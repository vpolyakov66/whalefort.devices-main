import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { UserCredentialsService } from '../services';
import { BehaviorSubject, catchError, filter, Observable, switchMap, take, throwError } from 'rxjs';
import { AuthService } from '../services';

@Injectable()
export class AuthValidatorInterceptor implements HttpInterceptor{
    private _isRefreshing: boolean = false;
    private _refreshTokenSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);

    constructor(
        private _tokenService: UserCredentialsService,
        private _authService: AuthService) { }

    /**
     * Перехватчик
     * @param {HttpRequest<any>} req
     * @param {HttpHandler} next
     * @return {Observable<HttpEvent<Object>>}
     */
    public intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<Object>> {
        let authReq: HttpRequest<any> = req;
        const token: string = this._tokenService.userToken;
        if (token !== null) {
            authReq = this.addTokenHeader(req, token);
        }

        return next.handle(authReq).pipe(catchError((error: HttpErrorResponse) => {
            if (error instanceof HttpErrorResponse && !authReq.url.includes('auth/login') && error.status === 401 && !authReq.url.includes('auth/refresh')) {
                return this.handleUnauthorized(authReq, next);
            }

            return throwError(() => error);
        }));
    }

    /**
     * Обработчик 401
     * @param {HttpRequest<any>} request
     * @param {HttpHandler} next
     * @return {Observable<HttpSentEvent | HttpHeaderResponse | HttpResponse<any> | HttpProgressEvent | HttpUserEvent<any>>}
     * @private
     */
    private handleUnauthorized(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        if (!this._isRefreshing) {
            this._isRefreshing = true;
            this._refreshTokenSubject.next(null);

            const token: string = this._tokenService.refreshToken;

            if (token)
            {
                return this._authService.refreshToken().pipe(
                    switchMap(() => {
                        this._isRefreshing = false;

                        this._refreshTokenSubject.next(this._tokenService.userToken);

                        return next.handle(this.addTokenHeader(request, this._tokenService.userToken));
                    }),
                    catchError((err: Error) => {
                        this._isRefreshing = false;

                        this._authService.signOut();

                        return throwError(() => err);
                    })
                );
            }
        }

        return this._refreshTokenSubject.pipe(
            filter((token: string | null) => token !== null),
            take(1),
            switchMap((token: string | null) => next.handle(this.addTokenHeader(request, token!)))
        );
    }

    /**
     * Прослушка
     * @param {HttpRequest<any>} request
     * @param {string} token
     * @return {HttpRequest<any>}
     * @private
     */
    private addTokenHeader(request: HttpRequest<any>, token: string): HttpRequest<any> {
        return request.clone({ headers: request.headers.set('Authorization', token) });
    }
}
