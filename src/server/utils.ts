import PDFDocument from 'pdfkit';
import nodemailer from 'nodemailer';
import fs from 'fs';

export function generateCaseNumber(): string {
  const prefix = 'DMCA';
  const year = new Date().getFullYear();
  const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `${prefix}-${year}-${randomNum}`;
}

export async function createPDF(caseNumber: string, url: string, criteria: string, date: string, template: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument();
    const buffers: Buffer[] = [];

    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => {
      const pdfBuffer = Buffer.concat(buffers);
      resolve(pdfBuffer);
    });

    const content = template
      .replace('{{caseNumber}}', caseNumber)
      .replace('{{url}}', url)
      .replace('{{criteria}}', criteria)
      .replace('{{date}}', date);

    doc.fontSize(12).text(content);
    doc.end();
  });
}

export async function sendEmail(domain: string, caseNumber: string, pdfPath: string) {
  const transporter = nodemailer.createTransport({
    // Configure your email service here
  });

  const mailOptions = {
    from: 'your-email@example.com',
    to: `dmca@${domain}`,
    subject: `DMCA Takedown Notice - Case ${caseNumber}`,
    text: 'Please find attached the DMCA Takedown Notice.',
    attachments: [
      {
        filename: `${caseNumber}.pdf`,
        path: pdfPath
      }
    ]
  };

  await transporter.sendMail(mailOptions);
}