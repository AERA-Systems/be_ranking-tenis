import test from 'node:test';
import assert from 'node:assert/strict';
import { MatchType, ChallengeFlowStatus, ChallengeStatus } from '../database/enums';
import { MatchesService } from './matches.service';
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

test('create mantém ataques da desafiante e reseta a desafiada ao concluir partida de challenge', async () => {
  const challenger = makePlayer('challenger', {
    currentRank: 10,
    consecutiveAttackCount: 2,
    challengeFlowStatus: ChallengeFlowStatus.WAITING_DEFENSE,
  });
  const challenged = makePlayer('challenged', {
    currentRank: 8,
    consecutiveAttackCount: 1,
    challengeFlowStatus: ChallengeFlowStatus.AVAILABLE_TO_ATTACK,
  });

  const playerUpdates: Array<{ id: string; payload: Record<string, unknown> }> = [];
  const challengeUpdates: Array<{ id: string; payload: Record<string, unknown> }> = [];

  const playerRepo = {
    findOne: async ({ where: { id } }: { where: { id: string } }) =>
      id === challenger.id ? challenger : challenged,
    update: async ({ id }: { id: string }, payload: Record<string, unknown>) => {
      playerUpdates.push({ id, payload });
      return { affected: 1 };
    },
    createQueryBuilder: () => ({
      select() {
        return this;
      },
      where() {
        return this;
      },
      getRawMany: async () => [],
      getRawOne: async () => ({ max: '10' }),
      orderBy() {
        return this;
      },
    }),
  };

  const challengeRepo = {
    findOne: async () => ({
      id: 'challenge-1',
      status: ChallengeStatus.PENDING,
      challengerId: challenger.id,
      challengedId: challenged.id,
    }),
    update: async ({ id }: { id: string }, payload: Record<string, unknown>) => {
      challengeUpdates.push({ id, payload });
      return { affected: 1 };
    },
  };

  const matchRepo = {
    create: (payload: Record<string, unknown>) => payload,
    save: async (payload: Record<string, unknown>) => ({ id: 'match-1', ...payload }),
  };

  const rankHistoryRepo = {
    insert: async () => ({ identifiers: [] }),
  };

  const dataSource = {
    transaction: async (cb: (manager: { getRepository: (entity: unknown) => unknown }) => Promise<unknown>) =>
      cb({
        getRepository: (entity: unknown) => {
          switch ((entity as { name?: string }).name) {
            case 'Player':
              return playerRepo;
            case 'Challenge':
              return challengeRepo;
            case 'Match':
              return matchRepo;
            default:
              return rankHistoryRepo;
          }
        },
      }),
  };

  const service = new MatchesService(
    dataSource as never,
    {
      createQueryBuilder() {
        throw new Error('unused');
      },
    } as never,
  );

  await service.create({
    type: MatchType.CHALLENGE,
    challengeId: 'challenge-1',
    player1Id: challenger.id,
    player2Id: challenged.id,
    winnerId: challenged.id,
    sets1: 0,
    sets2: 2,
  });

  assert.deepEqual(challengeUpdates, [
    {
      id: 'challenge-1',
      payload: { status: ChallengeStatus.COMPLETED },
    },
  ]);

  assert.deepEqual(playerUpdates, [
    {
      id: challenged.id,
      payload: {
        consecutiveAttackCount: 0,
        challengeFlowStatus: ChallengeFlowStatus.AVAILABLE_TO_ATTACK,
      },
    },
  ]);
});
