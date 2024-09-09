import { Inject, Injectable } from '@angular/core';
import { RoleStoreService } from '../../stores/role/role-store.service';
import { OrganizationQueryService } from '../../stores/organization/organization-query.service';
import { ProfileQueryService } from '../../stores/profile/profile-query.service';
import { RoleQueryService } from '../../stores/role/role-query.service';
import { RoleDataService } from './role-data.service';
import { Observable, tap } from 'rxjs';
import { map } from 'rxjs/operators';
import { LEGACY_UPDATE } from '../../token/legacy-update.token';
import { IFRole } from './interfaces/role.interface';

@Injectable({providedIn: 'root'})
export class RoleManagerService{

    constructor(
        private _roleStoreService: RoleStoreService,
        private _roleQ: RoleQueryService,
        private _orgQ: OrganizationQueryService,
        private _profQ: ProfileQueryService,
        private _roleData: RoleDataService,
        @Inject(LEGACY_UPDATE)
        private _isLegacyUpdate: boolean
    ) {
    }

    public updateRole(): Observable<void>{
        return this._roleData.getAll(this._orgQ.getActive()?.guid!)
            .pipe(
                tap((data) => {
                    data.forEach((role) => this._roleStoreService.upsertRole(role))
                }),
                map(() => void 0)
            )
    }

    public createRole(dto:  Omit<IFRole, 'guid' | 'organizationGuid' | 'deviceList'>): Observable<void>{
        return this._roleData.createRole({...dto, organizationGuid: this._orgQ.getActive()?.guid!} as IFRole)
            .pipe(
                tap((role: IFRole) => {
                    if(this._isLegacyUpdate){
                        this._roleStoreService.upsertRole(role)
                    }
                }),
                map(() => void 0)
            )
    }

    public editRole(dto: Omit<IFRole, 'guid'>, guid?: string ): Observable<void>{
        return this._roleData.editRole({...dto, guid: guid ?? this._roleQ.getActive()?.guid!})
            .pipe(
                tap((role: IFRole) => {
                    console.log(role);
                    if(this._isLegacyUpdate){
                        this._roleStoreService.upsertRole(role)
                    }
                }),
                map(() => void 0)
            )
    }

}
