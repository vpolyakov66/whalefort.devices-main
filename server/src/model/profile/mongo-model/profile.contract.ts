import { IProfile } from '../interfaces/profile.interface';
import { Model, Schema } from 'mongoose';
import * as mongoose from 'mongoose';

export interface ProfileContract extends Document, IProfile{}

const schema: Schema<IProfile> = new Schema<IProfile>({
    guid: { type: String, required: true },
    phone: { type: String, required: false },
    link: { type: String, required: false },
    firstName: { type: String, required: false },
    secondName: { type: String, required: false },
    symlinkedWith: [String],
    isActive: { type: Boolean, required: false },
    favouriteDevices: [String],
    picture: { type: String, required: false }
}, {
    toObject: {
        versionKey: false,
        transform: function(doc, ret) {
            delete ret._id;
        }
    }
})

export const ProfileSchema: Schema = schema;

export const ProfileDBM: Model<IProfile> = mongoose.model<IProfile>('Profile', schema, 'profiles')
