import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddChallengeFlowToPlayer1774361906 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$
      BEGIN
        CREATE TYPE "ChallengeFlowStatus" AS ENUM ('AVAILABLE_TO_ATTACK', 'WAITING_DEFENSE');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END
      $$;
    `);

    const hasConsecutiveAttackCount = await queryRunner.hasColumn('Player', 'consecutiveAttackCount');
    if (!hasConsecutiveAttackCount) {
      await queryRunner.addColumn(
        'Player',
        new TableColumn({
          name: 'consecutiveAttackCount',
          type: 'int',
          default: 0,
        }),
      );
    }

    const hasChallengeFlowStatus = await queryRunner.hasColumn('Player', 'challengeFlowStatus');
    if (!hasChallengeFlowStatus) {
      await queryRunner.addColumn(
        'Player',
        new TableColumn({
          name: 'challengeFlowStatus',
          type: '"ChallengeFlowStatus"',
          default: `'AVAILABLE_TO_ATTACK'`,
        }),
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const hasChallengeFlowStatus = await queryRunner.hasColumn('Player', 'challengeFlowStatus');
    if (hasChallengeFlowStatus) {
      await queryRunner.dropColumn('Player', 'challengeFlowStatus');
    }

    const hasConsecutiveAttackCount = await queryRunner.hasColumn('Player', 'consecutiveAttackCount');
    if (hasConsecutiveAttackCount) {
      await queryRunner.dropColumn('Player', 'consecutiveAttackCount');
    }

    await queryRunner.query('DROP TYPE IF EXISTS "ChallengeFlowStatus"');
  }
}
