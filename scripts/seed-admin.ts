import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { AuthService } from '../src/auth/auth.service';
import { getModelToken } from '@nestjs/mongoose';
import { User, UserRole } from '../src/schemas/user.schema';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';

async function seedAdmin() {
    const app = await NestFactory.createApplicationContext(AppModule);
    const userModel = app.get<Model<User>>(getModelToken(User.name));

    const adminEmail = 'admin@bids.com';
    const adminUsername = 'admin';
    const adminPassword = 'AdminPassword123!';
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    const existingAdmin = await userModel.findOne({ $or: [{ email: adminEmail }, { username: adminUsername }] });

    if (existingAdmin) {
        console.log('Admin user already exists. Updating password...');
        existingAdmin.password_hash = hashedPassword;
        existingAdmin.role = UserRole.ADMIN;
        await existingAdmin.save();
        console.log('Admin password updated successfully.');
    } else {
        console.log('Creating new admin user...');
        const newAdmin = new userModel({
            email: adminEmail,
            username: 'admin',
            password_hash: hashedPassword,
            first_name: 'System',
            last_name: 'Admin',
            phone_number: '9841000000',
            role: UserRole.ADMIN,
        });
        await newAdmin.save();
        console.log('Admin user created successfully.');
    }

    console.log('-----------------------------------');
    console.log('Admin Credentials:');
    console.log(`Email: ${adminEmail}`);
    console.log(`Password: ${adminPassword}`);
    console.log('-----------------------------------');

    await app.close();
}

seedAdmin().catch((err) => {
    console.error('Error seeding admin:', err);
    process.exit(1);
});
