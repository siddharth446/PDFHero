const express = require('express');
const router = express.Router();
const controller = require('../controllers/pdfController');
const upload = require('../middleware/fileUpload');

// PDF Operations
router.post('/merge', upload.array('files', 10), controller.merge);
router.post('/split', upload.single('file'), controller.split);
router.post('/rotate', upload.single('file'), controller.rotate);
router.post('/compress', upload.single('file'), controller.compress);
router.post('/protect', upload.single('file'), controller.protect);
router.post('/unlock', upload.single('file'), controller.unlock);
router.post('/watermark', upload.single('file'), controller.watermark);
router.post('/page-numbers', upload.single('file'), controller.pageNumbers);
router.post('/organize', upload.single('file'), controller.organize);
router.post('/image-to-pdf', upload.array('files', 50), controller.imageToPdf);

// Advanced Features (iLovePDF API)
const advancedController = require('../controllers/advancedPdfController');

router.post('/office-to-pdf', upload.single('file'), advancedController.officeToPdf);
router.post('/repair', upload.single('file'), advancedController.repairPdf);
router.post('/html-to-pdf', advancedController.htmlToPdf); // No file upload, JSON body
router.post('/pdfa', upload.single('file'), advancedController.pdfToPdfA);

// Stubs for currently unsupported features
router.post('/pdf-to-image', upload.single('file'), controller.pdfToImage);
router.post('/pdf-to-word', upload.single('file'), controller.pdfToWord);
router.post('/word-to-pdf', upload.single('file'), controller.wordToPdf); // Kept as fallback/stub or can redirect
router.post('/ocr', upload.single('file'), controller.ocr);

module.exports = router;
