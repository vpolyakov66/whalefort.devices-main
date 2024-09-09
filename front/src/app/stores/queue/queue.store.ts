import { ActiveState, applyTransaction, EntityState, EntityStore, StoreConfig, transaction } from '@datorama/akita';
import { QueueInterface } from '../../modules/queue/interfaces/queue.interface';
import { Injectable } from '@angular/core';
import { IDeviceState } from '../device/device.store';

export interface IQueueState extends EntityState<QueueInterface, string>, ActiveState{

}

@Injectable({providedIn: 'root'})
@StoreConfig({name: 'queue', idKey: 'guid', resettable: true})
export class QueueStore extends EntityStore<IQueueState>{
    constructor() {
        super()
    }

    public resetActive(): void{
        this.setActive(null);
    }
    @transaction()
    public setState(queueList: QueueInterface[]): void{
        applyTransaction(() => {
            this.getValue().entities
            console.log(this.getValue().entities);
        })

        this.reset();
        queueList.forEach((q) => {
            this.upsert(q.guid, q);
        })
    }
}
