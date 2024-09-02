import * as argon from 'argon2';
import { User } from '../src/models/user';

export async function seedAdmin(): Promise<void> {
    await User.create({
        firstName: "Super",
        lastName: "Admin",
        email: "admin@system.com",
        username: "admin",
        password: await argon.hash("Admin@123"),
        isEmailVerified: true,
        status: "active",
        role: "admin"
    })

    console.log("Admin seeded successfully")
}