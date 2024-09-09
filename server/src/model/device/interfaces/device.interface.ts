export interface DeviceInterface{
    guid: string,
    name: string,
    serialNumber?: string,
    icon?: string
    symlinkedWith: string

    physicLocation?: {
        info: string,
        x: number,
        y: number
    }
}
