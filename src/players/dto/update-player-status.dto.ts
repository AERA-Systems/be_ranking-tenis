import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsString } from 'class-validator';

export class UpdatePlayerStatusDto {
  @ApiProperty({
    example: 'normal',          // Exemplo de valor
    enum: ['normal', 'vermelho'], // Valores possíveis
    description: 'O status do jogador pode ser "normal" ou "vermelho".',
  })
  @IsString()                   // Valida que o campo é uma string
  @IsIn(['normal', 'vermelho']) // Valida que o valor é um dos dois
  status!: string;
}
