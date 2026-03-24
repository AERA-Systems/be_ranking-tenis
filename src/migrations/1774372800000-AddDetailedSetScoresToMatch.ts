import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddDetailedSetScoresToMatch1774372800000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const columns = [
      'set1Player1Games',
      'set1Player2Games',
      'set2Player1Games',
      'set2Player2Games',
      'set3Player1Games',
      'set3Player2Games',
    ];

    for (const name of columns) {
      const hasColumn = await queryRunner.hasColumn('Match', name);
      if (hasColumn) {
        continue;
      }

      await queryRunner.addColumn(
        'Match',
        new TableColumn({
          name,
          type: 'int',
          isNullable: true,
        }),
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const columns = [
      'set3Player2Games',
      'set3Player1Games',
      'set2Player2Games',
      'set2Player1Games',
      'set1Player2Games',
      'set1Player1Games',
    ];

    for (const name of columns) {
      const hasColumn = await queryRunner.hasColumn('Match', name);
      if (!hasColumn) {
        continue;
      }

      await queryRunner.dropColumn('Match', name);
    }
  }
}
