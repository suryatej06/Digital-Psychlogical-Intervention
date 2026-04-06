// backend/seed.js  — full replacement
// Run: node seed.js  (from the backend directory)
// Handles: default college, admin user, PHQ-9/GAD-7 questionnaires, 35 resources

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import Questionnaire from './models/Questionnaire.js';

dotenv.config();

// ─── Inline schemas ───────────────────────────────────────────────────────────
const College = mongoose.models.College || mongoose.model('College', new mongoose.Schema({
  name: String, code: String, isActive: { type: Boolean, default: true },
}));

const User = mongoose.models.User || mongoose.model('User', new mongoose.Schema({
  name: String, email: String, password: String,
  role: { type: String, default: 'student' },
  collegeId: mongoose.Schema.Types.ObjectId,
  isActive: { type: Boolean, default: true },
}));

const Resource = mongoose.models.Resource || mongoose.model('Resource', new mongoose.Schema({
  title: String, description: String,
  type: { type: String, enum: ['article', 'video', 'audio', 'exercise'] },
  category: String, tags: [String], url: String,
  thumbnail: { type: String, default: '' },
  collegeId: mongoose.Schema.Types.ObjectId,
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
}));

// ─── PHQ-9 ────────────────────────────────────────────────────────────────────
const phq9 = {
  type: 'phq9',
  title: 'PHQ-9 Depression Screening',
  questions: [
    { text: 'Little interest or pleasure in doing things', answers: [{ text: 'Not at all', score: 0 }, { text: 'Several days', score: 1 }, { text: 'More than half the days', score: 2 }, { text: 'Nearly every day', score: 3 }] },
    { text: 'Feeling down, depressed, or hopeless', answers: [{ text: 'Not at all', score: 0 }, { text: 'Several days', score: 1 }, { text: 'More than half the days', score: 2 }, { text: 'Nearly every day', score: 3 }] },
    { text: 'Trouble falling or staying asleep, or sleeping too much', answers: [{ text: 'Not at all', score: 0 }, { text: 'Several days', score: 1 }, { text: 'More than half the days', score: 2 }, { text: 'Nearly every day', score: 3 }] },
    { text: 'Feeling tired or having little energy', answers: [{ text: 'Not at all', score: 0 }, { text: 'Several days', score: 1 }, { text: 'More than half the days', score: 2 }, { text: 'Nearly every day', score: 3 }] },
    { text: 'Poor appetite or overeating', answers: [{ text: 'Not at all', score: 0 }, { text: 'Several days', score: 1 }, { text: 'More than half the days', score: 2 }, { text: 'Nearly every day', score: 3 }] },
    { text: 'Feeling bad about yourself — or that you are a failure or have let yourself or your family down', answers: [{ text: 'Not at all', score: 0 }, { text: 'Several days', score: 1 }, { text: 'More than half the days', score: 2 }, { text: 'Nearly every day', score: 3 }] },
    { text: 'Trouble concentrating on things, such as reading the newspaper or watching television', answers: [{ text: 'Not at all', score: 0 }, { text: 'Several days', score: 1 }, { text: 'More than half the days', score: 2 }, { text: 'Nearly every day', score: 3 }] },
    { text: 'Moving or speaking so slowly that other people could have noticed? Or the opposite — being so fidgety or restless that you have been moving around a lot more than usual', answers: [{ text: 'Not at all', score: 0 }, { text: 'Several days', score: 1 }, { text: 'More than half the days', score: 2 }, { text: 'Nearly every day', score: 3 }] },
    { text: 'Thoughts that you would be better off dead or of hurting yourself in some way', answers: [{ text: 'Not at all', score: 0 }, { text: 'Several days', score: 1 }, { text: 'More than half the days', score: 2 }, { text: 'Nearly every day', score: 3 }] },
  ],
};

// ─── GAD-7 ────────────────────────────────────────────────────────────────────
const gad7 = {
  type: 'gad7',
  title: 'GAD-7 Anxiety Screening',
  questions: [
    { text: 'Feeling nervous, anxious, or on edge', answers: [{ text: 'Not at all', score: 0 }, { text: 'Several days', score: 1 }, { text: 'More than half the days', score: 2 }, { text: 'Nearly every day', score: 3 }] },
    { text: 'Not being able to stop or control worrying', answers: [{ text: 'Not at all', score: 0 }, { text: 'Several days', score: 1 }, { text: 'More than half the days', score: 2 }, { text: 'Nearly every day', score: 3 }] },
    { text: 'Worrying too much about different things', answers: [{ text: 'Not at all', score: 0 }, { text: 'Several days', score: 1 }, { text: 'More than half the days', score: 2 }, { text: 'Nearly every day', score: 3 }] },
    { text: 'Trouble relaxing', answers: [{ text: 'Not at all', score: 0 }, { text: 'Several days', score: 1 }, { text: 'More than half the days', score: 2 }, { text: 'Nearly every day', score: 3 }] },
    { text: 'Being so restless that it is hard to sit still', answers: [{ text: 'Not at all', score: 0 }, { text: 'Several days', score: 1 }, { text: 'More than half the days', score: 2 }, { text: 'Nearly every day', score: 3 }] },
    { text: 'Becoming easily annoyed or irritable', answers: [{ text: 'Not at all', score: 0 }, { text: 'Several days', score: 1 }, { text: 'More than half the days', score: 2 }, { text: 'Nearly every day', score: 3 }] },
    { text: 'Feeling afraid, as if something awful might happen', answers: [{ text: 'Not at all', score: 0 }, { text: 'Several days', score: 1 }, { text: 'More than half the days', score: 2 }, { text: 'Nearly every day', score: 3 }] },
  ],
};

// ─── Resources ────────────────────────────────────────────────────────────────
const RESOURCES = [
  // ANXIETY
  { title: 'Understanding anxiety — what it is and why it happens', description: 'A clear, jargon-free explanation of how anxiety works in the brain and body, from Mind UK.', type: 'article', category: 'Anxiety', tags: ['anxiety', 'general'], url: 'https://www.mind.org.uk/information-support/types-of-mental-health-problems/anxiety-and-panic-attacks/about-anxiety/' },
  { title: 'How to stop a panic attack — NHS guide', description: 'Step-by-step advice from the NHS on what to do when a panic attack starts.', type: 'article', category: 'Anxiety', tags: ['anxiety', 'panic'], url: 'https://www.nhs.uk/mental-health/feelings-symptoms-behaviours/feelings-and-symptoms/panic-attacks/' },
  { title: 'Anxiety and worry — a TED-Ed explainer', description: 'Animated short explaining the neuroscience of worry and strategies to interrupt anxious thought loops.', type: 'video', category: 'Anxiety', tags: ['anxiety', 'stress'], url: 'https://www.youtube.com/watch?v=ZidGozDhOjg' },
  { title: 'GAD — generalised anxiety disorder explained', description: 'Detailed breakdown of GAD symptoms, causes and treatments from the NHS.', type: 'article', category: 'Anxiety', tags: ['anxiety'], url: 'https://www.nhs.uk/mental-health/conditions/generalised-anxiety-disorder/overview/' },
  { title: 'Headspace — managing anxiety (free intro)', description: 'Guided meditation specifically for anxiety. Works without a paid subscription for the first session.', type: 'audio', category: 'Anxiety', tags: ['anxiety', 'mindfulness'], url: 'https://www.headspace.com/anxiety' },
  { title: 'Box breathing — calm your nervous system in 4 minutes', description: 'A YouTube-guided box breathing session used by athletes and therapists to quickly lower anxiety.', type: 'video', category: 'Anxiety', tags: ['anxiety', 'panic', 'stress'], url: 'https://www.youtube.com/watch?v=tEmt1Znux58' },
  { title: '5-4-3-2-1 grounding technique — stop a panic attack', description: 'A sensory grounding exercise that interrupts the panic cycle using your five senses.', type: 'article', category: 'Anxiety', tags: ['panic', 'anxiety'], url: 'https://www.healthline.com/health/grounding-techniques' },
  { title: 'Diaphragmatic breathing — full tutorial', description: 'How to breathe from your diaphragm — the single most effective fast anxiety reducer.', type: 'video', category: 'Anxiety', tags: ['panic', 'anxiety', 'stress'], url: 'https://www.youtube.com/watch?v=kgTL5G1ibIo' },

  // DEPRESSION
  { title: 'Depression — symptoms, causes and treatment', description: 'Comprehensive overview of depression from Mind UK, written in plain language for students.', type: 'article', category: 'Depression', tags: ['depression', 'general'], url: 'https://www.mind.org.uk/information-support/types-of-mental-health-problems/depression/about-depression/' },
  { title: 'Understanding depression — TED-Ed', description: 'Award-winning animated explainer covering the biology of depression and how treatments work.', type: 'video', category: 'Depression', tags: ['depression'], url: 'https://www.youtube.com/watch?v=GOK1tKFFIQI' },
  { title: 'Behavioural activation — getting moving when motivation is low', description: 'A CBT-based self-help guide on using small actions to break depressive cycles.', type: 'article', category: 'Depression', tags: ['depression', 'self-care'], url: 'https://www.getselfhelp.co.uk/behaviouralactivation.htm' },
  { title: "NHS — low mood vs depression: what's the difference?", description: 'Helps students recognise when low mood crosses into clinical depression and when to seek help.', type: 'article', category: 'Depression', tags: ['depression', 'mood'], url: 'https://www.nhs.uk/mental-health/feelings-symptoms-behaviours/feelings-and-symptoms/low-mood-sadness-depression/' },
  { title: 'Mood gym — free CBT self-help program', description: 'An interactive program that teaches CBT skills for managing depression and anxiety.', type: 'exercise', category: 'Depression', tags: ['depression', 'anxiety', 'mood'], url: 'https://moodgym.com.au/' },

  // SLEEP
  { title: 'Sleep hygiene — 15 habits that actually work', description: 'Evidence-based sleep hygiene guide from the Sleep Foundation, written for college students.', type: 'article', category: 'Sleep', tags: ['sleep', 'self-care'], url: 'https://www.sleepfoundation.org/sleep-hygiene' },
  { title: 'NHS — how to fall asleep faster', description: 'Practical NHS advice on sleep restriction therapy, stimulus control and cognitive techniques.', type: 'article', category: 'Sleep', tags: ['sleep'], url: 'https://www.nhs.uk/every-mind-matters/mental-wellbeing-tips/how-to-fall-asleep-faster-and-sleep-better/' },
  { title: '10-minute body scan for better sleep', description: 'A guided body scan meditation designed to be done lying in bed before sleep.', type: 'video', category: 'Sleep', tags: ['sleep', 'mindfulness'], url: 'https://www.youtube.com/watch?v=ihwcMDMEVyQ' },
  { title: "Calm — sleep stories (free content)", description: "A selection of Calm's sleep stories — narrated audio designed to ease you into sleep.", type: 'audio', category: 'Sleep', tags: ['sleep', 'mindfulness'], url: 'https://www.calm.com/sleep' },

  // STRESS
  { title: 'Exam stress — how to manage it effectively', description: "Student-specific stress management guide from the UK's Student Minds charity.", type: 'article', category: 'Stress', tags: ['stress', 'general'], url: 'https://www.studentminds.org.uk/examstress.html' },
  { title: 'Kelly McGonigal — how to make stress your friend (TED)', description: 'One of the most-watched TED talks on reframing stress so it works for you, not against you.', type: 'video', category: 'Stress', tags: ['stress'], url: 'https://www.ted.com/talks/kelly_mcgonigal_how_to_make_stress_your_friend' },
  { title: 'Progressive muscle relaxation — guided audio', description: 'A 15-minute guided PMR session to physically release stress held in the body.', type: 'audio', category: 'Stress', tags: ['stress', 'anxiety'], url: 'https://www.youtube.com/watch?v=ClqPtWzozXs' },
  { title: 'Time management for students — reduce overwhelm', description: 'A practical guide to prioritisation and scheduling that directly reduces academic stress.', type: 'article', category: 'Stress', tags: ['stress', 'self-care'], url: 'https://www.mindtools.com/pages/article/newHTE_00.htm' },

  // MINDFULNESS
  { title: "What is mindfulness? — a beginner's guide", description: "Clear introduction to mindfulness — what it is, what it isn't, and how to start.", type: 'article', category: 'Mindfulness', tags: ['mindfulness', 'general'], url: 'https://www.mindful.org/what-is-mindfulness/' },
  { title: '5-minute mindfulness meditation for beginners', description: 'A gentle, guided session that requires no prior experience. Good for first thing in the morning.', type: 'video', category: 'Mindfulness', tags: ['mindfulness'], url: 'https://www.youtube.com/watch?v=inpok4MKVLM' },
  { title: 'Smiling Mind — free mindfulness app (web version)', description: 'A completely free, non-profit mindfulness platform with programs for students.', type: 'exercise', category: 'Mindfulness', tags: ['mindfulness', 'stress', 'anxiety'], url: 'https://www.smilingmind.com.au/' },

  // SELF-CARE
  { title: 'Five ways to wellbeing — NHS evidence-based framework', description: 'The NHS-backed framework (Connect, Be Active, Take Notice, Keep Learning, Give) with practical ideas for each.', type: 'article', category: 'Self-care', tags: ['self-care', 'general', 'mood'], url: 'https://www.nhs.uk/mental-health/self-help/guides-tools-and-activities/five-steps-to-mental-wellbeing/' },
  { title: 'Exercise and mental health — what the science says', description: 'How physical activity affects depression and anxiety — with specific dose recommendations.', type: 'article', category: 'Self-care', tags: ['self-care', 'depression', 'anxiety'], url: 'https://www.health.harvard.edu/mind-and-mood/exercise-is-an-all-natural-treatment-to-fight-depression' },
  { title: 'Journaling for mental health — a how-to guide', description: 'Research-backed prompts and techniques for using journaling to process emotions.', type: 'article', category: 'Self-care', tags: ['self-care', 'mood', 'depression'], url: 'https://www.healthline.com/health/benefits-of-journaling' },
  { title: 'Social connection and mental health', description: 'Why loneliness is harmful and practical ways to build connection as a student.', type: 'article', category: 'Self-care', tags: ['self-care', 'general', 'depression'], url: 'https://www.mentalhealthfoundation.org.uk/explore-mental-health/a-z-topics/relationships' },

  // CRISIS
  { title: 'iCall — free counselling helpline (India)', description: 'Professional counselling service run by TISS. Call or chat with a trained counsellor for free.', type: 'article', category: 'Crisis', tags: ['crisis', 'general'], url: 'https://icallhelpline.org/' },
  { title: 'Vandrevala Foundation — 24/7 helpline', description: '24-hour free mental health helpline for anyone in distress. Call 1860-2662-345.', type: 'article', category: 'Crisis', tags: ['crisis'], url: 'https://www.vandrevalafoundation.com/' },
  { title: 'Samaritans — emotional support (international)', description: 'Free, anonymous emotional support available by phone, email, or online chat at any time.', type: 'article', category: 'Crisis', tags: ['crisis'], url: 'https://www.samaritans.org/' },
  { title: 'When to seek emergency help — a student guide', description: 'Clear guidance on recognising a mental health crisis and what steps to take.', type: 'article', category: 'Crisis', tags: ['crisis', 'general'], url: 'https://www.studentminds.org.uk/crisisresources.html' },
];

// ─── Seed ─────────────────────────────────────────────────────────────────────
async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ Connected to MongoDB');

    // 1. College
    let college = await College.findOne({ code: 'DEFAULT' });
    if (!college) {
      college = await College.create({ name: 'Default College', code: 'DEFAULT' });
      console.log('✓ Created default college');
    } else {
      console.log('✓ Default college already exists — skipped');
    }

    // 2. Admin user
    const existingAdmin = await User.findOne({ email: 'admin@default.com' });
    if (!existingAdmin) {
      const hashed = await bcrypt.hash('admin123', 12);
      await User.create({ name: 'Admin', email: 'admin@default.com', password: hashed, role: 'admin', collegeId: college._id });
      console.log('✓ Created admin  →  admin@default.com / admin123');
    } else {
      console.log('✓ Admin already exists — skipped');
    }

    // 3. Questionnaires
    await Questionnaire.deleteMany({ type: { $in: ['phq9', 'gad7'] } });
    await Questionnaire.insertMany([phq9, gad7]);
    console.log('✓ Seeded PHQ-9 and GAD-7 questionnaires');

    // 4. Resources
    const deleted = await Resource.deleteMany({ collegeId: college._id });
    console.log(`✓ Cleared ${deleted.deletedCount} existing resources`);
    await Resource.insertMany(RESOURCES.map(r => ({ ...r, collegeId: college._id })));
    console.log(`✓ Seeded ${RESOURCES.length} resources`);

    console.log('\nAll done. Log in as admin@default.com / admin123');
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err);
    process.exit(1);
  }
}

seed();