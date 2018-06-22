#!/bin/bash -e

export COMPOSE_FILE=docker-compose/test.yml
export COMPOSE_PROJECT_NAME=health_check_server_test

docker-compose config -q
docker-compose up -d pg minio
sleep 10
docker-compose run --rm web npm test
docker-compose down
