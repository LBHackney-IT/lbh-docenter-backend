const allAPIRecords = async (client) => {
  const { Items } = await client
    .scan({
      TableName: process.env.DYNAMODB_APIS_TABLE,
    })
    .promise();

  return Items;
};

const filterInsertedRecord = (collection, id) =>
  collection.find((r) => r.id === id);

const dynamoMockError = (op, val) => {
  return {
    [op]: () => {
      return {
        promise: () => Promise.reject(val),
      };
    },
  };
};

module.exports = {
  allAPIRecords,
  filterInsertedRecord,
  dynamoMockError,
};
