import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateSistemaDto, UpdateSistemaDto } from './dto/sistema.dto';

@Injectable()
export class SistemasService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createSistemaDto: CreateSistemaDto) {
    try {
      const sistemaExistente = await this.prisma.sistemas.findFirst({
        where: {
          sistema: createSistemaDto.sistema,
          id_pessoa_juridica_base: createSistemaDto.id_pessoa_juridica_base,
          status_web: createSistemaDto.status_web,
          situacao: createSistemaDto.situacao,
        },
      });

      if (sistemaExistente) {
        throw new BadRequestException('Sistema ja cadastrado');
      }
    } catch (error) {
      throw new ServiceUnavailableException('Erro ao criar sistema');
    }
    return this.prisma.sistemas.create({
      data: {
        ...createSistemaDto,
      },
    });
  }

  async findAll() {
    return this.prisma.sistemas.findMany();
  }

  async findOne(id: number) {
    const sistemas = await this.prisma.sistemas.findUnique({
      where: { id: BigInt(id) },
    });

    if (!sistemas) {
      throw new NotFoundException(`Sistema com ID ${id} não encontrado`);
    }

    return sistemas;
  }

  async update(id: number, updateSistemaDto: UpdateSistemaDto) {
    await this.findOne(id); // valida existência

    return this.prisma.sistemas.update({
      where: { id: BigInt(id) },
      data: { ...updateSistemaDto },
    });
  }

  async remove(id: number, motivo: string) {
    // Busca o sistema para validação
    const sistema = await this.prisma.sistemas.findUnique({
      where: { id: BigInt(id) },
    });

    if (!sistema) {
      throw new NotFoundException(`Sistema com ID ${id} não encontrado`);
    }

    // Verifica se está ativo (situacao = 1)
    if (sistema.situacao !== 1) {
      throw new BadRequestException('Sistema já está desativado');
    }

    // Verifica se não é registro global (id_pessoa_juridica_base = -1)
    if (Number(sistema.id_pessoa_juridica_base) === -1) {
      throw new BadRequestException(
        'Nao e permitido remover registros globais ',
      );
    }

    // Executa a remoção lógica
    return this.prisma.sistemas.update({
      where: { id: BigInt(id) },
      data: {
        situacao: 0,
        motivo: motivo,
        updatedAt: new Date(),
      },
    });
  }
}
