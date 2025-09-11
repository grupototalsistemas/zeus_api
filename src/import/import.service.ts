import { Injectable, Logger } from '@nestjs/common';
import * as xlsx from 'xlsx';
import { PrismaService } from '../prisma/prisma.service'; // ajuste se seu PrismaService estiver em outro caminho

@Injectable()
export class ImportService {
  private readonly logger = new Logger(ImportService.name);

  constructor(private readonly prisma: PrismaService) {}

  async importEmpresasFromExcel(filePath: string) {
    this.logger.log(`📂 Lendo arquivo Excel: ${filePath}`);

    // 1. Ler o Excel
    const workbook = xlsx.readFile(filePath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = xlsx.utils.sheet_to_json(sheet);

    this.logger.log(`📊 Total de registros encontrados: ${rows.length}`);

    // 2. Iterar sobre linhas
    for (const row of rows as any[]) {
      try {
        const empresa = await this.prisma.empresa.create({
          data: {
            parentId: -1, // ou row.parentId
            tipoId: Number(row.tipoId),
            categoriaId: Number(row.categoriaId),
            cnpj: String(row.cnpj),
            codigo: row.codigo ?? null,
            razaoSocial: String(row.razaoSocial),
            nomeFantasia: String(row.nomeFantasia),
            logradouro: row.logradouro ?? null,
            endereco: row.endereco ?? null,
            numero: row.numero ?? null,
            complemento: row.complemento ?? null,
            bairro: row.bairro ?? null,
            cidade: row.cidade ?? null,
            estado: row.estado ?? null,
            cep: row.cep ?? null,
            contato: row.contato ?? null,
            email: row.email ?? null,
            observacao: row.observacao ?? null,
            ativo: 'ATIVO', // ajuste conforme enum StatusRegistro
            motivo: row.motivo ?? null,
          },
        });

        this.logger.log(`✅ Empresa inserida: ${empresa.razaoSocial}`);
      } catch (error) {
        this.logger.error(
          `❌ Erro ao inserir empresa ${row.razaoSocial}:`,
          error.message,
        );
      }
    }
  }
}
