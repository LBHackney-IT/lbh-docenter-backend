const { DynamoDBException } = require("../models/exceptions/dynamoException");

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
      Item: {
        id: dataBoundary?.id,
        name: dataBoundary?.name,
        baseUrl: dataBoundary?.baseUrl,
      },
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
    return await this._databaseContext
      .get({
        TableName: process.env.DYNAMODB_APIS_TABLE,
        Key: {
          id: dataBoundary.id,
        },
      })
      .promise();
  }
}

module.exports = {
  APIRecordsGateway,
};
