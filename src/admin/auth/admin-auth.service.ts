import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AdminAuthService {
    constructor(
        private jwtService: JwtService,
        private configService: ConfigService,
    ) { }

    async login(password: string) {
        const masterPassword = this.configService.get<string>('ADMIN_MASTER_PASSWORD');

        // Debugging (Remove in production)
        // console.log(`Attempting login with: "${password}"`);
        // console.log(`Master password is: "${masterPassword}"`);

        if (!masterPassword || password !== masterPassword.trim()) {
            throw new UnauthorizedException('Invalid master password');
        }

        const payload = { role: 'admin' };
        return {
            access_token: this.jwtService.sign(payload),
        };
    }

    async requestAdmin(clientIp: string, userAgent: string) {
        // Simple logging mechanism
        console.log(`[ADMIN REQUEST] A request for admin access was made.`);
        console.log(`Timestamp: ${new Date().toISOString()}`);
        console.log(`IP: ${clientIp}`);
        console.log(`User-Agent: ${userAgent}`);

        return { message: 'Admin request logged. Please wait for authorization.' };
    }
}
