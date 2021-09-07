"use strict";
const AWS = require("aws-sdk");
const { APIRecordsGateway } = require("./gateways/api-records-gw");
const { APIRecordUseCase } = require("./usecases/api-record-uc");
const { PresentationDomainMapper } = require("./mappers/api-record-pd-mapper");
const { dynamodbClient } = require("./database-contexts/dynamodb");
const {
  APIRecordsController,
} = require("./controllers/api-records-controller");
const gateway = new APIRecordsGateway(dynamodbClient);
const pdMapper = new PresentationDomainMapper();
const dmMapper = new PresentationDomainMapper();
dmMapper["domainToData"] = dmMapper["toDomain"];
delete dmMapper["toDomain"];

const usecase = new APIRecordUseCase(gateway, dmMapper);
const controller = new APIRecordsController(usecase, pdMapper);

module.exports = {
  hello: async (event) => {
    return {
      statusCode: 200,
      body: JSON.stringify(
        {
          message: "Go Serverless v1.0! Your function executed successfully!",
          input: event,
        },
        null,
        2
      ),
    };
  },
  createAPI: controller.create(),
  listAPIs: async (event, context) => {
    return { statusCode: 501 };
  },
  getAPI: async (event, context) => {
    let getResult = {};
    try {
      let dynamodb = new AWS.DynamoDB.DocumentClient(options);
      getResult = await dynamodb
        .scan({
          TableName: "api-records",
          FilterExpression: "#gId = :gId",
          ExpressionAttributeNames: { "#gId": "githubId" },
          ExpressionAttributeValues: {
            ":gId": parseInt(event.pathParameters.id),
          },
        })
        .promise();
    } catch (getError) {
      console.log("There was a problem creating an API record.\n", getError);
      return {
        statusCode: 500,
        body: JSON.stringify({ getError: getError.message }),
        headers: { "Content-Type": "application/json" },
      };
    }
    if (getResult.Item === null) {
      return { statusCode: 404 };
    }
    return { statusCode: 200, body: JSON.stringify(getResult.Items) };
  },
  patchAPI: async (event, context) => {
    return { statusCode: 501 };
  },
};
