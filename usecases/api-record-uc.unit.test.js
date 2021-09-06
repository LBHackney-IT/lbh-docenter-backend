"use strict";

const _faker = require("faker");
const { APIRecordUseCase } = require("./api-record-uc");

describe("API Records Use Case", () => {
  describe("Execute Post method", () => {
    let mockGateway, mockMapper, classUnderTest;

    beforeAll(() => {
      mockGateway = { executePost: jest.fn(), existsCheck: jest.fn() };
      mockMapper = { domainToData: jest.fn(), dataToDomain: jest.fn() };
      classUnderTest = new APIRecordUseCase(mockGateway, mockMapper);
    });

    afterEach(() => {
      mockGateway.executePost.mockReset();
      mockGateway.existsCheck.mockReset();
      mockMapper.domainToData.mockReset();
    });

    it("should call the gateway Post method once", async () => {
      // act
      await classUnderTest.executePost({});

      // assert
      expect(mockGateway.executePost).toHaveBeenCalledTimes(1);
    });

    it("should call the domainToData mapper method once", async () => {
      // act
      await classUnderTest.executePost({});

      // assert
      expect(mockMapper.domainToData).toHaveBeenCalledTimes(1);
    });

    it("should call the domainToData mapper method with the argument provided to UC", async () => {
      // arrange
      const usecaseArg = {
        name: _faker.random.words(3),
        baseUrl: _faker.internet.url(),
      };

      // act
      await classUnderTest.executePost(usecaseArg);

      // assert
      expect(mockMapper.domainToData).toHaveBeenCalledWith(usecaseArg);
    });

    it("should call the gateway Post method with data layer object", async () => {
      // arrange
      const dataLayerObj = {
        id: _faker.datatype.uuid(),
        name: _faker.random.words(3),
        baseUrl: _faker.internet.url(),
      };

      mockMapper.domainToData.mockReturnValue(dataLayerObj);

      // act
      await classUnderTest.executePost({});

      // assert
      expect(mockGateway.executePost).toHaveBeenCalledWith(dataLayerObj);
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
  });
});
