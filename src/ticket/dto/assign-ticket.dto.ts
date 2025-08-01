import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
export class AssignTicketDto {
  @ApiProperty({ description: 'ID do usuário que receberá o chamado' })
  @IsString()
  userId: string;
}
