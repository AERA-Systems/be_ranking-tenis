import test from 'node:test';
import assert from 'node:assert/strict';
import { BadRequestException } from '@nestjs/common';
import { ChallengeFlowStatus } from '../database/enums';
import { Player } from '../database/entities/player.entity';
import { buildChallengedFlowUpdate, buildChallengerFlowUpdate, ensurePlayerCanCreateAttack } from './challenge-flow';

function makePlayer(overrides: Partial<Player> = {}): Player {
  return {
    id: 'player-id',
    name: 'Player',
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

test('ataque 1x mantém AVAILABLE_TO_ATTACK', () => {
  const challenger = makePlayer({ consecutiveAttackCount: 0 });

  const update = buildChallengerFlowUpdate(challenger);

  assert.equal(update.consecutiveAttackCount, 1);
  assert.equal(update.challengeFlowStatus, ChallengeFlowStatus.AVAILABLE_TO_ATTACK);
});

test('ataque 2x vira WAITING_DEFENSE', () => {
  const challenger = makePlayer({ consecutiveAttackCount: 1 });

  const update = buildChallengerFlowUpdate(challenger);

  assert.equal(update.consecutiveAttackCount, 2);
  assert.equal(update.challengeFlowStatus, ChallengeFlowStatus.WAITING_DEFENSE);
});

test('tentativa de 3o ataque em WAITING_DEFENSE gera erro', () => {
  const challenger = makePlayer({ challengeFlowStatus: ChallengeFlowStatus.WAITING_DEFENSE });

  assert.throws(() => ensurePlayerCanCreateAttack(challenger), BadRequestException);
});

test('ao ser desafiado reseta contador e volta para AVAILABLE_TO_ATTACK', () => {
  const update = buildChallengedFlowUpdate();

  assert.equal(update.consecutiveAttackCount, 0);
  assert.equal(update.challengeFlowStatus, ChallengeFlowStatus.AVAILABLE_TO_ATTACK);
});
