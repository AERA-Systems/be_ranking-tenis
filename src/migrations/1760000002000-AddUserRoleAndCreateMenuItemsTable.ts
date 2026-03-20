import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class AddUserRoleAndCreateMenuItemsTable1760000002000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$
      BEGIN
        CREATE TYPE "public"."User_role_enum" AS ENUM('ADMIN', 'MASTER');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END
      $$;
    `);

    if (await queryRunner.hasTable('User')) {
      const userTable = await queryRunner.getTable('User');
      const hasRoleColumn = userTable?.findColumnByName('role');

      if (!hasRoleColumn) {
        await queryRunner.query(`ALTER TABLE "User" ADD "role" "public"."User_role_enum" NOT NULL DEFAULT 'ADMIN'`);
        await queryRunner.query(`UPDATE "User" SET "role" = 'MASTER' WHERE "role" = 'ADMIN' OR "role" IS NULL`);
      }
    }

    const hasMenuItemTable = await queryRunner.hasTable('MenuItem');
    if (!hasMenuItemTable) {
      await queryRunner.createTable(
        new Table({
          name: 'MenuItem',
          columns: [
            {
              name: 'id',
              type: 'uuid',
              isPrimary: true,
            },
            {
              name: 'label',
              type: 'text',
              isNullable: false,
            },
            {
              name: 'icon',
              type: 'text',
              isNullable: false,
            },
            {
              name: 'route',
              type: 'text',
              isNullable: true,
            },
            {
              name: 'sortOrder',
              type: 'int',
              isNullable: false,
              default: 0,
            },
            {
              name: 'role',
              type: '"public"."User_role_enum"',
              isNullable: false,
            },
            {
              name: 'parentId',
              type: 'uuid',
              isNullable: true,
            },
            {
              name: 'createdAt',
              type: 'timestamp',
              isNullable: false,
              default: 'now()',
            },
            {
              name: 'updatedAt',
              type: 'timestamp',
              isNullable: false,
              default: 'now()',
            },
          ],
        }),
      );

      await queryRunner.createForeignKey(
        'MenuItem',
        new TableForeignKey({
          columnNames: ['parentId'],
          referencedTableName: 'MenuItem',
          referencedColumnNames: ['id'],
          onDelete: 'CASCADE',
        }),
      );
    }

    await queryRunner.query(`
      INSERT INTO "MenuItem" ("id", "label", "icon", "route", "sortOrder", "role", "parentId")
      VALUES
        ('10000000-0000-0000-0000-000000000001', 'Gestão Usuário', 'account_circle', NULL, 0, 'ADMIN', NULL),
        ('10000000-0000-0000-0000-000000000002', 'Listar Usuários', 'chevron_right', '/users/list', 0, 'ADMIN', '10000000-0000-0000-0000-000000000001'),
        ('10000000-0000-0000-0000-000000000003', 'Novo Usuário', 'chevron_right', '/users/create', 1, 'ADMIN', '10000000-0000-0000-0000-000000000001'),
        ('10000000-0000-0000-0000-000000000004', 'Gestão de Items', 'inventory_2', NULL, 1, 'ADMIN', NULL),
        ('10000000-0000-0000-0000-000000000005', 'Novo Item', 'chevron_right', '/items/new-item', 0, 'ADMIN', '10000000-0000-0000-0000-000000000004'),
        ('10000000-0000-0000-0000-000000000006', 'Estoque', 'chevron_right', '/items/stock', 1, 'ADMIN', '10000000-0000-0000-0000-000000000004'),
        ('10000000-0000-0000-0000-000000000007', 'Relatórios', 'analytics', '/reports', 2, 'ADMIN', NULL),
        ('10000000-0000-0000-0000-000000000008', 'Suporte', 'help', '/support', 3, 'ADMIN', NULL),
        ('20000000-0000-0000-0000-000000000001', 'Painel Admin', 'admin_panel_settings', NULL, 0, 'MASTER', NULL),
        ('20000000-0000-0000-0000-000000000002', 'Listar Empresas', 'chevron_right', 'master/company/list', 0, 'MASTER', '20000000-0000-0000-0000-000000000001'),
        ('20000000-0000-0000-0000-000000000003', 'Nova Empresa', 'chevron_right', 'master/company/new-company', 1, 'MASTER', '20000000-0000-0000-0000-000000000001'),
        ('20000000-0000-0000-0000-000000000004', 'Permissões de Menu', 'chevron_right', 'master/menu-permissions', 2, 'MASTER', '20000000-0000-0000-0000-000000000001'),
        ('20000000-0000-0000-0000-000000000005', 'Gestão Usuário', 'account_circle', NULL, 1, 'MASTER', NULL),
        ('20000000-0000-0000-0000-000000000006', 'Listar Usuários', 'chevron_right', 'master/users/list', 0, 'MASTER', '20000000-0000-0000-0000-000000000005'),
        ('20000000-0000-0000-0000-000000000007', 'Novo Usuário', 'chevron_right', 'master/users/new', 1, 'MASTER', '20000000-0000-0000-0000-000000000005'),
        ('20000000-0000-0000-0000-000000000008', 'Relatórios', 'analytics', '/reports', 2, 'MASTER', NULL)
      ON CONFLICT ("id") DO NOTHING
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('MenuItem');
    await queryRunner.query(`ALTER TABLE "User" DROP COLUMN "role"`);
    await queryRunner.query(`DROP TYPE "public"."User_role_enum"`);
  }
}
