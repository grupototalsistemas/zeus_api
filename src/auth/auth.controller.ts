import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Request,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import {
  ApiBody,
  ApiExcludeEndpoint,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import express from 'express';
import { ApiLoginResponses } from 'src/auth/decorators/login-response.decorator';
import { NoLog } from 'src/common/decorators/no-log.decorator';
import { Public } from 'src/common/decorators/public.decorator';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthService } from './auth.service';
import { CertificateService } from './certificate.service';
import {
  ChaveSenhaApiDto,
  CriarChaveDto,
  FirstUpdateSenhaLoginDto,
  LoginResponseDto,
  LoginSenhaDto,
  NaoAutorizado,
} from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private certificateService: CertificateService,
    private prisma: PrismaService,
  ) {}

  //--------------------------------------- Validar Certificado ---------------------------------------
  @Public()
  @ApiExcludeEndpoint()
  @Post('certificate/validate')
  @ApiOperation({
    summary: 'Validar certificado digital',
    description:
      'Valida um certificado digital e retorna apenas se é válido ou não',
  })
  @ApiBody({
    required: true,
    schema: {
      type: 'object',
      properties: {
        certificate: {
          type: 'string',
          description: 'Certificado digital em formato string (PEM ou base64)',
        },
      },
    },
  })
  async validateCertificate(@Body() body: { certificate: string }) {
    if (!body.certificate) {
      throw new BadRequestException('Certificado digital é obrigatório');
    }

    try {
      const isValid = this.certificateService.validateCertificate(
        body.certificate,
      );

      return {
        isValid,
      };
    } catch (error) {
      console.error('Erro ao validar certificado:', error);
      return {
        isValid: false,
      };
    }
  }

  //--------------------------------------- Login com Certificado ---------------------------------------
  @Public()
  @NoLog()
  @Post('certificate/login')
  @ApiExcludeEndpoint()
  @ApiOperation({
    summary: 'Login com certificado digital',
    description:
      'Autentica usuário usando certificado digital em formato string',
  })
  @ApiBody({
    required: true,
    schema: {
      type: 'object',
      properties: {
        certificate: {
          type: 'string',
          description: 'Certificado digital em formato string (PEM ou base64)',
        },
      },
    },
  })
  async loginWithCertificate(
    @Body() body: { certificate: string },
    @Res({ passthrough: true }) res: express.Response,
  ) {
    if (!body.certificate) {
      throw new BadRequestException('Certificado digital é obrigatório');
    }

    // 1. Valida o certificado
    const isValid = this.certificateService.validateCertificate(
      body.certificate,
    );
    if (!isValid) {
      throw new UnauthorizedException(
        'Certificado digital inválido ou expirado',
      );
    }

    // 2. Extrai informações do certificado
    const certInfo = this.certificateService.extractCertificateData(
      body.certificate,
    );
    // 3. Busca o usuário no banco
    const user = await this.certificateService.findUserByCertificate(certInfo);
    if (!user) {
      throw new UnauthorizedException(
        'Usuário não encontrado para este certificado',
      );
    }
    // 4. Gera o token JWT
    const { accessToken, user: userData } = await this.authService.login(user);
    // 5. Define o cookie
    const isSecureEnv = ['production', 'homolog', 'development'].includes(
      process.env.NODE_ENV || '',
    );
    res.cookie('token', accessToken, {
      httpOnly: true,
      secure: isSecureEnv,
      sameSite: isSecureEnv ? 'none' : 'lax',
      maxAge: 24 * 60 * 60 * 1000, // 1 dia
      path: '/',
      domain: isSecureEnv ? 'totalsistemas.com.br' : 'localhost',
    });

    return {
      user: userData,
      authMethod: 'certificate',
      certificateInfo: {
        commonName: certInfo.commonName,
        issuer: certInfo.issuer,
        validTo: certInfo.validTo,
      },
    };
  }
  //
  //--------------------------------------- Criar Chave JWT e Senha Randômica ---------------------------------------
  @Public()
  @Post('criar_chave')
  @NoLog()
  @ApiExcludeEndpoint(
    process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'homolog',
  )
  async criarChave(@Body() dto: CriarChaveDto) {
    const resultado = await this.authService.criarChaveComSenha(
      dto.cnpj,
      dto.serventia,
      dto.cns,
    );

    return {
      chave: resultado.chave,
      senha: resultado.senha,
      id_pessoa: resultado.id_pessoa.toString(),
      id_pessoa_juridica: resultado.id_pessoa_juridica.toString(),
      mensagem: 'Chave criada com sucesso',
    };
  }

  //--------------------------------------- Login com Chave JWT e Senha ---------------------------------------
  @Public()
  @Post('login_externo')
  @NoLog()
  @ApiOperation({
    summary: 'Fazer login por chave JWT e senha',
    description:
      'Faz login usando a chave JWT gerada e a senha. Retorna um token de acesso igual ao endpoint login_senha.',
  })
  @ApiBody({
    required: true,
    schema: {
      type: 'object',
      properties: {
        chave: {
          type: 'string',
          description: 'Chave JWT gerada no endpoint /auth/criar_chave',
        },
        senha: { type: 'string', description: 'Senha fornecida' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Login realizado com sucesso',
    schema: {
      type: 'object',
      properties: {
        accessToken: { type: 'string', description: 'Token de acesso JWT' },
        user: {
          type: 'object',
          properties: {
            id_pessoa: { type: 'number' },
            id_pessoa_juridica: { type: 'number' },
            empresa: { type: 'string' },
            cnpj: { type: 'string' },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Credenciais inválidas' })
  async loginchaveSenha(
    @Body() req: ChaveSenhaApiDto,
    @Res({ passthrough: true }) res: express.Response,
  ) {
    const response = await this.authService.validateUser(req);

    // Configura o cookie HttpOnly com o token
    const isSecureEnv = ['production', 'homolog', 'development'].includes(
      process.env.NODE_ENV || '',
    );
    res.cookie('accessToken', response.accessToken, {
      httpOnly: true,
      secure: isSecureEnv,
      sameSite: isSecureEnv ? 'none' : 'lax',
      maxAge: 24 * 60 * 60 * 1000, // 1 dia
      path: '/',
      domain: isSecureEnv ? 'totalsistemas.com.br' : 'localhost',
    });

    return response;
  }

  //--------------------------------------- Login com Login e nome ---------------------------------------

  @Public()
  @Post('nao_autorizado')
  @HttpCode(HttpStatus.OK)
  @ApiExcludeEndpoint(
    process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'homolog',
  )
  @ApiOperation({
    summary: 'Buscar usuario ainda nao autorizado',
    description:
      'Faz uma verificação se o usuário ainda nao logou pela primeira vez, e retorna o usuario ainda nao logado pra consulta',
  })
  @ApiBody({ type: NaoAutorizado })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Login realizado com sucesso',
    type: LoginResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Credenciais inválidas',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Dados de entrada inválidos',
  })
  async loginNome(@Body() loginNomeDto: NaoAutorizado): Promise<any> {
    return this.authService.loginNome(loginNomeDto);
  }

  //--------------------------------------- Troca de Senha ---------------------------------------
  @Public()
  @Post('troca_senha/:id')
  @HttpCode(HttpStatus.OK)
  @ApiExcludeEndpoint(
    process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'homolog',
  )
  @ApiOperation({
    summary: 'Trocar e criar senha para primeiro acesso',
    description:
      'Informa o usuario que precisa trocar a senha. E cria uma nova senha para o primeiro acesso',
  })
  @ApiBody({ type: FirstUpdateSenhaLoginDto })
  @ApiLoginResponses()
  async login(
    @Param('id') id: string,
    @Body() loginDto: FirstUpdateSenhaLoginDto,
  ): Promise<any> {
    return this.authService.changePassword(Number(id), loginDto);
  }

  //--------------------------------------- Login com Login e Senha ---------------------------------------
  @Public()
  @Post('login_senha')
  @HttpCode(HttpStatus.OK)
  @ApiExcludeEndpoint(
    process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'homolog',
  )
  @ApiOperation({
    summary: 'Realizar login com senha',
    description:
      'Autentica o usuário e retorna um token JWT com as informações do usuário e suas vinculações',
  })
  @ApiBody({ type: LoginSenhaDto })
  @ApiLoginResponses()
  async loginSenha(
    @Body() loginSenhaDto: LoginSenhaDto,
    @Res({ passthrough: true }) res: express.Response,
  ): Promise<LoginResponseDto> {
    const loginResponse = await this.authService.login(loginSenhaDto);

    // Configura o cookie HttpOnly com o token
    const isSecureEnv = ['production', 'homolog', 'development'].includes(
      process.env.NODE_ENV || '',
    );
    res.cookie('accessToken', loginResponse.accessToken, {
      httpOnly: true,
      secure: isSecureEnv,
      sameSite: isSecureEnv ? 'none' : 'lax',
      maxAge: 24 * 60 * 60 * 1000, // 1 dia
      path: '/',
      domain: isSecureEnv ? 'totalsistemas.com.br' : 'localhost',
    });
    // Retorna o token também na resposta para uso via Bearer
    return loginResponse;
  }

  //--------------------------------------- Deslogar o usuário ---------------------------------------
  @Public()
  @Post('logout')
  @ApiOperation({
    summary: 'Deslogar o usuário',
    description: 'Deslogar o usuário',
  })
  logout(@Res({ passthrough: true }) res: express.Response) {
    const isSecureEnv = ['production', 'homolog', 'development'].includes(
      process.env.NODE_ENV || '',
    );
    res.clearCookie('accessToken', {
      httpOnly: true,
      secure: isSecureEnv,
      sameSite: isSecureEnv ? 'none' : 'lax',
      maxAge: 24 * 60 * 60 * 1000, // 1 dia
      path: '/',
      domain: isSecureEnv ? 'totalsistemas.com.br' : 'localhost',
    });

    return { message: 'Logout realizado com sucesso' };
  }

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
    } catch (error) {
      return { status: 'error', database: 'disconnected', error };
    }
  }
}
