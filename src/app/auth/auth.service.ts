import { IUser, User } from "../../models";
import { SignUpDto } from "./auth.dto";

class AuthService {
    public async createUser(dto: SignUpDto) : Promise<IUser | Error> {
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
        const user = await User.findOne({ username }) 
        return user
    }

    public async getUserByEmail(email: string) : Promise<IUser | null> {
        const user = await User.findOne({ email })  
        return user
    }
}

export default AuthService