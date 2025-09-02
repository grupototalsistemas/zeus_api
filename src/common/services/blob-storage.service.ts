// src/common/services/blob-storage.service.ts
import { Injectable } from '@nestjs/common';
import { del, head, put } from '@vercel/blob';

@Injectable()
export class BlobStorageService {
  async uploadFile(
    file: Express.Multer.File,
    folder: string = 'anexos',
  ): Promise<{ url: string; pathname: string }> {
    const filename = `${folder}/${Date.now()}-${Math.round(Math.random() * 1e9)}-${file.originalname}`;

    const blob = await put(filename, file.buffer, {
      access: 'public',
      contentType: file.mimetype,
    });

    return {
      url: blob.url,
      pathname: blob.pathname,
    };
  }

  async deleteFile(pathname: string): Promise<void> {
    try {
      await del(pathname);
    } catch (error) {
      console.error('Erro ao deletar arquivo do blob storage:', error);
      // Não propagar erro para não quebrar outras operações
    }
  }

  async fileExists(pathname: string): Promise<boolean> {
    try {
      await head(pathname);
      return true;
    } catch {
      return false;
    }
  }

  async getFileUrl(pathname: string): Promise<string | null> {
    try {
      const blob = await head(pathname);
      return blob.url;
    } catch {
      return null;
    }
  }
}
