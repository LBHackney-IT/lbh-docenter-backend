const {
  APIRecordsController,
} = require("./controllers/api-records-controller");
const { DynamoDBException } = require("./models/exceptions/dynamoException");
const _faker = require("faker");
const randexp = require("randexp").randexp;

describe("API Records Controller", () => {
  let classUnderTest, mockUseCase, mockMapper;

  beforeAll(() => {
    mockMapper = {
      toDomain: jest.fn(),
    };
    mockUseCase = {
      executePost: jest.fn(),
    };
    classUnderTest = new APIRecordsController(mockUseCase, mockMapper);
  });

  afterEach(() => {
    mockUseCase.executePost.mockReset();
    mockMapper.toDomain.mockReset();
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

  describe("Create method", () => {
    // TODO: don't test all of them at once!
    it("should return a function that performs validation on user input to check whether the required fields are non-empty", async () => {
      // arrange
      const event = {};
      const context = {};

      const expectedResponse = {
        statusCode: 400,
        body: {
          validationErrors: [
            "Please provide a non-empty API name.",
            "Please provide a non-empy GithubId number.",
            "Please provide a valid and non-empty API's url base.",
            "Please provide a valid and non-empty Github url.",
          ],
        },
      };

      const endpoint = classUnderTest.create();

      // act
      const endpointResponse = await endpoint(event, context);

      // assert
      expect(endpointResponse).toStrictEqual(expectedResponse);
    });

    it("should return a function that performs validation checking whether GithubId is a number", async () => {
      // arrange
      const event = {
        body: {
          name: _faker.random.word(3),
          githubId: _faker.datatype.number(10 ** 9, 10 ** 10 - 1).toString(),
          baseUrl: {
            [randexp(/development|staging|production/)]: _faker.internet.url(),
          },
          githubUrl: _faker.internet.url(),
        },
      };
      const context = {};

      const expectedResponse = {
        statusCode: 400,
        body: {
          validationErrors: ["Please provide a non-empy GithubId number."],
        },
      };

      const endpoint = classUnderTest.create();

      // act
      const endpointResponse = await endpoint(event, context);

      // assert
      expect(endpointResponse).toStrictEqual(expectedResponse);
    });

    it("should return a function that calls the presentation to domain mapper with the input event body", async () => {
      // arrange
      const event = {
        body: {
          name: _faker.random.word(3),
          githubId: _faker.datatype.number(),
          baseUrl: { staging: _faker.internet.url() },
          githubUrl: _faker.internet.url(),
        },
      };
      const context = {};

      const endpoint = classUnderTest.create();

      // act
      await endpoint(event, context);

      // assert
      expect(mockMapper.toDomain).toHaveBeenCalledTimes(1);
      expect(mockMapper.toDomain).toHaveBeenCalledWith(event.body);
    });

    it("should return a function that calls the use case with the the output of presentation to domain mapper", async () => {
      // arrange
      const event = {
        body: {
          name: _faker.random.word(3),
          githubId: _faker.datatype.number(),
          baseUrl: { staging: _faker.internet.url() },
          githubUrl: _faker.internet.url(),
        },
      };
      const context = {};
      const dummyMapperResponse = {
        prop1: "abc",
        prop2: 78,
      };

      mockMapper.toDomain.mockReturnValue(dummyMapperResponse);

      const endpoint = classUnderTest.create();

      // act
      await endpoint(event, context);

      // assert
      expect(mockUseCase.executePost).toHaveBeenCalledTimes(1);
      expect(mockUseCase.executePost).toHaveBeenCalledWith(dummyMapperResponse);
    });

    it("should retuned a function that returns 201 Created upon successful, error-free execution.", async () => {
      // arrange
      const event = {
        body: {
          name: _faker.random.word(3),
          githubId: _faker.datatype.number(),
          baseUrl: { staging: _faker.internet.url() },
          githubUrl: _faker.internet.url(),
        },
      };
      const context = {};

      const endpoint = classUnderTest.create();

      const expectedResponse = {
        statusCode: 201,
      };

      // act
      const endpointResponse = await endpoint(event, context);

      // assert
      expect(endpointResponse).toStrictEqual(expectedResponse);
    });
  });
});
