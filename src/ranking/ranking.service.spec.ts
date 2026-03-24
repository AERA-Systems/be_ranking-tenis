import test from 'node:test';
import assert from 'node:assert/strict';
import { RankingService } from './ranking.service';

test('monthly expõe attacks operacionais, defenses históricas e status do fluxo', async () => {
  let executedSql = '';
  const dataSource = {
    query: async (sql: string) => {
      executedSql = sql;
      return [];
    },
  };

  const service = new RankingService(dataSource as never);
  await service.monthly('2026-03');

  assert.match(executedSql, /COALESCE\(p\."consecutiveAttackCount", 0\)::int AS attacks/);
  assert.match(executedSql, /SELECT COUNT\(\*\) FROM "Challenge" c\s+WHERE c\."challengedId" = p\.id[\s\S]*?AS defenses/);
  assert.match(executedSql, /p\."challengeFlowStatus" AS "challengeFlowStatus"/);
});
