import { ServerEventName } from '../enum/sse-event.enum';

export interface IFServerEvent{
    data: string,
    eventName: ServerEventName,
    id: string
}
