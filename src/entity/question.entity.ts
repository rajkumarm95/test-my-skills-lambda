import {
  Column,
  JoinColumn,
  ManyToOne,
  Entity,
  PrimaryGeneratedColumn,
  OneToMany,
} from 'typeorm';
import { MCQOption } from './mcq_options.entity';
import { SuperEntity } from './super.entity';
import { Topic } from './topic.entity';

@Entity('questions')
export class Question extends SuperEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'name', type: 'text' })
  question: string;

  @Column({ name: 'complexity', type: 'int' })
  complexity: number;

  @Column({ name: 'type', type: 'varchar', length: 255 })
  type: string;

  @ManyToOne(() => Topic, (topic) => topic.questions)
  @JoinColumn({ name: 'topic_id' })
  topic: Topic;


  @OneToMany(() => MCQOption, (mcqOptions) => mcqOptions.question , { cascade: true })
  mcqOptions: MCQOption[];
}
