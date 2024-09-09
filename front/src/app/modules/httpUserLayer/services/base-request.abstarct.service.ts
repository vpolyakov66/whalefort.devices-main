import { Directive } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpEvent, HttpResponse } from '@angular/common/http';
import { IResponseDataWrapper } from '../wrappers';
import { IRequestOptions } from '../interfaces';
import { catchError, map } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';

@Directive()
export abstract class BaseRequestAbstarctService {

    constructor(
		private _http: HttpClient
    ) {
    }

    /**
     * Get
     * @param {IRequestOptions<undefined>} options
     * @return {Observable<ResponeDataWrapper<O>>}
     */
    public get<O>(options: IRequestOptions<undefined>): Observable<IResponseDataWrapper<O>> {
        return this._http.get<O>(options.url, { ...options.options?? {} as any, responseType: options.options?.responseType?? 'json' , observe: 'response' })
            .pipe(
                map((data: HttpEvent<O>) => {
                    return this.mapToResponseWrapper<O>(data as HttpResponse<O>);
                }),
                catchError(this.mapErrorToResponseWrapper<O>)
            );
    }

    /**
     * Post
     * @param {IRequestOptions<I>} options
     * @return {Observable<ResponeDataWrapper<O>>}
     */
    public post<O, I = any>(options: IRequestOptions<I>): Observable<IResponseDataWrapper<O>>{
        return this._http.post<O>(options.url, options.body,{ ...options.options?? {} as any, responseType: options.options?.responseType?? 'json' , observe: 'response' })
            .pipe(
                map((data: HttpEvent<O>) => {
                    return this.mapToResponseWrapper<O>(data as HttpResponse<O>);
                }),
                catchError(this.mapErrorToResponseWrapper<O>)
            );
    }

    /**
     * Put
     * @param {IRequestOptions<I>} options
     * @return {Observable<ResponeDataWrapper<O>>}
     */
    public put<O, I = any>(options: IRequestOptions<I>): Observable<IResponseDataWrapper<O>>{
        //@ts-ignore
        return this._http.put<O>(options.url, options.body,{ ...options.options?? {}, responseType: options.options?.responseType?? 'json' , observe: 'response' })
            .pipe(
                //@ts-ignore
                map(this.mapToResponseWrapper<O>),
                catchError(this.mapErrorToResponseWrapper<O>)
            );
    }

    /**
     * Patch
     * @param {IRequestOptions<I>} options
     * @return {Observable<ResponeDataWrapper<O>>}
     */
    public patch<O, I = any>(options: IRequestOptions<I>): Observable<IResponseDataWrapper<O>>{
        //@ts-ignore
        return this._http.patch<O>(options.url, options.body,{ ...options.options?? {}, responseType: options.options?.responseType?? 'json' , observe: 'response' })
            .pipe(
                //@ts-ignore
                map(this.mapToResponseWrapper<O>),
                catchError(this.mapErrorToResponseWrapper<O>)
            );
    }

    /**
     * Delete
     * @param {IRequestOptions<I>} options
     * @return {Observable<ResponeDataWrapper<O>>}
     */
    public delete<O, I = any>(options: IRequestOptions<I>): Observable<IResponseDataWrapper<O>> {
        //@ts-ignore
        return this._http.request<O>('DELETE', options.url, { ...options.options?? {}, body: options.body, responseType: options.options?.responseType?? 'json' , observe: 'response' })
            .pipe(
                //@ts-ignore
                map(this.mapToResponseWrapper),
                catchError(this.mapErrorToResponseWrapper<O>)
            );
    }

    /**
     * data response wrapper
     * @param {HttpErrorResponse | void} httpError
     * @return {Observable<ResponeDataWrapper<T>>}
     * @protected
     */
    protected mapErrorToResponseWrapper<T>(httpError: HttpErrorResponse | void): Observable<IResponseDataWrapper<T>>{
        return throwError(() => {

            const body: any = httpError;

            return {
                data: body?.error?? undefined,
                code: body?.status,
                isOk: body?.ok
            };
        });
    }

    /**
     * мапит
     * @param {HttpResponse<T>} data
     * @return {ResponeDataWrapper<T>}
     * @private
     */
    private mapToResponseWrapper<T>(data: HttpResponse<T> ): IResponseDataWrapper<T>{
        return {
            data: data.body?? undefined,
            code: data.status,
            isOk: data.ok
        };
    }
}
