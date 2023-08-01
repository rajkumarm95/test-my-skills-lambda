import {
  Column,
  PrimaryGeneratedColumn,
  Entity,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Question } from './question.entity';
import { SuperEntity } from './super.entity';

@Entity('mcq-options')
export class MCQOption extends SuperEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'option', type: 'text' })
  option: string;

  @Column({ name: 'is_correct', type: 'bool' })
  isCorrect: boolean;

  @ManyToOne(() => Question, (question) => question.mcqOptions)
  @JoinColumn({ name: 'question_id' })
  question: Question;
}
