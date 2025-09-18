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
import { ApiBody, ApiOperation } from '@nestjs/swagger';
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
  @ApiOperation({
    summary: 'Cadastrar um novo usuário',
    description: 'Cadastrar um novo usuário',
  })
  @ApiBody({
    required: true,
    schema: {
      type: 'object',
      properties: {
        pessoaId: { type: 'number' },
        perfilId: { type: 'number' },
        email: { type: 'string' },
        login: { type: 'string' },
        senha: { type: 'string' },
      },
    },
  })
  register(@Body() dto: RegisterRecibeDto) {
    return this.authService.register(dto);
  }

  @Public()
  @Post('login')
  @ApiOperation({
    summary: 'Autenticar usuario e fornecer token de acesso',
    description: 'Autenticar usuario e fornecer token de acesso',
  })
  @ApiBody({
    required: true,
    schema: {
      type: 'object',
      properties: {
        login: { type: 'string' },
        senha: { type: 'string' },
      },
    },
  })
  @UseGuards(LocalAuthGuard)
  async login(@Request() req: any, @Res({ passthrough: true }) res: Response) {
    const { accessToken, user } = await this.authService.login(req.user);

    // Configurações do cookie mais robustas
    res.cookie('token', accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 24 * 60 * 60 * 1000, // 1 dia
      path: '/',
    });

    console.log('Login realizado. Cookie definido para:', user.login);
    return {
      user,
    };
  }

  @Public()
  @Post('logout')
  @ApiOperation({
    summary: 'Deslogar o usuário',
    description: 'Deslogar o usuário',
  })
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
