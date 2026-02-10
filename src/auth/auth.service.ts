import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { User } from '../schemas/user.schema';

@Injectable()
export class AuthService {
    constructor(
        @InjectModel(User.name) private userModel: Model<User>,
        private jwtService: JwtService,
    ) { }

    async register(userData: any) {
        const { email, username, password, first_name, last_name, phone_number, address, date_of_birth, role } = userData;

        // Check if user already exists
        const existingUser = await this.userModel.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            throw new ConflictException('User with this email or username already exists');
        }

        // Hash password
        const password_hash = await bcrypt.hash(password, 10);

        // Create new user
        const newUser = new this.userModel({
            email,
            username,
            password_hash,
            first_name,
            last_name,
            phone_number,
            address,
            date_of_birth,
            role,
        });

        await newUser.save();
        return { message: 'User registered successfully' };
    }

    async login(loginData: any) {
        const { email, password } = loginData;

        // Find user by email
        const user = await this.userModel.findOne({ email });
        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        // Compare password
        const isPasswordValid = await bcrypt.compare(password, user.password_hash);
        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        // Generate JWT
        const payload = { sub: user._id, email: user.email, role: user.role };
        return {
            access_token: await this.jwtService.signAsync(payload),
            user: {
                id: user._id,
                email: user.email,
                username: user.username,
                role: user.role,
                first_name: user.first_name,
                last_name: user.last_name,
            },
        };
    }
}
