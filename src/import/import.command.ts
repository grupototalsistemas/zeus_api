import { NestFactory } from '@nestjs/core';

import { AppModule } from '../app.module';
import { ImportService } from './import.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const importService = app.get(ImportService);

  await importService.importEmpresasFromExcel('data/EMPRESAS.xlsx');

  await app.close();
}

bootstrap();
