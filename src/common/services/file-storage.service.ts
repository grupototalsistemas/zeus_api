import {
    Injectable,
    InternalServerErrorException,
    NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as mime from 'mime-types';
import * as path from 'path';
import { promisify } from 'util';

type MulterFile = Express.Multer.File;

const writeFileAsync = promisify(fs.writeFile);
const unlinkAsync = promisify(fs.unlink);
const mkdirAsync = promisify(fs.mkdir);
const existsAsync = promisify(fs.exists);
const readFileAsync = promisify(fs.readFile);

@Injectable()
export class FileStorageService {
  private readonly uploadPath: string;

  constructor(private configService: ConfigService) {
    this.uploadPath = this.configService.get<string>(
      'FILE_STORAGE_PATH',
      './uploads',
    );
    this.ensureUploadDirectory();
  }

  /**
   * Garante que o diretório de upload existe
   */
  private async ensureUploadDirectory() {
    try {
      const exists = await existsAsync(this.uploadPath);
      if (!exists) {
        await mkdirAsync(this.uploadPath, { recursive: true });
      }
    } catch (error) {
      throw new InternalServerErrorException(
        'Erro ao criar diretório de uploads',
      );
    }
  }

  /**
   * Salva um arquivo no sistema de arquivos
   * @param file - Arquivo do multer
   * @param subFolder - Subpasta opcional (ex: 'anexos', 'chamados')
   * @returns Caminho relativo do arquivo salvo
   */
  async saveFile(
    file: MulterFile,
    subFolder = 'anexos',
  ): Promise<string> {
    try {
      // Criar subpasta se não existir
      const fullSubPath = path.join(this.uploadPath, subFolder);
      const exists = await existsAsync(fullSubPath);
      if (!exists) {
        await mkdirAsync(fullSubPath, { recursive: true });
      }

      // Gerar nome único para o arquivo
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 15);
      const ext = path.extname(file.originalname);
      const filename = `${timestamp}-${randomString}${ext}`;

      // Caminho completo do arquivo
      const filePath = path.join(fullSubPath, filename);

      // Salvar arquivo
      await writeFileAsync(filePath, file.buffer);

      // Retornar caminho relativo
      return path.join(subFolder, filename);
    } catch (error) {
      console.error('Erro ao salvar arquivo:', error);
      throw new InternalServerErrorException('Erro ao salvar arquivo');
    }
  }

  /**
   * Recupera um arquivo do sistema de arquivos
   * @param relativePath - Caminho relativo do arquivo
   * @returns Buffer do arquivo e informações
   */
  async getFile(relativePath: string): Promise<{
    buffer: Buffer;
    mimeType: string;
    filename: string;
  }> {
    try {
      const fullPath = path.join(this.uploadPath, relativePath);
      const exists = await existsAsync(fullPath);

      if (!exists) {
        throw new NotFoundException('Arquivo não encontrado');
      }

      const buffer = await readFileAsync(fullPath);
      const filename = path.basename(relativePath);
      const mimeType = mime.lookup(relativePath) || 'application/octet-stream';

      return {
        buffer,
        mimeType,
        filename,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Erro ao ler arquivo:', error);
      throw new InternalServerErrorException('Erro ao ler arquivo');
    }
  }

  /**
   * Deleta um arquivo do sistema de arquivos
   * @param relativePath - Caminho relativo do arquivo
   */
  async deleteFile(relativePath: string): Promise<void> {
    try {
      const fullPath = path.join(this.uploadPath, relativePath);
      const exists = await existsAsync(fullPath);

      if (exists) {
        await unlinkAsync(fullPath);
      }
    } catch (error) {
      console.error('Erro ao deletar arquivo:', error);
      throw new InternalServerErrorException('Erro ao deletar arquivo');
    }
  }

  /**
   * Verifica se um arquivo existe
   * @param relativePath - Caminho relativo do arquivo
   * @returns true se existe, false caso contrário
   */
  async fileExists(relativePath: string): Promise<boolean> {
    try {
      const fullPath = path.join(this.uploadPath, relativePath);
      return await existsAsync(fullPath);
    } catch (error) {
      return false;
    }
  }

  /**
   * Retorna o caminho completo do diretório de uploads
   */
  getUploadPath(): string {
    return this.uploadPath;
  }
}
