import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddStatusColumn1774320826517 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const hasStatusColumn = await queryRunner.hasColumn('Player', 'status');
    if (hasStatusColumn) {
      return;
    }

    await queryRunner.addColumn(
      'Player',
      new TableColumn({
        name: 'status',
        type: 'varchar',
        length: '20',
        default: "'normal'",
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const hasStatusColumn = await queryRunner.hasColumn('Player', 'status');
    if (!hasStatusColumn) {
      return;
    }

    await queryRunner.dropColumn('Player', 'status');
  }
}
