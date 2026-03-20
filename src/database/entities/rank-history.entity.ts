import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Match } from './match.entity';
import { Player } from './player.entity';

@Entity({ name: 'RankHistory' })
export class RankHistory {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'matchId', type: 'uuid' })
  matchId!: string;

  @Column({ name: 'playerId', type: 'uuid' })
  playerId!: string;

  @Column({ name: 'rankBefore', type: 'int' })
  rankBefore!: number;

  @Column({ name: 'rankAfter', type: 'int' })
  rankAfter!: number;

  @Column({ name: 'createdAt', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;

  @ManyToOne(() => Match, (match) => match.rankHistory)
  @JoinColumn({ name: 'matchId' })
  match!: Match;

  @ManyToOne(() => Player, (player) => player.rankHistory)
  @JoinColumn({ name: 'playerId' })
  player!: Player;
}
