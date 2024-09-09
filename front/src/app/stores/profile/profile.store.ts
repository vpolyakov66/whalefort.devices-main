import { ActiveState, EntityState, EntityStore, StoreConfig } from '@datorama/akita';
import { IOrganization } from '../../modules/organization/interfaces/organization-root.interface';
import { Injectable } from '@angular/core';
import { IFProfile } from '../../services/profile/interfaces/profile.interface';

export interface IProfileState extends EntityState<IFProfile, string>, ActiveState{
    myself?: IFProfile
}

@Injectable({providedIn: 'root'})
@StoreConfig({name: 'profile', idKey: 'guid', resettable: true})
export class ProfileStore extends EntityStore<IProfileState>{
    constructor() {
        super()
    }
}
