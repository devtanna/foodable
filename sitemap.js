const { createSitemap } = require('sitemap');
const baselines = require('./scraper/baseline_locations.json');

const urls = [
  {
    url: 'http://foodable.ae/about-us/',
    changefreq: 'monthly',
  },
  {
    url: 'http://foodable.ae/privacy-policy/',
    changefreq: 'monthly',
  },
  {
    url: 'http://foodable.ae/select-area/',
    changefreq: 'monthly',
  },
  {
    url: 'http://foodable.ae/terms/',
    changefreq: 'monthly',
  },
];

baselines.forEach(baseline =>
  urls.push({
    url: `http://foodable.ae/dubai/${baseline.slug}/`,
    changefreq: 'monthly',
  })
);

const sitemap = createSitemap({
  hostname: 'http://foodable.ae',
  urls,
});

module.exports = {
  sitemap,
};
