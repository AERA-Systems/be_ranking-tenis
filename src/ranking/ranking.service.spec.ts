import test from 'node:test';
import assert from 'node:assert/strict';
import { RankingService } from './ranking.service';

test('monthly conta attacks e defenses por papel no challenge, sem depender de winnerId', async () => {
  let executedSql = '';
  const dataSource = {
    query: async (sql: string) => {
      executedSql = sql;
      return [];
    },
  };

  const service = new RankingService(dataSource as never);
  await service.monthly('2026-03');

  const attacksSegment = executedSql.match(/AS "totalChallenges",([\s\S]*?)AS attacks/)?.[1] ?? '';
  const defensesSegment = executedSql.match(/AS attacks,([\s\S]*?)AS defenses/)?.[1] ?? '';

  assert.match(attacksSegment, /FROM "Challenge" c\s+WHERE c\."challengerId" = p\.id/);
  assert.doesNotMatch(attacksSegment, /winnerId/);
  assert.match(defensesSegment, /FROM "Challenge" c\s+WHERE c\."challengedId" = p\.id/);
  assert.doesNotMatch(defensesSegment, /winnerId/);
});
