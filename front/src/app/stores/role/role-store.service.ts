import { Injectable } from '@angular/core';
import { RoleStore } from './role.store';
import { IFRole } from '../../services/role/interfaces/role.interface';

@Injectable({providedIn: 'root'})
export class RoleStoreService{
    constructor(
        private _roleStore: RoleStore,
    ) {
    }

    public setActive(guid: string): void{
        this._roleStore.setActive(guid);
    }

    public resetActive(): void{
        this._roleStore.resetActive();
    }

    public upsertRole(role: IFRole): void{
        this._roleStore.upsert(role.guid, role)
    }
}
