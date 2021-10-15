const { DynamoDBException } = require("../models/exceptions/dynamoException");
const { nonEmpty } = require("../helpers/actual/validation");
const {
  DuplicateRecordException,
} = require("../models/exceptions/duplicateRecordException");
const {
  RecordNotFoundException,
} = require("../models/exceptions/recordNotFoundException");

class APIRecordsController {
  constructor(apiRecordUseCase, apiRecordsPDMapper) {
    this._apiRecordUseCase = apiRecordUseCase;
    this._apiRecordsPDMapper = apiRecordsPDMapper;
  }

  baseEndpoint({ validators, implementation }) {
    return async (event, context) => {
      const payload = JSON.parse(event.body);
      event.body = payload;

      const validationErrors = validators
        ?.filter(
          (rule) => !rule.validate({ ...event.pathParameters, ...payload })
        )
        .map((rule) => rule.failureMessage);

      if (validationErrors?.length > 0)
        return {
          statusCode: 400,
          body: JSON.stringify({ validationErrors }),
        };

      try {
        const controllerResponse = await implementation(event, context);
        if (controllerResponse.body)
          controllerResponse.body = JSON.stringify(controllerResponse.body);
        return controllerResponse;
      } catch (e) {
        if (e instanceof RecordNotFoundException) {
          return {
            statusCode: 404,
            body: JSON.stringify({
              userMessage: e.message,
              errorMessage: e.message,
            }),
          };
        } else if (e instanceof DuplicateRecordException) {
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
            const environments = baseUrl ? Object.keys(baseUrl) : []; //.filter((env) => !!env?.match(/^(development|staging|production)$/));
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
        const usecaseResult = await this._apiRecordUseCase.executeGet(
          domainBoundary
        );
        const presentationBoundary =
          await this._apiRecordsPDMapper.domainToPresentationGet(usecaseResult);
        return {
          statusCode: 200,
          body: presentationBoundary,
        };
      },
    });
  }

  listAPIs() {
    return this.baseEndpoint({
      validators: [],
      implementation: async (event, context) => {
        const usecaseResult = await this._apiRecordUseCase.executeList();
        const apisList = usecaseResult.map((r) => {
          return {
            id: r.id,
            githubId: r.githubId,
            name: r.name,
          };
        });
        return {
          statusCode: 200,
          body: apisList,
        };
      },
    });
  }
}

module.exports = {
  APIRecordsController,
};
