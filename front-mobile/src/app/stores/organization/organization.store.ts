import { ActiveState, EntityState, EntityStore, StoreConfig } from '@datorama/akita';
import { Injectable } from '@angular/core';
import { IOrganization } from '../../modules/organization/interfaces/organization-root.interface';

export interface IOrganiztionState extends EntityState<IOrganization, string>, ActiveState{

}

@Injectable({providedIn: 'root'})
@StoreConfig({name: 'organization', idKey: 'guid', resettable: true})
export class OrganizationStore extends EntityStore<IOrganiztionState>{
    constructor() {
        super()
    }
}
