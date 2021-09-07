class DynamoDBException extends Error {
  constructor(message) {
    super(message);
    this.name = "DynamoDBException";
  }
}

module.exports = {
  DynamoDBException,
};
