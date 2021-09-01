"use strict";
const AWS = require("aws-sdk");

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
  createAPI: async (event, context) => {
    let payload = {};
    try {
      payload = JSON.parse(event.body);
    } catch (jsonError) {
      console.log("There was an error parsing json body:\n", jsonError);
      return {
        statusCode: 400,
      };
    }

    // basic validation
    if (
      typeof payload.name === "undefined" ||
      typeof payload.baseUrl === "undefined"
    ) {
      console.log("Missing required parameters");
      return {
        statusCode: 422,
      };
    }

    let createParams = {
      TableName: process.env.DYNAMODB_APIS_TABLE,
      // should do parsing elsewhere
      Item: {
        name: payload.name,
        baseUrl: payload.baseUrl,
      },
    };

    let putResult = {};
    try {
      let dynamodb = new AWS.DynamoDB.DocumentClient();
      putResult = await dynamodb.put(createParams).promise();
    } catch (createError) {
      console.log("There was a problem creating an API record.\n", createError);
      console.log("Create parameters: ", createParams);
      return {
        statusCode: 500,
        message: createError,
      };
    }

    return {
      statusCode: 201,
    };
  },
  listAPIs: async (event, context) => {
    return {
      statusCode: 501,
    };
  },
  getAPI: async (event, context) => {
    return {
      statusCode: 501,
    };
  },
  patchAPI: async (event, context) => {
    return {
      statusCode: 501,
    };
  },
};
