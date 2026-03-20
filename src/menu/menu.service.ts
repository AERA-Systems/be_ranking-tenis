import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { UserRole } from '../database/enums';
import { MenuItemEntity } from '../database/entities/menu-item.entity';
import { CreateMenuChildDto, CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';

export interface MenuTreeItem {
  id: string;
  label: string;
  icon: string;
  route?: string;
  children?: MenuTreeItem[];
}

export interface MenuGroupedResponse {
  admin: MenuTreeItem[];
  master: MenuTreeItem[];
}

@Injectable()
export class MenuService {
  constructor(
    @InjectRepository(MenuItemEntity)
    private readonly menuRepo: Repository<MenuItemEntity>,
  ) {}

  async listAllGrouped(): Promise<MenuGroupedResponse> {
    const [adminItems, masterItems] = await Promise.all([
      this.listByRole(UserRole.ADMIN),
      this.listByRole(UserRole.MASTER),
    ]);

    return {
      admin: adminItems,
      master: masterItems,
    };
  }

  async listForRole(role: UserRole): Promise<MenuTreeItem[]> {
    return this.listByRole(role);
  }

  async getById(id: string): Promise<CreateMenuDto & { id: string }> {
    const root = await this.menuRepo.findOne({ where: { id, parentId: IsNull() } });
    if (!root) {
      throw new NotFoundException('Menu não encontrado.');
    }

    const tree = await this.loadTreeByRoot(root.id, root.role);
    return {
      id: root.id,
      role: root.role,
      label: tree.label,
      icon: tree.icon,
      route: tree.route,
      children: this.removeIds(tree.children),
    };
  }

  async create(dto: CreateMenuDto): Promise<CreateMenuDto & { id: string }> {
    const root = await this.persistTree(dto, dto.role, null);
    return this.getById(root.id);
  }

  async update(id: string, dto: UpdateMenuDto): Promise<CreateMenuDto & { id: string }> {
    const existing = await this.menuRepo.findOne({ where: { id, parentId: IsNull() } });
    if (!existing) {
      throw new NotFoundException('Menu não encontrado.');
    }

    const role = dto.role ?? existing.role;
    await this.menuRepo.delete({ parentId: existing.id });

    existing.label = dto.label ?? existing.label;
    existing.icon = dto.icon ?? existing.icon;
    if (dto.route !== undefined) {
      existing.route = dto.route;
    }
    existing.role = role;
    await this.menuRepo.save(existing);

    if (dto.children) {
      await this.persistChildren(dto.children, role, existing.id);
    }

    return this.getById(existing.id);
  }

  async remove(id: string) {
    const existing = await this.menuRepo.findOne({ where: { id, parentId: IsNull() } });
    if (!existing) {
      throw new NotFoundException('Menu não encontrado.');
    }

    await this.menuRepo.remove(existing);
    return { ok: true };
  }

  private async listByRole(role: UserRole): Promise<MenuTreeItem[]> {
    const records = await this.menuRepo.find({
      where: { role },
      order: { sortOrder: 'ASC', createdAt: 'ASC' },
    });

    return this.buildTree(records);
  }

  private buildTree(records: MenuItemEntity[]): MenuTreeItem[] {
    const nodes = new Map<string, MenuTreeItem & { parentId?: string | null }>();

    for (const record of records) {
      nodes.set(record.id, {
        id: record.id,
        label: record.label,
        icon: record.icon,
        route: record.route ?? undefined,
        children: [],
        parentId: record.parentId,
      });
    }

    const roots: Array<MenuTreeItem & { parentId?: string | null }> = [];
    for (const record of records) {
      const current = nodes.get(record.id);
      if (!current) {
        continue;
      }

      if (record.parentId) {
        const parent = nodes.get(record.parentId);
        parent?.children?.push(current);
      } else {
        roots.push(current);
      }
    }

    return roots.map((item) => this.cleanNode(item));
  }

  private cleanNode(item: MenuTreeItem & { parentId?: string | null }): MenuTreeItem {
    const children = item.children?.map((child) => this.cleanNode(child as MenuTreeItem & { parentId?: string | null }));

    return {
      id: item.id,
      label: item.label,
      icon: item.icon,
      ...(item.route ? { route: item.route } : {}),
      ...(children && children.length > 0 ? { children } : {}),
    };
  }

  private async loadTreeByRoot(id: string, role: UserRole): Promise<MenuTreeItem> {
    const records = await this.menuRepo.find({
      where: { role },
      order: { sortOrder: 'ASC', createdAt: 'ASC' },
    });

    const tree = this.buildTree(records).find((item) => item.id === id);
    if (!tree) {
      throw new NotFoundException('Menu não encontrado.');
    }

    return tree;
  }

  private removeIds(children?: MenuTreeItem[]): CreateMenuChildDto[] | undefined {
    if (!children || children.length === 0) {
      return undefined;
    }

    return children.map((child) => ({
      label: child.label,
      icon: child.icon,
      route: child.route,
      children: this.removeIds(child.children),
    }));
  }

  private async persistTree(dto: CreateMenuChildDto, role: UserRole, parentId: string | null) {
    const sortOrder = await this.getNextSortOrder(parentId, role);
    const entity = await this.menuRepo.save(
      this.menuRepo.create({
        label: dto.label,
        icon: dto.icon,
        route: dto.route ?? null,
        role,
        parentId,
        sortOrder,
      }),
    );

    if (dto.children && dto.children.length > 0) {
      await this.persistChildren(dto.children, role, entity.id);
    }

    return entity;
  }

  private async persistChildren(children: CreateMenuChildDto[], role: UserRole, parentId: string) {
    for (const [index, child] of children.entries()) {
      const entity = await this.menuRepo.save(
        this.menuRepo.create({
          label: child.label,
          icon: child.icon,
          route: child.route ?? null,
          role,
          parentId,
          sortOrder: index,
        }),
      );

      if (child.children && child.children.length > 0) {
        await this.persistChildren(child.children, role, entity.id);
      }
    }
  }

  private async getNextSortOrder(parentId: string | null, role: UserRole) {
    const query = this.menuRepo
      .createQueryBuilder('menu')
      .select('COALESCE(MAX(menu.sortOrder), -1)', 'max')
      .where('menu.role = :role', { role });

    if (parentId) {
      query.andWhere('menu.parentId = :parentId', { parentId });
    } else {
      query.andWhere('menu.parentId IS NULL');
    }

    const result = await query.getRawOne<{ max: string }>();
    return Number(result?.max ?? -1) + 1;
  }
}
