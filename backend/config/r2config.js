// config/r2.js
const { S3Client } = require('@aws-sdk/client-s3');
const dotenv = require('dotenv');
dotenv.config();

// Initialize R2 client
const r2Client = new S3Client({
  region: 'auto', // Cloudflare R2 uses 'auto'
  endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

module.exports = r2Client;