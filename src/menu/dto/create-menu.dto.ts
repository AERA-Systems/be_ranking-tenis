import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsEnum, IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator';
import { UserRole } from '../../database/enums';

export class CreateMenuChildDto {
  @ApiProperty({ example: 'Gestão Usuário' })
  @IsString()
  label!: string;

  @ApiProperty({ example: 'account_circle' })
  @IsString()
  icon!: string;

  @ApiPropertyOptional({ example: '/users/list' })
  @IsOptional()
  @IsString()
  route?: string;

  @ApiPropertyOptional({ type: () => [CreateMenuChildDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateMenuChildDto)
  children?: CreateMenuChildDto[];
}

export class CreateMenuDto extends CreateMenuChildDto {
  @ApiProperty({ enum: UserRole, example: UserRole.ADMIN })
  @IsEnum(UserRole)
  role!: UserRole;
}

export class MenuIdParamDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  id!: string;
}

export class MenuTreeItemResponseDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ example: 'Gestão Usuário' })
  label!: string;

  @ApiProperty({ example: 'account_circle' })
  icon!: string;

  @ApiPropertyOptional({ example: '/users/list' })
  route?: string;

  @ApiPropertyOptional({ type: () => [MenuTreeItemResponseDto] })
  children?: MenuTreeItemResponseDto[];
}

export class MenuGroupedResponseDto {
  @ApiProperty({ type: () => [MenuTreeItemResponseDto] })
  admin!: MenuTreeItemResponseDto[];

  @ApiProperty({ type: () => [MenuTreeItemResponseDto] })
  master!: MenuTreeItemResponseDto[];
}

export class MenuCrudResponseDto extends CreateMenuDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;
}

export class MenuRemoveResponseDto {
  @ApiProperty({ example: true })
  ok!: boolean;
}
