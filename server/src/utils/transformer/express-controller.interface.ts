import { Router } from 'express';

export interface IExpressController{
    path: string
    router: Router
}
