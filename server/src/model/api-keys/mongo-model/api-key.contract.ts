import { ApiKeyInterface } from '../interfaces/api-key.interface';
import { Model, Schema } from 'mongoose';
import * as mongoose from 'mongoose';

export interface ApiKeyContract extends Document, ApiKeyInterface{}

const schema: Schema<ApiKeyInterface> = new Schema<ApiKeyInterface>({
    createdAt: { type: Date, required: true},
    createdBy: { type: 'string', required: true},
    symlinkedTo: { type: 'string', required: true },
    value: { type: 'string', required: true },
    guid: { type: 'string', required: true }
}, {
    toObject: {
        versionKey: false,
        transform: function(doc, ret) {
            delete ret._id;
        }
    }
})

export const ApiKeySchema: Schema = schema;

export const ApiKeyDBM: Model<ApiKeyInterface> = mongoose.model<ApiKeyInterface>('keys', schema, 'keys')
