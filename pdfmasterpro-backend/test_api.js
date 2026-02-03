require('dotenv').config();
const ILovePDFApi = require('@ilovepdf/ilovepdf-nodejs');

async function testTool(toolName) {
    console.log(`Testing tool: ${toolName}...`);
    try {
        const instance = new ILovePDFApi(process.env.ILOVEPDF_PUBLIC_KEY, process.env.ILOVEPDF_SECRET_KEY);
        const task = instance.newTask(toolName);
        await task.start();
        console.log(`✅ Tool '${toolName}' started successfully. Task ID: ${task.taskId}`);
        return true;
    } catch (error) {
        console.error(`❌ Tool '${toolName}' failed:`, error.message);
        if (error.response) {
            console.error('Response:', error.response.body || error.response);
        }
        return false;
    }
}

async function runTests() {
    console.log('--- iLovePDF API Verification ---');
    console.log('Public Key:', process.env.ILOVEPDF_PUBLIC_KEY ? 'Present' : 'Missing');
    console.log('Secret Key:', process.env.ILOVEPDF_SECRET_KEY ? 'Present' : 'Missing');

    if (!process.env.ILOVEPDF_PUBLIC_KEY || !process.env.ILOVEPDF_SECRET_KEY) {
        console.error('❌ Keys missing in .env');
        return;
    }

    const tools = ['officepdf', 'repair', 'htmlpdf', 'pdfa'];

    for (const tool of tools) {
        await testTool(tool);
    }
}

runTests();
