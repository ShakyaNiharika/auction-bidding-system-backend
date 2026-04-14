import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { getModelToken } from '@nestjs/mongoose';
import { User } from '../src/schemas/user.schema';
import { Model } from 'mongoose';

async function checkUser() {
    const app = await NestFactory.createApplicationContext(AppModule);
    const userModel = app.get<Model<User>>(getModelToken(User.name));

    const adminEmail = 'admin@bids.com';
    const adminUsername = 'admin';

    const byEmail = await userModel.findOne({ email: adminEmail });
    const byUsername = await userModel.findOne({ username: adminUsername });

    console.log('User found by email admin@bids.com:', byEmail ? {
        id: byEmail._id,
        email: byEmail.email,
        username: byEmail.username,
        role: byEmail.role,
        hasPassword: !!byEmail.password_hash
    } : 'NOT FOUND');

    console.log('User found by username admin:', byUsername ? {
        id: byUsername._id,
        email: byUsername.email,
        username: byUsername.username,
        role: byUsername.role,
        hasPassword: !!byUsername.password_hash
    } : 'NOT FOUND');

    await app.close();
}

checkUser().catch(console.error);
