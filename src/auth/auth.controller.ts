// auth/auth.controller.ts
import { Body, Controller, HttpCode, Post, Req, Res } from '@nestjs/common';
import {
  ApiBody,
  ApiGatewayTimeoutResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Response } from 'express';
import { Public } from 'src/common/decorators/public.decorator';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  private readonly isProduction = process.env.NODE_ENV === 'production';
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @HttpCode(200)
  @ApiOperation({ summary: 'Autenticar usuário e retornar tokens' })
  @ApiBody({ type: LoginDto })
  @ApiOkResponse({ description: 'Login realizado com sucesso' })
  @ApiUnauthorizedResponse({ description: 'Credenciais inválidas' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Public()
  @Post('refresh-token')
  @HttpCode(200)
  @ApiOperation({ summary: 'Renovar token de acesso' })
  @ApiBody({ type: LoginDto })
  @ApiOkResponse({ description: 'Token renovado com sucesso' })
  @ApiUnauthorizedResponse({ description: 'Token inválido ou expirado' })
  async refreshToken(@Body() dto: LoginDto) {
    const { refreshToken } = await this.authService.login(dto);
    return { refreshToken };
  }

  @Post('logout')
  @HttpCode(200)
  @ApiOperation({ summary: 'Invalidar token e encerrar sessão' })
  @ApiOkResponse({ description: 'Logout realizado com sucesso' })
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('token', {
      httpOnly: true,
      secure: this.isProduction,
      sameSite: this.isProduction ? 'strict' : 'lax',
      path: '/',
      domain: this.isProduction ? undefined : 'localhost',
    });
    return { message: 'Logout realizado com sucesso' };
  }

  @Post('verify')
  @HttpCode(200)
  @ApiOperation({ summary: 'Verificar se o usuário está autenticado' })
  @ApiOkResponse({ description: 'Usuário autenticado' })
  async verify(@Req() req: any) {
    return { user: req.user };
  }

  @Public()
  @Post('health-check')
  @HttpCode(200)
  @ApiOperation({ summary: 'Verificar se banco e sistema estão ativos' })
  @ApiOkResponse({ description: 'Banco e sistema ativos' })
  @ApiGatewayTimeoutResponse({ description: 'Banco e sistema inativos' })
  async check() {
    return this.authService.healthCheck();
  }
}
