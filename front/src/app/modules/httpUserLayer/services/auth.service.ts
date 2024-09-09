import { Inject, Injectable } from '@angular/core';
import { IdentityRequestService } from './identity-request.service';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { UserCredentialsService } from './user-credentials.service';
import { IUserCredentionalResponseModel } from '../interfaces';
import { IResponseDataWrapper } from '../wrappers';
import { IUserCredentialRequestModel } from '../interfaces';
import { catchError, map, mapTo, tap } from 'rxjs/operators';

import * as dayjs from 'dayjs';
import { Dayjs } from 'dayjs';
import { ART_BACKEND_HREF } from '../../../token/backend-href.token';
import { parseJwt } from '../../../utils/jwt';
import { concatUrl } from '../../../utils/concat-url.util';
import { IUserRegisterRequestModel } from '../interfaces/user-register.request-model.interface';
import { OrganizationQueryService } from '../../../stores/organization/organization-query.service';
import { tuiPure } from '@taiga-ui/cdk';


@Injectable()
export class AuthService {
    @tuiPure
    public get isSuccessAuth(): Observable<boolean> {
        return this._isSuccessAuth.asObservable();
    }


    private _isSuccessAuth: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

    constructor(
		private _identityRequest: IdentityRequestService,
		private _credService: UserCredentialsService,
        private _orgQ: OrganizationQueryService,
        @Inject(ART_BACKEND_HREF)
        private _baseHref: string
    ) {
    }



    /**
     * Helper for guard
     * @return Observable<boolean>
     */
    public initialize(): Observable<boolean> {
        if(this._credService.userToken && this._credService.userToken !== 'null'){
            const expire: any = parseJwt(this._credService.userToken);

            const date: Dayjs = dayjs.unix(expire.exp);

            if(dayjs().isAfter(date)){
                return this.refreshToken().pipe(map(() => {
                    this._isSuccessAuth.next(true)

                    return true
                }));
            }

            this._isSuccessAuth.next(true)
            return of(true);
        }

        return of(false);
    }

    /**
	 * k
	 * @param data
	 * @return {Observable<void>}
	 */
    public authorize(data: IUserCredentialRequestModel): Observable<void> {
        return this._identityRequest.post<IUserCredentionalResponseModel, IUserCredentialRequestModel>({
            url: concatUrl(this._baseHref, 'identity', 'login'),
            body: data
        }).pipe(
            tap((response: IResponseDataWrapper<IUserCredentionalResponseModel>) => {
                this._isSuccessAuth.next(true)
                this._credService.setUserCredential(response.data!);
            }),
            mapTo(void 0)
        );
    }

    public register(dto: IUserRegisterRequestModel): Observable<void>{
        return this._identityRequest.post<IUserCredentionalResponseModel, IUserRegisterRequestModel>({
            url: concatUrl(this._baseHref, 'identity', 'register', dto.guid? 'user' : 'admin'),
            body: dto
        }).pipe(
            tap((response: IResponseDataWrapper<IUserCredentionalResponseModel>) => {
                this._isSuccessAuth.next(true)
                this._credService.setUserCredential(response.data!);
            }),
            mapTo(void 0)
        );
    }

    public reserve(): Observable<string>{
        return this._identityRequest.post<{ guid: string }, {symlinkGuid: string}>({
            url: concatUrl(this._baseHref, 'identity', 'register', 'reserve'),
            body: { symlinkGuid: this._orgQ.getActive()?.guid!}
        })
            .pipe(
                map((data: IResponseDataWrapper<{ guid: string }>) => data.data?.guid!)
            )
    }

    /**
	 * k
	 * @return {Observable<void>}
	 */
    public refreshToken(): Observable<void> {
        return this._identityRequest.post<IUserCredentionalResponseModel,{ refreshToken: string, authToken: string }>({
            url: concatUrl(this._baseHref, 'identity', 'refresh'),
            body: {
                refreshToken: this._credService.refreshToken,
                authToken: this._credService.userToken
            }
        })
            .pipe(
                tap((data: IResponseDataWrapper<IUserCredentionalResponseModel>) => {
                    this._isSuccessAuth.next(true)
                    this._credService.setUserCredential(data.data!);
                }),
                catchError((err: Error) => {
                    console.log(err);

                    return throwError(() => err);
                }),
                mapTo(void 0)
            );
    }

    /**
	 * k
	 * @return {Observable<void>}
	 */
    public signOut(): Observable<void> {
        return this._identityRequest.post({
            url: concatUrl(this._baseHref, 'api', 'auth', 'logout')
        }).pipe(
            tap(() => this._credService.clearCredential()),
            mapTo(void 0)
        );
    }
}
