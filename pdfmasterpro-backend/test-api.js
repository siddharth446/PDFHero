const fs = require('fs');
const path = require('path');

async function testImageToPdf() {
    console.log('Testing Image To PDF...');
    const formData = new FormData();
    const blob = new Blob([fs.readFileSync('test-files/test.png')], { type: 'image/png' });
    formData.append('files', blob, 'test.png');

    try {
        const response = await fetch('http://localhost:5006/api/pdf/image-to-pdf', {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            console.log('✅ Image To PDF: Success');
            const buffer = await response.arrayBuffer();
            fs.writeFileSync('test-files/output.pdf', Buffer.from(buffer));
            console.log('Saved output to test-files/output.pdf');
        } else {
            console.error('❌ Image To PDF: Failed', response.status, response.statusText);
            const text = await response.text();
            console.error('Response:', text);
        }
    } catch (error) {
        console.error('❌ Image To PDF: Error', error.message);
    }
}

testImageToPdf();
