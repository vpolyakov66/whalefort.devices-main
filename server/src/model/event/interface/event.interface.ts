import { HistoryEventType } from '../enum/history-event.type';

export interface EventInterface{
    type: HistoryEventType,
    object: string,
    subject: string,
    createdAt: Date
}
