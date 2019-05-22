import {Component, OnInit} from '@angular/core';
import {ApiService} from '../api.service';
import {FormGroup, FormControl, Validators} from '@angular/forms';
import {Router} from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  error: any;
  loginForm = new FormGroup({
    email: new FormControl(null, [Validators.required]),
    password: new FormControl(null, [Validators.required]),
  });

  constructor(private api: ApiService,
              private router: Router) {
  }

  ngOnInit() {
  }

  getError(field) {
    if (this.loginForm.controls[field].hasError('required')) {
      return 'required';
    }
  }

  login() {
    this.api.authorize('login', this.loginForm.value).subscribe((response: any) => {
      if (response) {
        this.error = null;
        document.cookie = `auth_token=Token ${response.key};path=/`;
        this.router.navigate(['/profile']);
      } else {
        this.error = this.api.errorLog.pop();
      }
    });
  }
}
