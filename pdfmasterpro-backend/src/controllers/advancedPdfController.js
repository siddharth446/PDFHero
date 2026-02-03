const ilovepdfService = require('../services/ilovepdfService');
const fs = require('fs');
const path = require('path');

const cleanupFile = (filePath) => {
    if (filePath && fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
    }
};

exports.officeToPdf = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

        const buffer = await ilovepdfService.processFile('officepdf', req.file.path);

        cleanupFile(req.file.path);

        res.set('Content-Type', 'application/pdf');
        res.set('Content-Disposition', 'attachment; filename=converted.pdf');
        res.send(buffer);
    } catch (error) {
        if (req.file) cleanupFile(req.file.path);
        res.status(500).json({ error: error.message });
    }
};

exports.repairPdf = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

        const buffer = await ilovepdfService.processFile('repair', req.file.path);

        cleanupFile(req.file.path);

        res.set('Content-Type', 'application/pdf');
        res.set('Content-Disposition', 'attachment; filename=repaired.pdf');
        res.send(buffer);
    } catch (error) {
        if (req.file) cleanupFile(req.file.path);
        res.status(500).json({ error: error.message });
    }
};

exports.htmlToPdf = async (req, res) => {
    try {
        const { url } = req.body;
        if (!url) return res.status(400).json({ error: 'URL is required' });

        const buffer = await ilovepdfService.processUrl('htmlpdf', url);

        res.set('Content-Type', 'application/pdf');
        res.set('Content-Disposition', 'attachment; filename=webpage.pdf');
        res.send(buffer);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.pdfToPdfA = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

        const buffer = await ilovepdfService.processFile('pdfa', req.file.path, { conformance: 'pdfa-2b' });

        cleanupFile(req.file.path);

        res.set('Content-Type', 'application/pdf');
        res.set('Content-Disposition', 'attachment; filename=converted_pdfa.pdf');
        res.send(buffer);
    } catch (error) {
        if (req.file) cleanupFile(req.file.path);
        res.status(500).json({ error: error.message });
    }
};
