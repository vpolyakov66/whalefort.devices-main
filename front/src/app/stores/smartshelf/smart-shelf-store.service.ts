import { Injectable } from '@angular/core';
import { SmartShelfStore } from './smartshelf.store';
import { IFSmartShelf } from '../../modules/smartshelf/interfaces/smart-shelf.interface';

@Injectable({providedIn: 'root'})
export class SmartShelfStoreService{
    constructor(
        private _shelfStore: SmartShelfStore,
    ) {
    }

    public setActive(guid: string): void{
        this._shelfStore.setActive(guid);
    }

    public resetActive(): void{
        this._shelfStore.resetActive();
    }

    public upsertShelf(shelf: IFSmartShelf): void{
        this._shelfStore.upsert(shelf.guid, shelf)
    }
}
