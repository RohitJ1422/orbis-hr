import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity()
export class AgentEvent {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ nullable: true })
  employeeId!: string;

  @Column()
  event!: string;

  @Column()
  status!: string; // SUCCESS | FAILURE | ESCALATED

  @Column('text')
  detail!: string;

  @Column()
  timestamp!: string;

  @CreateDateColumn()
  createdAt!: Date;
}
