import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { DeviceQueryService } from '../../../../stores/device/device-query.service';
import { OrganizationManagerService } from '../../../../services/organization/organization-manager.service';
import { BehaviorSubject, filter, Observable, take, tap } from 'rxjs';
import { tuiPure } from '@taiga-ui/cdk';
import { SmartShelfManagerService } from '../../../../services/smart-shelf/smart-shelf-manager.service';
import { POLYMORPHEUS_CONTEXT } from '@tinkoff/ng-polymorpheus';
import { TuiDialogContext } from '@taiga-ui/core';
import { SmartShelfQueryService } from '../../../../stores/smartshelf/smart-shelf-query.service';
import { filterNilValue } from '@datorama/akita';
import { ShelfStateEnum } from '../../../smartshelf/enum/shelf-state.enum';
import { ServerEventService } from '../../../../services/sse/server-event.service';
import { ServerEventName } from '../../../../services/sse/enum/sse-event.enum';

@Component({
    templateUrl: './device-register.modal-component.html',
    styleUrls: [],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DeviceRegisterModalComponent{

    @tuiPure
    public get currentStep$(): Observable<number>{
        return this._currentStep;
    }

    private _currentStep: BehaviorSubject<number> = new BehaviorSubject<number>(0);

    constructor(
        private _deviceQ: DeviceQueryService,
        private _orgMan: OrganizationManagerService,
        private _shelfMan: SmartShelfManagerService,
        private _shelfQ: SmartShelfQueryService,
        private _sse: ServerEventService,
        @Inject(POLYMORPHEUS_CONTEXT)
        private readonly _context: TuiDialogContext<void, void>,
    ) {
        this.initialize()
    }

    public initialize(): void{
        this._shelfQ.selectActive()
            .pipe(
                filterNilValue(),
                filter((shelf) => shelf.state === ShelfStateEnum.openForAdding),
                tap((shelf) => {
                    this._currentStep.next(1)
                }),
                take(1)
            ).subscribe()
    }

    public openForAdding(): void{
        this._shelfMan.openForAdding().subscribe()
        this._shelfQ.selectActive()
            .pipe(
                filterNilValue(),
                filter((shelf) => shelf.state === ShelfStateEnum.verifyComplete),
                tap((shelf) => {
                    this._currentStep.next(2)
                }),
                take(1)
            ).subscribe()

    }

    public beginRegister(): void{
        this._shelfMan.beginRegistration().subscribe()
        this._sse.listenEvent([ServerEventName.deviceRegistered])
            .pipe(
                tap(() => {
                    this._currentStep.next(2);
                }),
                take(1)
            ).subscribe()
    }

    public completeFlow(): void{
        this._context.completeWith();
    }

    public cancelFlow(): void{
        this._shelfMan.cancelRegistration().subscribe()
    }
}
