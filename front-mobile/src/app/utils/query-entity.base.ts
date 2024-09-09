import { EntityState, EntityStore, getEntityType, getIDType, QueryEntity } from '@datorama/akita';
import { Observable } from 'rxjs';

export abstract class QueryEntityBase<T extends EntityState> extends QueryEntity<T>{

    /**
     * Все сущности из стора
     */
    public allEntity$: Observable<Array<getEntityType<T>>> = this.selectAll();
    /**
     * Первая сущность в сторе
     */
    public firstEntity$: Observable<getEntityType<T> | undefined> = this.selectFirst();
    /**
     * Последняя сущность в сторе
     */
    public lastEntity$: Observable<getEntityType<T> | undefined> = this.selectLast();
    /**
     * Не знаю нужно будет ли это вообще, думаю оставить пока это, возможнго потом для сторов будем определять ErrorType
     * Select the error state
     */
    public error$: ErrorType = this.selectError();
    /**
     * Количество сущностей в сторе
     */
    public count$: Observable<number> = this.selectCount();
    /**
     * Узнать состояние загрузки хранилища
     */
    public loading$: Observable<boolean> = this.selectLoading();
    /**
     * Содержит поток индефикаторов активных сущностей из стора
     */
    public activeId$: Observable<Array<getIDType<T>> | getIDType<T> | undefined> = this.selectActiveId();
    /**
     * Активные сущности в сторе
     */
    public active$: Observable<Array<getEntityType<T>> | getEntityType<T> | undefined> = this.selectActive();

    constructor(store: EntityStore<T>) {
        super(store);
    }

    /**
     * Поток массива сущностей из стора по массиву индефикаторов
     * @param ids Array<getIDType<T>>
     * @returns  Observable<Array<getEntityType<T>>>
     */
    public selectManyEntity$ = (ids: Array<getIDType<T>>): Observable<Array<getEntityType<T>>> => this.selectMany(ids);

    /**
     * Метод возвращает Observable с сущностью содержащейсе в сторе по индефикаторов
     * @param id getIDType<T>
     * @returns  Observable<Array<getEntityType<T>>> или Observable<undefined>
     */
    public entityById$ = (id: getIDType<T>): Observable<getEntityType<T> | undefined> => this.selectEntity(id);
}

export type ErrorType = unknown;
