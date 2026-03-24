import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { MatchType } from '../../database/enums';

export class MatchesQueryDto {
  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  playerId?: string;

  @ApiPropertyOptional({ enum: MatchType })
  @IsOptional()
  @IsEnum(MatchType)
  type?: MatchType;

  @ApiPropertyOptional({ example: '2026-03' })
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}$/)
  month?: string;
}

export class CreateMatchDto {
  @ApiProperty({ enum: MatchType })
  @IsEnum(MatchType)
  type!: MatchType;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  challengeId?: string;

  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  player1Id!: string;

  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  player2Id!: string;

  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  winnerId!: string;

  @ApiProperty({
    type: 'array',
    minItems: 2,
    maxItems: 3,
    example: [
      { player1Games: 6, player2Games: 4 },
      { player1Games: 3, player2Games: 6 },
      { player1Games: 6, player2Games: 2 },
    ],
  })
  @IsArray()
  @ArrayMinSize(2)
  @ArrayMaxSize(3)
  @ValidateNested({ each: true })
  @Type(() => MatchSetDto)
  sets!: MatchSetDto[];

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @Transform(({ value }) => (value === undefined ? undefined : Boolean(value)))
  @IsBoolean()
  wo?: boolean;

  @ApiPropertyOptional({
    example: '2026-03-12',
    description: 'Data da partida. Aceita data simples (YYYY-MM-DD) ou data/hora em ISO-8601.',
  })
  @IsOptional()
  @IsDateString()
  playedAt?: string;
}

export class MatchSetDto {
  @ApiProperty({ minimum: 0, maximum: 7 })
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(0)
  @Max(7)
  player1Games!: number;

  @ApiProperty({ minimum: 0, maximum: 7 })
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(0)
  @Max(7)
  player2Games!: number;
}
