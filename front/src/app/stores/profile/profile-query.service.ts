import { QueryEntityBase } from '../../utils/query-entity.base';
import { IProfileState, ProfileStore } from './profile.store';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IFProfile } from '../../services/profile/interfaces/profile.interface';
import { filterNilValue } from '@datorama/akita';

@Injectable({providedIn: 'root'})
export class ProfileQueryService extends QueryEntityBase<IProfileState>{
    constructor(
        private _store: ProfileStore
    ) {
        super(_store);
    }

    public getMyself$(): Observable<IFProfile>{
        return this._store._select((store) => store.myself)
            .pipe(
                filterNilValue()
            );
    }

    public getMyself(): IFProfile{
        return this._store.getValue().myself!;
    }
}
