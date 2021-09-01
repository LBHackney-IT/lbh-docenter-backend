"use strict";

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

    return {
      statusCode: 501,
    };
  },
  createAPI: async (event, context) => {},
  listAPIs: async (event, context) => {},
  getAPI: async (event, context) => {},
  patchAPI: async (event, context) => {},
};
