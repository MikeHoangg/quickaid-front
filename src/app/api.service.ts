import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {catchError} from 'rxjs/operators';
import {Observable, of} from 'rxjs';
import {MatIconRegistry} from '@angular/material';
import {DomSanitizer} from '@angular/platform-browser';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  errorLog: Array<object> = [];
  statusLog: Array<object> = [];
  currentUser: any;
  apiUrl: string;

  loadUser() {
    return new Promise((resolve, reject) => {
      const lang = document.cookie.match(/lang=(\w+)/);
      this.apiUrl = lang ? `http://127.0.0.1:8000/${lang[1]}/api` : 'http://127.0.0.1:8000/en/api';
      if (document.cookie.match(/auth_token=(Token \w+)/)) {
        this.getCurrentUser().subscribe((response: any) => {
          resolve();
          if (response) {
            this.currentUser = response;
          }
        });
      } else {
        resolve();
      }
    });
  }


  constructor(private httpClient: HttpClient,
              iconRegistry: MatIconRegistry,
              sanitizer: DomSanitizer) {
    iconRegistry.addSvgIcon('add',
      sanitizer.bypassSecurityTrustResourceUrl('assets/img/baseline-add-24px.svg'));
    iconRegistry.addSvgIcon('edit',
      sanitizer.bypassSecurityTrustResourceUrl('assets/img/baseline-edit-24px.svg'));
    iconRegistry.addSvgIcon('delete',
      sanitizer.bypassSecurityTrustResourceUrl('assets/img/baseline-delete-24px.svg'));
  }


  private handleError<T>(result?: T) {
    return (response: any): Observable<T> => {
      this.errorLog.push(response.error);
      this.statusLog.push(response.status);
      return of(result as T);
    };
  }

  private getHttpOptions() {
    const res = {};
    const authKey = 'Authorization';
    const authCookie = document.cookie.match(/auth_token=(Token \w+)/);
    // const csrfCookie = document.cookie.match(/csrftoken=(w+)/);
    if (authCookie) {
      res[authKey] = authCookie[1];
    }
    // if (csrfCookie)
    //   res['X-CSRFTOKEN'] = csrfCookie[1];
    return {headers: new HttpHeaders(res)};
  }

  authorize(action, data = null) {
    return this.httpClient.post(`${this.apiUrl}/${action}/`, data)
      .pipe(catchError(this.handleError()));
  }

  getCurrentUser() {
    return this.httpClient.get(`${this.apiUrl}/user/`, this.getHttpOptions())
      .pipe(catchError(this.handleError()));
  }

  editCurrentUser(data) {
    return this.httpClient.put(`${this.apiUrl}/user/`, data, this.getHttpOptions())
      .pipe(catchError(this.handleError()));
  }

  getList(list) {
    return this.httpClient.get(`${this.apiUrl}/${list}/`, this.getHttpOptions())
      .pipe(catchError(this.handleError()));
  }

  getObj(list, id) {
    return this.httpClient.get(`${this.apiUrl}/${list}/${id}/`, this.getHttpOptions())
      .pipe(catchError(this.handleError()));
  }

  editObj(list, id, data) {
    return this.httpClient.put(`${this.apiUrl}/${list}/${id}/`, data, this.getHttpOptions())
      .pipe(catchError(this.handleError()));
  }

  createObj(list, data) {
    return this.httpClient.post(`${this.apiUrl}/${list}/`, data, this.getHttpOptions())
      .pipe(catchError(this.handleError()));
  }

  deleteObj(list, id) {
    return this.httpClient.delete(`${this.apiUrl}/${list}/${id}/`, this.getHttpOptions())
      .pipe(catchError(this.handleError()));
  }

  formatTime(datetime, format = null) {
    let dd = datetime.getDate();
    let mm = datetime.getMonth() + 1;
    const yyyy = datetime.getFullYear();
    let MM = datetime.getMinutes();
    let HH = datetime.getHours();
    let SS = datetime.getSeconds();

    if (dd < 10) {
      dd = '0' + dd;
    }
    if (mm < 10) {
      mm = '0' + mm;
    }
    if (MM < 10) {
      MM = '0' + MM;
    }
    if (HH < 10) {
      HH = '0' + HH;
    }
    if (SS < 10) {
      SS = '0' + SS;
    }

    switch (format) {
      case 'time':
        return `${HH}:${MM}`;
      case 'date':
        return `${dd}/${mm}/${yyyy}`;
      default:
        return `${HH}:${MM} ${dd}/${mm}/${yyyy}`;
    }
  }
}
