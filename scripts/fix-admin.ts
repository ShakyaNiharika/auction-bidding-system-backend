import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { getModelToken } from '@nestjs/mongoose';
import { User, UserRole } from '../src/schemas/user.schema';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';

async function fixAdmin() {
    const app = await NestFactory.createApplicationContext(AppModule);
    const userModel = app.get<Model<User>>(getModelToken(User.name));

    const finalEmail = 'admin@bids.com';
    const finalUsername = 'admin';
    const finalPassword = 'AdminPassword123!';
    const hashedPassword = await bcrypt.hash(finalPassword, 10);

    // Find any user that has 'admin' in username or email
    const existingUser = await userModel.findOne({ 
        $or: [{ email: finalEmail }, { username: finalUsername }, { email: 'admin@gmail.com.com' }] 
    });

    if (existingUser) {
        console.log(`Found existing user with ID ${existingUser._id}. Updating to match expected credentials...`);
        existingUser.email = finalEmail;
        existingUser.username = finalUsername;
        existingUser.password_hash = hashedPassword;
        existingUser.role = UserRole.ADMIN;
        await existingUser.save();
        console.log('Admin account fixed successfully.');
    } else {
        console.log('No admin-like user found. Creating new one...');
        const newAdmin = new userModel({
            email: finalEmail,
            username: finalUsername,
            password_hash: hashedPassword,
            first_name: 'System',
            last_name: 'Admin',
            phone_number: '9841000000',
            role: UserRole.ADMIN,
        });
        await newAdmin.save();
        console.log('New admin account created.');
    }

    console.log('-----------------------------------');
    console.log('Login with these:');
    console.log(`Email: ${finalEmail}`);
    console.log(`Password: ${finalPassword}`);
    console.log('-----------------------------------');

    await app.close();
}

fixAdmin().catch(console.error);
