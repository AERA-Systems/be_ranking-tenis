import test from 'node:test';
import assert from 'node:assert/strict';
import { BadRequestException } from '@nestjs/common';
import { ChallengeFlowStatus, ChallengeStatus } from '../database/enums';
import { ChallengesService } from './challenges.service';
import { Player } from '../database/entities/player.entity';

function makePlayer(id: string, overrides: Partial<Player> = {}): Player {
  return {
    id,
    name: id,
    phone: null,
    birthDate: null,
    active: true,
    participates: true,
    currentRank: 10,
    createdAt: new Date(),
    status: 'normal',
    consecutiveAttackCount: 0,
    challengeFlowStatus: ChallengeFlowStatus.AVAILABLE_TO_ATTACK,
    challengerChallenges: [],
    challengedChallenges: [],
    matchesP1: [],
    matchesP2: [],
    wins: [],
    rankHistory: [],
    ...overrides,
  };
}

test('create bloqueia 3o ataque quando challenger está em WAITING_DEFENSE', async () => {
  const challenger = makePlayer('challenger', {
    currentRank: 10,
    consecutiveAttackCount: 2,
    challengeFlowStatus: ChallengeFlowStatus.WAITING_DEFENSE,
  });
  const challenged = makePlayer('challenged', { currentRank: 8 });

  const playerRepo = {
    findOne: async ({ where: { id } }: { where: { id: string } }) => (id === challenger.id ? challenger : challenged),
    update: async () => ({ affected: 1 }),
  };
  const challengeRepo = {
    findOne: async () => null,
    create: (payload: Record<string, unknown>) => payload,
    save: async (payload: Record<string, unknown>) => ({ id: 'challenge-1', ...payload }),
  };
  const dataSource = {
    transaction: async (cb: (manager: { getRepository: (entity: unknown) => unknown }) => Promise<unknown>) =>
      cb({
        getRepository: (entity: unknown) => {
          if ((entity as { name?: string }).name === 'Player') return playerRepo;
          return challengeRepo;
        },
      }),
  };
  const findRepo = {
    findOne: async () => ({ id: 'challenge-1', status: ChallengeStatus.PENDING, challenger, challenged }),
  };

  const service = new ChallengesService(
    dataSource as never,
    findRepo as never,
    playerRepo as never,
  );

  await assert.rejects(
    service.create({ challengerId: challenger.id, challengedId: challenged.id }),
    BadRequestException,
  );
});

test('create incrementa o challenger e reseta a challenged', async () => {
  const challenger = makePlayer('challenger', {
    currentRank: 10,
    consecutiveAttackCount: 1,
    challengeFlowStatus: ChallengeFlowStatus.AVAILABLE_TO_ATTACK,
  });
  const challenged = makePlayer('challenged', {
    currentRank: 8,
    consecutiveAttackCount: 2,
    challengeFlowStatus: ChallengeFlowStatus.WAITING_DEFENSE,
  });
  const updates: Array<{ id: string; payload: Record<string, unknown> }> = [];

  const playerRepo = {
    findOne: async ({ where: { id } }: { where: { id: string } }) => (id === challenger.id ? challenger : challenged),
    update: async ({ id }: { id: string }, payload: Record<string, unknown>) => {
      updates.push({ id, payload });
      return { affected: 1 };
    },
  };
  const challengeRepo = {
    findOne: async () => null,
    create: (payload: Record<string, unknown>) => payload,
    save: async (payload: Record<string, unknown>) => ({ id: 'challenge-1', ...payload }),
  };
  const dataSource = {
    transaction: async (cb: (manager: { getRepository: (entity: unknown) => unknown }) => Promise<unknown>) =>
      cb({
        getRepository: (entity: unknown) => {
          if ((entity as { name?: string }).name === 'Player') return playerRepo;
          return challengeRepo;
        },
      }),
  };
  const findRepo = {
    findOne: async () => ({ id: 'challenge-1', status: ChallengeStatus.PENDING, challenger, challenged }),
  };

  const service = new ChallengesService(
    dataSource as never,
    findRepo as never,
    playerRepo as never,
  );

  const result = await service.create({ challengerId: challenger.id, challengedId: challenged.id });

  assert.equal((result as { id: string }).id, 'challenge-1');
  assert.deepEqual(updates, [
    {
      id: challenger.id,
      payload: {
        consecutiveAttackCount: 2,
        challengeFlowStatus: ChallengeFlowStatus.WAITING_DEFENSE,
      },
    },
    {
      id: challenged.id,
      payload: {
        consecutiveAttackCount: 0,
        challengeFlowStatus: ChallengeFlowStatus.AVAILABLE_TO_ATTACK,
      },
    },
  ]);
});
