import {Component, OnInit, ViewChild} from '@angular/core';
import {MatDialog, MatPaginator, MatSnackBar, MatSort, MatTableDataSource} from '@angular/material';
import {ApiService} from '../api.service';
import {ActivatedRoute, Router} from '@angular/router';
import {TranslateService} from '@ngx-translate/core';
import {forkJoin} from 'rxjs';
import {EditProfileComponent} from '../edit-profile/edit-profile.component';
import {ScheduleComponent} from '../schedule/schedule.component';
import {el} from '@angular/platform-browser/testing/src/browser_util';

export interface Statistics {
  id: number;
  min_blood_pressure: number;
  max_blood_pressure: number;
  glucose_rate: number;
  protein_rate: number;
  albumin_rate: number;
  myoglobin_rate: number;
  ferritin_rate: number;
  cholesterol_rate: number;
  temperature: number;
  created: string;
}

export interface Diagnosis {
  id: number;
  verdict: string;
  start_time: string;
  end_time: string;
}

export interface Schedule {
  id: number;
  reason: string;
  description: string;
  expiration_date: string;
  time: string;
  days: Array<string>;
  active: boolean;
}

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  user: any;
  statistics: any;
  diagnoses: any;
  schedules: any;
  editProfileFlag = 0;
  createScheduleFlag = 1;
  editScheduleFlag = 2;
  statisticsDisplayedColumns: string[] = ['min_blood_pressure', 'max_blood_pressure', 'glucose_rate', 'protein_rate',
    'albumin_rate', 'myoglobin_rate', 'ferritin_rate', 'cholesterol_rate', 'temperature', 'created', 'actions'];
  diagnosisDisplayedColumns: string[] = ['verdict', 'start_time', 'end_time', 'actions'];
  scheduleDisplayedColumns: string[] = ['reason', 'description', 'expiration_date', 'time', 'days', 'active', 'actions'];
  statisticsDataSource = new MatTableDataSource([]);
  diagnosisDataSource = new MatTableDataSource([]);
  scheduleDataSource = new MatTableDataSource([]);
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(private dialog: MatDialog,
              private api: ApiService,
              private route: ActivatedRoute,
              private router: Router,
              public translate: TranslateService,
              public snackBar: MatSnackBar) {
  }

  ngOnInit() {
    this.updateUser();
  }

  getUser() {
    if (!this.api.currentUser) {
      this.router.navigate(['/login']);
    }
    this.user = this.api.currentUser;
    this.getTablesData();
  }

  getTablesData() {
    if (this.user) {
      const sources = [this.api.getList('statistics'), this.api.getList('diagnosis'), this.api.getList('schedule')];
      forkJoin(sources).subscribe((responseList) => {
        this.statistics = responseList[0];
        this.diagnoses = responseList[1];
        this.schedules = responseList[2];
        this.getTables();
      });
    } else {
      this.statistics = new Array<Statistics>();
      this.diagnoses = new Array<Diagnosis>();
      this.schedules = new Array<Schedule>();
      this.getTables();
    }
  }

  getTables() {
    this.statisticsDataSource = new MatTableDataSource(this.statistics);
    this.statisticsDataSource.paginator = this.paginator;
    this.statisticsDataSource.sort = this.sort;

    this.diagnosisDataSource = new MatTableDataSource(this.diagnoses);
    this.diagnosisDataSource.paginator = this.paginator;
    this.diagnosisDataSource.sort = this.sort;

    this.scheduleDataSource = new MatTableDataSource(this.schedules);
    this.scheduleDataSource.paginator = this.paginator;
    this.scheduleDataSource.sort = this.sort;
  }


  applyFilter(filterValue, dataSource) {
    dataSource.filter = filterValue.trim().toLowerCase();
    if (dataSource.paginator) {
      dataSource.paginator.firstPage();
    }
  }

  deleteObject(list, id) {
    const sources = [this.translate.get(`objects.${list}`), this.translate.get('action.deleted')];
    this.api.deleteObj(list, id).subscribe((response) => {
      forkJoin(sources).subscribe((responseList) => {
        this.getTablesData();
        this.snackBar.open(responseList.join(' '), 'OK', {
          duration: 5000,
        });
      });
    });
  }

  updateUser() {
    this.api.getCurrentUser().subscribe((response) => {
      if (response) {
        this.api.currentUser = response;
      }
      this.getUser();
    });
  }

  openDialog(flag, id = null) {
    if (!this.api.currentUser) {
      this.translate.get('ACTION.NOT_AUTHORIZED').subscribe((res) => {
        this.snackBar.open(res, 'OK', {
          duration: 5000,
        });
      });
    } else {
      let dialogRef;
      if (flag === this.editProfileFlag) {
        dialogRef = this.dialog.open(EditProfileComponent);
        this.closedDialog(dialogRef);
      } else if (flag === this.createScheduleFlag) {
        dialogRef = this.dialog.open(ScheduleComponent);
        this.closedDialog(dialogRef);
      } else if (flag === this.editScheduleFlag) {
        this.api.getObj('schedule', id).subscribe((response) => {
          if (response) {
            dialogRef = this.dialog.open(ScheduleComponent, {data: response});
            this.closedDialog(dialogRef);
          }
        });
      }
    }
  }

  closedDialog(dialogRef) {
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.updateUser();
      }
    });
  }

  displayTime(datetime, format = null) {
    return this.api.formatTime(new Date(datetime), format);
  }
}
