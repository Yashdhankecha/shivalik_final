const axios = require('axios');

async function checkFeaturedCommunities() {
    try {
        console.log('Checking featured communities...');
        const response = await axios.get('http://localhost:11001/api/v1/community/communities');
        const communities = response.data.result.communities;
        
        console.log('Total communities:', communities.length);
        
        const featured = communities.filter(c => c.isFeatured);
        console.log('Featured communities:', featured.length);
        
        featured.forEach((community, index) => {
            console.log(`${index + 1}. ${community.name} - isFeatured: ${community.isFeatured}`);
        });
        
        // Also check the featured endpoint
        console.log('\nChecking /featured endpoint:');
        const featuredResponse = await axios.get('http://localhost:11001/api/v1/community/communities/featured');
        console.log('Featured endpoint response:', JSON.stringify(featuredResponse.data, null, 2));
        
    } catch (error) {
        console.error('Error:', error.message);
    }
}

checkFeaturedCommunities();