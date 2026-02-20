import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
export function setupSwagger(app: INestApplication) {
  const configBuilder = new DocumentBuilder()
    .setTitle('API Zeus')
    .setDescription('API para comando do Zeus')
    .setVersion('1.0')
    .addBearerAuth();

  // Adiciona servidores baseado no ambiente
  switch (process.env.NODE_ENV) {
    case 'production':
      configBuilder.addServer('http://localhost:4000');
      break;
    case 'homolog':
      configBuilder.addServer('http://localhost:4000');
      break;
    case 'development':
      configBuilder.addServer('http://localhost:4000');
      break;
    default:
      configBuilder.addServer('http://localhost:4000');
      break;
  }

  const config = configBuilder.build();
  const document = SwaggerModule.createDocument(app, config);

  const ordemDesejada = [''];

  document.tags = document.tags?.sort(
    (a, b) => ordemDesejada.indexOf(a.name) - ordemDesejada.indexOf(b.name),
  );

  // Tags que devem ser escondidas da visualização em produção (rotas continuam funcionando)
  const tagsEscondidasEmProducao = [''];

  // Em produção, remove as tags do documento visual (mas as rotas continuam ativas)
  if (
    process.env.NODE_ENV === 'production' ||
    process.env.NODE_ENV === 'homolog'
  ) {
    // Remove as tags da lista
    document.tags = document.tags?.filter(
      (tag) => !tagsEscondidasEmProducao.includes(tag.name),
    );

    // Remove os paths (endpoints) associados às tags escondidas
    for (const path in document.paths) {
      const pathItem = document.paths[path];
      for (const method in pathItem) {
        const operation = pathItem[method];
        if (
          operation?.tags?.some((tag: string) =>
            tagsEscondidasEmProducao.includes(tag),
          )
        ) {
          delete pathItem[method];
        }
      }
      // Se o path ficou vazio, remove ele também
      if (Object.keys(pathItem).length === 0) {
        delete document.paths[path];
      }
    }
  }

  SwaggerModule.setup('docs', app, document, {
    customSiteTitle: 'API Zeus - Documentação',
    swaggerOptions: {
      docExpansion: 'none',
      operationsSorter: 'alpha',
      tagsSorter: 'alpha',
      persistAuthorization: true,
    },
  });
}
