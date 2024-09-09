export interface TransactionRequestModel{
    orgGuid: string
    deviceGuid: string
    from?: {
        building?: string,
        unit?: string,
        shelf?: string
    },
    to: {
        building: string,
        unit: string,
        shelf?: string
    }
}
