const axios = require('axios');

async function checkCommunityFields() {
    try {
        console.log('Checking community fields...');
        const response = await axios.get('http://localhost:11001/api/v1/community/communities');
        const communities = response.data.result.communities;
        
        if (communities.length > 0) {
            const firstCommunity = communities[0];
            console.log('First community fields:');
            Object.keys(firstCommunity).forEach(key => {
                console.log(`  ${key}: ${JSON.stringify(firstCommunity[key])}`);
            });
        }
    } catch (error) {
        console.error('Error:', error.message);
    }
}

checkCommunityFields();