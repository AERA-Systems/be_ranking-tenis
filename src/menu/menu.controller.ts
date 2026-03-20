import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiCookieAuth, ApiExtraModels, ApiForbiddenResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiParam, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { CurrentUser, type AuthenticatedUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { UserRole } from '../database/enums';
import { CreateMenuDto, MenuCrudResponseDto, MenuGroupedResponseDto, MenuIdParamDto, MenuRemoveResponseDto, MenuTreeItemResponseDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { MenuService } from './menu.service';

@ApiTags('Menu')
@ApiBearerAuth()
@ApiCookieAuth('access_token')
@ApiExtraModels(MenuTreeItemResponseDto, MenuGroupedResponseDto, MenuCrudResponseDto, MenuRemoveResponseDto)
@Controller('menu-permissions')
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  @Get('me')
  @ApiOperation({ summary: 'Retorna o menu conforme o papel do usuário logado' })
  @ApiOkResponse({ type: MenuTreeItemResponseDto, isArray: true })
  @ApiUnauthorizedResponse({ description: 'Usuário não autenticado.' })
  myMenu(@CurrentUser() user: AuthenticatedUser) {
    return this.menuService.listForRole(user.role as UserRole);
  }

  @Get()
  @Roles(UserRole.MASTER)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Lista menus agrupados por ADMIN e MASTER' })
  @ApiOkResponse({ type: MenuGroupedResponseDto })
  @ApiUnauthorizedResponse({ description: 'Usuário não autenticado.' })
  @ApiForbiddenResponse({ description: 'Apenas MASTER pode gerenciar menus.' })
  list() {
    return this.menuService.listAllGrouped();
  }

  @Get(':id')
  @Roles(UserRole.MASTER)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Busca um menu raiz por id' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ type: MenuCrudResponseDto })
  @ApiUnauthorizedResponse({ description: 'Usuário não autenticado.' })
  @ApiForbiddenResponse({ description: 'Apenas MASTER pode gerenciar menus.' })
  @ApiNotFoundResponse({ description: 'Menu não encontrado.' })
  getById(@Param() params: MenuIdParamDto) {
    return this.menuService.getById(params.id);
  }

  @Post()
  @Roles(UserRole.MASTER)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Cria menu e filhos em árvore' })
  @ApiOkResponse({ type: MenuCrudResponseDto })
  @ApiUnauthorizedResponse({ description: 'Usuário não autenticado.' })
  @ApiForbiddenResponse({ description: 'Apenas MASTER pode gerenciar menus.' })
  create(@Body() dto: CreateMenuDto) {
    return this.menuService.create(dto);
  }

  @Patch(':id')
  @Roles(UserRole.MASTER)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Atualiza menu e filhos em árvore' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ type: MenuCrudResponseDto })
  @ApiUnauthorizedResponse({ description: 'Usuário não autenticado.' })
  @ApiForbiddenResponse({ description: 'Apenas MASTER pode gerenciar menus.' })
  @ApiNotFoundResponse({ description: 'Menu não encontrado.' })
  update(@Param() params: MenuIdParamDto, @Body() dto: UpdateMenuDto) {
    return this.menuService.update(params.id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.MASTER)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Exclui menu raiz e seus filhos' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ type: MenuRemoveResponseDto })
  @ApiUnauthorizedResponse({ description: 'Usuário não autenticado.' })
  @ApiForbiddenResponse({ description: 'Apenas MASTER pode gerenciar menus.' })
  @ApiNotFoundResponse({ description: 'Menu não encontrado.' })
  remove(@Param() params: MenuIdParamDto) {
    return this.menuService.remove(params.id);
  }
}
