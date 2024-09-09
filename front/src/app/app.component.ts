import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { from, tap } from 'rxjs';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: [ './app.component.scss' ]
})
export class AppComponent {

    constructor(
        private _http: HttpClient
    ) {
        // this._http.get('/ast/api/v1/organization/listen/')
        //   .pipe(
        //     tap((data) => {
        //       console.log(data);
        //     })
        //   ).subscribe()
        //
        // new EventSource('/ast/api/v1/organization/listen/').onmessage = (ev) => {
        //   console.log(ev);
        // }

    }
}
