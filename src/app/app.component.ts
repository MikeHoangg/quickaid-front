import {Component, OnInit} from '@angular/core';
import {MatDialog} from '@angular/material';
import {ApiService} from './api.service';
import {TranslateService} from '@ngx-translate/core';
import {Router} from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  constructor(private dialog: MatDialog,
              private api: ApiService,
              public translate: TranslateService,
              private router: Router) {
    translate.addLangs(['en', 'uk']);
    translate.setDefaultLang('en');
    const lang = document.cookie.match(/lang=(\w+)/);
    translate.use(lang ? lang[1] : 'en');
  }

  ngOnInit() {
    this.router.routeReuseStrategy.shouldReuseRoute = () => {
      return false;
    };
  }

  setLang(lang) {
    this.api.apiUrl = `http://127.0.0.1:8000/${lang}/api`;
    this.translate.use(lang);
    this.router.navigate(['']);

  }

  logout(): void {
    this.api.authorize('logout').subscribe((response: any) => {
      if (response) {
        document.cookie = 'auth_token=;path=/';
        this.api.currentUser = null;
        this.router.navigate(['/login']);
      }
    });
  }
}
