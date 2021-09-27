"use strict";

const { APIRecordsGateway } = require("./gateways/api-records-gw");
const { APIRecordUseCase } = require("./usecases/api-record-uc");
const { PresentationDomainMapper } = require("./mappers/api-record-pd-mapper");
const { dynamodbClient } = require("./database-contexts/dynamodb");
const {
  APIRecordsController,
} = require("./controllers/api-records-controller");

const gateway = new APIRecordsGateway(dynamodbClient);
const pdMapper = new PresentationDomainMapper();
pdMapper["presentationToDomainGet"] = (userInput) => {
  return { id: userInput.id };
};
pdMapper["domainToPresentationGet"] = pdMapper["toDomain"];
const dmMapper = new PresentationDomainMapper();
dmMapper["domainToData"] = dmMapper["toDomain"];
delete dmMapper["toDomain"];
dmMapper["toDataGet"] = (userInput) => {
  return { id: userInput.id };
};
dmMapper["toDomainGet"] = dmMapper["domainToData"];

// TODO: make mapper resilient to missing fields:
// cannot access "apis" of undefined

// mockMapper.presentationToDomainGet.mockReset();
// mockMapper.domainToPresentationGet.mockReset();
// mockMapper.toDataGet.mockReset();
// mockMapper.toDomainGet.mockReset();

const usecase = new APIRecordUseCase(gateway, dmMapper);
const controller = new APIRecordsController(usecase, pdMapper);

module.exports = {
  hello: async (event) => {
    return {
      statusCode: 200,
      body: JSON.stringify(
        {
          message: "Go Serverless v1.0! Your function executed successfully!",
          input: event,
        },
        null,
        2
      ),
    };
  },
  // TODO Fix record creation error, where only 3 fields get added to the DB in gateway
  createAPI: controller.create(),
  listAPIs: controller.listAPIs(),
  getAPI: controller.get(),
  patchAPI: async (event, context) => {
    return { statusCode: 501 };
  },
};
