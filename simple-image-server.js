const express = require('express');
const cors = require('cors');
const multer = require('multer');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Create express app
const app = express();

// Enable CORS
app.use(cors({
  origin: 'http://localhost:5174',
  credentials: true
}));

// Parse JSON bodies
app.use(express.json());

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'success',
    message: 'Image compression service is running',
    timestamp: new Date().toISOString()
  });
});

// Image compression endpoint
app.post('/api/image/compress', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    // Get quality parameter (default to 80)
    const quality = parseInt(req.body.quality) || 80;
    
    console.log(`Compressing image with quality: ${quality}%`);
    
    // Process image with sharp
    const compressedBuffer = await sharp(req.file.buffer)
      .jpeg({ 
        quality: quality,
        mozjpeg: true 
      })
      .toBuffer();
    
    // Get original file extension
    const ext = path.extname(req.file.originalname).toLowerCase();
    const originalName = path.parse(req.file.originalname).name;
    
    // Set appropriate content type
    let contentType = 'image/jpeg';
    let fileName = `${originalName}_compressed.jpg`;
    
    // For PNG files, we might want to preserve transparency
    if (ext === '.png') {
      try {
        const pngBuffer = await sharp(req.file.buffer)
          .png({ 
            quality: quality,
            compressionLevel: Math.min(9, Math.max(0, Math.round(quality / 12)))
          })
          .toBuffer();
        // Use PNG if it's smaller or if quality is high
        if (pngBuffer.length < compressedBuffer.length || quality > 85) {
          contentType = 'image/png';
          fileName = `${originalName}_compressed.png`;
        }
      } catch (pngError) {
        console.log('PNG compression failed, using JPEG:', pngError.message);
      }
    }
    
    // Send the compressed image
    res.set({
      'Content-Type': contentType,
      'Content-Disposition': `attachment; filename="${fileName}"`
    });
    
    // Log compression stats
    const originalSize = req.file.size;
    const compressedSize = compressedBuffer.length;
    const reduction = ((originalSize - compressedSize) / originalSize * 100).toFixed(1);
    
    console.log(`Compression complete: ${originalSize} -> ${compressedSize} bytes (${reduction}% reduction)`);
    
    res.send(compressedBuffer);
    
  } catch (error) {
    console.error('Compression error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to compress image',
      error: error.message
    });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File is too large. Maximum size is 10MB.'
      });
    }
  }
  
  res.status(500).json({
    success: false,
    message: error.message || 'Internal server error'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found'
  });
});

const PORT = process.env.PORT || 5006;

app.listen(PORT, () => {
  console.log(`🚀 Image compression server running on port ${PORT}`);
  console.log(`📝 Ready to compress images!`);
});

module.exports = app;