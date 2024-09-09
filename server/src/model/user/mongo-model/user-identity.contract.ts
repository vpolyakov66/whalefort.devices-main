import { Schema, Document, Model, model } from 'mongoose';
import * as mongoose from 'mongoose';
import { UserIdentityInterface } from '../interfaces/user-identity.interface';
import { ProfileDBM } from '../../profile/mongo-model/profile.contract';
import { firstValueFrom, from, of, switchMap } from 'rxjs';
const bcrypt = require('bcrypt');




export interface UserIdentityContract extends Document, UserIdentityInterface {}

const schema: Schema = new Schema({
    username: { type: String, required: false },
    password: { type: String, required: false },
    guid: { type: String, required: true },
    scopeList: [String]
}, {
    toObject: {
        versionKey: false,
        transform: function(doc, ret) {
            delete ret._id;
        }
    }
})

schema.pre('save', async function (next) {
    if(this.password){
        this.password = bcrypt.hashSync(this.password, 10);
    }
    await firstValueFrom(from(ProfileDBM.findOne({guid: this.guid}))
        .pipe(
            switchMap((data) => {
                if(!data){
                    return from(ProfileDBM.create({guid: this.guid, isActive: false}))
                }

                return of(void 0);
            })
        ))
    next()
})

export const UserIdentitySchema: Schema = schema

export const UserIdenityDBM: Model<UserIdentityInterface> = mongoose.model<UserIdentityInterface>('UserIdentity', schema, 'users');
