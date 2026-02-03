const ILovePDFApi = require('@ilovepdf/ilovepdf-nodejs');
const ILovePDFFile = require('@ilovepdf/ilovepdf-nodejs/ILovePDFFile');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

class ILovePDFService {
    constructor() {
        if (!process.env.ILOVEPDF_PUBLIC_KEY || !process.env.ILOVEPDF_SECRET_KEY) {
            console.warn('WARNING: iLovePDF keys missing. Advanced features will error.');
        }
        this.instance = new ILovePDFApi(
            process.env.ILOVEPDF_PUBLIC_KEY,
            process.env.ILOVEPDF_SECRET_KEY
        );
    }

    async processFile(tool, filePath, options = {}) {
        if (!process.env.ILOVEPDF_PUBLIC_KEY) {
            throw new Error('iLovePDF API keys are not configured. Please contact the administrator.');
        }

        try {
            const task = this.instance.newTask(tool);
            await task.start();

            const file = new ILovePDFFile(filePath);
            await task.addFile(file);

            // Apply options if needed (tool specific)
            // e.g. task.process({ ignore_errors: true })
            await task.process(options);

            // Download returns buffer directly in this SDK version
            const data = await task.download();

            return data;
        } catch (error) {
            console.error(`iLovePDF Service Error (${tool}):`, error);
            throw new Error(`PDF processing failed: ${error.message}`);
        }
    }

    async processUrl(tool, url, options = {}) {
        if (!process.env.ILOVEPDF_PUBLIC_KEY) {
            throw new Error('iLovePDF API keys are not configured.');
        }

        try {
            const task = this.instance.newTask(tool);
            await task.start();

            await task.addFile(url); // SDK handles URL string as addFile? 
            // Wait, docs say: task.addFile('<FILE_URL>') is valid.

            await task.process(options);
            const data = await task.download();
            return data;
        } catch (error) {
            console.error(`iLovePDF Service Error (${tool}):`, error);
            throw new Error(`PDF processing failed: ${error.message}`);
        }
    }
}

module.exports = new ILovePDFService();
