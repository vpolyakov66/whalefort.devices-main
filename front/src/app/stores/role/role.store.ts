import { ActiveState, EntityState, EntityStore, StoreConfig } from '@datorama/akita';
import { Injectable } from '@angular/core';
import { IFRole } from '../../services/role/interfaces/role.interface';

export interface IRoleState extends EntityState<IFRole, string>, ActiveState {

}

@Injectable({providedIn: 'root'})
@StoreConfig({name: 'role', idKey: 'guid', resettable: true})
export class RoleStore extends EntityStore<IRoleState> {
    constructor() {
        super()
    }

    public resetActive(): void {
        this.setActive(null);
    }
}
