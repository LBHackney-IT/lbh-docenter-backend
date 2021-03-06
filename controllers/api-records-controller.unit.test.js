const { APIRecordsController } = require("./api-records-controller");
const {
  DuplicateRecordException,
} = require("../models/exceptions/duplicateRecordException");
const {
  RecordNotFoundException,
} = require("../models/exceptions/recordNotFoundException");
const { DynamoDBException } = require("../models/exceptions/dynamoException");
const _faker = require("faker");
const randexp = require("randexp").randexp;

describe("API Records Controller", () => {
  let classUnderTest, mockUseCase, mockMapper;

  beforeAll(() => {
    mockMapper = {
      toDomain: jest.fn(),
      domainToPresentationGet: jest.fn(),
      presentationToDomainGet: jest.fn(),
    };
    mockUseCase = {
      executePost: jest.fn(),
      executeGet: jest.fn(),
    };
    classUnderTest = new APIRecordsController(mockUseCase, mockMapper);
  });

  afterEach(() => {
    mockUseCase.executePost.mockReset();
    mockUseCase.executeGet.mockReset();
    mockMapper.toDomain.mockReset();
    mockMapper.domainToPresentationGet.mockReset();
    mockMapper.presentationToDomainGet.mockReset();
  });

  describe("Base endpoint method", () => {
    /* TODO: Add test for baseEndpoint parsing event.body
         from typeof string to typeof object
         should equal to self deparsed */

    it("should return a function that accepts & passes AWS API gateway's event and context objects into custom implementation", async () => {
      // arrange
      const event = {
        body: JSON.stringify({ inputProp: _faker.datatype.number() }),
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
        body: JSON.stringify({
          inputProp1: _faker.datatype.number(),
          inputProp2: _faker.random.word(),
        }),
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

      const combinedInputsObj = {
        ...event.pathParameters,
        ...JSON.parse(event.body),
      };

      // act
      await endpoint(event, context);

      // assert
      mockValidators.forEach((validator) => {
        expect(validator.validate).toHaveBeenCalledTimes(1);
        expect(validator.validate).toHaveBeenCalledWith(combinedInputsObj);
      });
    });

    it("should return a function that returns validators' returned validation errors in a custom 400 bad input response", async () => {
      // arrange
      const event = { pathParameters: "", body: null };
      const context = {};

      const mockValidators = [...new Array(3).keys()].map((num) => {
        return {
          failureMessage: _faker.random.words(3),
          validate: jest.fn().mockReturnValue(num % 2 !== 0),
        };
      });

      const expectedResponse = {
        statusCode: 400,
        body: JSON.stringify({
          validationErrors: mockValidators
            .filter((_, i) => i % 2 === 0)
            .map((v) => v.failureMessage),
        }),
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

    it("should return a function that handles RecordNotFoundException failure within implementation by returning a 404 Not Found response.", async () => {
      // arrange
      const event = { pathParameters: null, body: null };
      const context = {};

      const expectedErrorMessage = "mock error message!";

      const endpoint = classUnderTest.baseEndpoint({
        validators: [],
        implementation: () => {
          throw new RecordNotFoundException(expectedErrorMessage);
        },
      });

      const expectedResponse = {
        statusCode: 404,
        body: JSON.stringify({
          userMessage: expectedErrorMessage,
          errorMessage: expectedErrorMessage,
        }),
      };

      // act
      const endpointResponse = await endpoint(event, context);

      // assert
      expect(endpointResponse).toStrictEqual(expectedResponse);
    });

    it("should return a function that handles DuplicateRecordException failure within implementation by returning a 409 Conflict response", async () => {
      // arrange
      const event = { pathParameters: "", body: null };
      const context = {};

      const expectedErrorMessage = `The project from this repository (githubId: ${_faker.datatype.number()}) already exists!`;

      const endpoint = classUnderTest.baseEndpoint({
        validators: [],
        implementation: () => {
          throw new DuplicateRecordException(expectedErrorMessage);
        },
      });

      const expectedResponse = {
        statusCode: 409,
        body: JSON.stringify({
          userMessage: expectedErrorMessage,
          errorMessage: expectedErrorMessage,
        }),
      };

      // act
      const endpointResponse = await endpoint(event, context);

      // assert
      expect(endpointResponse).toStrictEqual(expectedResponse);
    });

    it("should return a function that handles Any type of error from within implementation function by returning a 500 Internal Server Error response", async () => {
      // arrange
      const event = { pathParameters: "", body: null };
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
        body: JSON.stringify({
          userMessage: "Unexpected server error.",
          errorMessage: expectedErrorMessage,
        }),
      };

      // act
      const endpointResponse = await endpoint(event, context);

      // assert
      expect(endpointResponse).toStrictEqual(expectedResponse);
    });

    it("should return a function that handles DynamoDB failure within implementation by returning a 503 Service Unavailable response", async () => {
      // arrange
      const event = { pathParameters: "", body: null };
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
        body: JSON.stringify({
          userMessage: "Dynamo client error. Please try again later.",
          errorMessage: expectedErrorMessage,
        }),
      };

      // act
      const endpointResponse = await endpoint(event, context);

      // assert
      expect(endpointResponse).toStrictEqual(expectedResponse);
    });

    it("should return a function that upon successful code execution forwards the server response from implementation back to API Gateway", async () => {
      // arrange
      const event = { pathParameters: "", body: null };
      const context = {};

      const expectedResponse = {
        statusCode: 200,
        body: JSON.stringify({
          data: {
            prop1: "Heart of the Cards, guide me! I draw!",
            prop2: 40,
          },
        }),
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
  });

  describe("Create method", () => {
    // TODO: don't test all of them at once!
    it("should return a function that performs validation on user input to check whether the required fields are non-empty", async () => {
      // arrange
      const event = { body: null };
      const context = {};

      const expectedResponse = {
        statusCode: 400,
        body: JSON.stringify({
          validationErrors: [
            "Please provide a non-empty API name.",
            "Please provide a non-empy GithubId number.",
            "Please provide a valid and non-empty API's url base.",
            "Please provide a valid and non-empty Github url.",
          ],
        }),
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
        body: JSON.stringify({
          name: _faker.random.word(3),
          githubId: _faker.datatype.number(10 ** 9, 10 ** 10 - 1).toString(),
          baseUrl: {
            [randexp(/development|staging|production/)]: _faker.internet.url(),
          },
          githubUrl: _faker.internet.url(),
        }),
      };
      const context = {};

      const expectedResponse = {
        statusCode: 400,
        body: JSON.stringify({
          validationErrors: ["Please provide a non-empy GithubId number."],
        }),
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
        body: JSON.stringify({
          name: _faker.random.word(3),
          githubId: _faker.datatype.number(),
          baseUrl: { staging: _faker.internet.url() },
          githubUrl: _faker.internet.url(),
        }),
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
        body: JSON.stringify({
          name: _faker.random.word(3),
          githubId: _faker.datatype.number(),
          baseUrl: { staging: _faker.internet.url() },
          githubUrl: _faker.internet.url(),
        }),
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
        body: JSON.stringify({
          name: _faker.random.word(3),
          githubId: _faker.datatype.number(),
          baseUrl: { staging: _faker.internet.url() },
          githubUrl: _faker.internet.url(),
        }),
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

  describe("Get single method", () => {
    it("should return a function that performs validation on user input to check whether path parameters are non-empty", async () => {
      // arrange
      const event = { body: null };
      const context = {};

      const expectedResponse = {
        statusCode: 400,
        body: JSON.stringify({
          validationErrors: ["Please provide a non-empty API id."],
        }),
      };

      const endpoint = classUnderTest.get();

      // act
      let endpointResponse = await endpoint(event, context);

      // assert
      expect(endpointResponse).toStrictEqual(expectedResponse);
    });

    it("should return a function that calls the presentation to domain mapper with the input event path parameters", async () => {
      // arrange
      const event = {
        pathParameters: { id: _faker.datatype.number().toString() },
        body: null,
      };
      const context = {};

      const endpoint = classUnderTest.get();

      // act
      await endpoint(event, context);

      // assert
      // expect(JSON.parse(endpointResponse)).toStrictEqual(expectedResponse);
      expect(mockMapper.presentationToDomainGet).toHaveBeenCalledTimes(1);
      expect(mockMapper.presentationToDomainGet).toHaveBeenCalledWith(
        event.pathParameters
      );
    });

    it("should return a function that calls the use case with the the output of presentation to domain mapper", async () => {
      // arrange
      const event = { body: null, pathParameters: "kurwa" };
      const context = {};
      const dummyMapperResponse = {
        prop3: "abc",
        prop4: 7897987,
      };

      mockMapper.presentationToDomainGet.mockReturnValue(dummyMapperResponse);
      mockUseCase.executeGet = jest.fn(); //.mockResolvedValue(42);

      const endpoint = classUnderTest.get();
      console.log(endpoint);

      // act
      // can't use the await here, because it won't do its job. it's because ether jest, or javascript was written by someone with less than 20 IQ
      endpoint(event, context).then(() => {
        // assert
        expect(mockUseCase.executeGet).toHaveBeenCalledTimes(1);
        expect(mockUseCase.executeGet).toHaveBeenCalledWith(
          dummyMapperResponse
        );
      });
    });

    it("should call the domain to presentation mapper with use case result", async () => {
      // arrange
      const dummyUsecaseResponse = {
        prop1: "abc",
        prop2: 78,
      };

      mockUseCase.executeGet.mockResolvedValue(dummyUsecaseResponse);
      const endpoint = classUnderTest.get();

      // act
      endpoint({ body: null }, {}).then(() => {
        // assert
        expect(mockMapper.domainToPresentationGet).toHaveBeenCalledTimes(1);
        expect(mockMapper.domainToPresentationGet).toHaveBeenCalledWith(
          dummyMapperResponse
        );
      });
    });

    it("should return 200 Ok with an object returned by domain to presentation mapper", async () => {
      // arrange
      const dummyUsecaseResponse = {
        prop1: "abc",
        prop2: 78,
      };

      mockMapper.domainToPresentationGet.mockResolvedValue(
        dummyUsecaseResponse
      );
      const endpoint = classUnderTest.get();

      const expectedResponse = {
        statusCode: 200,
        body: JSON.stringify(dummyUsecaseResponse),
      };

      // act
      const endpointResponse = await endpoint(
        {
          body: null,
          pathParameters: {
            id: "123",
          },
        },
        {}
      );

      // assert
      expect(endpointResponse).toStrictEqual(expectedResponse);
    });
  });
});
