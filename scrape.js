const scavenger = require('scavenger');
const cheerio = require('cheerio');
const urls = [
    'http://www.darinburris.com/',
    "http://www.darinburris.com/about/",
    "http://www.darinburris.com/work/"
]
// Multiple urls with mapFn (get length of html for each scraped page)
scavenger.scrape(
    urls,
    function(html){
        let $ = cheerio.load(html);
        return $('title').text();
    }
).then((dom) => {
    console.log('dom= ',dom);
});
