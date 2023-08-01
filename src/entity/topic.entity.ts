import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from "typeorm";
import { SuperEntity } from './super.entity';
import { Question } from './question.entity';

@Entity("topics")
export class Topic extends SuperEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ name: "name", type: "varchar", length: 255 })
  name: string;

  @Column({ name: "description", type: "text", nullable: true })
  description: string;

  @Column({ name: "importance", type: "int" })
  importance: number;

  @JoinColumn({ name: "sector_id" })
  sector: string;

  @OneToMany(() => Question, (question) => question.topic)
  questions: Question[];

}
