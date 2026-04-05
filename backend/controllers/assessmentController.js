import Questionnaire from '../models/Questionnaire.js';
import UserResult from '../models/UserResult.js';

export const getResults = async (req, res) => {
  try {
    const results = await UserResult.find({ userId: req.user.userId })
      .sort({ createdAt: -1 });
    res.json(results);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

export const saveResult = async (req, res) => {
  try {
    const { questionnaireType, totalScore, severityTag } = req.body;
    const result = await UserResult.create({
      userId:            req.user.userId,
      collegeId:         req.user.collegeId,
      questionnaireType,
      totalScore,
      severityTag,
    });
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

export const getQuestionnaire = async (req, res) => {
  try {
    const questionnaire = await Questionnaire.findOne({ type: req.params.type });
    if (!questionnaire) {
      return res.status(404).json({ message: 'Questionnaire not found' });
    }
    res.json(questionnaire);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};