const {
  allAPIRecords,
  filterInsertedRecord,
  dynamoMockError,
} = require("../helpers/tests/dynamoOps");
const { APIRecordsGateway } = require("./api-records-gw");
const { DynamoDBException } = require("../models/exceptions/dynamoException");
const { dynamodbClient } = require("../database-contexts/dynamodb");
const _faker = require("faker");

describe("API Records Gateway", () => {
  let classUnderTest;

  beforeAll(() => {
    classUnderTest = new APIRecordsGateway(dynamodbClient);
  });

  afterEach(() => {
    classUnderTest = new APIRecordsGateway(dynamodbClient);
  });

  describe("Execute Post method", () => {
    it("should insert only the provided API Record once", async () => {
      // arrange
      const initialRecordCount = (await allAPIRecords(dynamodbClient))?.length;

      const dataBoundary = {
        id: _faker.datatype.uuid(),
        name: _faker.random.words(3),
        baseUrl: { staging: _faker.internet.url() },
      };

      // act
      await classUnderTest.executePost(dataBoundary);

      // assert
      const allItems = await allAPIRecords(dynamodbClient);
      const endItemCount = allItems?.length;
      const insertedItem = filterInsertedRecord(allItems, dataBoundary.id);

      expect(endItemCount).toEqual(initialRecordCount + 1);
      expect(insertedItem).toStrictEqual(dataBoundary);
    });

    it("should throw a DynamoDB Exception when Error from within dynamodb client comes up", async () => {
      // arrange
      const expectedException = new DynamoDBException("Can't touch this!");

      classUnderTest._databaseContext = dynamoMockError(
        "put",
        expectedException
      );

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
});
