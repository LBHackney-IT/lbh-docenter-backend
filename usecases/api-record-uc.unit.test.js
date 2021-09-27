"use strict";

const _faker = require("faker");
const { APIRecordUseCase } = require("./api-record-uc");
const {
  DuplicateRecordException,
} = require("../models/exceptions/duplicateRecordException");
const { generateAPIRecord } = require("../helpers/tests/generators");

describe("API Records Use Case", () => {
  let mockGateway, mockMapper, classUnderTest;

  beforeAll(() => {
    mockGateway = {
      executePost: jest.fn(),
      existsCheck: jest.fn(),
      executeGet: jest.fn(),
    };
    mockMapper = {
      domainToData: jest.fn(),
      toDataGet: jest.fn(),
      toDomainGet: jest.fn(),
    };
    classUnderTest = new APIRecordUseCase(mockGateway);
  });

  afterEach(() => {
    mockGateway.executePost.mockReset();
    mockGateway.existsCheck.mockReset();
    mockGateway.executeGet.mockReset();
  });

  describe("Execute Post method", () => {
    it("should call the gateway Post method once", async () => {
      // arrange
      mockGateway.existsCheck.mockResolvedValue(false);

      // act
      await classUnderTest.executePost({});

      // assert
      expect(mockGateway.executePost).toHaveBeenCalledTimes(1);
    });

    it("should call the gateway Post method with domain layer object", async () => {
      // arrange
      const domainLayerObj = {
        id: _faker.datatype.uuid(),
        name: _faker.random.words(3),
        baseUrl: _faker.internet.url(),
      };

      mockGateway.existsCheck.mockResolvedValue(false);

      // act
      await classUnderTest.executePost(domainLayerObj);

      // assert
      expect(mockGateway.executePost).toHaveBeenCalledWith(domainLayerObj);
    });

    it("should call the gateway existsCheck method once", async () => {
      // act
      await classUnderTest.executePost({});

      // assert
      expect(mockGateway.existsCheck).toHaveBeenCalledTimes(1);
    });

    it("should call the gateway existsCheck method with the githubId from a domain boundary object", async () => {
      // arrange
      const usecaseArg = {
        githubId: _faker.datatype.number(10 ** 9, 10 ** 10 - 1),
        dummyProp: 42,
      };

      // act
      await classUnderTest.executePost(usecaseArg);

      // assert
      expect(mockGateway.existsCheck).toHaveBeenCalledWith(usecaseArg.githubId);
    });

    it("should throw a DuplicateRecordException if a record to be inserted already exists", async () => {
      // arrange
      const githubId = _faker.datatype.number(10 ** 9, 10 ** 10 - 1);
      const expectedException = new DuplicateRecordException(
        `The project from this repository (githubId: ${githubId}) already exists!`
      ); //I live in a Twilight Zone!

      mockGateway.existsCheck.mockResolvedValue(true);

      // act
      const testDelegate = async () =>
        await classUnderTest.executePost({ githubId });

      // assert
      await expect(testDelegate).rejects.toThrow(expectedException.message);
    });

    it("should not call usecase when API Record already exists", async () => {
      // arrange
      const githubId = _faker.datatype.number(10 ** 9, 10 ** 10 - 1);

      mockGateway.existsCheck.mockResolvedValue(true);

      try {
        // act
        await classUnderTest.executePost({ githubId });
      } catch {
        // assert
        expect(mockGateway.executePost).not.toHaveBeenCalled();
      }
    });
  });

  describe("Execute Get method", () => {
    it("should call the gateway's executeGet method once", async () => {
      // act
      await classUnderTest.executeGet({});

      // assert
      expect(mockGateway.executeGet).toHaveBeenCalledTimes(1);
    });

    it("should call the gateway's executeGet method with domain layer object", async () => {
      // arrange
      const domainBoundary = { id: _faker.datatype.string(5) };

      // act
      await classUnderTest.executeGet(domainBoundary);

      // assert
      expect(mockGateway.executeGet).toHaveBeenCalledWith(domainBoundary);
    });

    it("should return the domainBoundary outputed by the gateway's executeGet method.", async () => {
      // arrange
      const expectedResult = generateAPIRecord();

      mockGateway.executeGet.mockResolvedValue(expectedResult);

      // act
      classUnderTest.executeGet({}).then((actualResult) => {
        // assert
        expect(actualResult).toBe(expectedResult);
      });
    });
  });
});
