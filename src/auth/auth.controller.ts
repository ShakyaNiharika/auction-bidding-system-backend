import { Controller, Post, Body, HttpCode, HttpStatus, Get, UseGuards, Req, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthGuard } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import type { Response } from 'express';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
    constructor(
        private authService: AuthService,
        private configService: ConfigService,
    ) { }

    @Post('register')
    @ApiOperation({ summary: 'Register a new user' })
    @ApiResponse({ status: 201, description: 'User registered successfully' })
    @ApiResponse({ status: 409, description: 'User already exists' })
    @ApiResponse({ status: 400, description: 'Bad Request' })
    async register(@Body() userData: RegisterDto) {
        return this.authService.register(userData);
    }

    @HttpCode(HttpStatus.OK)
    @Post('login')
    @ApiOperation({ summary: 'Login as an existing user' })
    @ApiResponse({ status: 200, description: 'User logged in successfully' })
    @ApiResponse({ status: 401, description: 'Invalid credentials' })
    async login(@Body() loginData: LoginDto) {
        return this.authService.login(loginData);
    }

    @Get('google')
    @UseGuards(AuthGuard('google'))
    @ApiOperation({ summary: 'Initiate Google SSO login' })
    async googleAuth(@Req() req) {
        // Initiates the Google OAuth2 login flow
    }

    @Get('google/callback')
    @UseGuards(AuthGuard('google'))
    @ApiOperation({ summary: 'Google SSO callback' })
    async googleAuthRedirect(@Req() req, @Res() res: Response) {
        const result = await this.authService.validateGoogleUser(req.user);
        const frontendUrl = this.configService.get<string>('FRONTEND_URL', 'http://localhost:3000');

        // Redirect to frontend with token and user data in query params (or handle via cookies)
        // For simplicity, we'll use query params which the frontend will then store
        const token = result.access_token;
        const user = encodeURIComponent(JSON.stringify(result.user));

        return res.redirect(`${frontendUrl}/auth/sso-callback?token=${token}&user=${user}`);
    }
}
