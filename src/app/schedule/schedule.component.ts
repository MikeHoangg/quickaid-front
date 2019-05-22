import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {ApiService} from '../api.service';
import {FormControl, FormGroup, Validators} from '@angular/forms';

@Component({
  selector: 'app-furniture',
  templateUrl: './schedule.component.html',
  styleUrls: ['./schedule.component.css']
})
export class ScheduleComponent implements OnInit {
  title: string;
  error: any;
  scheduleForm: FormGroup;
  days = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun', 'evr'];

  constructor(private dialogRef: MatDialogRef<ScheduleComponent>,
              private api: ApiService,
              @Inject(MAT_DIALOG_DATA) public schedule: any) {
    this.scheduleForm = new FormGroup({
      reason: new FormControl(schedule ? schedule.reason : null),
      description: new FormControl(schedule ? schedule.description : null, [Validators.required]),
      expiration_date: new FormControl(schedule ? schedule.expiration_date : null, [Validators.required]),
      time: new FormControl(schedule ? schedule.time : null, [Validators.required]),
      days: new FormControl(schedule ? this.getSelectedDays(schedule) : null, [Validators.required]),
      active: new FormControl(schedule ? schedule.active : true),
      user: new FormControl(api.currentUser.id),
    });
    this.title = schedule ? 'edit' : 'add';
  }

  ngOnInit() {
  }

  save(): void {
    const expirationDate = 'expiration_date';
    if (this.scheduleForm.valid) {
      if (typeof this.scheduleForm.value[expirationDate] === 'object') {
        const date = this.scheduleForm.value[expirationDate]._i;
        this.scheduleForm.value[expirationDate] = this.api.formatTime(new Date(date.year, date.month, date.date), 'date');
      } else if (typeof this.scheduleForm.value[expirationDate] === 'string') {
        this.scheduleForm.value[expirationDate] = this.api.formatTime(new Date(this.scheduleForm.value[expirationDate]), 'date');
      }
      if (!this.schedule) {
        this.api.createObj('schedule', this.scheduleForm.value).subscribe((response: any) => {
          if (response) {
            this.error = null;
            this.dialogRef.close(true);
          } else {
            this.error = this.api.errorLog.pop();
          }
        });
      } else {
        this.api.editObj('schedule', this.schedule.id, this.scheduleForm.value).subscribe((response: any) => {
          if (response) {
            this.error = null;
            this.dialogRef.close(true);
          } else {
            this.error = this.api.errorLog.pop();
          }
        });
      }
    }
  }

  getError(field) {
    if (this.scheduleForm.controls[field].hasError('required')) {
      return 'required';
    }
  }

  getSelectedDays(schedule) {
    const res = [];
    if (schedule) {
      if (schedule.days.includes('monday') || schedule.days.includes('понеділок')) {
        res.push('mon');
      }
      if (schedule.days.includes('tuesday') || schedule.days.includes('вівторок')) {
        res.push('tue');
      }
      if (schedule.days.includes('wednesday') || schedule.days.includes('середа')) {
        res.push('wed');
      }
      if (schedule.days.includes('thursday') || schedule.days.includes('четвер')) {
        res.push('thu');
      }
      if (schedule.days.includes('friday') || schedule.days.includes('п\'ятниця')) {
        res.push('fri');
      }
      if (schedule.days.includes('saturday') || schedule.days.includes('субота')) {
        res.push('sat');
      }
      if (schedule.days.includes('sunday') || schedule.days.includes('неділя')) {
        res.push('sun');
      }
      if (schedule.days.includes('everyday') || schedule.days.includes('кожен день')) {
        res.push('evr');
      }
    }
    return res;
  }
}
