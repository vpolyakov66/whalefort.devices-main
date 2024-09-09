import { QueueInterface } from '../interfaces/queue.interface';
import { Model, Schema } from 'mongoose';
import * as mongoose from 'mongoose';

export interface QueueContract extends Document, QueueInterface{}

const schema: Schema<QueueInterface> = new Schema<QueueInterface>({
    guid: { type: String, required: true },
    inHandUserId: { type: String },
    lastChangeUtc: { type: Date },
    userInQueueList: [String]
}, {
    toObject: {
        versionKey: false,
        transform: function(doc, ret) {
            delete ret._id;
        }
    }
})

export const QueueSchema: Schema = schema;

export const QueueDBM: Model<QueueInterface> = mongoose.model<QueueInterface>('Queue', schema, 'queues');
