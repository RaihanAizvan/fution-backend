import { Controller, Post, Body, Ip, Headers } from '@nestjs/common';
import { AdminAuthService } from './admin-auth.service';
import { Public } from '../../utils/public.decorator';
import { AdminLoginDto } from './dto/login.dto';

@Controller('admin/auth')
export class AdminAuthController {
    constructor(private adminAuthService: AdminAuthService) { }

    @Public()
    @Post('login')
    async login(@Body() loginDto: AdminLoginDto) {
        return this.adminAuthService.login(loginDto.password);
    }

    @Public()
    @Post('request')
    async requestAdmin(
        @Ip() ip: string,
        @Headers('user-agent') userAgent: string,
    ) {
        return this.adminAuthService.requestAdmin(ip, userAgent);
    }
}
