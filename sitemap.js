const { createSitemap } = require('sitemap');
const CITIES = [
  {
    slug: 'dxb',
    name: 'dubai',
  },
  {
    slug: 'shj',
    name: 'sharjah',
  },
  {
    slug: 'ad',
    name: 'abu-dhabi',
  },
];

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
  {
    url: 'https://foodable.ae/favourites',
    changefreq: 'monthly',
  },
];

CITIES.forEach(city => {
  const baselines = require(`./scraper/locations/${city.slug}/baseline_locations.json`);

  baselines.forEach(baseline =>
    urls.push({
      url: `https://foodable.ae/${city.name}/${baseline.slug}/`,
      changefreq: 'monthly',
    })
  );
});

const sitemap = createSitemap({
  hostname: 'https://foodable.ae',
  urls,
});

module.exports = {
  sitemap,
};
