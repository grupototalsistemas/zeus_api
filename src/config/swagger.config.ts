import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
export function setupSwagger(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle('API Zeus')
    .setDescription('API para abertura e gestão de chamados')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });
}
