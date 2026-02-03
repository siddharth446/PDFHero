const { PDFDocument, rgb, degrees, StandardFonts } = require('pdf-lib');
const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

const mergePDFs = async (filePaths) => {
    try {
        const mergedPdf = await PDFDocument.create();

        for (const filePath of filePaths) {
            const pdfBytes = fs.readFileSync(filePath);
            const pdf = await PDFDocument.load(pdfBytes);
            const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
            copiedPages.forEach((page) => mergedPdf.addPage(page));
        }

        const mergedPdfBytes = await mergedPdf.save();
        return mergedPdfBytes;
    } catch (error) {
        logger.error(`Merge Error: ${error.message}`);
        throw new Error('Failed to merge PDFs');
    }
};

const splitPDF = async (filePath, outputDir) => {
    try {
        const pdfBytes = fs.readFileSync(filePath);
        const pdf = await PDFDocument.load(pdfBytes);
        const numPages = pdf.getPageCount();
        const outputFiles = [];

        // Ensure output directory exists (using temps)
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        for (let i = 0; i < numPages; i++) {
            const newPdf = await PDFDocument.create();
            const [copiedPage] = await newPdf.copyPages(pdf, [i]);
            newPdf.addPage(copiedPage);

            const newPdfBytes = await newPdf.save();
            const outputFilePath = path.join(outputDir, `page-${i + 1}.pdf`);
            fs.writeFileSync(outputFilePath, newPdfBytes);
            outputFiles.push(outputFilePath);
        }

        return outputFiles;
    } catch (error) {
        logger.error(`Split Error: ${error.message}`);
        throw new Error('Failed to split PDF');
    }
};

const rotatePDF = async (filePath, angle) => {
    try {
        const pdfBytes = fs.readFileSync(filePath);
        const pdf = await PDFDocument.load(pdfBytes);
        const pages = pdf.getPages();

        pages.forEach(page => {
            const { rotation } = page.getRotation();
            page.setRotation(degrees(rotation + angle));
        });

        const rotatedPdfBytes = await pdf.save();
        return rotatedPdfBytes;
    } catch (error) {
        logger.error(`Rotate Error: ${error.message}`);
        throw new Error('Failed to rotate PDF');
    }
}

const compressPDF = async (filePath, options = {}) => {
    try {
        const { level = 'medium', quality = 70, removeMetadata = false } = options;
        
        const pdfBytes = fs.readFileSync(filePath);
        const pdf = await PDFDocument.load(pdfBytes);
        
        // Apply compression based on level
        const compressionOptions = {
            useObjectStreams: level !== 'high', // Disable for maximum compression
            addDefaultPage: false
        };
        
        // Remove metadata if requested
        if (removeMetadata) {
            // Note: pdf-lib has limited metadata removal capabilities
            // For full metadata removal, we'd need additional libraries
            logger.info('Metadata removal requested (limited support in pdf-lib)');
        }
        
        // For better compression, we could integrate with Ghostscript or other tools
        // This is a basic implementation using pdf-lib's built-in optimization
        const compressedBytes = await pdf.save(compressionOptions);
        
        // Log compression results
        const originalSize = fs.statSync(filePath).size;
        const newSize = compressedBytes.length;
        const reduction = ((originalSize - newSize) / originalSize * 100).toFixed(1);
        
        logger.info(`PDF Compression: ${originalSize} -> ${newSize} bytes (${reduction}% reduction)`);
        
        return compressedBytes;
    } catch (error) {
        logger.error(`Compress Error: ${error.message}`);
        throw new Error('Failed to compress PDF');
    }
}

const protectPDF = async (filePath, password) => {
    try {
        const pdfBytes = fs.readFileSync(filePath);
        const pdf = await PDFDocument.load(pdfBytes);

        // Encrypt the PDF
        pdf.encrypt({
            userPassword: password,
            ownerPassword: password, // Same for simplicity, or generate random
            permissions: {
                printing: 'highResolution',
                modifying: false,
                copying: false,
                annotating: false,
                fillingForms: false,
                contentAccessibility: false,
                documentAssembly: false,
            },
        });

        return await pdf.save();
    } catch (error) {
        logger.error(`Protect Error: ${error.message}`);
        throw new Error('Failed to protect PDF');
    }
}

const unlockPDF = async (filePath, password) => {
    try {
        const pdfBytes = fs.readFileSync(filePath);
        // Load with password
        // Note: pdf-lib (v1.17) might not support reading encrypted PDFs well in all cases without password param
        // .load(pdfBytes, { password }) is not standard in some versions, check docs.
        // Actually pdf-lib v1.17.1 (in package.json) DOES support ignoreEncryption: true to inspect, 
        // but to fully modify/save unlocked we need to decrypt.
        // HOWEVER, standard pdf-lib only supports *producing* encrypted PDFs, not always fully decrypting to remove it easily unless we just save it.
        // Let's try loading then saving. If it was loaded with password, it is decrypted in memory.

        // pdf-lib load doesn't take password as second arg in standard docs, 
        // but let's see if we can just re-save it without encryption.
        // Wait, pdf-lib CANNOT load encrypted PDFs. This is a known limitation. 
        // We might need 'pdf-parse' or similar to help, or just warn user.
        // actually there was a PR or fork.
        // If we can't do it with current lib, we'll placeholder it.
        // Re-checking pdf-lib docs... "pdf-lib does not currently support reading encrypted documents".

        // Alternative: throw error for now
        throw new Error('PDF unlocking requires a different library (e.g. qpdf/ghostscript) not currently installed.');
    } catch (error) {
        logger.error(`Unlock Error: ${error.message}`);
        throw new Error('Failed to unlock PDF: ' + error.message);
    }
}

const watermarkPDF = async (filePath, watermarkText) => {
    try {
        const pdfBytes = fs.readFileSync(filePath);
        const pdf = await PDFDocument.load(pdfBytes);
        const pages = pdf.getPages();
        const font = await pdf.embedFont(StandardFonts.HelveticaBold);

        pages.forEach(page => {
            const { width, height } = page.getSize();
            const fontSize = 50;
            const textWidth = font.widthOfTextAtSize(watermarkText, fontSize);
            const textHeight = font.heightAtSize(fontSize);

            page.drawText(watermarkText, {
                x: width / 2 - textWidth / 2,
                y: height / 2 - textHeight / 2,
                size: fontSize,
                font: font,
                color: rgb(0.7, 0.7, 0.7), // Light gray
                opacity: 0.5,
                rotate: degrees(45),
            });
        });

        return await pdf.save();
    } catch (error) {
        logger.error(`Watermark Error: ${error.message}`);
        throw new Error('Failed to watermark PDF');
    }
}

const imageToPDF = async (imagePaths) => {
    try {
        const pdf = await PDFDocument.create();

        for (const imgPath of imagePaths) {
            const imgBytes = fs.readFileSync(imgPath);
            const ext = path.extname(imgPath).toLowerCase();
            let image;

            if (ext === '.png') {
                image = await pdf.embedPng(imgBytes);
            } else if (ext === '.jpg' || ext === '.jpeg') {
                image = await pdf.embedJpg(imgBytes);
            } else {
                continue; // Skip unsupported
            }

            const page = pdf.addPage([image.width, image.height]);
            page.drawImage(image, {
                x: 0,
                y: 0,
                width: image.width,
                height: image.height,
            });
        }

        return await pdf.save();
    } catch (error) {
        logger.error(`ImageToPDF Error: ${error.message}`);
        throw new Error('Failed to convert images to PDF');
    }
}

const addPageNumbers = async (filePath) => {
    try {
        const pdfBytes = fs.readFileSync(filePath);
        const pdf = await PDFDocument.load(pdfBytes);
        const pages = pdf.getPages();
        const font = await pdf.embedFont(StandardFonts.Helvetica);

        for (let i = 0; i < pages.length; i++) {
            const page = pages[i];
            const { width } = page.getSize();
            const text = `${i + 1} / ${pages.length}`;
            const fontSize = 12;
            const textWidth = font.widthOfTextAtSize(text, fontSize);

            page.drawText(text, {
                x: width - textWidth - 20,
                y: 20,
                size: fontSize,
                font: font,
                color: rgb(0, 0, 0),
            });
        }

        return await pdf.save();
    } catch (error) {
        logger.error(`PageNumbers Error: ${error.message}`);
        throw new Error('Failed to add page numbers');
    }
}

const organizePDF = async (filePath, pageOrder) => {
    try {
        // pageOrder is expected to be array of 1-based indices [1, 3, 2, ...]
        const pdfBytes = fs.readFileSync(filePath);
        const pdf = await PDFDocument.load(pdfBytes);
        const pageCount = pdf.getPageCount();

        const newPdf = await PDFDocument.create();

        // Validate indices
        const validIndices = pageOrder
            .map(p => parseInt(p) - 1) // Convert to 0-based
            .filter(i => i >= 0 && i < pageCount);

        if (validIndices.length === 0) throw new Error("No valid pages selected");

        const copiedPages = await newPdf.copyPages(pdf, validIndices);
        copiedPages.forEach(p => newPdf.addPage(p));

        return await newPdf.save();
    } catch (error) {
        logger.error(`Organize Error: ${error.message}`);
        throw new Error('Failed to organize PDF');
    }
}

module.exports = {
    mergePDFs,
    splitPDF,
    rotatePDF,
    compressPDF,
    protectPDF,
    unlockPDF,
    watermarkPDF,
    imageToPDF,
    addPageNumbers,
    organizePDF
};
