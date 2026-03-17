import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateRankingDomainTables1760000001000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$
      BEGIN
        CREATE TYPE "ChallengeStatus" AS ENUM ('PENDING', 'ACCEPTED', 'COMPLETED', 'CANCELED');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END
      $$;
    `);

    await queryRunner.query(`
      DO $$
      BEGIN
        CREATE TYPE "MatchType" AS ENUM ('CHALLENGE', 'LEAGUE', 'FRIENDLY');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END
      $$;
    `);

    if (!(await queryRunner.hasTable('Player'))) {
      await queryRunner.createTable(
        new Table({
          name: 'Player',
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
            },
            {
              name: 'phone',
              type: 'text',
              isNullable: true,
            },
            {
              name: 'birthDate',
              type: 'timestamp',
              isNullable: true,
            },
            {
              name: 'active',
              type: 'boolean',
              default: true,
            },
            {
              name: 'participates',
              type: 'boolean',
              default: true,
            },
            {
              name: 'currentRank',
              type: 'int',
              isNullable: true,
              isUnique: true,
            },
            {
              name: 'createdAt',
              type: 'timestamp',
              default: 'now()',
            },
          ],
        }),
      );
    }

    if (!(await queryRunner.hasTable('Challenge'))) {
      await queryRunner.createTable(
        new Table({
          name: 'Challenge',
          columns: [
            {
              name: 'id',
              type: 'uuid',
              isPrimary: true,
              isGenerated: true,
              generationStrategy: 'uuid',
            },
            {
              name: 'challengerId',
              type: 'uuid',
            },
            {
              name: 'challengedId',
              type: 'uuid',
            },
            {
              name: 'status',
              type: '"ChallengeStatus"',
              default: `'PENDING'`,
            },
            {
              name: 'expiresAt',
              type: 'timestamp',
            },
            {
              name: 'createdAt',
              type: 'timestamp',
              default: 'now()',
            },
          ],
        }),
      );

      await queryRunner.createForeignKeys('Challenge', [
        new TableForeignKey({
          columnNames: ['challengerId'],
          referencedTableName: 'Player',
          referencedColumnNames: ['id'],
        }),
        new TableForeignKey({
          columnNames: ['challengedId'],
          referencedTableName: 'Player',
          referencedColumnNames: ['id'],
        }),
      ]);
    }

    if (!(await queryRunner.hasTable('Match'))) {
      await queryRunner.createTable(
        new Table({
          name: 'Match',
          columns: [
            {
              name: 'id',
              type: 'uuid',
              isPrimary: true,
              isGenerated: true,
              generationStrategy: 'uuid',
            },
            {
              name: 'type',
              type: '"MatchType"',
            },
            {
              name: 'challengeId',
              type: 'uuid',
              isNullable: true,
              isUnique: true,
            },
            {
              name: 'player1Id',
              type: 'uuid',
            },
            {
              name: 'player2Id',
              type: 'uuid',
            },
            {
              name: 'winnerId',
              type: 'uuid',
            },
            {
              name: 'sets1',
              type: 'int',
            },
            {
              name: 'sets2',
              type: 'int',
            },
            {
              name: 'wo',
              type: 'boolean',
              default: false,
            },
            {
              name: 'playedAt',
              type: 'timestamp',
              default: 'CURRENT_TIMESTAMP',
            },
            {
              name: 'createdAt',
              type: 'timestamp',
              default: 'now()',
            },
          ],
        }),
      );

      await queryRunner.createForeignKeys('Match', [
        new TableForeignKey({
          columnNames: ['challengeId'],
          referencedTableName: 'Challenge',
          referencedColumnNames: ['id'],
        }),
        new TableForeignKey({
          columnNames: ['player1Id'],
          referencedTableName: 'Player',
          referencedColumnNames: ['id'],
        }),
        new TableForeignKey({
          columnNames: ['player2Id'],
          referencedTableName: 'Player',
          referencedColumnNames: ['id'],
        }),
        new TableForeignKey({
          columnNames: ['winnerId'],
          referencedTableName: 'Player',
          referencedColumnNames: ['id'],
        }),
      ]);
    }

    if (!(await queryRunner.hasTable('RankHistory'))) {
      await queryRunner.createTable(
        new Table({
          name: 'RankHistory',
          columns: [
            {
              name: 'id',
              type: 'uuid',
              isPrimary: true,
              isGenerated: true,
              generationStrategy: 'uuid',
            },
            {
              name: 'matchId',
              type: 'uuid',
            },
            {
              name: 'playerId',
              type: 'uuid',
            },
            {
              name: 'rankBefore',
              type: 'int',
            },
            {
              name: 'rankAfter',
              type: 'int',
            },
            {
              name: 'createdAt',
              type: 'timestamp',
              default: 'now()',
            },
          ],
        }),
      );

      await queryRunner.createForeignKeys('RankHistory', [
        new TableForeignKey({
          columnNames: ['matchId'],
          referencedTableName: 'Match',
          referencedColumnNames: ['id'],
        }),
        new TableForeignKey({
          columnNames: ['playerId'],
          referencedTableName: 'Player',
          referencedColumnNames: ['id'],
        }),
      ]);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    if (await queryRunner.hasTable('RankHistory')) {
      await queryRunner.dropTable('RankHistory', true);
    }

    if (await queryRunner.hasTable('Match')) {
      await queryRunner.dropTable('Match', true);
    }

    if (await queryRunner.hasTable('Challenge')) {
      await queryRunner.dropTable('Challenge', true);
    }

    if (await queryRunner.hasTable('Player')) {
      await queryRunner.dropTable('Player', true);
    }

    await queryRunner.query('DROP TYPE IF EXISTS "MatchType"');
    await queryRunner.query('DROP TYPE IF EXISTS "ChallengeStatus"');
  }
}
