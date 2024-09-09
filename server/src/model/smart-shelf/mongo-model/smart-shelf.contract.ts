import { SmartShelfInterface } from '../interfaces/smart-shelf.interface';
import { Model, Schema } from 'mongoose';
import * as mongoose from 'mongoose';

export interface SmartShelfContract extends Document, SmartShelfInterface{}

const schema: Schema = new Schema<SmartShelfInterface>({
    state: { type: Number, required: true },
    verifyDeviceGuid: { type: String, required: false },
    deviceList: [String],
    unverifiedDeviceList: [String],
    guid: { type: String, required: true },
    apiKey: { type: String, required: false }
}, {
    toObject: {
        versionKey: false,
        transform: function(doc, ret) {
            delete ret._id;
            delete ret.apiKey;
        }
    }
})

export const SmartShelfIdentity: Schema = schema;

export const SmartShelfDBM: Model<SmartShelfInterface> = mongoose.model<SmartShelfInterface>('SmartShelf',schema, 'smartShelf')
