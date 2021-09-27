const { DynamoDBException } = require("../models/exceptions/dynamoException");
const {
  RecordNotFoundException,
} = require("../models/exceptions/recordNotFoundException");

class APIRecordsGateway {
  constructor(databaseContext) {
    this._databaseContext = databaseContext;
    this.executePost = this.executePost.bind(this);
  }

  // Check whether a repository is already registered within database
  async existsCheck(githubId) {
    const getResult = await this._databaseContext
      .scan({
        TableName: process.env.DYNAMODB_APIS_TABLE,
        FilterExpression: "#gId = :gId",
        ExpressionAttributeNames: {
          "#gId": "githubId",
        },
        ExpressionAttributeValues: {
          ":gId": parseInt(githubId),
        },
      })
      .promise();

    return getResult.Items.length > 0;
  }

  async executePost(dataBoundary) {
    let createParams = {
      TableName: process.env.DYNAMODB_APIS_TABLE,
      // should do parsing elsewhere
      // also we're way past validation stage here, hence the ?.
      Item: dataBoundary,
    };

    try {
      await this._databaseContext.put(createParams).promise();
    } catch (createError) {
      console.log("There was a problem creating an API record.\n", createError);
      console.log("Create parameters: ", createParams);
      throw new DynamoDBException(createError);
    }
  }

  async executeGet(dataBoundary) {
    const apiRecord = await this._databaseContext
      .get({
        TableName: process.env.DYNAMODB_APIS_TABLE,
        Key: {
          id: dataBoundary.id,
        },
      })
      .promise();

    if (!apiRecord.Item)
      throw new RecordNotFoundException(
        `Record with id: ${dataBoundary.id} was not found.`
      );

    return apiRecord.Item;
  }

  async executeList() {
    const apiRecords = await dynamoClient
      .scan({
        TableName: TABLE_NAME,
      })
      .promise();

    return apiRecords.Items || [];
  }
}

module.exports = {
  APIRecordsGateway,
};
