import Resume from '../models/Resume.js';
import pdf from 'pdf-parse/lib/pdf-parse.js';
import mammoth from 'mammoth';

export const createResume = async (req, res) => {
  try {
    const { title, rawText, extractedData, isPrimary } = req.body;

    if (!title || !rawText) {
      return res.status(400).json({ success: false, message: 'Title and resume text are required' });
    }

    if (isPrimary) {
      await Resume.updateMany({ user: req.user._id }, { isPrimary: false });
    }

    const resume = await Resume.create({
      user: req.user._id,
      title,
      rawText,
      extractedData: extractedData || {},
      isPrimary: isPrimary || false,
      fileType: 'manual',
    });

    res.status(201).json({ success: true, resume });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getResumes = async (req, res) => {
  try {
    const resumes = await Resume.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, count: resumes.length, resumes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getResume = async (req, res) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, user: req.user._id });
    if (!resume) {
      return res.status(404).json({ success: false, message: 'Resume not found' });
    }
    res.json({ success: true, resume });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateResume = async (req, res) => {
  try {
    let resume = await Resume.findOne({ _id: req.params.id, user: req.user._id });
    if (!resume) {
      return res.status(404).json({ success: false, message: 'Resume not found' });
    }

    const { title, rawText, extractedData, isPrimary } = req.body;

    if (isPrimary) {
      await Resume.updateMany({ user: req.user._id }, { isPrimary: false });
    }

    resume.title = title || resume.title;
    resume.rawText = rawText || resume.rawText;
    if (extractedData) resume.extractedData = extractedData;
    if (typeof isPrimary === 'boolean') resume.isPrimary = isPrimary;
    resume.version += 1;

    await resume.save();
    res.json({ success: true, resume });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteResume = async (req, res) => {
  try {
    const resume = await Resume.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!resume) {
      return res.status(404).json({ success: false, message: 'Resume not found' });
    }
    res.json({ success: true, message: 'Resume deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const { originalname, mimetype, buffer } = req.file;
    let rawText = '';
    let fileType = 'pdf';

    if (mimetype === 'application/pdf') {
      const data = await pdf(buffer);
      rawText = data.text;
      fileType = 'pdf';
    } else if (
      mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      originalname.endsWith('.docx')
    ) {
      const result = await mammoth.extractRawText({ buffer });
      rawText = result.value;
      fileType = 'docx';
    } else {
      return res.status(400).json({ success: false, message: 'Only PDF and DOCX files are supported' });
    }

    if (!rawText || rawText.trim().length < 50) {
      return res.status(400).json({
        success: false,
        message: 'Could not extract sufficient text from the file. Please try pasting the text manually.',
      });
    }

    const title = req.body.title || originalname.replace(/\.[^/.]+$/, '');

    const resume = await Resume.create({
      user: req.user._id,
      title,
      originalFileName: originalname,
      fileType,
      rawText: rawText.trim(),
      extractedData: {},
    });

    res.status(201).json({ success: true, resume });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
