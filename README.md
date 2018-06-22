# health-check-service
Services health check API

### Supported services
- AWS
- Postgres
- Redis
- SMTP
- MongoDb
- RabbitMQ

### Install
```bash
npm i -S @eldarseytablaev/health-check-service
```

#### Example and Dev
- Docker stack deploy
    ```bash
    docker stack deploy -c docker-compose.yml health_check_server_stack
    ```
- Start Example App
    ```bash
    npm run start:example:app
    ```
- Fetch service status info:
    ```bash
    # if not exists
    brew install httpie

    http -v http://127.0.0.1:3000/health
    ```
- Docker stack remove
    ```bash
    docker stack rm health_check_server_stack
    ```
