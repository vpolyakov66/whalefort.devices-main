import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { DeviceQueryService } from '../../../../stores/device/device-query.service';
import { ProfileQueryService } from '../../../../stores/profile/profile-query.service';
import { QueueQueryService } from '../../../../stores/queue/queue-query.service';
import { finalize, map, Observable, of, retry, retryWhen, switchMap, tap, throwError } from 'rxjs';
import { IFProfile } from '../../../../services/profile/interfaces/profile.interface';
import { filterNilValue } from '@datorama/akita';
import { IDevice } from '../../../../modules/device-module/interfaces/device.interface';
import { AsyncPipe, NgForOf, NgTemplateOutlet } from '@angular/common';
import { UserAvatarComponent } from '../user-avatar/user-avatar.component';
import { TuiIslandModule } from '@taiga-ui/kit';
import { TuiLetModule, tuiPure } from '@taiga-ui/cdk';
import { TuiSvgModule } from '@taiga-ui/core';

@Component({
    selector: 'art-device-queue',
    templateUrl: './device-queue.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    styleUrls: ['./styles/device-queue.scss'],
    standalone: true,
    imports: [
        NgTemplateOutlet,
        UserAvatarComponent,
        AsyncPipe,
        NgForOf,
        TuiIslandModule,
        TuiLetModule,
        TuiSvgModule
    ]
})
export class DeviceQueueComponent{
    @Input()
    public isFlatten: boolean = false;

    @Input()
    public deviceGuid?: string;

    @tuiPure
    public get device$(): Observable<IDevice>{
        return this._deviceQ.selectActive()
            .pipe(
                switchMap((id) => {
                    if (id){
                        return of(id)
                    }

                    return this._deviceQ.getAllDevice()
                        .pipe(
                            switchMap((device) => {
                                if (device.length === 0){
                                    return throwError(() => {})
                                }

                                return of(void 0);
                            }),
                            retry({count: 3, delay: 200}),
                            switchMap(() => {
                                return this._deviceQ.selectEntity((d) => d.guid === this.deviceGuid)
                                    .pipe(
                                        filterNilValue(),
                                        tap(() => {
                                            console.log(this.deviceGuid);
                                            console.log('bruh')
                                        })
                                    )
                            })
                        )
                })
            )
    }

    @tuiPure
    public get profiles$(): Observable<IFProfile[]>{
        return this._queueQ.selectEntity((q) => q.guid === this.deviceGuid)
            .pipe(
                filterNilValue(),
                switchMap((query) => {
                    return this._profileQ.selectManyEntity$(query.userInQueueList ?? []);
                })
            )
    }

    constructor(
        private _deviceQ: DeviceQueryService,
        private _profileQ: ProfileQueryService,
        private _queueQ: QueueQueryService,
    ) {
    }
}
