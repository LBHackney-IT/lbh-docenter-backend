const {
  APIRecordsController,
} = require("./controllers/api-records-controller");
const { DynamoDBException } = require("./models/exceptions/dynamoException");
const _faker = require("faker");

describe("API Records Controller", () => {
  let classUnderTest, mockUseCase;

  beforeAll(() => {
    mockUseCase = {
      executePost: jest.fn(),
    };
    classUnderTest = new APIRecordsController(mockUseCase);
  });

  afterEach(() => {
    mockUseCase.executePost.mockReset();
  });

  describe("Base endpoint method", () => {
    it("should return a function that accepts & passes AWS API gateway's event and context objects into custom implementation", async () => {
      // arrange
      const event = {
        body: { inputProp: _faker.datatype.number() },
        pathParameters: { duckId: _faker.datatype.number() },
      };
      const context = { someContextProp: _faker.random.word() };

      const customImplementation = jest.fn();

      const endpoint = classUnderTest.baseEndpoint({
        validators: [],
        implementation: customImplementation,
      });

      // act
      await endpoint(event, context);

      // assert
      expect(customImplementation).toHaveBeenCalledTimes(1);
      expect(customImplementation).toHaveBeenCalledWith(event, context);
    });

    it("should return a function that passes AWS API gateway's event's pathParameters and body fields combined into a single object to each validator", async () => {
      // arrange
      const event = {
        testProp: _faker.random.word(),
        body: {
          inputProp1: _faker.datatype.number(),
          inputProp2: _faker.random.word(),
        },
        pathParameters: {
          duckId: _faker.datatype.number(),
        },
      };

      const context = { someContextProp: _faker.random.word() };

      const mockValidators = [...new Array(3).keys()].map(() => {
        return {
          failureMessage: _faker.random.words(3),
          validate: jest.fn(),
        };
      });

      const endpoint = classUnderTest.baseEndpoint({
        validators: mockValidators,
        implementation: () => {},
      });

      const combinedInputsObj = { ...event.pathParameters, ...event.body };

      // act
      await endpoint(event, context);

      // assert
      mockValidators.forEach((validator) => {
        expect(validator.validate).toHaveBeenCalledTimes(1);
        expect(validator.validate).toHaveBeenCalledWith(combinedInputsObj);
      });
    });

    it("should return a function that handles DynamoDB failure within implementation by returning a custom response", async () => {
      // arrange
      const event = { pathParameters: "", body: "" };
      const context = {};

      const expectedErrorMessage = _faker.random.words(3);

      const endpoint = classUnderTest.baseEndpoint({
        validators: [],
        implementation: () => {
          throw new DynamoDBException(expectedErrorMessage);
        },
      });

      const expectedResponse = {
        statusCode: 503,
        body: {
          userMessage: "Dynamo client error. Please try again later.",
          errorMessage: expectedErrorMessage,
        },
      };

      // act
      const endpointResponse = await endpoint(event, context);

      // assert
      expect(endpointResponse).toStrictEqual(expectedResponse);
    });

    it("should return a function that handles Any type of error from within implementation function by returning a custom response", async () => {
      // arrange
      const event = { pathParameters: "", body: "" };
      const context = {};

      const expectedErrorMessage = _faker.random.words(3);

      const endpoint = classUnderTest.baseEndpoint({
        validators: [],
        implementation: () => {
          throw new Error(expectedErrorMessage);
        },
      });

      const expectedResponse = {
        statusCode: 500,
        body: {
          userMessage: "Unexpected server error.",
          errorMessage: expectedErrorMessage,
        },
      };

      // act
      const endpointResponse = await endpoint(event, context);

      // assert
      expect(endpointResponse).toStrictEqual(expectedResponse);
    });

    it("should return a function that upon successful code execution forwards the server response from implementation back to API Gateway", async () => {
      // arrange
      const event = { pathParameters: "", body: "" };
      const context = {};

      const expectedResponse = {
        statusCode: 200,
        body: {
          data: {
            prop1: "Heart of the Cards, guide me! I draw!",
            prop2: 40,
          },
        },
      };

      const endpoint = classUnderTest.baseEndpoint({
        validators: [],
        implementation: () => expectedResponse,
      });

      // act
      const endpointResponse = await endpoint(event, context);

      // assert
      expect(endpointResponse).toStrictEqual(expectedResponse);
    });

    it("should return a function that returns validators' returned validation errors in a custom 400 bad input response", async () => {
      // arrange
      const event = { pathParameters: "", body: "" };
      const context = {};

      const mockValidators = [...new Array(3).keys()].map((num) => {
        return {
          failureMessage: _faker.random.words(3),
          validate: jest.fn().mockReturnValue(num % 2 !== 0),
        };
      });

      const expectedResponse = {
        statusCode: 400,
        body: {
          validationErrors: mockValidators
            .filter((_, i) => i % 2 === 0)
            .map((v) => v.failureMessage),
        },
      };

      const endpoint = classUnderTest.baseEndpoint({
        validators: mockValidators,
        implementation: () => {},
      });

      // act
      const endpointResponse = await endpoint(event, context);

      // assert
      expect(endpointResponse).toStrictEqual(expectedResponse);
    });
  });
});
