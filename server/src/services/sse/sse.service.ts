import { singleton } from 'tsyringe';
import SSE from 'express-sse-ts';
import { SSEEventName } from './enum/event-name.enum';
import { interval, tap } from 'rxjs';

@singleton()
export class SseService{
    private _sseConnectionCahce: Map<string, SSE> = new Map<string, SSE>();

    constructor() {
    }

    public createConnection(recipientGuid: string): SSE{
        this._sseConnectionCahce.set(recipientGuid, new SSE())

        return this._sseConnectionCahce.get(recipientGuid)!;
    }

    public sendEvent(recipientIdList: string[], data: string, eventName?: SSEEventName | string, id?: string): void{
        console.log(recipientIdList);
        recipientIdList
            .filter((query) => this._sseConnectionCahce.has(query))
            .forEach((connection: string) => {
                console.log(connection, this._sseConnectionCahce.get(connection));
                this._sseConnectionCahce.get(connection)?.send(JSON.stringify({data: data, eventName: eventName, id: id}))
            })
    }

    public sendEvent$(recipientIdList: string[], data: string, eventName?: SSEEventName | string, id?: string): void{
        recipientIdList
            .filter((query) => this._sseConnectionCahce.has(query))
            .forEach((connection: string) => {
                console.log(connection, this._sseConnectionCahce.get(connection));

                this._sseConnectionCahce.get(connection)?.send(`${data} `, `${eventName}`, id);
            })
    }
}
