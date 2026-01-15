
import { TaskTopic } from './types';

export const IELTS_TOPICS: TaskTopic[] = [
  {
    id: '1',
    category: 'Technology',
    question: 'Some people think that the development of technology is making us more social. Others believe it is making us less social. Discuss both views and give your opinion.'
  },
  {
    id: '2',
    category: 'Environment',
    question: 'Environmental problems are too big for individual countries and individual people to address. In other words, only large companies and governments can make a difference. To what extent do you agree or disagree?'
  },
  {
    id: '3',
    category: 'Work',
    question: 'Many people believe that working from home has more benefits than disadvantages for both employees and employers. To what extent do you agree or disagree?'
  },
  {
    id: '4',
    category: 'Education',
    question: 'In some countries, young people are encouraged to work or travel for a year between finishing high school and starting university. Discuss the advantages and disadvantages for young people who decide to do this.'
  }
];

export const SYSTEM_INSTRUCTION_GENERATOR = `
You are an IELTS Writing Expert. Given an IELTS Task 2 topic, your goal is to generate:
1. A high-scoring (Band 8.0-9.0) body paragraph of about 60-80 words.
2. A "Slash Version" of that same paragraph where all function words (articles, prepositions, auxiliary verbs, linkers like 'is', 'are', 'to', 'for') are removed, leaving only the key content words separated by forward slashes (/).

Format the output as a JSON object:
{
  "fullParagraph": "The complete original text.",
  "slashVersion": "Key / content / words / separated / by / slashes."
}
`;

export const SYSTEM_INSTRUCTION_EVALUATOR = `
You are an IELTS Writing Examiner. You will be given an "Original High-Quality Paragraph" and a "User Reconstructed Version".
The User version was created based on a keyword list.
Your task is to:
1. Compare the User version with the Original.
2. Calculate an accuracy percentage (0-100%) based on how correctly the user filled in the grammar words and reconstructed the sentences while maintaining the meaning of the original.
3. Provide a score for Grammar (1-10) and Vocabulary (1-10).
4. Provide constructive feedback on what they missed or got wrong.
5. Provide a 'corrections' string showing the user's text with improvements.

Format the output as a JSON object:
{
  "accuracy": 85,
  "grammarScore": 8,
  "vocabularyScore": 9,
  "feedback": "Detailed feedback string.",
  "corrections": "Improved version of user's text."
}
`;
