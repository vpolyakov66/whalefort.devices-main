export interface QueueInterface{
    userInQueueList: string[]
    guid: string,
    /**
     * В руках пользователя по guid
     */
    inHandUserId: string | null,
    /**
     * Время последнего изменения - взятие в руки или сдача устройства
     */
    lastChangeUtc: Date,
}
