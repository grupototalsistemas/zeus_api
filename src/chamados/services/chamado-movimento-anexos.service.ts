import { Injectable, NotFoundException } from '@nestjs/common';
import { FileStorageService } from 'src/common/services/file-storage.service';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  CreateChamadoMovimentoAnexoDto,
  UpdateChamadoMovimentoAnexoDto,
} from '../dto/chamado-movimento-anexo.dto';

type MulterFile = Express.Multer.File;

@Injectable()
export class ChamadoMovimentoAnexosService {
  constructor(
    private prisma: PrismaService,
    private fileStorage: FileStorageService,
  ) {}

  /**
   * Cria um novo anexo com upload de arquivo
   */
  async create(
    createDto: CreateChamadoMovimentoAnexoDto,
    file: MulterFile,
  ) {
    // Salvar arquivo no sistema de arquivos
    const caminho = await this.fileStorage.saveFile(file, 'anexos');

    // Criar registro no banco
    return this.prisma.chamadoMovimentoAnexo.create({
      data: {
        id_chamado_movimento: BigInt(createDto.id_chamado_movimento),
        id_pessoa_usuario: BigInt(createDto.id_pessoa_usuario),
        ordem: createDto.ordem,
        descricao: createDto.descricao,
        dataHora: new Date(),
        caminho,
        situacao: 1,
      },
      include: {
        movimento: true,
        usuario: true,
      },
    });
  }

  /**
   * Lista todos os anexos ativos
   */
  async findAll() {
    return this.prisma.chamadoMovimentoAnexo.findMany({
      where: { situacao: 1 },
      include: {
        movimento: true,
        usuario: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Lista anexos de um movimento específico
   */
  async findByMovimento(idMovimento: number) {
    return this.prisma.chamadoMovimentoAnexo.findMany({
      where: {
        id_chamado_movimento: BigInt(idMovimento),
        situacao: 1,
      },
      include: {
        movimento: true,
        usuario: true,
      },
      orderBy: [
        { ordem: 'asc' },
        { createdAt: 'desc' },
      ],
    });
  }

  /**
   * Busca um anexo específico
   */
  async findOne(id: number) {
    const anexo = await this.prisma.chamadoMovimentoAnexo.findUnique({
      where: { id: BigInt(id) },
      include: {
        movimento: true,
        usuario: true,
      },
    });

    if (!anexo) {
      throw new NotFoundException(`Anexo com ID ${id} não encontrado`);
    }

    return anexo;
  }

  /**
   * Faz download do arquivo de um anexo
   */
  async downloadFile(id: number) {
    const anexo = await this.findOne(id);

    if (anexo.situacao !== 1) {
      throw new NotFoundException('Anexo não está disponível');
    }

    return await this.fileStorage.getFile(anexo.caminho);
  }

  /**
   * Atualiza um anexo (descrição, ordem ou arquivo)
   */
  async update(
    id: number,
    updateDto: UpdateChamadoMovimentoAnexoDto,
    file?: MulterFile,
  ) {
    const anexo = await this.findOne(id);

    let novoCaminho = anexo.caminho;

    // Se um novo arquivo foi enviado, substitui o anterior
    if (file) {
      // Deletar arquivo antigo
      await this.fileStorage.deleteFile(anexo.caminho);

      // Salvar novo arquivo
      novoCaminho = await this.fileStorage.saveFile(file, 'anexos');
    }

    // Atualizar registro no banco
    return this.prisma.chamadoMovimentoAnexo.update({
      where: { id: BigInt(id) },
      data: {
        ...(updateDto.ordem !== undefined && { ordem: updateDto.ordem }),
        ...(updateDto.descricao && { descricao: updateDto.descricao }),
        ...(file && { caminho: novoCaminho }),
        updatedAt: new Date(),
      },
      include: {
        movimento: true,
        usuario: true,
      },
    });
  }

  /**
   * Remove (soft delete) um anexo e deleta o arquivo
   */
  async remove(id: number, motivo: string) {
    const anexo = await this.findOne(id);

    // Deletar arquivo do sistema de arquivos
    await this.fileStorage.deleteFile(anexo.caminho);

    // Soft delete no banco
    return this.prisma.chamadoMovimentoAnexo.update({
      where: { id: BigInt(id) },
      data: {
        situacao: 0,
        motivo,
        updatedAt: new Date(),
      },
    });
  }

  /**
   * Verifica se um arquivo anexo existe fisicamente
   */
  async checkFileExists(id: number): Promise<boolean> {
    const anexo = await this.findOne(id);
    return await this.fileStorage.fileExists(anexo.caminho);
  }
}

