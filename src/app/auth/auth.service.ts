import { ISecret, IUser, Secret, User } from "../../models";
import { SignUpDto } from "./auth.dto";

class AuthService {
    public async createUser(dto: SignUpDto) : Promise<IUser> {
        const user = new User({
            ...dto
        })

        const result = await user.save()

        return result
    }

    public async getUserById(id: string) : Promise<IUser | null> {
        const user = await User.findById(id) 
        return user
    }

    public async getUserByUsername(username: string) : Promise<IUser | null> {
        // need to ignore case
        const user = await User.findOne({ username : { $regex: new RegExp(username, "i") } }) 
        return user
    }

    public async getUserByEmail(email: string) : Promise<IUser | null> {
        const user = await User.findOne({ email })  
        return user
    }

    public async getUserByEmailOrUsername(username: string) : Promise<IUser | null> {
        const user = await User.findOne({ $or: [{ username }, { email: username }] })
        return user 
    }

    public async createScret(_id: string, secret: string, purpose: "email_verification" | "password_reset", expiresAt: number = Date.now()) : Promise<void> {
        await Secret.updateOne({
            _id
        }, {
            secret,
            purpose,
            expiresAt
        }, {
            upsert: true
        })
    }

    public async getSecret(_id: string) : Promise<ISecret | null> {
        const secret = await Secret.findById(_id)
        return secret
    }

    public async getSecretBySecret(secret: string) : Promise<ISecret | null> {
        const secretDoc = await Secret.findOne({ secret })
        return secretDoc
    }

    public async updateEmailVerificationStatus(id: string) : Promise<void> {
        await User.updateOne({ _id: id }, { isEmailVerified: true })
    }

    public async deleteEmailVerificationSecret(id: string) : Promise<void> {
        await Secret.deleteOne({ _id: id })
    }

    public async updatePassword(id: string, password: string) : Promise<void> {
        await User.updateOne({ _id: id }, { password }) 
    }

    public async getUserByNic(nic: string) : Promise<IUser | null> {
        const user = await User.findOne({ nic: {
            $regex: new RegExp(nic, "i")
        } })
        return user
    }

    public async getUserByMobile(mobile: string) : Promise<IUser | null> {
        const user = await User.findOne({ mobile })
        return user
    }
}

export default AuthService