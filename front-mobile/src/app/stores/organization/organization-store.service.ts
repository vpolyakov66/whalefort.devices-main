import { Injectable } from '@angular/core';
import { OrganizationStore } from './organization.store';
import { IAbstractNode } from '../../modules/organization/interfaces/abstract-node.interface';

@Injectable({providedIn: 'root'})
export class OrganizationStoreService{
    constructor(
        private _organizationStore: OrganizationStore,
    ) {
    }

    public setActive(guid: string): void{
        this._organizationStore.setActive(guid)
    }

    public upsertOrganization(organization: IAbstractNode){
        this._organizationStore.upsert(organization.guid, organization)
    }

    public reset(): void{
        this._organizationStore.reset()
    }
}
