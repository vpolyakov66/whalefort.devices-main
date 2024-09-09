import { Inject, Injectable } from '@angular/core';
import { IdentityRequestService } from '../../modules/httpUserLayer';
import { ART_BACKEND_HREF } from '../../token/backend-href.token';
import { Observable } from 'rxjs';
import { QueueInterface } from '../../modules/queue/interfaces/queue.interface';
import { concatUrl } from '../../utils/concat-url.util';
import { HttpParams } from '@angular/common/http';
import { map } from 'rxjs/operators';

@Injectable({providedIn: 'root'})
export class QueueDataService{

    private get serviceHref(): string{
        return `${this._baseHref}/queue`
    }

    constructor(
        private _requestService: IdentityRequestService,
        @Inject(ART_BACKEND_HREF)
        private _baseHref: string,

    ) {
    }

    public getMyQueueList(): Observable<QueueInterface[]>{
        return this._requestService.get<QueueInterface[]>({
            url: concatUrl(this.serviceHref, 'myqueue'),
        })
            .pipe(
                map((data) => data.data!)
            )
    }

    public getInfo(deviceGuid: string): Observable<QueueInterface>{
        return this._requestService.get<QueueInterface>({
            url: concatUrl(this.serviceHref, 'meta'),
            options: {
                params: new HttpParams().set('deviceGuid', deviceGuid)
            }
        })
            .pipe(
                map((data) => data.data!)
            )
    }

    public joinQueue(deviceGuid: string): Observable<QueueInterface>{
        return this._requestService.post<QueueInterface, {deviceGuid: string}>({
            url: concatUrl(this.serviceHref, 'join'),
            body: {deviceGuid}
        })
            .pipe(
                map((data) => data.data!)
            )
    }

    public takeInQueue(deviceGuid: string): Observable<QueueInterface>{
        return this._requestService.post<QueueInterface, {deviceGuid: string}>({
            url: concatUrl(this.serviceHref, 'take'),
            body: {deviceGuid}
        })
            .pipe(
                map((data) => data.data!)
            )
    }

    public takeoffQueue(deviceGuid: string): Observable<QueueInterface>{
        return this._requestService.post<QueueInterface, {deviceGuid: string}>({
            url: concatUrl(this.serviceHref, 'takeoff'),
            body: {deviceGuid}
        })
            .pipe(
                map((data) => data.data!)
            )
    }

    public cancelQueue(deviceGuid: string): Observable<QueueInterface>{
        return this._requestService.post<QueueInterface, {deviceGuid: string}>({
            url: concatUrl(this.serviceHref, 'cancel'),
            body: {deviceGuid}
        })
            .pipe(
                map((data) => data.data!)
            )
    }

    public dropQueue(deviceGuid: string): Observable<QueueInterface>{
        return this._requestService.post<QueueInterface, {deviceGuid: string}>({
            url: concatUrl(this.serviceHref, 'drop'),
            body: {deviceGuid}
        })
            .pipe(
                map((data) => data.data!)
            )
    }
}
