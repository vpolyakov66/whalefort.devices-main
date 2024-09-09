import { singleton } from 'tsyringe';
import { HistoryEventType } from '../../model/event/enum/history-event.type';
import { HistoryDBM } from '../../model/event/mongo-model/hystory-event.contract';
import dayjs from 'dayjs';
import { from, retry, take } from 'rxjs';

@singleton()
export class HistoryMoonService{

    public sentEvent(type: HistoryEventType, who: string, which: string): void{
        const executable = from(HistoryDBM.create({
            type,
            subject: who,
            object: which,
            createdAt: dayjs().toDate()
        }))
            .pipe(
                retry({delay: 500, count: 3}),
                take(1)
            )

        executable.subscribe();
    }
}
