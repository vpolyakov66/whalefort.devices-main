import { Inject, Injectable } from '@angular/core';
import { IdentityRequestService, IResponseDataWrapper } from '../../modules/httpUserLayer';
import { ART_BACKEND_HREF } from '../../token/backend-href.token';
import { Observable, throwError } from 'rxjs';
import { IFProfile } from './interfaces/profile.interface';
import { concatUrl } from '../../utils/concat-url.util';
import { HttpParams } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';
import { ProfileUpdateRequestModel } from './interfaces/profile-update.request-model';

@Injectable({ providedIn: 'root' })
export class ProfileDataService{
    private get serviceHref(): string{
        return `${this._baseHref}/profile`
    }

    constructor(
        private _requestService: IdentityRequestService,
        @Inject(ART_BACKEND_HREF)
        private _baseHref: string
    ) {
    }

    public identifyMyself(): Observable<IFProfile>{
        return this._requestService.get<IFProfile>({
            url: concatUrl(this.serviceHref, 'identifyMyself'),
        })
            .pipe(
                map((data: IResponseDataWrapper<IFProfile>) => data.data!),
                catchError((err) => {
                    console.log(err);

                    return throwError(() => err)
                }),
            )
    }

    public updateProfile(dto: ProfileUpdateRequestModel): Observable<IFProfile>{
        return this._requestService.post<IFProfile, ProfileUpdateRequestModel>({
            url: concatUrl(this.serviceHref, 'update'),
            body: dto
        })
            .pipe(
                map((data: IResponseDataWrapper<IFProfile>) => data.data!)
            )
    }

    public addFavourite(guid: string ) : Observable<IFProfile>{
        return this._requestService.post<IFProfile>({
            url: concatUrl(this.serviceHref, 'favourite'),
            body: {guid}
        }).pipe(
            map((data: IResponseDataWrapper<IFProfile>) => data.data!)
        )
    }

    public deleteFavourite(guid: string): Observable<IFProfile> {
        return this._requestService.delete<IFProfile>({
            url: concatUrl(this.serviceHref, 'favourite'),
            body: {guid}
        }).pipe(
            map((data: IResponseDataWrapper<IFProfile>) => data.data!)
        )
    }

    public identify(guid: string): Observable<IFProfile>{
        return this._requestService.get<IFProfile>({
            url: concatUrl(this.serviceHref, 'identify'),
            options: {
                params: new HttpParams().set('guid', guid)
            }
        })
            .pipe(
                map((data: IResponseDataWrapper<IFProfile>) => data.data!)
            )
    }

    public identifyOverOrganization(guid: string): Observable<IFProfile[]>{
        return this._requestService.get<IFProfile[]>({
            url: concatUrl(this.serviceHref, 'employee'),
            options: {
                params: new HttpParams().set('orgGuid', guid)
            }
        })
            .pipe(
                map((data: IResponseDataWrapper<IFProfile[]>) => data.data!)
            )
    }
}
