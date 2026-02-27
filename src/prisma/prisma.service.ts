import {
  INestApplication,
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super({
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
      log: [
        { level: 'error', emit: 'stdout' },
        { level: 'warn', emit: 'stdout' },
      ],
      errorFormat: 'pretty',
    });
  }

  async onModuleInit() {
    await this.connectWithRetry();
    this.logger.log('📊 Pool de conexões do Prisma configurado com sucesso');
  }

  async onModuleDestroy() {
    this.logger.log('🔌 Desconectando do banco de dados...');
    await this.$disconnect();
    this.logger.log('✅ Desconexão do banco de dados concluída');
  }

  private async connectWithRetry(retries = 10, delayMs = 5000) {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        this.logger.log(
          `Tentando conectar ao banco de dados (tentativa ${attempt}/${retries})...`,
        );

        // Configuração de timeout mais longa para conexão inicial
        await Promise.race([
          this.$connect(),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Connection timeout')), 30000),
          ),
        ]);

        // Teste a conexão
        await this.$queryRaw`SELECT 1`;

        this.logger.log(
          '✅ Conexão com o banco de dados estabelecida com sucesso!',
        );
        return;
      } catch (err: any) {
        this.logger.error(
          `❌ Falha ao conectar ao banco (tentativa ${attempt}/${retries}): ${err.message}`,
        );

        if (attempt < retries) {
          this.logger.warn(
            `Aguardando ${delayMs / 1000}s antes de tentar novamente...`,
          );
          await new Promise((resolve) => setTimeout(resolve, delayMs));
        } else {
          this.logger.error(
            '🚨 Não foi possível conectar ao banco após múltiplas tentativas. Verifique se o container do banco está rodando.',
          );
          process.exit(1);
        }
      }
    }
  }

  async enableShutdownHooks(app: INestApplication) {
    (this.$on as any)('beforeExit', async () => {
      await app.close();
    });
  }

  /**
   * Executa uma operação com retry em caso de timeout de conexão
   */
  async executeWithRetry<T>(
    operation: () => Promise<T>,
    maxRetries = 3,
    delay = 1000,
  ): Promise<T> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error: any) {
        const isConnectionError =
          error.code === 'P2024' || // Connection pool timeout
          error.code === 'P1001' || // Can't reach database server
          error.code === 'P1017' || // Server has closed the connection
          error.message.includes('connection pool') ||
          error.message.includes('Connection timeout');

        if (!isConnectionError || attempt === maxRetries) {
          throw error;
        }

        this.logger.warn(
          `Erro de conexão na tentativa ${attempt}/${maxRetries}: ${error.message}. Tentando novamente em ${delay}ms...`,
        );

        await new Promise((resolve) => setTimeout(resolve, delay));
        delay *= 1.5; // Exponential backoff
      }
    }

    // Este ponto nunca deveria ser alcançado, mas TypeScript precisa de um return
    throw new Error('executeWithRetry failed to complete after all attempts');
  }

  /**
   * Monitora o status do pool de conexões
   */
  async getPoolStatus(): Promise<{
    isConnected: boolean;
    poolSize: number;
    activeConnections: number;
  }> {
    try {
      await this.$queryRaw`SELECT 1`;
      return {
        isConnected: true,
        poolSize: 10, // Valor padrão do Prisma
        activeConnections: -1, // Não disponível facilmente no Prisma
      };
    } catch (error: any) {
      return {
        isConnected: false,
        poolSize: 0,
        activeConnections: 0,
      };
    }
  }
}
