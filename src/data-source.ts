import "reflect-metadata"
import { DataSource } from "typeorm"
import { Question } from './entity/question.entity'
import { MCQOption } from './entity/mcq_options.entity'
import { Topic } from './entity/topic.entity'

export const AppDataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST,
    port: process.env.DB_PORT as unknown as number,
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    entities: [Question, MCQOption, Topic],
    migrations: ['build/migrations/*.js'],
    ssl: true,
})
