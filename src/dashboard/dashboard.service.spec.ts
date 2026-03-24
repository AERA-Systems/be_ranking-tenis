import test from 'node:test';
import assert from 'node:assert/strict';
import { DashboardService } from './dashboard.service';

test('overview usa Challenge para mostAttacks e mostDefenses, sem winnerId', async () => {
  const queries: string[] = [];
  const dataSource = {
    query: async (sql: string) => {
      queries.push(sql);
      return [];
    },
  };

  const service = new DashboardService(dataSource as never);
  await service.overview();

  const attackQuery = queries[2] ?? '';
  const defenseQuery = queries[3] ?? '';

  assert.match(attackQuery, /JOIN "Challenge" c ON c\."challengerId" = p\.id/);
  assert.doesNotMatch(attackQuery, /winnerId/);
  assert.match(defenseQuery, /JOIN "Challenge" c ON c\."challengedId" = p\.id/);
  assert.doesNotMatch(defenseQuery, /winnerId/);
});
