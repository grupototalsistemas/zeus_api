import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { DelphiCryptoUtil } from 'src/common/utils/crypto-delphi.util';
import { PrismaService } from '../prisma/prisma.service';
import {
  ChaveSenhaApiDto,
  FirstUpdateSenhaLoginDto,
  LoginSenhaDto,
  NaoAutorizado,
} from './dto/login.dto';

interface UserLoginData {
  id_pessoa_usuario?: bigint;
  id_pessoa_fisica?: bigint;
  id_pessoa_juridica?: bigint;
  id_pessoa_juridica_perfil?: bigint;
  id_sistema?: bigint;
  juridica_principal?: number;
  nome_login?: string;
  login?: string;
  senha: string;
  empresa?: string;
  funcionario?: string;
  first_access?: number;
  chave?: string;
}

interface RequestUserPayload {
  id: number;
  login: string;
  nome_login?: string;
  id_pessoa_fisica?: number;
  id_pessoa_juridica?: number;
  id_perfil?: number;
  id_sistema: number;
  empresa?: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  // 🔐 Gera senha curta para chave externa
  private generatePassword(length = 8): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
    let senha = '';

    for (let i = 0; i < length; i++) {
      senha += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    return senha;
  }

  // ===================== DELPHI COMPAT =====================
  private readonly DELPHI_PASSWORD = process.env.DELPHI_PASSWORD || '1234';

  private readonly DELPHI_SALT = process.env.DELPHI_SALT || 'D@lph1#S@lt!2025';

  private deriveKey(password: string, salt: string): Buffer {
    return crypto
      .createHash('sha256')
      .update(password + salt)
      .digest();
  }

  private xorTransform(data: Buffer, key: Buffer): Buffer {
    const result = Buffer.alloc(data.length);
    for (let i = 0; i < data.length; i++) {
      result[i] = data[i] ^ key[i % key.length];
    }
    return result;
  }

  private encryptDelphiStyle(
    plainText: string,
    password: string,
    salt: string,
  ): string {
    const data = Buffer.from(plainText, 'utf8');
    const key = this.deriveKey(password, salt);
    return this.xorTransform(data, key).toString('base64');
  }

  async loginNome(loginData: NaoAutorizado) {
    const user = await this.prisma.pessoasUsuarios.findFirst({
      where: {
        login: {
          equals: loginData.login,
          mode: 'insensitive',
        },
        nome_login: {
          equals: loginData.nome,
          mode: 'insensitive',
        },
      },
    });

    if (!user) {
      throw new BadRequestException('Usuário não encontrado');
    }
    const empresa_pessoa = await this.prisma.pessoasJuridicasFisicas.findMany({
      where: {
        id_pessoa_fisica: user.id_pessoa_fisica,
      },
    });

    if (empresa_pessoa.length > 0) {
      const sistema_empresa = await Promise.allSettled(
        empresa_pessoa.map(async (empresa) => {
          return await this.prisma.pessoasJuridicasSistemas.findMany({
            where: {
              id_pessoa_juridica: empresa.id_pessoa_juridica,
              id_sistema: loginData.sistema,
            },
          });
        }),
      );

      // Verifica se alguma empresa tem permissão no sistema
      // Verifica se a promise foi resolvida (fulfilled) e se o resultado foi um array vazio
      const temPermissao = sistema_empresa.some(
        (result) => result.status === 'fulfilled' && result.value.length > 0,
      );

      if (!temPermissao) {
        throw new BadRequestException(
          'Usuário nao tem permissão pra acesso a esse sistema',
        );
      }
    }
    const userFirstAcess = await this.prisma.pessoasUsuarios.findFirst({
      where: {
        login: {
          equals: loginData.login,
          mode: 'insensitive',
        },
        nome_login: {
          equals: loginData.nome,
          mode: 'insensitive',
        },
        first_access: 1,
      },
    });

    if (!userFirstAcess) {
      throw new BadRequestException(
        'Usuário ja tem permissão pra acesso por login e senha',
      );
    }

    return user;
  }

  async login(loginDto: LoginSenhaDto): Promise<any> {
    // Query completa baseada no seu SQL - validando tudo de uma vez
    const userData = await this.getUserLoginData(
      loginDto.login,
      loginDto.sistema,
    );
    console.log(userData);
    // Valida login
    if (!userData) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    // Valida senha
    const isPasswordValid = await this.validatePassword(
      loginDto.senha,
      userData.senha,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException();
    }

    // Busca permissões do usuário
    const permissoes = await this.getPermissoes(
      Number(userData.id_sistema),
      Number(userData.juridica_principal),
      Number(userData.id_pessoa_juridica_perfil),
    );
    // console.log(permissoes);
    // Gera tokens
    const { accessToken, refreshToken } = await this.generateTokens(userData);

    // Log de acesso
    // await this.logAccess(userData, 'web');

    // Remove senha para segurança
    const { senha, ...pessoa_usuario } = userData;
    return {
      accessToken,
      refreshToken,
      pessoa_usuario,
      permissoes,
    };
  }

  async getUserLoginData(
    login: string,
    id_sistema: number,
  ): Promise<UserLoginData | null> {
    const result = await this.prisma.$transaction(async (tx) => {
      // Busca primeiro pela pessoa_juridica_fisica que conecta tudo
      const pessoaJuridicaFisica = await tx.pessoasJuridicasFisicas.findFirst({
        where: {
          situacao: 1,
          juridica_principal: 1,
          pessoaFisica: {
            situacao: 1,
            pessoasUsuarios: {
              some: {
                login: login,
                situacao: 1,
              },
            },
          },
          pessoaJuridica: {
            situacao: 1,
            pessoasJuridicasSistemas: {
              some: {
                id_sistema: id_sistema,
              },
            },
          },
        },
        include: {
          pessoaJuridica: {
            include: {
              pessoa: true,
            },
          },
          pessoaFisica: {
            include: {
              pessoa: true,
              pessoasUsuarios: {
                where: {
                  login: login,
                  situacao: 1,
                },
              },
            },
          },
        },
      });
      // console.log(pessoaJuridicaFisica);
      if (
        !pessoaJuridicaFisica ||
        !pessoaJuridicaFisica.pessoaFisica.pessoasUsuarios.length
      ) {
        return null;
      }

      const pessoaUsuario =
        pessoaJuridicaFisica.pessoaFisica.pessoasUsuarios[0];
      const pessoaFisica = pessoaJuridicaFisica.pessoaFisica;
      const pessoaJuridica = pessoaJuridicaFisica.pessoaJuridica;

      return {
        id_pessoa_usuario: pessoaUsuario.id,
        id_pessoa: pessoaFisica.pessoa.id,
        id_empresa: pessoaJuridica.pessoa.id,
        id_pessoa_juridica: pessoaJuridicaFisica.id_pessoa_juridica,
        id_pessoa_fisica: pessoaJuridicaFisica.id_pessoa_fisica,
        id_pessoa_juridica_perfil:
          pessoaJuridicaFisica.id_pessoa_juridica_perfil,
        id_sistema: BigInt(id_sistema),
        juridica_principal: pessoaJuridicaFisica.juridica_principal,
        nome_login: pessoaUsuario.nome_login,
        login: pessoaUsuario.login,
        senha: pessoaUsuario.senha,
        empresa: pessoaJuridica.razao_social,
        funcionario: pessoaFisica.nome_registro,
        first_access: pessoaUsuario.first_access,
        chave: pessoaFisica.pessoa.chave,
      } as UserLoginData;
    });

    return result;
  }

  async getPermissoes(
    idSistema: number,
    idModuloPrincipal: number,
    idPerfil: number,
  ) {
    const result = await this.prisma.$queryRawUnsafe<any[]>(`
    WITH RECURSIVE permissao AS (
      -- Busca todos os módulos raiz (id_parent = -1) que fazem parte do sistema
      -- e que o perfil tem permissão
      SELECT
        m.id_modulo,
        m.id_parent,
        m.name_form_page,
        m.component_indx,
        m.component_name,
        m.component_text,
        m.component_event,
        m.shortcutkeys,
        mpp.action_insert,
        mpp.action_update,
        mpp.action_search,
        mpp.action_delete,
        mpp.action_print
      FROM global.sistemas_modulos sm
      INNER JOIN global.modulos m 
        ON m.id_modulo = sm.id_modulo_primcipal
        AND m.situacao = sm.situacao
      INNER JOIN global.modulos_perfis_permissoes mpp 
        ON mpp.id_modulo = m.id_modulo
        AND mpp.situacao = sm.situacao
      WHERE sm.situacao = 1
        AND m.id_parent = -1
        AND m.status_visible = 1
        AND sm.id_sistema = ${idSistema}
        AND mpp.id_pessoa_juridica_perfil = ${idPerfil}

      UNION ALL

      -- Busca recursivamente os submódulos que têm permissão para o perfil
      SELECT
        mm.id_modulo,
        mm.id_parent,
        mm.name_form_page,
        mm.component_indx,
        mm.component_name,
        mm.component_text,
        mm.component_event,
        mm.shortcutkeys,
        mppp.action_insert,
        mppp.action_update,
        mppp.action_search,
        mppp.action_delete,
        mppp.action_print
      FROM global.modulos mm
      INNER JOIN global.modulos_perfis_permissoes mppp 
        ON mppp.id_modulo = mm.id_modulo
        AND mppp.situacao = mm.situacao
      INNER JOIN permissao p 
        ON p.id_modulo = mm.id_parent
      WHERE mm.situacao = 1
        AND mm.id_parent > 0
        AND mm.status_visible = 1
        AND mppp.id_pessoa_juridica_perfil = ${idPerfil}
    )
    SELECT * FROM permissao
    ORDER BY  component_indx, id_modulo;
  `);

    return result;
  }

  async verificaChave(chave: string) {
    try {
      // Descriptografa e verifica o JWT
      const payload = this.jwtService.verify(chave);

      // Extrai apenas os dados necessários
      const { cnpj, chave: chaveDescricao, cns: cnsDescricao } = payload;

      if (!cnpj || !chaveDescricao || !cnsDescricao) {
        throw new BadRequestException('Chave inválida: dados faltando');
      }

      // Busca no banco com os dados descriptografados
      const res = await this.prisma.$queryRaw`
        SELECT
        pj.id_pessoa
        ,pj.id_pessoa_juridica
        FROM
        global.pessoas_juridicas pj
        INNER JOIN global.pessoas p on p.id_pessoa = pj.id_pessoa
                      and p.situacao = pj.situacao
        INNER JOIN global.pessoas_dados_adicionais tj on tj.id_pessoa = p.id_pessoa
                                and tj.id_pessoa_dado_adicional_tipo = 1
                                and tj.situacao = pj.situacao
        INNER JOIN global.pessoas_dados_adicionais cns on cns.id_pessoa = p.id_pessoa
                                and cns.id_pessoa_dado_adicional_tipo = 2
                                and tj.situacao = pj.situacao
        WHERE
        pj.situacao = 1
        AND pj.cnpj = ${cnpj}
        AND tj.descricao = ${chaveDescricao}
        AND cns.descricao = ${cnsDescricao}
        AND p.senha is null`;

      if (!res || (Array.isArray(res) && res.length === 0)) {
        throw new UnauthorizedException('Chave não encontrada ou inválida');
      }

      return {
        cnpj,
        chave: chaveDescricao,
        cns: cnsDescricao,
        dados: res,
      };
    } catch (error) {
      if (
        error.name === 'JsonWebTokenError' ||
        error.name === 'TokenExpiredError'
      ) {
        throw new UnauthorizedException('Chave inválida ou expirada');
      }
      throw error;
    }
  }

  // Método auxiliar para gerar a chave JWT
  gerarChave(
    cnpj: string,
    chave: string,
    cns: string,
    id_pessoa: string,
  ): string {
    const payload = { cnpj, chave, cns, id_pessoa };

    return this.jwtService.sign(payload);
  }

  async criarChaveComSenha(cnpj: string, serventia: string, cns: string) {
    const salt = 'D@lph1#S@lt!2025';

    const [dados] = await this.prisma.$queryRaw<any[]>`
  SELECT
    pj.id_pessoa,
    pj.cnpj,
    pj.id_pessoa_juridica,
    tj.descricao AS serventia,
    cns.descricao AS cns
  FROM global.pessoas_juridicas pj
  INNER JOIN global.pessoas p 
    ON p.id_pessoa = pj.id_pessoa
    AND p.situacao = pj.situacao
  INNER JOIN global.pessoas_dados_adicionais tj 
    ON tj.id_pessoa = p.id_pessoa
    AND tj.id_pessoa_dado_adicional_tipo = 1
    AND tj.situacao = pj.situacao
  INNER JOIN global.pessoas_dados_adicionais cns 
    ON cns.id_pessoa = p.id_pessoa
    AND cns.id_pessoa_dado_adicional_tipo = 2
    AND cns.situacao = pj.situacao
  WHERE
    pj.situacao = 1
    AND pj.cnpj = ${cnpj}
    AND tj.descricao = ${serventia}
    AND cns.descricao = ${cns}
`;

    if (!dados) {
      throw new BadRequestException(
        'Não foi possível localizar os dados informados',
      );
    }

    // 🔹 Texto base EXACTO do Delphi
    const textoBase = `${dados.id_pessoa}${dados.cnpj}${dados.serventia}${dados.cns}`;

    // 🔹 Senha curta
    const senha = this.generatePassword(8);

    // 🔹 Criptografia Delphi
    const chave = DelphiCryptoUtil.encryptString(textoBase, senha, salt);

    // 🔹 Persistência (opcional, mas recomendada)
    await this.prisma.pessoas.update({
      where: {
        id: BigInt(dados.id_pessoa),
      },
      data: {
        chave,
        senha,
        updatedAt: new Date(),
      },
    });

    return {
      chave,
      senha,
      id_pessoa: dados.id_pessoa,
      id_pessoa_juridica: dados.id_pessoa_juridica,
    };
  }

  async validateUser(chavesenha: ChaveSenhaApiDto): Promise<any> {
    const { chave, senha } = chavesenha;

    let cnpj: string;
    let serventia: string;
    let cns: string;
    let id_pessoa: string;

    try {
      const textoDescriptografado = DelphiCryptoUtil.decryptString(
        chave,
        senha,
        this.DELPHI_SALT,
      );

      id_pessoa = textoDescriptografado.substring(0, 1);
      cnpj = textoDescriptografado.substring(1, 15);
      serventia = textoDescriptografado.substring(15, 19);
      cns = textoDescriptografado.substring(19);

      if (!cnpj || !serventia || !cns || !id_pessoa) {
        throw new UnauthorizedException();
      }
    } catch {
      throw new UnauthorizedException('Chave inválida ou corrompida');
    }

    // Busca no banco com os dados descriptografados e valida senha
    const resultado: any = await this.prisma.$queryRaw`
      SELECT
      pj.id_pessoa
      ,pj.id_pessoa_juridica
      ,p.senha
      ,pj.razao_social
      FROM
      global.pessoas_juridicas pj
      INNER JOIN global.pessoas p on p.id_pessoa = pj.id_pessoa
                    and p.situacao = pj.situacao
      INNER JOIN global.pessoas_dados_adicionais tj on tj.id_pessoa = p.id_pessoa
                              and tj.id_pessoa_dado_adicional_tipo = 1
                              and tj.situacao = pj.situacao
      INNER JOIN global.pessoas_dados_adicionais cns on cns.id_pessoa = p.id_pessoa
                              and cns.id_pessoa_dado_adicional_tipo = 2
                              and tj.situacao = pj.situacao
      WHERE
      pj.situacao = 1
      AND pj.cnpj = ${cnpj}
      AND tj.descricao = ${serventia}
      AND cns.descricao = ${cns}
      AND p.senha IS NOT NULL`;

    if (!resultado || resultado.length === 0) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const user = resultado[0];

    // Valida a senha (não criptografada, comparação direta)
    if (user.senha !== senha) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    // Cria o payload para o token de acesso
    const userData = {
      id_pessoa_juridica: user.id_pessoa_juridica,
      id_pessoa: user.id_pessoa,
      empresa: user.razao_social,
    };

    // Gera token de acesso JWT
    const payload = {
      sub: Number(user.id_pessoa),
      id_pessoa_juridica: Number(user.id_pessoa_juridica),
      empresa: user.razao_social,
      cnpj,
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: '1d',
    });

    return {
      accessToken,
      user: {
        id_pessoa: Number(user.id_pessoa),
        id_pessoa_juridica: Number(user.id_pessoa_juridica),
        empresa: user.razao_social,
        cnpj,
        cns,
        serventia,
      },
    };
  }

  async generateTokens(userData: UserLoginData) {
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
      expiresIn: '1d',
    });

    const refreshToken = this.jwtService.sign(
      { sub: payload.sub, login: payload.login },
      { expiresIn: '1d' },
    );

    return { accessToken, refreshToken };
  }

  // private async logAccess(userData: UserLoginData, device: string) {
  //   try {
  //     await this.prisma.logSystem.create({
  //       data: {
  //         id_pessoa_juridica_empresa: userData.id_pessoa_juridica,
  //         id_pessoa_fisica_usuario: userData.id_pessoa_usuario,
  //         id_pessoa_juridica_fisica_perfil: userData.id_pessoa_juridica_perfil,
  //         id_modulo_perfil_permissao: BigInt(1), // ID do módulo de login
  //         endpoint_name: '/auth/login',
  //         device,
  //         action_page: 'LOGIN',
  //         situacao: 1,
  //         error_status: 0,
  //       },
  //     });
  //   } catch (error) {
  //     // Log não deve quebrar o login
  //     console.error('Erro ao registrar log:', error);
  //   }
  // }

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
      throw new BadRequestException('Usuario ou senha inválidos');
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
    {
      confirmacao_nova_senha,
      nova_senha,
      senha_master,
      email,
    }: FirstUpdateSenhaLoginDto,
  ) {
    const user = await this.prisma.pessoasUsuarios.findUnique({
      where: { id: BigInt(userId), situacao: 1 },
    });

    if (!user) {
      throw new BadRequestException('Usuário não encontrado');
    }

    if (user.first_access !== 1) {
      throw new BadRequestException(
        'Para alterar senha apos primeiro acesso, utilize outro endpoint',
      );
    }

    if (nova_senha !== confirmacao_nova_senha) {
      throw new BadRequestException('As senhas devem ser iguais');
    }
    if (nova_senha === senha_master) {
      throw new BadRequestException(
        'A senha nova deve ser diferente da senha master',
      );
    }

    const hashedPassword = await this.hashPassword(nova_senha);
    const hashedPasswordMaster =
      senha_master && senha_master.trim().length > 4
        ? await this.hashPassword(senha_master)
        : null;

    // Verifica se o nome do usuário é "ADMINISTRADOR" e se login contem "admin" para mudar email (login) do usuario
    if (
      user.nome_login.toUpperCase() === 'ADMINISTRADOR' &&
      user.nome_login.toLowerCase().includes('admin')
    ) {
      if (!email) {
        throw new BadRequestException(
          'O novo email é obrigatório para o usuário ADMINISTRADOR',
        );
      } else {
        // Verifica se o novo email já está em uso
        const emailExistente = await this.prisma.pessoasUsuarios.findFirst({
          where: { login: email.trim().toLowerCase() },
        });
        if (emailExistente) {
          throw new BadRequestException('Email já está em uso');
        } else {
          email = email.trim().toLowerCase();
        }
      }
    }

    const updatedUser = await this.prisma.pessoasUsuarios.update({
      where: { id: BigInt(userId), situacao: 1 },
      data: {
        senha: hashedPassword,
        senha_master: hashedPasswordMaster,
        login: email ? email : user.login,
        first_access: 0,
        updatedAt: new Date(),
      },
    });

    if (!updatedUser) {
      throw new BadRequestException('Erro ao atualizar a senha do usuário');
    }

    return {
      message: `Senha alterada para o usuário ${updatedUser.nome_login}, com sucesso!`,
    };
  }

  async getLoggedUserInfo(requestUser: RequestUserPayload): Promise<any> {
    if (!requestUser?.login || !requestUser?.id_sistema) {
      throw new UnauthorizedException('Usuário não identificado');
    }

    const userData = await this.getUserLoginData(
      requestUser.login,
      Number(requestUser.id_sistema),
    );

    if (!userData) {
      throw new UnauthorizedException('Usuário não encontrado');
    }

    const moduloPrincipal = Number(
      userData.juridica_principal ?? requestUser.id_pessoa_juridica,
    );
    const perfilId = Number(
      userData.id_pessoa_juridica_perfil ?? requestUser.id_perfil,
    );

    const permissoes = await this.getPermissoes(
      Number(userData.id_sistema),
      moduloPrincipal,
      perfilId,
    );

    const { senha, ...pessoa_usuario } = userData;

    return {
      pessoa_usuario,
      permissoes,
    };
  }
}
