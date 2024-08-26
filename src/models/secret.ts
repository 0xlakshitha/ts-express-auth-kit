import mongoose, {Document, Schema} from "mongoose";

export interface ISecret extends Document {
    secret: string
    createdAt?: Date
    updatedAt?: Date
}

const secretSchema = new Schema<ISecret>({
    _id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    secret: {
        type: String,
        required: true
    }
}, {timestamps: true, versionKey: false, _id: false});

export const Secret = mongoose.models.Secret || mongoose.model<ISecret>("Secret", secretSchema, "secrets");