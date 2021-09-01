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
  createAPI: async (event, context) => {},
  listAPIs: async (event, context) => {},
  getAPI: async (event, context) => {},
  patchAPI: async (event, context) => {},
};
