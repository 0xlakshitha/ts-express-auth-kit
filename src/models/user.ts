import mongoose, {Document, Schema} from "mongoose";

export interface IUser extends Document {
    _id: string
    firstName?: string
    lastName?: string
    email?: string 
    mobile?: string
    nic?: string
    sponsor?: string 
    username?: string 
    password?: string 
    isEmailVerified?: boolean 
    role?: "admin" | "user" | "staff"
    profilePic?: string
    createdAt?: Date 
    updatedAt?: Date
}

const userSchema = new Schema<IUser>({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    mobile: {
        type: String,
        required: true
    },
    nic: {
        type: String,
        required: true 
    },
    sponsor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: false
    },
    username: {
        type: String,
        required: true,
        unique: true 
    },
    password: {
        type: String,
        required: true 
    },
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    role: {
        type: String,
        enum: ["admin", "user", "staff"],
        default: "user"
    },
    profilePic: {
        type: String
    }
}, {
    timestamps: true
})

userSchema.index({ email: 1, username: 1, sponsor: 1, nic: 1, mobile: 1})
userSchema.index({ email: "text", username: "text"})

export const User = mongoose.models.User || mongoose.model<IUser>("User", userSchema, "users")