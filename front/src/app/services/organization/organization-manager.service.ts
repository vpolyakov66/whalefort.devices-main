import { Inject, Injectable, Optional } from '@angular/core';
import { ProfileQueryService } from '../../stores/profile/profile-query.service';
import { OrganizationDataService } from './organization-data.service';
import { map, Observable, switchMap, tap, zip } from 'rxjs';
import { IFProfile } from '../profile/interfaces/profile.interface';
import { IAbstractNode } from '../../modules/organization/interfaces/abstract-node.interface';
import { OrganizationStoreService } from '../../stores/organization/organization-store.service';
import { LEGACY_UPDATE } from '../../token/legacy-update.token';
import { IFCreateBuildingRequestModel } from './interfaces/create-building.request-model';
import { IFCreateShelfRequestModel } from './interfaces/create-shelf.request-model';
import { IFCreateUnitRequestModel } from './interfaces/create-unit.request-model';
import { OrganizationQueryService } from '../../stores/organization/organization-query.service';
import { TransactionInterface } from '../../modules/organization/interfaces/transaction.interface';
import { DeviceQueryService } from '../../stores/device/device-query.service';
import { IFHistoryEvent } from '../../modules/history/interfaces/hystory-event.interface';
import { HistoryRequestInterface } from '../../modules/history/interfaces/history-request.interface';
import { RemoveNodeRequestModel } from './interfaces/remove-node.request-model';
import { ServerEventService } from '../sse/server-event.service';
import { ServerEventName } from '../sse/enum/sse-event.enum';
import { SystemUserRoleEnum } from '../../utils/resolution-directive/enum/system-user-role.enum';

@Injectable({providedIn: 'root'})
export class OrganizationManagerService{

    constructor(
        private _profileQuery: ProfileQueryService,
        private _orgDataService: OrganizationDataService,
        private _orgStoreService: OrganizationStoreService,
        private _orgQ: OrganizationQueryService,
        private _devQ: DeviceQueryService,
        @Inject(LEGACY_UPDATE)
        @Optional()
        private _isLegacyUpdate: boolean,
        private _sse: ServerEventService,
    ) {
        this._sse.listenEvent(ServerEventName.organizationUpdate)
            .pipe(
                switchMap(() => this.updateAvailableOrganizationList())
            ).subscribe()
    }

    public retrieveKeys(shelfGuid: string): Observable<string>{
        return this._orgDataService.retrieveKeys(shelfGuid, this._orgQ.getActive()?.guid!);
    }

    public transaction(dto: Omit<TransactionInterface, 'deviceGuid' | 'orgGuid'>): Observable<void>{
        return this._orgDataService.transaction({
            ...dto, orgGuid: this._orgQ.getActive()?.guid!, deviceGuid: this._devQ.getActive()?.guid!
        })
            .pipe(
                tap((org) => {
                    if(this._isLegacyUpdate){
                        this._orgStoreService.upsertOrganization(org)
                    }
                }),
                map(() => void 0)
            )
    }

    public getHistoryInfo(data: HistoryRequestInterface): Observable<IFHistoryEvent[]>{
        return this._orgDataService.getHistoryInfo(data, this._orgQ.getActive()?.guid!);
    }

    public updateAvailableOrganizationList(): Observable<void>{

        return this._profileQuery.getMyself$()
            .pipe(
                switchMap((profile: IFProfile) => {
                    const orgListRequest: Observable<IAbstractNode>[] = profile.symlinkedWith.map((guid) => {
                        return this._orgDataService.getOrganization(guid)
                    })

                    return zip(orgListRequest);
                }),
                tap((orgDataList: IAbstractNode[]) => {
                    orgDataList.forEach((org) => this._orgStoreService.upsertOrganization(org))
                }),
                tap((data:IAbstractNode[]) => {
                   this._orgStoreService.setActive(data[0].guid!)
                }),
                map(() => void 0)
            )
    }

    public createOrganization(name: string): Observable<void>{
        return this._orgDataService.createOrganization(name)
            .pipe(
                tap((org) => {
                    if(this._isLegacyUpdate){
                        this._orgStoreService.upsertOrganization(org)
                    }
                }),
                map(() => void 0)
            )
    }

    public getSystemRole(): Observable<SystemUserRoleEnum>{
        return this._orgDataService.getSystemRole()
    }

    public createBuilding(dto: IFCreateBuildingRequestModel): Observable<void>{
        return this._orgDataService.createBuilding(dto)
            .pipe(
                tap((org) => {
                    if(this._isLegacyUpdate){
                        this._orgStoreService.upsertOrganization(org)
                    }                }),
                map(() => void 0)
            )
    }

    public removeBuilding(dto: RemoveNodeRequestModel): Observable<void>{
        return this._orgDataService.removeBuilding(dto)
            .pipe(
                map(() => void 0)
            )
    }

    public createDepartment(dto: IFCreateUnitRequestModel): Observable<void>{
        return this._orgDataService.createDepartment(dto)
            .pipe(
                tap((org) => {
                    if(this._isLegacyUpdate){
                        this._orgStoreService.upsertOrganization(org)
                    }
                }),
                map(() => void 0)
            )
    }

    public removeDepartment(dto: RemoveNodeRequestModel): Observable<void>{
        return this._orgDataService.removeDepartment(dto)
            .pipe(
                map(() => void 0)
            )
    }

    public createShelf(dto: IFCreateShelfRequestModel): Observable<void>{
        return this._orgDataService.createShelf(dto)
            .pipe(
                tap((org) => {
                    if(this._isLegacyUpdate){
                        this._orgStoreService.upsertOrganization(org)
                    }                }),
                map(() => void 0)
            )
    }

    public removeShelf(dto: RemoveNodeRequestModel): Observable<void>{
        return this._orgDataService.removeShelf(dto)
            .pipe(
                map(() => void 0)
            )
    }

}
