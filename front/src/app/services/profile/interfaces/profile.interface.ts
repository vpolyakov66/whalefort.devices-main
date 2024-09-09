export interface IFProfile{
    guid: string
    firstName: string;
    secondName: string;
    /**
     * Ссылка на мессенджер
     */
    link: string;
    /**
     * Номер телефона для связи
     */
    phone: string;
    /**
     * Связан с организацией | GUID ORG
     */
    symlinkedWith: string[],
    isActive: boolean,
    picture?: string,
    favouriteDevices?: string[]
}
