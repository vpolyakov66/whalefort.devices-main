import { ShelfStateEnum } from '../enum/shelf-state.enum';

export interface IFSmartShelf{
    state: ShelfStateEnum,
    verifyDeviceGuid?: string,
    deviceList: string[]
    unverifiedDeviceList: string[]
    guid: string,
    apiKey: string
}
