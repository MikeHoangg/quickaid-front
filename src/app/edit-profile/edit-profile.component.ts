import {Component, OnInit} from '@angular/core';
import {ApiService} from '../api.service';
import {MatDialogRef} from '@angular/material';
import {FormControl, FormGroup, Validators} from '@angular/forms';

@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.css']
})
export class EditProfileComponent implements OnInit {
  error: any;
  user: any;
  editProfileForm: FormGroup;
  genders = ['male', 'female'];

  constructor(private api: ApiService,
              private dialogRef: MatDialogRef<EditProfileComponent>) {
    this.user = this.api.currentUser;
    this.editProfileForm = new FormGroup({
      email: new FormControl(this.user.email, [Validators.required]),
      first_name: new FormControl(this.user.first_name),
      last_name: new FormControl(this.user.last_name),
      gender: new FormControl(this.getGender(this.user)),
      age: new FormControl(this.user.age, [Validators.required, Validators.min(0)]),
    });
  }

  getGender(user) {
    if (user.gender === 'male' || user.gender === 'чоловіча') {
      return 'male';
    } else if (user.gender === 'female' || user.gender === 'жіноча') {
      return 'female';
    }
  }

  ngOnInit() {
  }

  save(): void {
    if (this.editProfileForm.valid) {
      this.api.editCurrentUser(this.editProfileForm.value).subscribe((response: any) => {
        if (response) {
          this.error = null;
          this.dialogRef.close(true);
        } else {
          this.error = this.api.errorLog.pop();
        }
      });
    }
  }

  getError(field) {
    if (this.editProfileForm.controls[field].hasError('required')) {
      return 'required';
    } else if (this.editProfileForm.controls[field].hasError('min')) {
      return 'min';
    }
  }

  getParam(field) {
    if (this.editProfileForm.controls[field].hasError('min')) {
      return {value: this.editProfileForm.controls[field].errors['min']['min']};
    }
  }

}
