import { IdentityRequestService } from '../../modules/httpUserLayer';
import { Inject, Injectable } from '@angular/core';
import { ART_BACKEND_HREF } from '../../token/backend-href.token';
import { map, Observable } from 'rxjs';
import { IFSmartShelf } from '../../modules/smartshelf/interfaces/smart-shelf.interface';
import { concatUrl } from '../../utils/concat-url.util';
import { HttpParams } from '@angular/common/http';
import { SmartShelfRequestModel } from './interfaces/smart-shelf.request-model';

@Injectable({providedIn: 'root'})
export class SmartShelfDataService{
    private get serviceHref(): string{
        return `${this._baseHref}/organization/enclave`
    }

    constructor(
        private _requestService: IdentityRequestService,
        @Inject(ART_BACKEND_HREF)
        private _baseHref: string
    ) {
    }

    public getAll(orgGuid: string): Observable<IFSmartShelf[]>{
        return this._requestService.get<IFSmartShelf[]>({
            url: concatUrl(this.serviceHref,'all'),
            options: {
                params: new HttpParams().set('orgGuid',orgGuid)
            }
        })
            .pipe(
                map((data) => data.data!)
            )
    }

    public openEnclave(dto: SmartShelfRequestModel): Observable<void>{
        return this._requestService.post<void, SmartShelfRequestModel>({
            url: concatUrl(this.serviceHref,'open'),
            body: dto
        })
            .pipe(
                map((data) => void 0)
            )
    }

    public registerDeviceEnclave(dto: Omit<SmartShelfRequestModel, 'reason'>): Observable<void>{
        return this._requestService.post<void, Omit<SmartShelfRequestModel, 'reason'>>({
            url: concatUrl(this.serviceHref,'register'),
            body: dto
        })
            .pipe(
                map((data) => void 0)
            )
    }

    public cancelRegistrationEnclave(dto: Omit<SmartShelfRequestModel, 'reason'>): Observable<void>{
        return this._requestService.post<void, Omit<SmartShelfRequestModel, 'reason'>>({
            url: concatUrl(this.serviceHref,'registerCancel'),
            body: dto
        })
            .pipe(
                map((data) => void 0)
            )
    }

    public verifyEnclave(dto: Omit<SmartShelfRequestModel, 'reason'>): Observable<void>{
        return this._requestService.post<void, Omit<SmartShelfRequestModel, 'reason'>>({
            url: concatUrl(this.serviceHref,'verify'),
            body: dto
        })
            .pipe(
                map((data) => void 0)
            )
    }

}
