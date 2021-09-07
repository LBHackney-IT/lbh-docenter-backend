#!/bin/bash

BASEDIR=$(dirname "$0")

function create_table() {
    local LOC_SCHEMA_PATH=$1
    local LOC_TABLE_NAME=$(grep -oP 'TableName": ?"\K[^"]+' $1)

    echo -e "Attempting to create table: $LOC_TABLE_NAME\nFrom schema: $LOC_SCHEMA_PATH"
    
    (aws dynamodb list-tables --endpoint-url http://localhost:8000 | grep -wq "\b$LOC_TABLE_NAME\b")
    local LOC_TABLE_FOUND=$?

    if [[ $LOC_TABLE_FOUND -eq 0 ]]; then
        echo -e 'Table already exists. Skipping creation.\n'
    else
        aws dynamodb create-table \
            --cli-input-json file://$LOC_SCHEMA_PATH \
            --endpoint-url http://localhost:8000 \
            > /dev/null \
            && echo -e 'Table successfully created.\n' \
            || (echo -e '\nAn error occured table was not created!\n' \
                && exit 1)
    fi

    exit 0
}

find $BASEDIR/tables/ -type f | while read file; do create_table "$file"; done
