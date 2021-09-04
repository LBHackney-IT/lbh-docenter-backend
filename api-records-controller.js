"use strict";
const AWS = require("aws-sdk");

let options = {};
if (process.env.IS_OFFLINE) {
  options = {
    region: "localhost",
    endpoint: "http://localhost:8000",
  };
}
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
      console.log(event.body);
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
        id: payload.id,
        name: payload.name,
        baseUrl: payload.baseUrl,
      },
    };

    try {
      let dynamodb = new AWS.DynamoDB.DocumentClient(options);
      await dynamodb.put(createParams).promise();
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
    let getParams = {
      TableName: process.env.DYNAMODB_APIS_TABLE,
      Key: {
        id: event.pathParameters.id,
      },
    };

    let getResult = {};
    try {
      let dynamodb = new AWS.DynamoDB.DocumentClient(options);
      getResult = await dynamodb.get(getParams).promise();
    } catch (getError) {
      console.log("There was a problem creating an API record.\n", getError);
      console.log("Create parameters: ", getParams);
      return {
        statusCode: 500,
        message: getError,
      };
    }

    if (getResult.Item === null) {
      return {
        statusCode: 404,
      };
    }

    return {
      statusCode: 200,
      // do custom mapping here
      body: JSON.stringify({
        name: getResult.Item.name,
        baseUrl: getResult.Item.baseUrl,
      }),
    };
  },
  patchAPI: async (event, context) => {
    return {
      statusCode: 501,
    };
  },
};
