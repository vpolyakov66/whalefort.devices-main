import { IDevice } from '../../../modules/device-module/interfaces/device.interface';

export interface IFDeviceCreateRequestModel extends Omit<IDevice, 'guid'>{

}
