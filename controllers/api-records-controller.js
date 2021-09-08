const { DynamoDBException } = require("../models/exceptions/dynamoException");
const { nonEmpty } = require("../helpers/actual/validation");
const {
  DuplicateRecordException,
} = require("../models/exceptions/duplicateRecordException");

class APIRecordsController {
  constructor(apiRecordUseCase, apiRecordsPDMapper) {
    this._apiRecordUseCase = apiRecordUseCase;
    this._apiRecordsPDMapper = apiRecordsPDMapper;
  }

  baseEndpoint({ validators, implementation }) {
    return async (event, context) => {
      // TODO: Adjust the tests to work with body as a string!
      // Add test for baseEndpoint parsing event.body
      // from typeof string to typeof object
      // should equal to self deparsed

      /*
TODO: test this case when body is null
SyntaxError: Unexpected token u in JSON at position 0
        at JSON.parse (<anonymous>)

      17 |       // from typeof string to typeof object
      18 |       // should equal to self deparsed
    > 19 |       const payload = JSON.parse(event.body);
      */
      const payload = JSON.parse(event.body);
      event.body = payload;
      const validationErrors = validators
        ?.filter(
          (rule) =>
            !rule.validate({
              ...event.pathParameters,
              ...payload,
            })
        )
        .map((rule) => rule.failureMessage);

      if (validationErrors?.length > 0)
        return {
          statusCode: 400,
          body: JSON.stringify({
            validationErrors,
          }),
        };

      try {
        return await implementation(event, context);
      } catch (e) {
        if (e instanceof DuplicateRecordException) {
          return {
            statusCode: 409,
            body: JSON.stringify({
              userMessage: e.message,
              errorMessage: e.message,
            }),
          };
        } else if (e instanceof DynamoDBException) {
          return {
            statusCode: 503,
            body: JSON.stringify({
              userMessage: "Dynamo client error. Please try again later.",
              errorMessage: e.message,
            }),
          };
        } else {
          return {
            statusCode: 500,
            body: JSON.stringify({
              userMessage: "Unexpected server error.",
              errorMessage: e.message,
            }),
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
        const domainBoundary = this._apiRecordsPDMapper.toDomain(event.body);
        await this._apiRecordUseCase.executePost(domainBoundary);
        return {
          statusCode: 201,
        };
      },
    });
  }

  get() {
    return this.baseEndpoint({
      validators: [
        {
          name: "API id",
          failureMessage: "Please provide a non-empty API id.",
          validate: (inputObj) => nonEmpty(inputObj?.id),
        },
      ],
      implementation: async (event, context) => {
        const domainBoundary = this._apiRecordsPDMapper.presentationToDomainGet(
          event.pathParameters
        );
        await this._apiRecordUseCase.executeGet(domainBoundary);
      },
    });
  }
}

module.exports = {
  APIRecordsController,
};
