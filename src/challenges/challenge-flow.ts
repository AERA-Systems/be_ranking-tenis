import { BadRequestException } from '@nestjs/common';
import { ChallengeFlowStatus } from '../database/enums';
import { Player } from '../database/entities/player.entity';

export function ensurePlayerCanCreateAttack(player: Player) {
  if (player.challengeFlowStatus === ChallengeFlowStatus.WAITING_DEFENSE) {
    throw new BadRequestException('Atleta precisa ser desafiada antes de criar um novo challenge.');
  }
}

export function buildChallengerFlowUpdate(player: Player) {
  const consecutiveAttackCount = (player.consecutiveAttackCount ?? 0) + 1;

  return {
    consecutiveAttackCount,
    challengeFlowStatus:
      consecutiveAttackCount >= 2
        ? ChallengeFlowStatus.WAITING_DEFENSE
        : ChallengeFlowStatus.AVAILABLE_TO_ATTACK,
  };
}

export function buildChallengedFlowUpdate() {
  return {
    consecutiveAttackCount: 0,
    challengeFlowStatus: ChallengeFlowStatus.AVAILABLE_TO_ATTACK,
  };
}
