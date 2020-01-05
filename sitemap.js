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
    url: 'https://foodable.ae/',
    changefreq: 'weekly',
  },
];

CITIES.forEach(city => {
  const baselines = require(`./scraper/locations/${city.slug}/baseline_locations.json`);

  baselines.forEach(baseline =>
    urls.push({
      url: `https://foodable.ae/${city.name}/${baseline.slug}/`,
      changefreq: 'weekly',
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
