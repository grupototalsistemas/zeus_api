import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class LoginCertificateDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  certificate: string;
}
