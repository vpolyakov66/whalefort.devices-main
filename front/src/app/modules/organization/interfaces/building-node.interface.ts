import { IAbstractNode } from './abstract-node.interface';

export interface IBuilding extends IAbstractNode{
    name: string
    administratorList: string[]
    address?: string
}
