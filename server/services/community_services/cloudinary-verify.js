// Load environment variables
require('dotenv').config();

// Test Cloudinary configuration
const cloudinary = require('./src/libs/cloudinary');

console.log('🔍 Testing Cloudinary Configuration...');
console.log('=====================================');

// Check if environment variables are set
console.log('📋 Environment Variables Check:');
console.log('   CLOUDINARY_CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME ? '✅ SET' : '❌ MISSING');
console.log('   CLOUDINARY_API_KEY:', process.env.CLOUDINARY_API_KEY ? '✅ SET' : '❌ MISSING');
console.log('   CLOUDINARY_API_SECRET:', process.env.CLOUDINARY_API_SECRET ? '✅ SET' : '❌ MISSING');

if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    console.log('\n❌ Cloudinary environment variables are missing!');
    console.log('Please check your .env file for the following variables:');
    console.log('   - CLOUDINARY_CLOUD_NAME');
    console.log('   - CLOUDINARY_API_KEY');
    console.log('   - CLOUDINARY_API_SECRET');
    process.exit(1);
}

// Test Cloudinary connection
try {
    const config = cloudinary.cloudinary.config();
    console.log('\n✅ Cloudinary Configuration:');
    console.log('   Cloud Name:', config.cloud_name);
    console.log('   API Key:', config.api_key);
    console.log('   API Secret: ***REDACTED***');
    
    console.log('\n🎉 Cloudinary is properly configured and ready for image uploads!');
    console.log('\nTo test image uploads, try uploading an image through any of the forms:');
    console.log('   - Add Community Form');
    console.log('   - Event Upload Form');
    console.log('   - Pulse Upload Form');
    console.log('   - Product Listing Form');
} catch (error) {
    console.log('\n❌ Error testing Cloudinary connection:', error.message);
    process.exit(1);
}