import { ShelfStateEnum } from '../../../modules/smartshelf/enum/shelf-state.enum';

export interface SmartShelfRequestModel{
    deviceGuid: string,
    orgGuid: string,
    reason: ShelfStateEnum
}
