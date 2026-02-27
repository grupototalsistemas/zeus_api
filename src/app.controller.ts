import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { ApiExcludeEndpoint, ApiOperation } from '@nestjs/swagger';

import { AuthService } from './auth/auth.service';
import { NoLog } from './common/decorators/no-log.decorator';
import { Public } from './common/decorators/public.decorator';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { PrismaService } from './prisma/prisma.service';

@Controller('App')
@UseGuards(JwtAuthGuard)
export class AppController {
  constructor(
    private authService: AuthService,
    private prisma: PrismaService,
  ) {}

  // Endpoint para verificar autenticação
  @NoLog()
  @Get('me')
  @ApiExcludeEndpoint(
    process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'homolog',
  )
  @ApiOperation({
    summary: 'Verifica se o usuário está autenticado',
    description: 'Verifica se o usuário está autenticado',
  })
  getProfile(@Request() req: any) {
    return req.user;
  }

  @NoLog()
  @Get('user')
  @ApiExcludeEndpoint(
    process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'homolog',
  )
  @ApiOperation({
    summary: 'Retorna informações do usuário autenticado',
    description: 'Retorna informações do usuário autenticado',
  })
  getUserInfo(@Request() req: any) {
    return this.authService.getLoggedUserInfo(req.user);
  }

  // Endpoint público para testar se o servidor está funcionando
  @Public()
  @NoLog()
  @Get('health')
  @ApiExcludeEndpoint(
    process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'homolog',
  )
  @ApiOperation({
    summary: 'Verifica se o servidor está funcionando',
    description: 'Verifica se o servidor está funcionando',
  })
  async health() {
    try {
      await this.prisma.$queryRaw`SELECT 1`; // query bem leve
      return { status: 'ok', database: 'connected' };
    } catch (error: any) {
      return { status: 'error', database: 'disconnected', error };
    }
  }
}
