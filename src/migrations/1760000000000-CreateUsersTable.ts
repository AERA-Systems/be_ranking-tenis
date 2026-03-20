import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateUsersTable1760000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    if (await queryRunner.hasTable('User')) {
      return;
    }

    await queryRunner.createTable(
      new Table({
        name: 'User',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'uuid',
          },
          {
            name: 'name',
            type: 'text',
            isNullable: false,
          },
          {
            name: 'username',
            type: 'text',
            isNullable: false,
            isUnique: true,
          },
          {
            name: 'passwordHash',
            type: 'text',
            isNullable: false,
          },
          {
            name: 'active',
            type: 'boolean',
            isNullable: false,
            default: true,
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
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('User');
  }
}
