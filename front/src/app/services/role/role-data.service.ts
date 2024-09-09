import { Inject, Injectable } from '@angular/core';
import { IdentityRequestService, IResponseDataWrapper } from '../../modules/httpUserLayer';
import { ART_BACKEND_HREF } from '../../token/backend-href.token';
import { IFRole } from './interfaces/role.interface';
import { Observable } from 'rxjs';
import { concatUrl } from '../../utils/concat-url.util';
import { map } from 'rxjs/operators';
import { HttpParams } from '@angular/common/http';

@Injectable({
    providedIn: 'root'
})
export class RoleDataService{

    private get serviceHref(): string{
        return `${this._baseHref}/role`
    }

    constructor(
        private _requestService: IdentityRequestService,
        @Inject(ART_BACKEND_HREF)
        private _baseHref: string
    ) {
    }

    public getAll(guid: string): Observable<IFRole[]>{
        return this._requestService.get<IFRole[]>({
            url: concatUrl(this.serviceHref, 'all'),
            options: {
                params: new HttpParams().set('orgGuid', guid)
            }
        })
            .pipe(
                map((data: IResponseDataWrapper<IFRole[]>) => data.data!)
            )
    }

    public createRole(dto: Omit<IFRole, 'guid'>): Observable<IFRole>{
        return this._requestService.post<IFRole, any>({
            url: concatUrl(this.serviceHref, 'create'),
            body: {...dto, deviceList: []}
        })
            .pipe(
                map((data: IResponseDataWrapper<IFRole>) => data.data!)
            )
    }

    public editRole(dto: IFRole): Observable<IFRole>{
        return this._requestService.patch<IFRole, IFRole>({
            url: concatUrl(this.serviceHref, 'edit'),
            body: dto
        })
            .pipe(
                map((data: IResponseDataWrapper<IFRole>) => data.data!)
            )
    }

}
