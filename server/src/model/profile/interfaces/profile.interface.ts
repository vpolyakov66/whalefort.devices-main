export interface IProfile{
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
    /**
     * Активен ли профиль
     */
    isActive?: boolean,
    picture?: string,
    favouriteDevices?: string[]
}
