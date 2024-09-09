import { ActiveState, EntityState, EntityStore, StoreConfig } from '@datorama/akita';
import { IFRole } from '../../services/role/interfaces/role.interface';
import { Injectable } from '@angular/core';
import { IFSmartShelf } from '../../modules/smartshelf/interfaces/smart-shelf.interface';

export interface ISmartShelfState extends EntityState<IFSmartShelf, string>, ActiveState {

}

@Injectable({providedIn: 'root'})
@StoreConfig({name: 'smartshelf', idKey: 'guid', resettable: true})
export class SmartShelfStore extends EntityStore<ISmartShelfState> {
    constructor() {
        super()
    }

    public resetActive(): void {
        this.setActive(null);
    }
}
