import { Inject, Injectable, NgZone } from '@angular/core';
import { AuthService, IdentityRequestService, UserCredentialsService } from '../../modules/httpUserLayer';
import { ART_BACKEND_HREF } from '../../token/backend-href.token';
import { filter, fromEvent, Observable, retry, skipWhile, Subject, tap } from 'rxjs';
// @ts-ignore
import * as ssePolyfill from 'event-source-polyfill/src/eventsource.min.js';
import { tuiPure } from '@taiga-ui/cdk';
import { ServerEventName } from './enum/sse-event.enum';
import { IFServerEvent } from './interfaces/server-event.interface';


declare var EventSourcePolyfill: any;
var EventSource = ssePolyfill.EventSourcePolyfill;

@Injectable({providedIn: 'root'})
export class ServerEventService {

    private _resolver: Subject<IFServerEvent> = new Subject<IFServerEvent>()

    constructor(
        private _requestService: IdentityRequestService,
        private _credService: UserCredentialsService,
        private _authService: AuthService,
        @Inject(ART_BACKEND_HREF)
        private _baseHref: string,
        private zone: NgZone
    ) {
        this._authService.isSuccessAuth
            .pipe(
                skipWhile((state) => !state),
                tap((data) => {
                    this.initializeListner()
                })
            )
            .subscribe()
    }

    public initializeListner(): void{
        const observable = new Observable<IFServerEvent>(observer => {
            const eventSource = new EventSource(`${this._baseHref}/organization/listen/`, {
                // @ts-ignore
                headers: {
                    'Authorization': `Bearer ${this._credService.userToken}`
                }
            });
            eventSource.onmessage = (x: any) => observer.next(JSON.parse(x.data));
            eventSource.onerror = (x: any) => observer.error(x);

            return () => {
                eventSource.close();
            };
        });


        observable
            .pipe(
                tap((data) => {
                    if(data && (data as IFServerEvent).eventName){
                        this._resolver.next(data as IFServerEvent)
                    }
                }),
                retry({delay: 1000, count: 5, resetOnSuccess: true})
            ).subscribe({})
    }

    @tuiPure
    public get sseBus$(): Observable<IFServerEvent> {
        return this._resolver.asObservable();
    }

    public listenEvent(eventName: ServerEventName | ServerEventName[]): Observable<IFServerEvent>{
        return this.sseBus$
            .pipe(
                filter((event: IFServerEvent) => {
                    console.log(event);
                    if(Array.isArray(eventName)){
                        return eventName.some((name) => event.eventName === name)
                    }

                    return event.eventName === eventName;
                })
            )
    }

}
