# Scrappers written in node

### Setup Manually:
```npm install```

### Running the scraper manually:
```node scraper/zomato.js```

### Docker Commands:
1) Install Docker

2) Build the Docker containers (need to run only once) ```docker-compose build```

3) Run the containers ```docker-compose up```
This will:
- Update the code in the container
- Run npm install in the container
- Start the server

4) Stop the containers  ```docker stop foodable```
                        ```docker stop mongo```

