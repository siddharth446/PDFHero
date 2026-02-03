const fs = require('fs');

async function testCompressPdf() {
    console.log('Testing Compress PDF...');
    const formData = new FormData();
    const blob = new Blob([fs.readFileSync('test-files/test1.pdf')], { type: 'application/pdf' });
    formData.append('file', blob, 'test1.pdf');

    try {
        const response = await fetch('http://localhost:5000/api/pdf/compress', {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            console.log('✅ Compress PDF: Success');
        } else {
            console.error('❌ Compress PDF: Failed', response.status, response.statusText);
            console.error(await response.text());
        }
    } catch (error) {
        console.error('❌ Compress PDF: Error', error.message);
    }
}

testCompressPdf();
