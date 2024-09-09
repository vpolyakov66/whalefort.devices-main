import { DeviceInterface } from '../interfaces/device.interface';
import { Model, Schema } from 'mongoose';
import * as mongoose from 'mongoose';

export interface DeviceContract extends Document, DeviceInterface{}

const schema: Schema<DeviceInterface> = new Schema<DeviceInterface>({
    guid: {type: String, required: true},
    name: {type: String, required: true},
    serialNumber: {type: String},
    symlinkedWith: {type: String, required: true},
    icon: {type: String, required: false}
}, {
    toObject: {
        versionKey: false,
        transform: function(doc, ret) {
            delete ret._id;
        }
    }
})

export const DeviceSchema: Schema = schema;

export const DeviceDBM: Model<DeviceInterface> = mongoose.model<DeviceInterface>('Device', schema, 'devices')
