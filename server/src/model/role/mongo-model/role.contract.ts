import { IRole } from '../interfaces/role.interface';
import { Model, Schema } from 'mongoose';
import * as mongoose from 'mongoose';

export interface RoleContract extends Document, IRole{}

const schema: Schema<IRole> = new Schema<IRole>({
    guid: { type: String, required: true },
    adminList: [String],
    deviceList: [String],
    ownerList: [String],
    userList: [String],
    alias: {type: String, required: true},
    organizationGuid: { type: 'string', required: true }
}, {
    toObject: {
        versionKey: false,
        transform: function(doc, ret) {
            delete ret._id;
        }
    }
})

export const RoleSchema: Schema = schema;

export const RoleDBM: Model<IRole> = mongoose.model<IRole>('Role', schema, 'roles')
