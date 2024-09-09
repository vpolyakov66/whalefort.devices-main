import { Injectable } from '@angular/core';
import { ProfileStore } from './profile.store';
import { IOrganization } from '../../modules/organization/interfaces/organization-root.interface';
import { IFProfile } from '../../services/profile/interfaces/profile.interface';

@Injectable({providedIn: 'root'})
export class ProfileStoreService {
    constructor(
        private _organizationStore: ProfileStore,
    ) {
    }

    public setActive(guid: string): void{
        this._organizationStore.setActive(guid)
    }

    public upsertProfile(profile: IFProfile){
        this._organizationStore.upsert(profile.guid, profile)
    }

    public upsertMyself(profile: IFProfile){
        this._organizationStore.update({myself: profile})
    }
}
