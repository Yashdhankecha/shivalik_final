// Load environment variables first
const dotenv = require("dotenv");
const path = require("path");

// Load .env file
const envFile = '.env';
console.log("🔹 Loading environment file:", envFile);

dotenv.config({ path: envFile });

const cloudinary = require('./src/libs/cloudinary');

// Test Cloudinary configuration
console.log('Cloudinary Configuration:');
console.log('Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME);
console.log('API Key:', process.env.CLOUDINARY_API_KEY);
// Don't log the secret for security reasons

// Test if Cloudinary is properly configured
if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
    console.log('✅ Cloudinary environment variables are set');
    
    // Test Cloudinary connection
    try {
        const config = cloudinary.cloudinary.config();
        console.log('✅ Cloudinary is properly configured');
        console.log('✅ Cloudinary setup is complete and ready for image uploads');
    } catch (error) {
        console.log('❌ Error testing Cloudinary connection:', error.message);
        process.exit(1);
    }
} else {
    console.log('❌ Cloudinary environment variables are missing');
    console.log('Please check your .env file for the following variables:');
    console.log('- CLOUDINARY_CLOUD_NAME');
    console.log('- CLOUDINARY_API_KEY');
    console.log('- CLOUDINARY_API_SECRET');
    process.exit(1);
}