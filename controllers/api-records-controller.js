const { DynamoDBException } = require("../models/exceptions/dynamoException");
const { nonEmpty } = require("../helpers/actual/validation");

class APIRecordsController {
  constructor(apiRecordUC, presentationDomainMapper) {
    this._apiRecordUC = apiRecordUC;
    this._presentationDomainMapper = presentationDomainMapper;
    this.create = this.create.bind(this);
  }

  baseEndpoint({ validators, implementation }) {
    return async (event, context) => {
      const validationErrors = validators
        ?.filter(
          (rule) => !rule.validate({ ...event.pathParameters, ...event.body })
        )

      try {
        await implementation(event, context);
      } catch (e) {
        if (e instanceof DynamoDBException) {
          return {
            statusCode: 503,
            body: {
              userMessage: "Dynamo client error. Please try again later.",
              errorMessage: e.message,
            },
          };
        } else {
        }
      }
    };
  }
}

module.exports = {
  APIRecordsController,
};
