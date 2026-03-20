import { BadRequestException, Body, Controller, Delete, Get, Param, Patch, Post, Put } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../common/decorators/public.decorator';
import { UserRole } from '../database/enums';
import { CreateUserDto, UserIdParamDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'Lista usuarios' })
  list() {
    return this.usersService.list();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Busca usuario por id' })
  getById(@Param() params: UserIdParamDto) {
    return this.usersService.getById(params.id);
  }

  @Post()
  @ApiOperation({ summary: 'Cria usuario' })
  create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  @Public()
  @Post('bootstrap')
  @ApiOperation({ summary: 'Cria o primeiro usuario do sistema' })
  async bootstrap(@Body() dto: CreateUserDto) {
    const userCount = await this.usersService.countUsers();
    if (userCount > 0) {
      throw new BadRequestException('Bootstrap inicial já foi realizado.');
    }

    return this.usersService.create({ ...dto, role: UserRole.MASTER });
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualiza usuario (PATCH)' })
  patch(@Param() params: UserIdParamDto, @Body() dto: UpdateUserDto) {
    return this.usersService.update(params.id, dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualiza usuario (PUT)' })
  put(@Param() params: UserIdParamDto, @Body() dto: UpdateUserDto) {
    return this.usersService.update(params.id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove usuario' })
  remove(@Param() params: UserIdParamDto) {
    return this.usersService.remove(params.id);
  }
}
