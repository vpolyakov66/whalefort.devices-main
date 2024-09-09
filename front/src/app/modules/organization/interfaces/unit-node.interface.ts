import { IAbstractNode } from './abstract-node.interface';

export interface IUnit extends IAbstractNode{
    name: string
    administratorList: string[]
}
