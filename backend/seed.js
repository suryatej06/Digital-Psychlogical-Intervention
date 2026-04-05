import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Questionnaire from './models/Questionnaire.js';

dotenv.config();

const phq9 = {
  type: 'phq9',
  title: 'PHQ-9 Depression Screening',
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
      text: 'Thoughts that you would be better off dead or of hurting yourself in some way',
      answers: [
        { text: 'Not at all', score: 0 },
        { text: 'Several days', score: 1 },
        { text: 'More than half the days', score: 2 },
        { text: 'Nearly every day', score: 3 },
      ],
    },
  ],
};

const gad7 = {
  type: 'gad7',
  title: 'GAD-7 Anxiety Screening',
  questions: [
    {
      text: 'Feeling nervous, anxious, or on edge',
      answers: [
        { text: 'Not at all', score: 0 },
        { text: 'Several days', score: 1 },
        { text: 'More than half the days', score: 2 },
        { text: 'Nearly every day', score: 3 },
      ],
    },
    {
      text: 'Not being able to stop or control worrying',
      answers: [
        { text: 'Not at all', score: 0 },
        { text: 'Several days', score: 1 },
        { text: 'More than half the days', score: 2 },
        { text: 'Nearly every day', score: 3 },
      ],
    },
    {
      text: 'Worrying too much about different things',
      answers: [
        { text: 'Not at all', score: 0 },
        { text: 'Several days', score: 1 },
        { text: 'More than half the days', score: 2 },
        { text: 'Nearly every day', score: 3 },
      ],
    },
    {
      text: 'Trouble relaxing',
      answers: [
        { text: 'Not at all', score: 0 },
        { text: 'Several days', score: 1 },
        { text: 'More than half the days', score: 2 },
        { text: 'Nearly every day', score: 3 },
      ],
    },
    {
      text: 'Being so restless that it is hard to sit still',
      answers: [
        { text: 'Not at all', score: 0 },
        { text: 'Several days', score: 1 },
        { text: 'More than half the days', score: 2 },
        { text: 'Nearly every day', score: 3 },
      ],
    },
    {
      text: 'Becoming easily annoyed or irritable',
      answers: [
        { text: 'Not at all', score: 0 },
        { text: 'Several days', score: 1 },
        { text: 'More than half the days', score: 2 },
        { text: 'Nearly every day', score: 3 },
      ],
    },
    {
      text: 'Feeling afraid, as if something awful might happen',
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
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  await Questionnaire.deleteMany({ type: { $in: ['phq9', 'gad7'] } });
  await Questionnaire.insertMany([phq9, gad7]);

  console.log('Seeded PHQ-9 and GAD-7 questionnaires');
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});