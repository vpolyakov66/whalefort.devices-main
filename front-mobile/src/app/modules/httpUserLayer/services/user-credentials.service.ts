import { Injectable } from '@angular/core';
import { IUserCredentionalResponseModel } from '../interfaces';

const userLSToken: string = 'userJwt';
const userRefreshLSToken: string = 'userRefreshToken';

@Injectable()
export class UserCredentialsService{


    /**
     * Получить токен
     * @return {string}
     */
    public get userToken(): string{
        return this._userToken!;
    }

    /**
     * Получить рефреш
     * @return {string}
     */
    public get refreshToken(): string {
        return this._refreshToken!;
    }

    /**
     * Установка токена
     * @param {string} token
     * @private
     */
    private set userToken(token: string){
        localStorage.setItem(userLSToken, token);
        this._userToken = token;
    }

    /**
     * Установка рефреша
     * @param {string} token
     * @private
     */
    private set refreshToken(token: string){
        localStorage.setItem(userRefreshLSToken, token);
        this._refreshToken = token;
    }

    private _refreshToken?: string;
    private _userToken?: string;

    constructor() {
        this.initialize();
    }


    /**
     * Установить пользовательские креды
     * @param {IUserCredentionalResponseModel} params
     */
    public setUserCredential(params: IUserCredentionalResponseModel): void{
        this.userToken = params.accessToken;
        this.refreshToken = params.refreshToken;
    }

    /**
     * Clear creds
     */
    public clearCredential(): void{
        localStorage.clear();
    }

    /**
     * Initialization func
     * @private
     */
    private initialize(): void{
        this.refreshToken = localStorage.getItem(userRefreshLSToken)!;
        this.userToken = localStorage.getItem(userLSToken)!;
    }
}
