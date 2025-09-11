// auth/auth.controller.ts
import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { Public } from './decorators/public.decorator';
import { RegisterRecibeDto } from './dto/register.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('register')
  register(@Body() dto: RegisterRecibeDto) {
    return this.authService.register(dto);
  }

  @Public()
  @Post('login')
  @UseGuards(LocalAuthGuard)
  async login(@Request() req: any, @Res({ passthrough: true }) res: Response) {
    const { accessToken, user } = await this.authService.login(req.user);

    // Configurações do cookie mais robustas
    res.cookie('token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
      maxAge: 24 * 60 * 60 * 1000, // 1 dia
      path: '/',
      domain: process.env.NODE_ENV === 'production' ? undefined : 'localhost',
    });

    console.log('Login realizado. Cookie definido para:', user.login);
    return {
      user: {
        id: user.id,
        login: user.login,
        email: user.email,
      },
      message: 'Login realizado com sucesso',
    };
  }

  @Public()
  @Post('logout')
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
      path: '/',
      domain: process.env.NODE_ENV === 'production' ? undefined : 'localhost',
    });

    return { message: 'Logout realizado com sucesso' };
  }

  // Endpoint para verificar autenticação
  @Get('me')
  getProfile(@Request() req: any) {
    console.log('Usuário autenticado:', req.user);
    return req.user;
  }

  // Endpoint público para testar se o servidor está funcionando
  @Public()
  @Get('health')
  health() {
    return { status: 'OK', timestamp: new Date().toISOString() };
  }
}
