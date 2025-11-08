const axios = require('axios');

async function testCommunitiesAPI() {
    try {
        console.log('Testing communities API...');
        const response = await axios.get('http://localhost:11001/api/v1/community/communities');
        console.log('Status:', response.status);
        console.log('Data structure:', JSON.stringify(response.data, null, 2));
        console.log('Communities count:', response.data.result?.communities?.length || response.data.data?.length || 0);
    } catch (error) {
        console.error('Error:', error.message);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', JSON.stringify(error.response.data, null, 2));
        }
    }
}

testCommunitiesAPI();