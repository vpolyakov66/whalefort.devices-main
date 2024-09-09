import express from 'express';
import bodyParser from 'body-parser';
import { catchError, from, tap, throwError } from 'rxjs';
import { connect } from 'mongoose';
import morgan from 'morgan';
import { RegisterRoutes } from '../public/routes';
const swaggerUi = require('swagger-ui-express')
import swaggerJson from '../public/swagger.json';
import { config } from 'dotenv';
import { QueueDaemonService } from './services/queueDaemon/queue-daemon.service';
import { autoInjectable, injectable, singleton } from 'tsyringe';
import { ValidationService } from '@tsoa/runtime';

import admin from 'firebase-admin';

const serviceAccount = require("./serviceAccount.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});


@injectable()
class App {
    public app: express.Application;
    public port: number;

    /**
     * Корень приложения.
     * @param _qD
     */
    constructor(
            private _qD?: QueueDaemonService
        ) {
        this.app = express();
        this.port = 5004;

        /**
         * Инициализируем все middleware
         */
        this.initializeMiddlewares();

        /**
         * Инициализируем необходимые контроллеры
         */
        this.initializeControllers();
        /**
         * Открываем соединения к БД
         */
        this.initializeConnectors();
        /**
         * Открывем доступ к Web-интерфейсу Swagger'a
         */
        this.initializeSwaggerUI();

        console.log(config().parsed?.['JWT_SECRET']);
    }

    /**
     * Инициализируем доступ к Swagger
     * @private
     */
    private initializeSwaggerUI(){
        this.app.use(
            "/api-docs",
            swaggerUi.serve,
            /**
             * Т.к. TSOA хранит OpenAPI спеки в JSON, передаем
             * в делегат сконфигурированный файл OAPI-specs
             */
            swaggerUi.setup(swaggerJson)
        );

    }

    private initializeConnectors() {
        from(connect('mongodb://database:27017', {
            auth: {
                username: 'dale',
                password: 'rootpassword'
            },
            dbName: 'dev'
        }))
            .pipe(
                tap((res: any) => {
                }),
                catchError((err, caught) => {
                    console.log(err);

                    return throwError(() => {})
                })
            )
            .subscribe()
    }

    private initializeMiddlewares() {
        this.app.use(bodyParser.json());
        this.app.use(express.json());
        this.app.use(morgan('dev'));
        this.app.use(express.urlencoded({extended: true}));
    }

    private initializeControllers() {
        ValidationService.prototype.ValidateParam = (
            property,
            rawValue,
            name = '',
            fieldErrors,
            parent = '',
            minimalSwaggerConfig
        ) => rawValue;

        RegisterRoutes.prototype.getValidatedArgs = (
            args: any,
            request: any,
            response: any
        ) => Object.keys(args);

        RegisterRoutes(this.app);
    }

    public listen() {
        this.app.listen(this.port, () => {
            console.log(`App listening on the port ${this.port}`);
        });
    }
}

const app = new App();

app.listen()
