# Foodable

### Running the scrapers locally:

`node scraper/location.js`
Run this first to load the locations

- `node scraper/zomato.js`
- `node scraper/talabat.js`
- `node scraper/deliveroo.js`
- `node scraper/carriage.js`
- `node scraper/ubereats.js`

* `node scraper/reindex2.js`

Run this at any given time after any number of scraper runs to generate the offers.

# Docker:

Install Docker

#### Running the foodable stack:

_Build_ the stack like this

`docker-compose up --build scraper foodable_front foodable_back mongo nginx-proxy`

Then to _stop_ the stack

`docker stop scraper foodable_front foodable_back mongo nginx-proxy`

Then to _start_ the stack

`docker-compose up scraper foodable_front foodable_back mongo nginx-proxy`

#### Docker endpoints:

Please add the line `127.0.0.1 foodable.local` to your /etc/hosts. Remember to edit the hosts file with sudo.

Endpoints:

- `http://foodable.local:8090/`
- `http://foodable.local:8090/graphql`

### Database cleanup:

`node scraper/cleanup/dbClean.js`

### Running a test run of scrapers

1. Build the scraper container (only has to be done once) or skip if you followed the docker setup above
2. Once built it will run a script to run all scrapers
3. If you want to run the scrapers again
   a) `docker stop scraper`
   b) `docker start scraper`
4. The scraper takes about 4min to complete (this is just a test run (subset) of all scraper results)

### Example Queries:

Get all locations

`query{ locations(page:1 pageSize:3){ _id, locationSlug, locationName } }`

Get offers in a certain location input. Each offer item is sorted in descending order by score internally.

`query{ offers(page:1 pageSize:3, locationSlug:"al-karama"){ _id, offers{ title, cuisine, offer, score, source, locationSlug, rating, cost_for_two, votes, image, href } } }`

Get offers in a certain location input with keyword and cuisine search
`{ offers(page: 1, pageSize: 2, locationSlug: "al-karama", keywords: "cafe", cuisine: "indian chinese") { _id offers { title cuisine offer score source locationSlug rating cost_for_two votes image href } } }`

Get a list of X Random offers.

`query{ randomOffers(count:4 page:1 pageSize:3 locationSlug:"al-karama"){ _id, title, cuisine, offer, score, source, locationSlug, rating, cost_for_two, votes, image, href } }`

Get list of locations with offers

`query{ locationsWithOffers{ _id locationSlug, locationName } }`

Get list of cuisines indexed by scraper so far

`query{fetchCuisine{type,tags}}`

Get list of Restaurants by keyword

`query{ findByKeyword(page:1 pageSize:10 keyword:"pizza"){ title, cuisine, offer, score, source, locationSlug, rating, cost_for_two, votes, image, href }}`

ENDPOINT for contact us
`http://foodable.local:8090/contactus`

POST DATA Example for contact us
`{ "email": "\"dev.tanna@gmail.com\"", "message": "\"test message\"" }`

ENDPOINT for subscribe
`http://foodable.local:8090/subscribe`

POST DATA Example for subscribe
`{ "email": "\"dev.tanna@gmail.com\"" }`

### Production How-To Run Full Scrape

Running a full scrape to update data on Production involves these steps:

- Run `npm install` to make sure your local node_modules is up to date

- Make sure mongo is running locally `docker start mongo`

- Make sure test_mode is set to `false` in settings.py

- Clean up local db collection so we start from clean state
    
   `mongo foodabledb --eval 'db.collection_99_99_99.drop()'`
    
   You should see a `true` at the end once the command is executed
- Run all scrapers for your localhost environment
    
   `sh ./docker_run_all_scrapers_script.sh`
- Export data from mongo localhost into json file
    
   `mongoexport --host localhost:27017,localhost:27017 --db foodabledb --collection collection_99_99_99 --type json --out datadump.json`
- Check file is created.

- Import the file onto Mongo atlas which is production db
  `mongoimport --host foodable-Cluster0-shard-0/foodable-cluster0-shard-00-00-zyyjg.gcp.mongodb.net:27017,foodable-cluster0-shard-00-01-zyyjg.gcp.mongodb.net:27017,foodable-cluster0-shard-00-02-zyyjg.gcp.mongodb.net:27017 --ssl --username devtanna --password K4eh5Ds2MrDkAk5I --authenticationDatabase admin --db foodabledb --collection collection_99_99_99 --drop --type json --file datadump.json`

- Once uploaded clean up by deleting the json file created
  `rm datadump.json 2> /dev/null`

### Deploying to production involves two things

1. Building the image - This is done when all changes are commited and now we want to start deploying to production.
   So we make a commit into `master` branch with the following commit message `Triggering image build [image-build]`
   This exact message will start a CI pipeline on gitlab to build and push the images to DockerHub

2. Rolling out new image to GKE

   WARNING: Please do this only after the CI pipeline is finished on gitlab.

   For this step you will need your correct GCP credentials on the foodable cluster. You will also need kubectl linked to the foodable cluster on GCP. Once this is done you run the following two commands.
   a) `kubectl scale --replicas=0 deployments/foodable-deployment`

   b) `kubectl scale --replicas=1 deployments/foodable-deployment`
