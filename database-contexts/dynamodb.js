const AWS = require("aws-sdk");

const isOffline = process.env.IS_OFFLINE;
const isTest = process.env.JEST_UNIT;

let options = {};
if (isOffline || isTest) {
  options = {
    region: "localhost",
    endpoint: "http://localhost:8000",
  };
}

let dynamodbClient = new AWS.DynamoDB.DocumentClient(options);

module.exports = { dynamodbClient };
