const axios = require('axios');
const { Parser } = require('htmlparser2');

const url = 'https://www.olx.kz/list/';

const parseHTML = (html) => {
    const listings = [];
    let currentListing = null;

    const parser = new Parser({
        onopentag(name, attribs) {
            if (name === 'div' && attribs['data-cy'] === 'l-card') {
                currentListing = {};
                listings.push(currentListing);
            }
            if (currentListing && name === 'a' && attribs.href) {
                currentListing.url = `https://www.olx.kz${attribs.href}`;
            }
            if (currentListing && name === 'h6') {
                currentListing.title = '';
                currentListing._collectTitle = true;
            }
            if (currentListing && name === 'p' && attribs['data-testid'] === 'ad-price') {
                currentListing.price = '';
                currentListing._collectPrice = true;
            }
            if (currentListing && name === 'p' && attribs['data-testid'] === 'location-date') {
                currentListing.locationDate = '';
                currentListing._collectLocationDate = true;
            }
        },
        ontext(text) {
            if (currentListing) {
                if (currentListing._collectTitle) {
                    currentListing.title += text;
                }
                if (currentListing._collectPrice) {
                    currentListing.price += text;
                }
                if (currentListing._collectLocationDate) {
                    currentListing.locationDate += text;
                }
            }
        },
        onclosetag(tagname) {
            if (currentListing && tagname === 'h6') {
                currentListing._collectTitle = false;
            }
            if (currentListing && tagname === 'p') {
                currentListing._collectPrice = false;
                currentListing._collectLocationDate = false;
            }
        }
    }, { decodeEntities: true });
    parser.write(html);
    parser.end();

    listings.forEach(listing => {
        delete listing._collectTitle;
        delete listing._collectPrice;
        delete listing._collectLocationDate;
        if (listing.price) {
            listing.price = listing.price.split('.css-')[0].trim();
        }
    });

    return listings;
};

const fetchListings = async () => {
    try {
        const response = await axios.get(url);
        const listings = parseHTML(response.data);
        return listings;
    } catch (error) {
        console.error('Error fetching listings:', error);
    }
};

module.exports = fetchListings;
