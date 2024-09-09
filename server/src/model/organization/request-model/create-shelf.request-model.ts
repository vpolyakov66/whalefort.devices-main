export interface CreateShelfRequestModel{
    name: string,
    organizationGuid: string,
    buildingGuid: string,
    unitGuid?: string,
    isSmartShelf?: boolean
}
