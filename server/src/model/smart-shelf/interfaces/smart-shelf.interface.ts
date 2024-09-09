import { ShelfState } from '../enum/shelf-state.enum';

export interface SmartShelfInterface{
    state: ShelfState,
    verifyDeviceGuid?: string,
    deviceList: string[]
    unverifiedDeviceList: string[]
    guid: string,
    apiKey: string
}
