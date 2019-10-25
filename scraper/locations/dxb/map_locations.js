const baselineLocations = require('./baseline_locations.json');
const utils = require('./utils');
const fs = require('fs');
const path = require('path');
const prompts = require('prompts');
const outputBaselineFile = path.join(__dirname, 'baseline_locations.json');

const green = '\x1b[32m';
const red = '\x1b[31m';
const blue = '\x1b[34m';

const Fuse = require('fuse.js');

const fuse = new Fuse(baselineLocations, {
  keys: ['slug'],
  shouldSort: true,
  includeScore: true,
  threshold: 0.3,
});

const scrapers = ['talabat', 'carriage', 'deliveroo', 'zomato', 'eateasy'];

(async () => {
  let updateBaseline = false;

  const { scraper } = await prompts({
    type: 'text',
    name: 'scraper',
    message: 'Which scraper would you like to map?',
    validate: value => (scrapers.indexOf(value) === -1 ? 'Invalid scraper' : true),
  });

  console.log(blue, `MAPPING SCRAPER: ${scraper.toUpperCase()}`);

  const scrapedLocations = require(`./${scraper}_locations.json`);
  const outputFile = path.join(__dirname, `${scraper}_locations.json`);

  for (let i = 0; i < scrapedLocations.length; i++) {
    let location = scrapedLocations[i];

    let result = fuse.search(utils.slugify(location.locationName));

    if (result.length || (result.length && result[0].score < 0.2)) {
      let best = result[0];
      location.baseline = best.item.slug;
      console.log(green, `${location.locationName} == ${best.item.locationName}`);
    } else {
      console.log(red, `No a good enough result for: ${location.locationName}`);

      const { answer } = await prompts({
        type: 'text',
        name: 'answer',
        message: `Add ${location.locationName} to baselines? (Y)es, (N)o or (R)ename`,
        validate: value => (['Y', 'N', 'R'].indexOf(value) === -1 ? 'Answer with (Y)es, (N)o or (R)ename' : true),
      });

      switch (answer) {
        case 'Y':
          let slugified1 = utils.slugify(location.locationName);
          location.baseline = [slugified1];
          if (!baselineLocations.find(item => item.slug === slugified1)) {
            baselineLocations.push({
              locationName: location.locationName,
              slug: slugified1,
            });
            if (!updateBaseline) updateBaseline = true;
          }
          break;
        case 'N':
          location.baseline = [];
          break;
        case 'R':
          const { renameTo } = await prompts({
            type: 'text',
            name: 'renameTo',
            message: `Add non slugified baseline name for ${location.locationName}`,
            validate: value => (value === '' ? 'Add name' : true),
          });
          let slugified2 = utils.slugify(renameTo);
          location.baseline = [slugified2];
          if (!baselineLocations.find(item => item.slug === slugified2)) {
            baselineLocations.push({
              locationName: renameTo,
              slug: slugified2,
            });
            if (!updateBaseline) updateBaseline = true;
          }
          break;
        default:
          break;
      }
    }
  }

  if (updateBaseline) {
    fs.writeFile(outputBaselineFile, JSON.stringify(baselineLocations, null, 2), err =>
      err ? console.log(err) : 'Done!'
    );
  }

  fs.writeFile(outputFile, JSON.stringify(scrapedLocations, null, 2), err => (err ? console.log(err) : 'Done!'));

  console.log(blue, `-------------------${scraper.toUpperCase()} DONE-----------------------`);
})();
