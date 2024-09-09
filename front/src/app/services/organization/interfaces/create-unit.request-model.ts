import { IFCreateBuildingRequestModel } from './create-building.request-model';

export interface IFCreateUnitRequestModel{
    name: string,
    administratorList: string[]
    organizationGuid: string,
    buildingGuid: string
}
