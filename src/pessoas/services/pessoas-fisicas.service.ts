import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  CreatePessoasFisicaDto,
  UpdatePessoasFisicaDto,
} from '../dto/pessoa-fisica.dto';

@Injectable()
export class PessoasFisicasService {
  constructor(private prisma: PrismaService) {}

  async create(createPessoaFisicaDto: CreatePessoasFisicaDto) {
    // return this.prisma.pessoasFisica.create({
    //   data: createPessoaFisicaDto,
    //   include: {
    //     pessoa: true,
    //     genero: true,
    //     estadoCivil: true,
    //   },
    // });
  }

  async findAll(query?: any) {
    const { situacao = 1, cpf, nome_registro, nome_social } = query || {};

    const orConditions: any[] = [];

    if (cpf) {
      orConditions.push({ cpf: { contains: cpf } });
    }

    if (nome_registro) {
      orConditions.push({
        nome_registro: { contains: nome_registro, mode: 'insensitive' },
      });
    }

    if (nome_social) {
      orConditions.push({
        nome_social: { contains: nome_social, mode: 'insensitive' },
      });
    }

    const result = await this.prisma.pessoasFisica.findMany({
      where: {
        situacao,
        ...(orConditions.length > 0 ? { OR: orConditions } : {}),
      },
      include: {
        pessoa: true,
        genero: true,
        estadoCivil: true,
        pessoasUsuarios: true,
      },
    });

    if (!result.length) {
      throw new NotFoundException('Nenhuma pessoa física encontrada');
    }

    return result;
  }

  async findOne(id: number) {
    if (!id) throw new NotFoundException('ID da pessoa física é obrigatório');

    const pessoaFisica = await this.prisma.pessoasFisica.findUnique({
      where: { id },
      include: {
        pessoa: true,
        genero: true,
        estadoCivil: true,
        pessoasUsuarios: true,
        pessoasJuridicasFisicas: {
          include: {
            pessoaJuridica: true,
            pessoaJuridicaPerfil: true,
          },
        },
      },
    });

    if (!pessoaFisica) {
      throw new NotFoundException('Pessoa física não encontrada');
    }

    return pessoaFisica;
  }

  async update(id: number, updatePessoaFisicaDto: UpdatePessoasFisicaDto) {
    // const pessoaFisica = await this.findOne(id);
    // return this.prisma.pessoasFisica.update({
    //   where: { id },
    //   data: updatePessoaFisicaDto,
    //   include: {
    //     pessoa: true,
    //     genero: true,
    //     estadoCivil: true,
    //   },
    // });
  }

  async remove(id: number, motivo: string) {
    const pessoaFisica = await this.findOne(id);

    // Verifica se está ativo (situacao = 1)
    if (pessoaFisica.situacao !== 1) {
      throw new BadRequestException('Pessoa física já está desativada');
    }

    // Verifica se não é registro global (id_pessoa = -1)
    if (Number(pessoaFisica.id_pessoa) === -1) {
      throw new BadRequestException(
        'Nao e permitido remover registros globais (pessoa = -1)',
      );
    }

    return this.prisma.pessoasFisica.update({
      where: { id },
      data: {
        situacao: 0,
        motivo: motivo,
        updatedAt: new Date(),
      },
    });
  }

  // Método específico para encontrar pessoa física pelo ID de usuário
  async findByUsuarioId(usuarioId: number) {
    const usuario = await this.prisma.pessoasUsuarios.findUnique({
      where: { id: usuarioId },
      include: {
        pessoaFisica: {
          include: {
            pessoa: true,
            genero: true,
            estadoCivil: true,
          },
        },
      },
    });

    if (!usuario) {
      throw new NotFoundException('Usuário não encontrado');
    }

    return usuario.pessoaFisica;
  }
}
