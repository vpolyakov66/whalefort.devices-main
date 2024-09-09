import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BehaviorSubject, Observable, take, tap } from 'rxjs';
import { AuthService } from '../../../httpUserLayer';
import { FormControl } from '@angular/forms';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    styleUrls: [],
    templateUrl: './reserve-user.modal-component.html'
})
export class ReserveUserModalComponent{

    public guidControl = new FormControl('');

    public get reservedGuid(): Observable<string>{
        return this._reservedGuid$.asObservable();
    }

    private _reservedGuid$: BehaviorSubject<string> = new BehaviorSubject<string>('');

    constructor(
        private _authService: AuthService
    ) {
        this._authService.reserve()
            .pipe(
                tap((guid: string) => {
                    this._reservedGuid$.next(guid)
                    this.guidControl.setValue(guid);
                }),
                take(1)
            ).subscribe()
    }
}
