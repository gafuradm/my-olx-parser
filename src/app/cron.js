const cron = require('node-cron');
const fetchListings = require('./parser');
const fs = require('fs');
const path = require('path');

cron.schedule('*/30 * * * *', async () => {
    try {
        console.log('Fetching latest listings...');
        const listings = await fetchListings();
        console.log('Fetched listings:', listings);
    } catch (error) {
        console.error('Error fetching listings:', error);
    }
});

console.log('Cron job scheduled to run every 30 minutes.');
