import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto, LoginResponseDto } from './dto/login.dto';

interface UserLoginData {
  id_pessoa_usuario: bigint;
  id_pessoa_fisica: bigint;
  id_pessoa_juridica: bigint;
  id_pessoa_juridica_perfil: bigint;
  id_sistema: bigint;
  juridica_principal: number;
  nome_login: string;
  login: string;
  senha: string;
  empresa: string;
  funcionario: string;
  first_access: number;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto): Promise<LoginResponseDto> {
    try {
      // Query completa baseada no seu SQL - validando tudo de uma vez
      const userData = await this.getUserLoginData(
        loginDto.login,
        loginDto.sistema,
      );
      console.log('usuario', userData);
      if (!userData) {
        throw new UnauthorizedException('Credenciais inválidas');
      }

      // Valida senha
      // const isPasswordValid = await this.validatePassword(
      //   loginDto.senha,
      //   userData.senha,
      // );

      // if (!isPasswordValid) {
      //   throw new UnauthorizedException('Credenciais inválidas');
      // }

      // Busca permissões do usuário
      const permissoes = await this.getPermissoes(
        userData.id_pessoa_juridica_perfil,
      );

      // Gera tokens
      const { accessToken, refreshToken } = await this.generateTokens(userData);

      // Log de acesso
      await this.logAccess(userData, 'web');

      return {
        accessToken,
        refreshToken,
        user: {
          id: Number(userData.id_pessoa_usuario),
          nome_login: userData.nome_login,
          login: userData.login,
          nome_completo: userData.funcionario,
          empresa: userData.empresa,
          id_pessoa_fisica: Number(userData.id_pessoa_fisica),
          id_pessoa_juridica: Number(userData.id_pessoa_juridica),
          id_perfil: Number(userData.id_pessoa_juridica_perfil),
          id_sistema: Number(userData.id_sistema),
          juridica_principal: userData.juridica_principal === 1,
          first_access: userData.first_access === 1,
        },
        permissoes,
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;

      console.error('Erro no login:', error);
      throw new HttpException(
        'Erro ao processar login',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private async getUserLoginData(
    login: string,
    id_sistema: number,
  ): Promise<UserLoginData | null> {
    const result = await this.prisma.$queryRaw<UserLoginData[]>`
      SELECT
        pu.id_pessoa_usuario,
        pjf.id_pessoa_fisica,
        pjf.id_pessoa_juridica,
        pjf.id_pessoa_juridica_perfil,
        pjs.id_sistema,
        pjf.juridica_principal,
        pj.razao_social AS empresa,
        pf.nome_registro AS funcionario,
        pu.nome_login,
        pu.login,
        pu.senha,
        pu.first_access
      FROM
        global.pessoas_juridicas_fisicas pjf
        INNER JOIN global.pessoas_juridicas pj 
          ON pj.id_pessoa_juridica = pjf.id_pessoa_juridica
          AND pj.situacao = pjf.situacao
        INNER JOIN global.pessoas_fisicas pf 
          ON pf.id_pessoa_fisica = pjf.id_pessoa_fisica
          AND pf.situacao = pjf.situacao
        INNER JOIN global.pessoas_usuarios pu 
          ON pu.id_pessoa_fisica = pjf.id_pessoa_fisica
          AND pu.situacao = pjf.situacao
        INNER JOIN global.pessoas_juridicas_sistemas pjs 
          ON pjs.id_pessoa_juridica = pjf.id_pessoa_juridica
          AND pjs.situacao = pjf.situacao
      WHERE
        pjf.situacao = 1
        AND pu.login = ${login}
        AND pjs.id_sistema = ${id_sistema}
      LIMIT 1
    `;

    return result[0] || null;
  }

  private async validatePassword(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    try {
      // Se a senha ainda não é hash (migração), compara direto
      if (!hashedPassword.startsWith('$2')) {
        return plainPassword === hashedPassword;
      }
      return await bcrypt.compare(plainPassword, hashedPassword);
    } catch (error) {
      console.error('Erro ao validar senha:', error);
      return false;
    }
  }

  private async getPermissoes(id_perfil: bigint) {
    const permissoes = await this.prisma.modulosPerfisPermissoes.findMany({
      where: {
        id_pessoa_juridica_perfil: id_perfil,
        situacao: 1,
      },
      include: {
        modulo: {
          select: {
            id: true,
            name_form_page: true,
            component_name: true,
            component_text: true,
          },
        },
      },
    });

    return permissoes.map((p) => ({
      id_modulo: Number(p.id_modulo),
      modulo: p.modulo.name_form_page,
      component_name: p.modulo.component_name,
      component_text: p.modulo.component_text,
      permissoes: {
        insert: p.action_insert === 1,
        update: p.action_update === 1,
        search: p.action_search === 1,
        delete: p.action_delete === 1,
        print: p.action_print === 1,
      },
    }));
  }

  private async generateTokens(userData: UserLoginData) {
    const payload = {
      sub: Number(userData.id_pessoa_usuario),
      login: userData.login,
      nome_login: userData.nome_login,
      id_pessoa_fisica: Number(userData.id_pessoa_fisica),
      id_pessoa_juridica: Number(userData.id_pessoa_juridica),
      id_perfil: Number(userData.id_pessoa_juridica_perfil),
      id_sistema: Number(userData.id_sistema),
      empresa: userData.empresa,
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: '30m',
    });

    const refreshToken = this.jwtService.sign(
      { sub: payload.sub, login: payload.login },
      { expiresIn: '1d' },
    );

    return { accessToken, refreshToken };
  }

  private async logAccess(userData: UserLoginData, device: string) {
    try {
      await this.prisma.logSystem.create({
        data: {
          id_pessoa_juridica_empresa: userData.id_pessoa_juridica,
          id_pessoa_fisica_usuario: userData.id_pessoa_usuario,
          id_pessoa_juridica_fisica_perfil: userData.id_pessoa_juridica_perfil,
          id_modulo_perfil_permissao: BigInt(1), // ID do módulo de login
          endpoint_name: '/auth/login',
          device,
          action_page: 'LOGIN',
          situacao: 1,
          error_status: 0,
        },
      });
    } catch (error) {
      // Log não deve quebrar o login
      console.error('Erro ao registrar log:', error);
    }
  }

  async refreshToken(oldRefreshToken: string) {
    try {
      const payload = this.jwtService.verify(oldRefreshToken);

      const user = await this.prisma.pessoasUsuarios.findUnique({
        where: { id: BigInt(payload.sub) },
      });

      if (!user || user.situacao !== 1) {
        throw new UnauthorizedException('Token inválido');
      }

      // Busca dados completos novamente
      const userData = await this.prisma.$queryRaw<UserLoginData[]>`
        SELECT
          pu.id_pessoa_usuario,
          pjf.id_pessoa_fisica,
          pjf.id_pessoa_juridica,
          pjf.id_pessoa_juridica_perfil,
          pjs.id_sistema,
          pj.razao_social AS empresa,
          pu.nome_login,
          pu.login
        FROM
          global.pessoas_usuarios pu
          INNER JOIN global.pessoas_fisicas pf ON pf.id_pessoa_fisica = pu.id_pessoa_fisica
          INNER JOIN global.pessoas_juridicas_fisicas pjf ON pjf.id_pessoa_fisica = pf.id_pessoa_fisica
          INNER JOIN global.pessoas_juridicas pj ON pj.id_pessoa_juridica = pjf.id_pessoa_juridica
          INNER JOIN global.pessoas_juridicas_sistemas pjs ON pjs.id_pessoa_juridica = pjf.id_pessoa_juridica
        WHERE
          pu.id_pessoa_usuario = ${BigInt(payload.sub)}
          AND pu.situacao = 1
        LIMIT 1
      `;

      if (!userData[0]) {
        throw new UnauthorizedException('Usuário não encontrado');
      }

      const tokens = await this.generateTokens(userData[0]);
      return tokens;
    } catch (error) {
      throw new UnauthorizedException('Token inválido ou expirado');
    }
  }

  async logout(userId: number, token: string) {
    // Registra logout
    await this.prisma.logSystem.create({
      data: {
        id_pessoa_juridica_empresa: BigInt(1), // Buscar do token
        id_pessoa_fisica_usuario: BigInt(userId),
        id_pessoa_juridica_fisica_perfil: BigInt(1), // Buscar do token
        id_modulo_perfil_permissao: BigInt(1),
        endpoint_name: '/auth/logout',
        device: 'web',
        action_page: 'LOGOUT',
        situacao: 1,
        error_status: 0,
      },
    });

    return { message: 'Logout realizado com sucesso' };
  }

  async healthCheck() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return {
        status: 'ok',
        timestamp: new Date().toISOString(),
        database: 'connected',
      };
    } catch (error) {
      throw new HttpException(
        'Banco ou sistema indisponível',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  // Método auxiliar para hash de senhas (usar em migração)
  async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }

  // Método para trocar senha no primeiro acesso
  async changePassword(
    userId: number,
    oldPassword: string,
    newPassword: string,
  ) {
    const user = await this.prisma.pessoasUsuarios.findUnique({
      where: { id: BigInt(userId) },
    });

    if (!user) {
      throw new BadRequestException('Usuário não encontrado');
    }

    const isPasswordValid = await this.validatePassword(
      oldPassword,
      user.senha,
    );

    if (!isPasswordValid) {
      throw new BadRequestException('Senha atual incorreta');
    }

    const hashedPassword = await this.hashPassword(newPassword);

    await this.prisma.pessoasUsuarios.update({
      where: { id: BigInt(userId) },
      data: {
        senha: hashedPassword,
        first_access: 0,
        updatedAt: new Date(),
      },
    });

    return { message: 'Senha alterada com sucesso' };
  }
}
