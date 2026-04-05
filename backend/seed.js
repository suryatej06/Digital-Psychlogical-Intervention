import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Questionnaire from './models/Questionnaire.js';

dotenv.config();

const phq9 = {
  type: 'phq9',
  title: 'PHQ-9: Patient Health Questionnaire',
  questions: [
    {
      text: 'Little interest or pleasure in doing things',
      answers: [
        { text: 'Not at all', score: 0 },
        { text: 'Several days', score: 1 },
        { text: 'More than half the days', score: 2 },
        { text: 'Nearly every day', score: 3 },
      ],
    },
    {
      text: 'Feeling down, depressed, or hopeless',
      answers: [
        { text: 'Not at all', score: 0 },
        { text: 'Several days', score: 1 },
        { text: 'More than half the days', score: 2 },
        { text: 'Nearly every day', score: 3 },
      ],
    },
    {
      text: 'Trouble falling or staying asleep, or sleeping too much',
      answers: [
        { text: 'Not at all', score: 0 },
        { text: 'Several days', score: 1 },
        { text: 'More than half the days', score: 2 },
        { text: 'Nearly every day', score: 3 },
      ],
    },
    {
      text: 'Feeling tired or having little energy',
      answers: [
        { text: 'Not at all', score: 0 },
        { text: 'Several days', score: 1 },
        { text: 'More than half the days', score: 2 },
        { text: 'Nearly every day', score: 3 },
      ],
    },
    {
      text: 'Poor appetite or overeating',
      answers: [
        { text: 'Not at all', score: 0 },
        { text: 'Several days', score: 1 },
        { text: 'More than half the days', score: 2 },
        { text: 'Nearly every day', score: 3 },
      ],
    },
    {
      text: 'Feeling bad about yourself — or that you are a failure or have let yourself or your family down',
      answers: [
        { text: 'Not at all', score: 0 },
        { text: 'Several days', score: 1 },
        { text: 'More than half the days', score: 2 },
        { text: 'Nearly every day', score: 3 },
      ],
    },
    {
      text: 'Trouble concentrating on things, such as reading the newspaper or watching television',
      answers: [
        { text: 'Not at all', score: 0 },
        { text: 'Several days', score: 1 },
        { text: 'More than half the days', score: 2 },
        { text: 'Nearly every day', score: 3 },
      ],
    },
    {
      text: 'Moving or speaking so slowly that other people could have noticed? Or the opposite — being so fidgety or restless that you have been moving around a lot more than usual',
      answers: [
        { text: 'Not at all', score: 0 },
        { text: 'Several days', score: 1 },
        { text: 'More than half the days', score: 2 },
        { text: 'Nearly every day', score: 3 },
      ],
    },
    {
      text: 'Thoughts that you would be better off dead, or of hurting yourself in some way',
      answers: [
        { text: 'Not at all', score: 0 },
        { text: 'Several days', score: 1 },
        { text: 'More than half the days', score: 2 },
        { text: 'Nearly every day', score: 3 },
      ],
    },
  ],
};

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    await Questionnaire.deleteOne({ type: 'phq9' });
    await Questionnaire.create(phq9);
    console.log('✅ PHQ-9 seeded successfully');

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  }
}

seed();