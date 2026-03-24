export enum ChallengeStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  COMPLETED = 'COMPLETED',
  CANCELED = 'CANCELED',
}

export enum ChallengeFlowStatus {
  AVAILABLE_TO_ATTACK = 'AVAILABLE_TO_ATTACK',
  WAITING_DEFENSE = 'WAITING_DEFENSE',
}

export enum MatchType {
  CHALLENGE = 'CHALLENGE',
  LEAGUE = 'LEAGUE',
  FRIENDLY = 'FRIENDLY',
}

export enum UserRole {
  ADMIN = 'ADMIN',
  MASTER = 'MASTER',
}
