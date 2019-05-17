# Scrappers written in node

### Running the scrapers:
```node scraper/location.js```
Run this first to load the locations

- ```node scraper/zomato.js```
- ```node scraper/talabat.js```
- ```node scraper/deliveroo.js```
- ```node scraper/carriage.js```
- ```node scraper/ubereats.js```


This is the only subset of scrapers working for now. More will be added when availible here. You can run these in any order at any given time.

- ```node scraper/reindex_offers.js```


Run this at any given time after any number of scraper runs to generate the offers.


### Docker Commands:
1) Install Docker

2) Build and Run the containers 
    - ```docker-compose up --build foodable_front```

    This is for the frontend. Port: ```5000!```

    - ```docker-compose up --build foodable_back```
    
    This is for the backend. Port: ```4000!```

3) Stop the containers  
- ```docker stop foodable_front```
- ```docker stop foodable_back```
- ```docker stop mongo```

4) Endpoints:
    - ```http://localhost:4000/graphql```

### Example Queries:
Get all locations

`query{
  locations(page:1 pageSize:3){
    _id,
    locationSlug,
    locationName
  }
}`

Get offers in a certain location input. Each offer item is sorted in descending order by score internally.

`query{
  offers(page:1 pageSize:3, locationSlug:"al-karama"){
    _id,
    offers{
      title,
      cuisine,
      offer,
      score,
      source,
      locationSlug,
      rating,
      cost_for_two,
      votes,
      image,
      href
    }
  }
}`


Get a list of X Random offers.

`
query{
  randomOffers(count:4 page:1 pageSize:3 locationSlug:"al-karama"){
    _id,
    offers{
      title,
      cuisine,
      offer,
      score,
      source,
      locationSlug,
      rating,
      cost_for_two,
      votes,
      image,
      href
    }
  }
}`

Please Note: 
    - You will need to run the scraper manually to poopulate the db with data.
