import { DeviceInterface } from '../../device/interfaces/device.interface';
import { Model, Schema } from 'mongoose';
import mongoose from 'mongoose';
import { EventInterface } from '../interface/event.interface';


export interface HistoryEventContract extends Document, EventInterface{}

const schema: Schema<EventInterface> = new Schema<EventInterface>({
    type: { type: String, required: true},
    createdAt: { type: 'Date', required: true},
    object: { type: String, required: true },
    subject: { type: String, required: true}
}, {
    toObject: {
        versionKey: false,
        transform: function(doc, ret) {
            delete ret._id;
        }
    }
})

export const HistoryEventSchema: Schema = schema;

export const HistoryDBM: Model<EventInterface> = mongoose.model<EventInterface>('History', schema, 'history')
