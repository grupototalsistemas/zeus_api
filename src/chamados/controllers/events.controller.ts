import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('WebSocket')
@Controller('events')
export class EventsController {
  @Get('docs')
  @ApiOperation({
    summary: 'Documentação dos eventos WebSocket',
    description: `
Eventos disponíveis via WebSocket:
- connect → Cliente conectado
- disconnect → Cliente desconectado
- sendMessage → Cliente envia mensagem { userId, message }
- newMessage → Servidor emite mensagem recebida
- orderCreated → Servidor emite quando um pedido é criado
    `,
  })
  getDocs() {
    return { message: 'Confira a descrição dos eventos no Swagger' };
  }
}
