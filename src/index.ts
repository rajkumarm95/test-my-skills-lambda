import { Context } from "aws-lambda";
import { Configuration, OpenAIApi } from "openai";
import "dotenv/config";
import { AppDataSource } from "./data-source";
import { Question } from "./entity/question.entity";
import { MCQOption } from "./entity/mcq_options.entity";
import logger from './logger';

interface Record {
  body: {
    topic: string;
    topicId: string;
  };
}

interface SQSEvent {
  Records: Record[];
}

export async function handler(
  event: SQSEvent,
  context: Context
): Promise<void> {
  for (const record of event.Records) {
    try {
      const { topic, topicId } = JSON.parse(record.body as unknown as string);
      logger.info(`Generating questions for topic: ${topic}`);
      const { OPENAI_API_KEY, OPENAI_ORGANIZATION } = process.env;
      const configuration: Configuration = new Configuration({
        apiKey: OPENAI_API_KEY,
        organization: OPENAI_ORGANIZATION,
      });

      const prompt = `Given the topic '${topic}', please generate a series of questions for an assessment based on this topic. The question set should include, if applicable, 5 multiple choice questions, 5 long answer questions, and 5 coding questions. The expected output should be in the form of a JavaScript array of objects, with each object having the following structure in a stringified JSON format :

      \[
      \begin{{align*}}
      \{
      &\text{{question: "string",}} \\
      &\text{{type: "string",}} \quad \text{{// Can be "mcq", "long", or "code"}} \\
      &\text{{complexity: number,}} \quad \text{{// 1 for easy, 2 for medium, 3 for hard}} \\
      &\text{{options: [}} \\
      &\quad \text{{\{option: "option1", isCorrect: false\},}} \\
      &\quad \text{{\{option: "option2", isCorrect: false\},}} \\
      &\quad \text{{\{option: "option3", isCorrect: false\},}} \\
      &\quad \text{{\{option: "option4", isCorrect: false\}}} \\
      &\text{{]}} \quad \text{{// Options are only applicable for MCQs}} \\
      \}
      \end{{align*}}
      \]

      Please note that the 'options' array is only applicable for multiple choice questions, and each option in this array should be an object that includes the text of the option and a boolean indicating whether this option is the correct answer. this data will be directly passed to the database and if the format is not in a stringified json format the application will fail so keep the output in the above mentioned format.`;

      const openAIApi: OpenAIApi = new OpenAIApi(configuration);
        logger.info(`Creating chat completion for prompt...`);
      const response = await openAIApi.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      });
      const questions = JSON.parse(response.data.choices[0].message.content);
      await AppDataSource.initialize();
      console.log("Inserting new questions into the database...");
      try {
        for (let questionData of questions) {
          const question = new Question();
          question.question = questionData.question;
          question.complexity = questionData.complexity;
          question.type = questionData.type;
          question.topic = topicId;
          if (question.type === "mcq") {
            question.mcqOptions = questionData.options.map((optionData) => {
              const mcqOption = new MCQOption();
              mcqOption.option = optionData.option;
              mcqOption.isCorrect = optionData.isCorrect;
              mcqOption.question = question;
              return mcqOption;
            });
          }
          await AppDataSource.manager.save(question);
        }
        console.log("Saved all questions");
        console.log("Loading questions from the database...");
        const loadedQuestions = await AppDataSource.manager.find(Question, {
          relations: ["mcqOptions"],
        });
        console.log("Loaded questions: ", loadedQuestions);
      } catch (error) {
        console.log(error);
      }
    } catch (error) {
      console.log(error);
    }
  }
}
