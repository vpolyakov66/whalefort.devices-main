import { HistoryTypeEnum } from '../enums/history-type.enum';

export interface IFHistoryEvent{
    type: HistoryTypeEnum,
    object: string,
    subject: string,
    createdAt: Date
}
