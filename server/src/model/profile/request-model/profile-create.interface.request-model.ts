export interface ProfileCreateInterfaceRequestModel{
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
    guid: string;
}
