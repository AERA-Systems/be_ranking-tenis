import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { MatchType } from '../enums';
import { Challenge } from './challenge.entity';
import { Player } from './player.entity';
import { RankHistory } from './rank-history.entity';

@Entity({ name: 'Match' })
export class Match {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'enum', enum: MatchType, enumName: 'MatchType' })
  type!: MatchType;

  @Column({ name: 'challengeId', type: 'uuid', nullable: true, unique: true })
  challengeId!: string | null;

  @Column({ name: 'player1Id', type: 'uuid' })
  player1Id!: string;

  @Column({ name: 'player2Id', type: 'uuid' })
  player2Id!: string;

  @Column({ name: 'winnerId', type: 'uuid' })
  winnerId!: string;

  @Column({ type: 'int' })
  sets1!: number;

  @Column({ type: 'int' })
  sets2!: number;

  @Column({ name: 'set1Player1Games', type: 'int', nullable: true })
  set1Player1Games!: number | null;

  @Column({ name: 'set1Player2Games', type: 'int', nullable: true })
  set1Player2Games!: number | null;

  @Column({ name: 'set2Player1Games', type: 'int', nullable: true })
  set2Player1Games!: number | null;

  @Column({ name: 'set2Player2Games', type: 'int', nullable: true })
  set2Player2Games!: number | null;

  @Column({ name: 'set3Player1Games', type: 'int', nullable: true })
  set3Player1Games!: number | null;

  @Column({ name: 'set3Player2Games', type: 'int', nullable: true })
  set3Player2Games!: number | null;

  @Column({ type: 'boolean', default: false })
  wo!: boolean;

  @Column({ name: 'playedAt', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  playedAt!: Date;

  @CreateDateColumn({ name: 'createdAt', type: 'timestamp' })
  createdAt!: Date;

  @OneToOne(() => Challenge, (challenge) => challenge.match)
  @JoinColumn({ name: 'challengeId' })
  challenge!: Challenge | null;

  @ManyToOne(() => Player, (player) => player.matchesP1)
  @JoinColumn({ name: 'player1Id' })
  player1!: Player;

  @ManyToOne(() => Player, (player) => player.matchesP2)
  @JoinColumn({ name: 'player2Id' })
  player2!: Player;

  @ManyToOne(() => Player, (player) => player.wins)
  @JoinColumn({ name: 'winnerId' })
  winner!: Player;

  @OneToMany(() => RankHistory, (rankHistory) => rankHistory.match)
  rankHistory!: RankHistory[];
}
