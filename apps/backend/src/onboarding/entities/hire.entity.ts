import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Hire {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column()
  role!: string;

  @Column()
  startDate!: string;

  @Column({ nullable: true })
  department!: string;

  @Column({ default: 'PENDING' })
  status!: string; // PENDING | COMPLETE | PARTIAL

  @Column({ type: 'text', nullable: true })
  onboardingPlan!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
