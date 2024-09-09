import { Injectable } from '@angular/core';
import { IRoleState, RoleStore } from './role.store';
import { QueryEntityBase } from '../../utils/query-entity.base';

@Injectable({providedIn: 'root'})
export class RoleQueryService extends QueryEntityBase<IRoleState> {
    constructor(
        private _store: RoleStore
    ) {
        super(_store)
    }
}
