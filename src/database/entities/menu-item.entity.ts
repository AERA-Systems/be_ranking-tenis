import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserRole } from '../enums';

@Entity({ name: 'MenuItem' })
export class MenuItemEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'text' })
  label!: string;

  @Column({ type: 'text' })
  icon!: string;

  @Column({ type: 'text', nullable: true })
  route!: string | null;

  @Column({ type: 'int', default: 0 })
  sortOrder!: number;

  @Column({
    type: 'enum',
    enum: UserRole,
  })
  role!: UserRole;

  @Column({ type: 'uuid', nullable: true })
  parentId!: string | null;

  @ManyToOne(() => MenuItemEntity, (item) => item.children, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'parentId' })
  parent!: MenuItemEntity | null;

  @OneToMany(() => MenuItemEntity, (item) => item.parent, { cascade: false })
  children!: MenuItemEntity[];

  @CreateDateColumn({ name: 'createdAt', type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updatedAt', type: 'timestamp' })
  updatedAt!: Date;
}
