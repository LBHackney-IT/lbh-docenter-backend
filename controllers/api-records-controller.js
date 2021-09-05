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
        .map((rule) => rule.failureMessage);

      if (validationErrors?.length > 0)
        return {
          statusCode: 400,
          body: {
            validationErrors,
          },
        };

      try {
        return await implementation(event, context);
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
          return {
            statusCode: 500,
            body: {
              userMessage: "Unexpected server error.",
              errorMessage: e.message,
            },
          };
        }
      }
    };
  }

  create() {
    return this.baseEndpoint({
      validators: [
        {
          name: "API Name",
          failureMessage: "Please provide a non-empty API name.",
          validate: (inputObj) => nonEmpty(inputObj?.name),
        },
        {
          name: "Github Id",
          failureMessage: "Please provide a non-empy GithubId number.",
          validate: (inputObj) => typeof inputObj?.githubId === "number",
        },
        {
          name: "Base Url",
          failureMessage:
            "Please provide a valid and non-empty API's url base.",
          validate: (inputObj) => {
            const baseUrl = inputObj.baseUrl;
            const environments = !!baseUrl ? Object.keys(baseUrl) : []; //.filter((env) => !!env?.match(/^(development|staging|production)$/));
            return (
              baseUrl &&
              environments
                .map((env) => nonEmpty(baseUrl[env]))
                .reduce((acc, v) => acc || v, false)
            );
          },
        },
        {
          name: "Github Url",
          failureMessage: "Please provide a valid and non-empty Github url.",
          validate: (inputObj) => nonEmpty(inputObj?.githubUrl),
        },
      ],
      implementation: async (event, context) => {
        this._presentationDomainMapper.toDomain(event.body);
      },
    });
  }
}

module.exports = {
  APIRecordsController,
};
