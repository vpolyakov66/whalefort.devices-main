export interface CreateBuildingRequestModel{
    organizationGuid: string,
    name: string,
    address?: string,
    administratorList: string[]
}
