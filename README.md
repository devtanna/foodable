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

Get a list of X Random offers.

`query{ randomOffers(count:4 page:1 pageSize:3 locationSlug:"al-karama"){ _id, title, cuisine, offer, score, source, locationSlug, rating, cost_for_two, votes, image, href } }`

Get list of locations with offers

`query{ locationsWithOffers{ _id locationSlug, locationName } }`

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
