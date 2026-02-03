const fs = require('fs');
const path = require('path');
const { PDFDocument } = require('pdf-lib');

// Create dummy files for testing
if (!fs.existsSync('test-files')) fs.mkdirSync('test-files');

const createaaaDummyPDF = async (name) => {
    const pdf = await PDFDocument.create();
    pdf.addPage([100, 100]);
    fs.writeFileSync(path.join('test-files', name), await pdf.save());
};

createaaaDummyPDF('test1.pdf');
createaaaDummyPDF('test2.pdf');

// Create dummy image
// Minimal 1x1 PNG
const pngBuffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACklEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg==', 'base64');
fs.writeFileSync(path.join('test-files', 'test.png'), pngBuffer);

console.log('Test files created in ./test-files');
console.log('Now please run the curl commands manually to test specific endpoints.');
