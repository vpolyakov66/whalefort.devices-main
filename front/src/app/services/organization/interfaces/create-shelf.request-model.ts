import { IFCreateBuildingRequestModel } from './create-building.request-model';

export interface IFCreateShelfRequestModel{
    name: string,
    organizationGuid: string,
    buildingGuid: string,
    unitGuid?: string,
    isSmartShelf?: boolean
}
