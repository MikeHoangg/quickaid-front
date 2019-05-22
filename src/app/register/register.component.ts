import {Component, OnInit} from '@angular/core';
import {ApiService} from '../api.service';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {Router} from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  registerForm = new FormGroup({
    email: new FormControl(null, [Validators.required]),
    password1: new FormControl(null, [Validators.required]),
    password2: new FormControl(null, [Validators.required]),
  });
  error: any;

  constructor(private router: Router,
              private api: ApiService) {
  }

  ngOnInit() {
  }

  getError(field) {
    if (this.registerForm.controls[field].hasError('required')) {
      return 'required';
    }
  }

  register() {
    this.api.authorize('register', this.registerForm.value).subscribe((response: any) => {
      if (response) {
        document.cookie = `auth_token=Token ${response.key};path=/`;
        this.error = null;
        this.router.navigate(['/profile']);
      } else {
        this.error = this.api.errorLog.pop();
      }
    });
  }
}
