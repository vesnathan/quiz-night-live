import Anthropic from '@anthropic-ai/sdk';
import { saveQuestionBatch, getQuestionCount } from '../src/services/questionService';
import type { Question, QuestionCategory } from '@quiz/shared';
import { QUESTION_CATEGORIES } from '@quiz/shared';

const anthropic = new Anthropic();

const QUESTIONS_PER_BATCH = 20;
const TARGET_QUESTIONS = 200;

async function generateQuestions(
  category: QuestionCategory,
  count: number
): Promise<Omit<Question, 'id'>[]> {
  const prompt = `Generate ${count} pub quiz trivia questions for the category "${category}".

Each question should:
- Be suitable for a general audience pub quiz
- Have exactly 4 multiple choice options
- Have varying difficulty (mix of easy, medium, and hard)
- Be factually accurate
- Not be too obscure or require specialist knowledge

Return the questions as a JSON array with this exact format:
[
  {
    "text": "The question text?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctIndex": 0,
    "category": "${category}",
    "difficulty": "easy" | "medium" | "hard"
  }
]

Only return the JSON array, no other text.`;

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    messages: [{ role: 'user', content: prompt }],
  });

  const content = response.content[0];
  if (content.type !== 'text') {
    throw new Error('Unexpected response type');
  }

  try {
    const questions = JSON.parse(content.text);
    return questions;
  } catch (error) {
    console.error('Failed to parse response:', content.text);
    throw new Error('Failed to parse questions from Claude response');
  }
}

async function main() {
  console.log('Starting question generation...');

  const { total, unused } = await getQuestionCount();
  console.log(`Current questions: ${total} total, ${unused} unused`);

  if (unused >= TARGET_QUESTIONS) {
    console.log('Sufficient questions available, skipping generation');
    return;
  }

  const questionsNeeded = TARGET_QUESTIONS - unused;
  const questionsPerCategory = Math.ceil(questionsNeeded / QUESTION_CATEGORIES.length);

  console.log(`Generating ${questionsNeeded} questions (${questionsPerCategory} per category)...`);

  for (const category of QUESTION_CATEGORIES) {
    console.log(`Generating questions for category: ${category}`);

    try {
      const questions = await generateQuestions(
        category,
        Math.min(questionsPerCategory, QUESTIONS_PER_BATCH)
      );

      await saveQuestionBatch(questions);
      console.log(`Saved ${questions.length} questions for ${category}`);
    } catch (error) {
      console.error(`Failed to generate questions for ${category}:`, error);
    }

    // Rate limiting
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  const finalCount = await getQuestionCount();
  console.log(`Generation complete. Final count: ${finalCount.total} total, ${finalCount.unused} unused`);
}

main().catch(console.error);
