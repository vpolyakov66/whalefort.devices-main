import * as express from "express";
import * as jwt from "jsonwebtoken";
import { config } from 'dotenv';
import { firstValueFrom, from, map, of, switchMap, throwError } from 'rxjs';
import { ApiKeyDBM } from '../model/api-keys/mongo-model/api-key.contract';
import { isDefined } from '../utils/is-defined.util';

export function expressAuthentication(
    request: express.Request,
    securityName: string,
    scopes?: string[]
): Promise<any> {
    if (securityName === "jwt") {
        const token: string =
            (request.headers["authorization"] as string).replace('Bearer', '').trim();
        return new Promise((resolve, reject) => {
            if (!token) {
                reject(new Error("No token provided"));
            }

            jwt.verify(token, config().parsed?.['JWT_SECRET']!, function (err: any, decoded: any) {
                if (err) {
                    reject(err);
                } else {
                    if(!scopes || scopes.length === 0){
                        resolve(decoded);
                    }

                    if((scopes!).some((s) => decoded.scopes.includes(s))){
                        resolve(decoded);

                    }

                    reject(new Error("JWT does not contain required scope."))
                }
            });
        });
    }

    if(securityName === 'api'){
        const token: string =
            (request.headers["authorization"] as string).replace('Bearer', '').trim();

        const exec = from(ApiKeyDBM.findOne({value: token}, 'symlinkedTo guid'))
            .pipe(
                switchMap((data) => {
                    if(isDefined(data)){
                        return of(data.toObject());
                    }

                    return throwError(() => new Error("API isn't correct."));
                })
            )

        return firstValueFrom(exec)
    }

    return new Promise((resolve, reject) => reject(new Error('No correct provider')))
}
