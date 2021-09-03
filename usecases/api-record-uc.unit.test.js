"use strict";

const _faker = require("faker");
const { APIRecordUseCase } = require("./api-record-uc");

describe("API Records Use Case", () => {
  describe("Execute Post method", () => {
    let mockGateway, mockMapper, classUnderTest;

    beforeAll(() => {
      mockGateway = { executePost: jest.fn() };
      mockMapper = { domainToData: jest.fn(), dataToDomain: jest.fn() };
      classUnderTest = new APIRecordUseCase(mockGateway, mockMapper);
    });

    afterEach(() => {
      mockGateway.executePost.mockReset();
      mockMapper.domainToData.mockReset();
    });

    it("should call the gateway Post method once", () => {
      // act
      classUnderTest.executePost({});

      // assert
      expect(mockGateway.executePost).toHaveBeenCalledTimes(1);
    });

    it("should call the domainToData mapper method once", () => {
      // act
      classUnderTest.executePost({});

      // assert
      expect(mockMapper.domainToData).toHaveBeenCalledTimes(1);
    });

    it("should call the domainToData mapper method with the argument provided to UC", () => {
      // arrange
      const usecaseArg = {
        name: _faker.random.words(3),
        baseUrl: _faker.internet.url(),
      };

      // act
      classUnderTest.executePost(usecaseArg);

      // assert
      expect(mockMapper.domainToData).toHaveBeenCalledWith(usecaseArg);
    });

    it("should call the gateway Post method with data layer object", () => {
      // arrange
      const dataLayerObj = {
        id: _faker.datatype.uuid(),
        name: _faker.random.words(3),
        baseUrl: _faker.internet.url(),
      };

      mockMapper.domainToData.mockReturnValue(dataLayerObj);

      // act
      classUnderTest.executePost({});

      // assert
      expect(mockGateway.executePost).toHaveBeenCalledWith(dataLayerObj);
    });
  });
});
