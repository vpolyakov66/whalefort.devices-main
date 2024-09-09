import { IOrganizationRoot } from '../interfaces/organization-root.interface';
import { Schema, Document, Model, model } from 'mongoose';
import * as mongoose from 'mongoose';
import { IAbstractNode } from '../interfaces/abstract-node.interface';
import { IBuildingNode } from '../interfaces/building-node.interface';
import { IUnitNode } from '../interfaces/unit-node.interface';
import { IShelfNode } from '../interfaces/shelf-node.interface';


export interface OrganizationContract extends Document, IOrganizationRoot{}


const ShelfSchema: Schema< IShelfNode> = new Schema< IShelfNode>({
    guid: { type: String, required: true },
    type: { type: String, required: true },
    parent: { type: String, required: true },
    leafList: [String],
    children: [Object],
    comment: { type: String, required: false },
    name: { type: String, required: false},
    isSmartShelf: { type: Boolean, required: false}
})

const UnitSchema: Schema<IUnitNode | IShelfNode> = new Schema<IUnitNode | IShelfNode>({
    guid: { type: String, required: true },
    type: { type: String, required: true },
    parent: { type: String, required: true },
    leafList: [String],
    children: [ShelfSchema],
    comment: { type: String, required: false },
    name: { type: String, required: false},
    administratorList: [String],
})

const BuildingSchema: Schema<IBuildingNode> = new Schema<IBuildingNode>({
    guid: { type: String, required: true },
    type: { type: String, required: true },
    parent: { type: String, required: true },
    leafList: [String],
    children: [UnitSchema],
    comment: { type: String, required: false },
    name: { type: String, required: false},
    address: { type: String, required: false },
    administratorList: [String],
})

const schema: Schema<IOrganizationRoot> = new Schema<IOrganizationRoot>({
    name: { type: String, required: true },
    guid: { type: String, required: true },
    type: { type: String, required: true },
    children: [ BuildingSchema ],
    parent: { type: String, default: null },
    leafList: [String],
    ownerGuid: { type: String, required: true }
}, {
    toObject: {
        versionKey: false,
        transform: function(doc, ret) {
            delete ret._id;
        }
    }
})

export const OrganizationSchema: Schema = schema;

export const OrganizationDBM: Model<IOrganizationRoot> = mongoose.model<IOrganizationRoot>('OrganizationRoot', schema, 'organizations');

