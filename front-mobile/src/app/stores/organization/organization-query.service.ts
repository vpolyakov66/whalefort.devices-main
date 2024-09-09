import { QueryEntityBase } from '../../utils/query-entity.base';
import { IOrganiztionState, OrganizationStore } from './organization.store';
import { Injectable } from '@angular/core';

@Injectable({providedIn: 'root'})
export class OrganizationQueryService extends QueryEntityBase<IOrganiztionState>{
    constructor(
        private _store: OrganizationStore
    ) {
        super(_store);
    }
}
