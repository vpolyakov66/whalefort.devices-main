import { CanActivate, Router, UrlTree } from '@angular/router';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AuthService } from '../modules/httpUserLayer';

@Injectable()
export class AuthorizeGuard implements CanActivate{

    constructor(
        private _authService: AuthService,
        private _router: Router,
    ) {
    }

    /**
     * Может ли быть активирован модуль кабинета
     * @return {Observable<boolean | UrlTree> | boolean | UrlTree}
     */
    public canActivate(): Observable<boolean | UrlTree> | boolean | UrlTree {
        return this._authService.initialize()
            .pipe(
                map((isActivated: boolean) => {
                    if(isActivated){
                        return true;
                    }

                    return this._router.parseUrl('/account/login');
                }),
                catchError(() => {

                    return of(this._router.parseUrl('/account/login'));
                })
            );
    }
}
