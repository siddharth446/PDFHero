const pdfService = require('../services/pdfService');
const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

// Helper to cleanup files
const cleanupFiles = (files) => {
    files.forEach(file => {
        if (file && fs.existsSync(file)) fs.unlinkSync(file);
    });
};

// Generic handler for PDF operations
const handlePdfOperation = async (req, res, operation, operationName, outputPrefix = 'processed') => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }

    const inputPath = req.file.path;
    const outputPath = path.join('uploads', `${outputPrefix}-${Date.now()}.pdf`);

    try {
        const processedPdfBytes = await operation();
        fs.writeFileSync(outputPath, processedPdfBytes);

        res.download(outputPath, path.basename(outputPath), (err) => {
            if (err) logger.error(err);
            cleanupFiles([inputPath, outputPath]);
        });
    } catch (error) {
        logger.error(`${operationName} failed: ${error.message}`);
        cleanupFiles([inputPath]);
        res.status(500).json({ message: error.message || `${operationName} failed` });
    }
};

const merge = async (req, res) => {
    if (!req.files || req.files.length < 2) {
        return res.status(400).json({ message: 'Please upload at least 2 PDF files' });
    }
    const filePaths = req.files.map(file => file.path);
    try {
        const mergedPdfBytes = await pdfService.mergePDFs(filePaths);
        const fileName = `merged-${Date.now()}.pdf`;
        const outputPath = path.join('uploads', fileName);
        fs.writeFileSync(outputPath, mergedPdfBytes);
        res.download(outputPath, fileName, (err) => {
            if (err) logger.error(err);
            cleanupFiles([...filePaths, outputPath]);
        });
    } catch (error) {
        cleanupFiles(filePaths);
        res.status(500).json({ message: error.message });
    }
};

const split = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }
    try {
        const tempDir = path.join('uploads', `split-${Date.now()}`);
        const outputFiles = await pdfService.splitPDF(req.file.path, tempDir);
        res.json({
            message: 'PDF Split successfully',
            files: outputFiles.map(f => path.basename(f)),
            basePath: `/download/split/${path.basename(tempDir)}` // Needs a route to serve this
        });
        // Cleanup file but keep output dir/files until downloaded? 
        // Real app needs better management.
        if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    } catch (error) {
        if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        res.status(500).json({ message: error.message });
    }
};

const rotate = async (req, res) => {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const angle = parseInt(req.body.angle) || 90;
    await handlePdfOperation(req, res, () => pdfService.rotatePDF(req.file.path, angle), 'Rotate', 'rotated');
};

const compress = async (req, res) => {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    
    const { level = 'medium', quality = 70, removeMetadata = false } = req.body;
    
    await handlePdfOperation(req, res, 
        () => pdfService.compressPDF(req.file.path, { level, quality, removeMetadata }), 
        'Compress', 
        'compressed'
    );
}

const protect = async (req, res) => {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const { password } = req.body;
    if (!password) return res.status(400).json({ message: 'Password is required' });
    await handlePdfOperation(req, res, () => pdfService.protectPDF(req.file.path, password), 'Protect', 'protected');
}

const unlock = async (req, res) => {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const { password } = req.body;
    await handlePdfOperation(req, res, () => pdfService.unlockPDF(req.file.path, password), 'Unlock', 'unlocked');
}

const watermark = async (req, res) => {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const { text } = req.body;
    if (!text) return res.status(400).json({ message: 'Watermark text is required' });
    await handlePdfOperation(req, res, () => pdfService.watermarkPDF(req.file.path, text), 'Watermark', 'watermarked');
}

const imageToPdf = async (req, res) => {
    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: 'Please upload at least one image' });
    }
    const filePaths = req.files.map(file => file.path);
    try {
        const pdfBytes = await pdfService.imageToPDF(filePaths);
        const fileName = `images-to-pdf-${Date.now()}.pdf`;
        const outputPath = path.join('uploads', fileName);
        fs.writeFileSync(outputPath, pdfBytes);
        res.download(outputPath, fileName, (err) => {
            if (err) logger.error(err);
            cleanupFiles([...filePaths, outputPath]);
        });
    } catch (error) {
        cleanupFiles(filePaths);
        res.status(500).json({ message: error.message });
    }
}

const pageNumbers = async (req, res) => {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    await handlePdfOperation(req, res, () => pdfService.addPageNumbers(req.file.path), 'PageNumbers', 'numbered');
}

const organize = async (req, res) => {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const { pages } = req.body; // Expect JSON array or comma separated string
    let pageOrder;
    try {
        pageOrder = typeof pages === 'string' ? JSON.parse(pages) : pages;
        if (!Array.isArray(pageOrder)) pageOrder = pages.split(',').map(Number);
    } catch (e) {
        return res.status(400).json({ message: 'Invalid page order format' });
    }

    await handlePdfOperation(req, res, () => pdfService.organizePDF(req.file.path, pageOrder), 'Organize', 'organized');
}

// Stubs for complex features
const notImplementedStub = (req, res) => {
    if (req.file) fs.unlinkSync(req.file.path);
    if (req.files) req.files.forEach(f => fs.unlinkSync(f.path));
    res.status(501).json({ message: 'This feature is not yet available on the server.' });
}

module.exports = {
    merge,
    split,
    rotate,
    compress,
    protect,
    unlock,
    watermark,
    imageToPdf,
    pageNumbers,
    organize,
    pdfToImage: notImplementedStub,
    pdfToWord: notImplementedStub,
    wordToPdf: notImplementedStub,
    ocr: notImplementedStub
};
