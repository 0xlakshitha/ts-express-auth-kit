import mongoose, {Document, Schema} from "mongoose";

export interface ISecret extends Document {
    secret: string
    purpose: "email_verification" | "password_reset"
    expiresAt: number
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
    },
    purpose: {
        type: String,
        enum: ["email_verification", "password_reset"],
        required: true
    },
    expiresAt: {
        type: Number,
        default: Date.now()
    }
}, {timestamps: true, versionKey: false, _id: false});

export const Secret = mongoose.models.Secret || mongoose.model<ISecret>("Secret", secretSchema, "secrets");