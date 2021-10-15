const {
  allAPIRecords,
  filterInsertedRecord,
  dynamoMockError,
} = require("../helpers/tests/dynamoOps");
const { APIRecordsGateway } = require("./api-records-gw");
const { DynamoDBException } = require("../models/exceptions/dynamoException");
const {
  RecordNotFoundException,
} = require("../models/exceptions/recordNotFoundException");
const { generateAPIRecord } = require("../helpers/tests/generators");
const { dynamodbClient } = require("../database-contexts/dynamodb");
const _faker = require("faker");

describe("API Records Gateway", () => {
  let classUnderTest;

  beforeAll(() => {
    mockMapper = {
      domainToData: jest.fn(),
      toDataGet: jest.fn(),
      toDomainGet: jest.fn(),
    };
    classUnderTest = new APIRecordsGateway(dynamodbClient, mockMapper);
  });

  afterEach(() => {
    mockMapper.domainToData.mockReset();
    mockMapper.toDataGet.mockReset();
    mockMapper.toDomainGet.mockReset();
    classUnderTest = new APIRecordsGateway(dynamodbClient, mockMapper);
  });

  describe("Execute Post method", () => {
    it("should call the domainToData mapper method once", async () => {
      try {
        // act
        await classUnderTest.executePost({});
      } catch {
        // assert
        expect(mockMapper.domainToData).toHaveBeenCalledTimes(1);
      }
    });

    it("should call the domainToData mapper method with the argument provided to GW", async () => {
      // arrange
      const gatewayArg = {
        name: _faker.random.words(3),
        baseUrl: _faker.internet.url(),
      };

      try {
        // act
        await classUnderTest.executePost(gatewayArg);
      } catch {
        // assert
        expect(mockMapper.domainToData).toHaveBeenCalledWith(gatewayArg);
      }
    });

    it("should insert the mapper provided data layer API Record only once", async () => {
      // arrange
      const initialRecordCount = (await allAPIRecords(dynamodbClient))?.length;

      const dataLayerObj = {
        id: _faker.datatype.uuid(),
        name: _faker.random.words(3),
        baseUrl: { staging: _faker.internet.url() },
      };

      mockMapper.domainToData.mockReturnValue(dataLayerObj);

      // act
      await classUnderTest.executePost({});

      // assert
      const allItems = await allAPIRecords(dynamodbClient);
      const endItemCount = allItems?.length;
      const insertedItem = filterInsertedRecord(allItems, dataLayerObj.id);

      expect(endItemCount).toEqual(initialRecordCount + 1);
      expect(insertedItem).toStrictEqual(dataLayerObj);
    });

    it("should throw a DynamoDB Exception when Error from within dynamodb client comes up", async () => {
      // arrange
      const expectedException = new DynamoDBException("Can't touch this!");

      classUnderTest._databaseContext = dynamoMockError(
        "put",
        expectedException
      );

      mockMapper.domainToData.mockReturnValue({ id: "asdf" });

      // act
      const testDelegate = classUnderTest.executePost;

      // assert
      await expect(testDelegate).rejects.toThrow(expectedException.message);
    });
  });

  describe("Existance Check method", () => {
    it("should return true when a record with an input githubId already exists.", async () => {
      // arrange
      const existingGithubId = _faker.datatype.number(10 ** 9, 10 ** 10 - 1);

      await dynamodbClient
        .put({
          TableName: process.env.DYNAMODB_APIS_TABLE,
          Item: {
            id: "abcd",
            githubId: existingGithubId,
          },
        })
        .promise();

      const expectedResult = true;

      // act
      const actualResult = await classUnderTest.existsCheck(existingGithubId);

      // assert
      await expect(actualResult).toEqual(expectedResult);
    });

    it("should return false when a record with an input githubId doesn't exist.", async () => {
      // arrange
      const existingGithubId = _faker.datatype.number(10 ** 9, 10 ** 10 - 1);

      const expectedResult = false;

      // act
      const actualResult = await classUnderTest.existsCheck(existingGithubId);

      // assert
      await expect(actualResult).toEqual(expectedResult);
    });
  });

  describe("Execute Get method", () => {
    it("should call the mapper's toDataGet method with domainBoundary once", async () => {
      // arrange
      const domainBoundary = { id: _faker.datatype.string(5) };

      // act
      try {
        await classUnderTest.executeGet(domainBoundary);
      } catch {
        // assert
        expect(mockMapper.toDataGet).toHaveBeenCalledTimes(1);
        expect(mockMapper.toDataGet).toHaveBeenCalledWith(domainBoundary);
      }
    });

    it("should retrieve a record (when record exists) with id coming from toDataGet mapper method", async () => {
      // arrange
      const searchDataBoundary = {
        id: _faker.datatype.string(8),
      };

      mockMapper.toDataGet.mockReturnValue(searchDataBoundary);
      mockMapper.toDomainGet.mockImplementation((x) => x);

      const expectedItem = {
        id: searchDataBoundary.id,
        name: _faker.datatype.string(5),
      };

      await dynamodbClient
        .put({
          TableName: process.env.DYNAMODB_APIS_TABLE,
          Item: expectedItem,
        })
        .promise();

      // act
      const actualResult = await classUnderTest.executeGet({});

      // assert
      expect(actualResult).toStrictEqual(expectedItem);
    });

    it("should throw a Record Not Found exception when no record matching given id is found", async () => {
      // arrange
      const searchDataBoundary = {
        id: _faker.datatype.string(8),
      };

      mockMapper.toDataGet.mockReturnValue(searchDataBoundary);

      const nonMatchingItem = {
        id: _faker.datatype.string(8),
        name: _faker.datatype.string(5),
      };

      await dynamodbClient
        .put({
          TableName: process.env.DYNAMODB_APIS_TABLE,
          Item: nonMatchingItem,
        })
        .promise();

      const expectedException = new RecordNotFoundException(
        `Record with id: ${searchDataBoundary.id} was not found.`
      );

      // act
      const testDelegate = () => classUnderTest.executeGet(searchDataBoundary);

      // assert
      await expect(testDelegate).rejects.toThrow(expectedException.message);
    });

    it("should call the mapper's toDomainGet method with dataBoundary returned by the dynamo query once", async () => {
      // arrange
      const expectedDbRecord = {
        id: _faker.datatype.string(8),
        name: _faker.datatype.string(5),
      };

      const searchDataBoundary = {
        id: expectedDbRecord.id,
      };

      mockMapper.toDataGet.mockReturnValue(searchDataBoundary);

      // make db return the expected db record
      await dynamodbClient
        .put({
          TableName: process.env.DYNAMODB_APIS_TABLE,
          Item: expectedDbRecord,
        })
        .promise();

      // act
      await classUnderTest.executeGet({});

      // assert
      expect(mockMapper.toDomainGet).toHaveBeenCalledTimes(1);
      expect(mockMapper.toDomainGet).toHaveBeenCalledWith(expectedDbRecord);
    });

    it("should return the domainBoundary outputed by the toDomainGet mapper's method.", async () => {
      // arrange
      const expectedResult = generateAPIRecord();
      await dynamodbClient
        .put({
          TableName: process.env.DYNAMODB_APIS_TABLE,
          Item: expectedResult,
        })
        .promise();

      mockMapper.toDataGet.mockReturnValue({
        id: expectedResult.id,
      });
      mockMapper.toDomainGet.mockReturnValue(expectedResult);

      // act
      const actualResult = await classUnderTest.executeGet({});

      // assert
      expect(actualResult).toBe(expectedResult);
    });
  });
});
