import { Injectable } from '@angular/core';
import { IRoleState, RoleStore } from '../role/role.store';
import { QueryEntityBase } from '../../utils/query-entity.base';
import { IFSmartShelf } from '../../modules/smartshelf/interfaces/smart-shelf.interface';
import { ISmartShelfState, SmartShelfStore } from './smartshelf.store';

@Injectable({providedIn: 'root'})

export class SmartShelfQueryService extends QueryEntityBase<ISmartShelfState> {
    constructor(
        private _store: SmartShelfStore
    ) {
        super(_store)
    }
}
