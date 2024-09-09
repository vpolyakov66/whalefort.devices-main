import { ProfileDataService } from './profile-data.service';
import { Injectable } from '@angular/core';
import { Observable, of, switchMap, take, tap } from 'rxjs';
import { IFProfile } from './interfaces/profile.interface';
import { ProfileStoreService } from '../../stores/profile/profile-store.service';
import { OrganizationQueryService } from '../../stores/organization/organization-query.service';
import { catchError, map } from 'rxjs/operators';
import { ServerEventService } from '../sse/server-event.service';
import { ServerEventName } from '../sse/enum/sse-event.enum';
import { ProfileUpdateRequestModel } from './interfaces/profile-update.request-model';

@Injectable({ providedIn: 'root' })
export class ProfileManagerService{
    constructor(
        private _profileData: ProfileDataService,
        private _profileStore: ProfileStoreService,
        private _orgQ: OrganizationQueryService,
        private _sse: ServerEventService,

    ) {
        this._sse.listenEvent(ServerEventName.personUpdate)
            .pipe(
                switchMap(() => {
                    return this.updateEmployee$()
                        .pipe(
                            catchError(() => of(void 0))
                        )
                })
            ).subscribe()
    }

    public updateEmployee$(): Observable<void>{
        return this._profileData.identifyOverOrganization(this._orgQ.getActive()?.guid!)
            .pipe(
                tap((data: IFProfile[]) => {
                    data.forEach((profile) => this._profileStore.upsertProfile(profile))
                }),
                map(() => void 0),
            );
    }

    public addFavorite(guid: string): Observable<IFProfile>{
       return  this._profileData.addFavourite(guid).pipe(
            tap( (data: IFProfile) => {
                this._profileStore.upsertMyself(data)
            })
        )
    }

    public deleteFavorite(guid: string): Observable<IFProfile> {
       return  this._profileData.deleteFavourite(guid)
            .pipe(
               tap((data: IFProfile) => {
                   this._profileStore.upsertMyself(data)
               })
            )
    }


    public modifyEmployee(dto: ProfileUpdateRequestModel): Observable<void>{
        return this._profileData.updateProfile(dto)
            .pipe(
                tap((data: IFProfile) => {
                    this._profileStore.upsertMyself(data)
                }),
                map(() => void 0)
            )
    }

    public updateEmployee(): void{
        this._profileData.identifyOverOrganization(this._orgQ.getActive()?.guid!)
            .pipe(
                tap((data: IFProfile[]) => {
                    data.forEach((profile) => this._profileStore.upsertProfile(profile))
                }),
                take(1)
            ).subscribe()
    }

    public identifySelf$(): Observable<void>{
        return this._profileData.identifyMyself()
            .pipe(
                tap((data: IFProfile) => {
                    this._profileStore.upsertMyself(data)
                }),
                take(1),
                catchError((err) => {
                    console.log(err);

                    return of([])
                }),
                map(() => void 0)
            );
    }

    public identifySelf(): void{
        this._profileData.identifyMyself()
            .pipe(
                tap((data: IFProfile) => {
                    this._profileStore.upsertMyself(data)
                }),
                take(1)
            ).subscribe()
    }
}
