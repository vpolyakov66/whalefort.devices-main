export interface HistoryRequestInterface{
    skip?: number,
    get?: number,
    to?: Date,
    from?: Date,
    deviceGuid?: string | string[]
    type?: string | string[]
    by?: string | string[]
}
