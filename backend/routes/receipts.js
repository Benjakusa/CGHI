const express = require('express');
const PDFDocument = require('pdfkit');
const db = require('../db');

const router = express.Router();

router.post('/generate', (req, res) => {
    const { jobId, applicantName, applicantEmail } = req.body;

    const jobIdNum = Number(jobId);
    if (!Number.isInteger(jobIdNum) || jobIdNum <= 0) {
        return res.status(400).json({ error: 'jobId must be a valid job id' });
    }

    const job = db.prepare('SELECT * FROM jobs WHERE id=? AND published=1').get(jobIdNum);
    if (!job) {
        return res.status(404).json({ error: 'Job not found or not published' });
    }

    const doc = new PDFDocument({ margin: 50, size: 'A4', compress: true, info: { Title: 'Application Receipt - CGP' } });

    // APK-safe binary download headers. Keep Content-Length unset because PDFKit
    // streams before the final byte count is known. Android WebView and mobile
    // browsers still save/open attachment PDFs without Content-Length.
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    const filename = 'CGP_Application_Receipt_' + jobIdNum + '_' + Date.now() + '.pdf';
    const safeFilename = filename.replace(/[^A-Za-z0-9._-]/g, '_');
    res.setHeader('Content-Disposition', 'attachment; filename="' + safeFilename + '"; filename*=UTF-8\'\'' + encodeURIComponent(safeFilename));
    res.setHeader('Accept-Ranges', 'none');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    // Expose the filename so browser/APK fetch clients can preserve it.
    res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');

    // Pipe the PDF stream directly to the response. This preserves backpressure
    // better than manual data/end handling in Express/mobile proxies.
    doc.pipe(res);
    doc.on('error', err => {
        console.error('[CGHI] PDF generation error:', err);
        if (!res.headersSent) {
            res.status(500).json({ error: 'Failed to generate PDF' });
        } else {
            res.end();
        }
    });

    const pageWidth = doc.page.width;
    const center = pageWidth / 2;
    const brandBlue = '#008ecc';
    const white     = '#FFFFFF';
    const black     = '#000000';
    const gray      = '#666666';
    const lightGray = '#999999';
    const leftX = 50;
    const labelW = 140;
    const valueX = leftX + labelW;
    const valueW = pageWidth - leftX - labelW - 50;

    function hr(y, color, width) {
        doc.moveTo(50, y).lineTo(pageWidth - 50, y).strokeColor(color).lineWidth(width).stroke();
    }

    // Header bar
    doc.rect(0, 0, pageWidth, 68).fill(brandBlue);
    doc.fillColor(white).fontSize(22).font('Helvetica-Bold').text('CGP', 50, 20, { width: pageWidth - 100 });
    doc.fillColor(white).fontSize(11).font('Helvetica').text('Center for Global Health & Pandemic Intelligence', 50, 42, { width: pageWidth - 100 });
    doc.fillColor(white).fontSize(8).font('Helvetica').text('Pandemic Intel Center', 50, 55, { width: pageWidth - 100 });

    // Title
    hr(90, brandBlue, 2);
    doc.fillColor(black).fontSize(18).font('Helvetica-Bold').text('Application Receipt', center, 105, { align: 'center', width: pageWidth - 100 });
    doc.fillColor(gray).fontSize(9).font('Helvetica').text('Job Application Submission Confirmation', center, 125, { align: 'center', width: pageWidth - 100 });
    hr(138, lightGray, 0.5);

    // Meta
    const metaY = 160;
    const receiptDate = new Date();
    const formattedDate = receiptDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const formattedTime = receiptDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    doc.fillColor(black).font('Helvetica-Bold').fontSize(9);
    doc.text('Receipt Date:', leftX, metaY);
    doc.fillColor(black).font('Helvetica');
    doc.text(formattedDate, valueX, metaY);
    doc.text('Time: ' + formattedTime, valueX, metaY + 14);

    const receiptNum = 'CGHI-REC-' + Date.now().toString(36).toUpperCase() + '-' + jobIdNum;
    doc.fillColor(black).font('Helvetica-Bold');
    doc.text('Receipt Number:', leftX, metaY + 32);
    doc.fillColor(black).font('Helvetica');
    doc.text(receiptNum, valueX, metaY + 32);

    doc.fillColor(black).font('Helvetica-Bold');
    doc.text('Organization:', leftX, metaY + 50);
    doc.fillColor(black).font('Helvetica');
    doc.text('Center for Global Health & Pandemic Intelligence (CGP)', valueX, metaY + 50, { width: valueW, lineBreak: true });

    hr(metaY + 72, lightGray, 0.5);

    // Applicant
    const appY = metaY + 90;
    doc.fillColor(brandBlue).fontSize(11).font('Helvetica-Bold').text('APPLICANT INFORMATION', leftX, appY);
    hr(appY + 16, brandBlue, 1.5);

    doc.fillColor(black).font('Helvetica-Bold');
    doc.text('Applicant Name:', leftX, appY + 32);
    doc.fillColor(black).font('Helvetica');
    doc.text(applicantName || 'N/A', valueX, appY + 32, { width: valueW, lineBreak: true });

    doc.fillColor(black).font('Helvetica-Bold');
    doc.text('Applicant Email:', leftX, appY + 50);
    doc.fillColor(black).font('Helvetica');
    doc.text(applicantEmail || 'N/A', valueX, appY + 50, { width: valueW, lineBreak: true });

    // Job
    const jobY = appY + 72;
    doc.fillColor(brandBlue).fontSize(11).font('Helvetica-Bold').text('JOB APPLIED FOR', leftX, jobY);
    hr(jobY + 16, brandBlue, 1.5);

    doc.fillColor(black).font('Helvetica-Bold');
    doc.text('Position:', leftX, jobY + 32);
    doc.fillColor(black).font('Helvetica');
    doc.text(job.title, valueX, jobY + 32, { width: valueW, lineBreak: true });

    doc.fillColor(black).font('Helvetica-Bold');
    doc.text('Department:', leftX, jobY + 50);
    doc.fillColor(black).font('Helvetica');
    doc.text(job.department || 'Not specified', valueX, jobY + 50, { width: valueW, lineBreak: true });

    doc.fillColor(black).font('Helvetica-Bold');
    doc.text('Location:', leftX, jobY + 68);
    doc.fillColor(black).font('Helvetica');
    doc.text(job.location || 'Not specified', valueX, jobY + 68, { width: valueW, lineBreak: true });

    doc.fillColor(black).font('Helvetica-Bold');
    doc.text('Employment Type:', leftX, jobY + 86);
    doc.fillColor(black).font('Helvetica');
    doc.text(job.employment_type || 'Not specified', valueX, jobY + 86, { width: valueW, lineBreak: true });

    if (job.closing_date) {
        doc.fillColor(black).font('Helvetica-Bold');
        doc.text('Application Deadline:', leftX, jobY + 104);
        doc.fillColor(black).font('Helvetica');
        doc.text(job.closing_date, valueX, jobY + 104, { width: valueW, lineBreak: true });
    }

    // Footer
    const footerY = jobY + 135;
    hr(footerY, lightGray, 0.5);
    doc.fillColor(gray).fontSize(7.5).font('Helvetica');
    doc.text('This is a computer-generated receipt. No signature is required.', center, footerY + 8, { align: 'center', width: pageWidth - 100 });
    doc.text('For inquiries about this application, please contact: info@pandemicintelcenter.org', center, footerY + 20, { align: 'center', width: pageWidth - 100 });
    doc.text('(c) ' + receiptDate.getFullYear() + ' Center for Global Health & Pandemic Intelligence. All rights reserved.', center, footerY + 32, { align: 'center', width: pageWidth - 100 });

    doc.end();
});

module.exports = router;
