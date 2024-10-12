import express from 'express';
import multer from 'multer';
import { parse } from 'csv-parse/sync';
import fs from 'fs';
import path from 'path';
import { initializeDatabase, getViolations, addViolation, updateViolationStatus, addNotice, getNotices, getNoticeTemplate, addNoticeTemplate } from './db';
import { generateCaseNumber, createPDF, sendEmail } from './utils';

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(express.json());

initializeDatabase();

app.post('/api/import-violations', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const filePath = req.file.path;
  const fileContent = fs.readFileSync(filePath, 'utf8');
  
  try {
    const records = parse(fileContent, { columns: true, skip_empty_lines: true });
    for (const record of records) {
      await addViolation({
        url: record.url,
        domain: record.domain,
        criteria: record.criteria,
        date_detected: record.date_detected || new Date().toISOString()
      });
    }
    res.json({ message: 'Import completed successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Import failed', details: error.message });
  } finally {
    fs.unlinkSync(filePath);
  }
});

app.get('/api/violations', async (req, res) => {
  try {
    const violations = await getViolations();
    res.json(violations);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch violations' });
  }
});

app.post('/api/create-notice', async (req, res) => {
  const { violationId, backdatedDate } = req.body;
  try {
    const caseNumber = generateCaseNumber();
    const dateSent = backdatedDate || new Date().toISOString();
    
    await updateViolationStatus(violationId, 'Notice Sent', caseNumber);
    await addNotice({ case_number: caseNumber, violation_id: violationId, date_sent: dateSent, backdated: !!backdatedDate });
    
    const violation = (await getViolations()).find(v => v.id === violationId);
    const template = await getNoticeTemplate(violation.domain);
    
    if (!template) {
      return res.status(404).json({ error: 'Notice template not found for this domain' });
    }
    
    const pdfBuffer = await createPDF(caseNumber, violation.url, violation.criteria, dateSent, template.template);
    const pdfPath = path.join('case_files', `${caseNumber}.pdf`);
    fs.writeFileSync(pdfPath, pdfBuffer);
    
    await sendEmail(violation.domain, caseNumber, pdfPath);
    
    res.json({ message: 'Notice created and sent successfully', caseNumber });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create notice' });
  }
});

app.get('/api/cases', async (req, res) => {
  try {
    const notices = await getNotices();
    res.json(notices);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch cases' });
  }
});

app.get('/api/case-pdf/:caseNumber', (req, res) => {
  const { caseNumber } = req.params;
  const pdfPath = path.join('case_files', `${caseNumber}.pdf`);
  
  if (fs.existsSync(pdfPath)) {
    res.contentType('application/pdf');
    fs.createReadStream(pdfPath).pipe(res);
  } else {
    res.status(404).json({ error: 'PDF not found' });
  }
});

app.post('/api/notice-template', async (req, res) => {
  const { domain, template } = req.body;
  try {
    await addNoticeTemplate(domain, template);
    res.json({ message: 'Notice template added successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add notice template' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});