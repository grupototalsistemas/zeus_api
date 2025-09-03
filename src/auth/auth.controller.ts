// auth/auth.controller.ts
import {
  Body,
  Controller,
  Post,
  Request,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { Public } from './decorators/public.decorator';
import { LoginDto } from './dto/login.dto';
import { RegisterRecibeDto } from './dto/register.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @ApiOperation({ summary: 'Registrar novo usuário' })
  @ApiBody({ type: RegisterRecibeDto })
  @Post('register')
  register(@Body() dto: RegisterRecibeDto) {
    return this.authService.register(dto);
  }

  @Public()
  @ApiOperation({ summary: 'Login e obtenção de JWT' })
  @ApiBody({ type: LoginDto })
  @Post('login')
  @UseGuards(LocalAuthGuard)
  async login(@Request() req: any, @Res({ passthrough: true }) res: Response) {
    const { accessToken, user } = await this.authService.login(req.user);

    const cookieOptions = {
      httpOnly: true,
      secure: true,
      sameSite: 'none' as const,
      maxAge: 24 * 60 * 60 * 1000,
      path: '/',
    };

    res.cookie('zeus_token', accessToken, cookieOptions);

    // DEBUG: Verificar se o cookie foi setado
    console.log('Headers após set cookie:', res.getHeaders());

    return { user };
  }

  @Public()
  @ApiOperation({ summary: 'Logout e retirada de JWT' })
  @Post('logout')
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('zeus_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
    });
    return { message: 'Logout realizado com sucesso' };
  }
}
