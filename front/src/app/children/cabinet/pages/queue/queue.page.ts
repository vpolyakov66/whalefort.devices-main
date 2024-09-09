import { ChangeDetectionStrategy, Component } from '@angular/core';
import { QueueManagerService } from '../../../../services/queue/queue-manager.service';
import { QueueQueryService } from '../../../../stores/queue/queue-query.service';
import { DeviceQueryService } from '../../../../stores/device/device-query.service';
import { tuiPure } from '@taiga-ui/cdk';
import { Observable, tap } from 'rxjs';
import { ProfileQueryService } from '../../../../stores/profile/profile-query.service';
import { QueueInterface } from '../../../../modules/queue/interfaces/queue.interface';

@Component({
    templateUrl: './queue.page.html',
    styleUrls: ['./styles/queue-page.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class QueuePage{

    @tuiPure
    public get queueList$(): Observable<QueueInterface[]>{
        return this._queueQuery.selectAll({filterBy: (queue) => queue.userInQueueList.includes(this._profileQ.getMyself().guid)})
            .pipe(
                tap((data) => console.log(data))
            )
    }

    constructor(
        private _queueMan: QueueManagerService,
        private _queueQuery: QueueQueryService,
        private _profileQ: ProfileQueryService,
    ) {
    }

    public trackBy(index: number, item: QueueInterface){
        return item.guid;
    }

}
