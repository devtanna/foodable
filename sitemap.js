const { createSitemap } = require('sitemap');
const baselines = require('./scraper/baseline_locations.json');

const urls = [
  {
    url: 'https://foodable.ae/about-us',
    changefreq: 'monthly',
  },
  {
    url: 'https://foodable.ae/privacy-policy',
    changefreq: 'monthly',
  },
  {
    url: 'https://foodable.ae/select-area',
    changefreq: 'monthly',
  },
  {
    url: 'https://foodable.ae/terms',
    changefreq: 'monthly',
  },
];

baselines.forEach(baseline =>
  urls.push({
    url: `https://foodable.ae/dubai/${baseline.slug}/`,
    changefreq: 'monthly',
  })
);

const sitemap = createSitemap({
  hostname: 'https://foodable.ae',
  urls,
});

module.exports = {
  sitemap,
};
