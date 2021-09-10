"use strict";
console.log("We hit this point!!!!!!!!!!!\n\n\n\n\n\\n\n\n\n\n");

console.log("Importing Gateway!\n\n\n\n\n");
const { APIRecordsGateway } = require("./gateways/api-records-gw");
console.log("Importing UseCase!\n\n\n\n\n");
const { APIRecordUseCase } = require("./usecases/api-record-uc");
console.log("Importing PD Mapper!\n\n\n\n\n");
const { PresentationDomainMapper } = require("./mappers/api-record-pd-mapper");
console.log("Importing dynamo client!\n\n\n\n\n");
const { dynamodbClient } = require("./database-contexts/dynamodb");
console.log("Importing Controller!\n\n\n\n\n");
const {
  APIRecordsController,
} = require("./controllers/api-records-controller");

console.log("passed the imports\n\n\n\n");

console.log("Newing up Gateway!\n\n\n\n\n");
const gateway = new APIRecordsGateway(dynamodbClient);

console.log("Newing up PD Mapper!\n\n\n\n\n");
const pdMapper = new PresentationDomainMapper();


console.log("PD Mapper GET hack!\n\n\n\n\n");
pdMapper["presentationToDomainGet"] = (userInput) => {
  return { id: userInput.id };
};


console.log("PD Mapper GET toDomain insert!\n\n\n\n\n");
pdMapper["domainToPresentationGet"] = pdMapper["toDomain"];


console.log("Newing up DM Mapper!\n\n\n\n\n");
const dmMapper = new PresentationDomainMapper();

console.log("Newing up DM Mapper toDomain!\n\n\n\n\n");
dmMapper["domainToData"] = dmMapper["toDomain"];

console.log("Delete key!\n\n\n\n\n");
delete dmMapper["toDomain"];

console.log("DM Mapper hack!\n\n\n\n\n");
dmMapper["toDataGet"] = (userInput) => {
  return { id: userInput.id };
};

console.log("Newing up DM Mapper domainToData!\n\n\n\n\n");
dmMapper["toDomainGet"] = dmMapper["domainToData"];

// TODO: make mapper resilient to missing fields:
// cannot access "apis" of undefined

// mockMapper.presentationToDomainGet.mockReset();
// mockMapper.domainToPresentationGet.mockReset();
// mockMapper.toDataGet.mockReset();
// mockMapper.toDomainGet.mockReset();

console.log("Injecting deps Usecase, controller!\n\n\n\n\n");
const usecase = new APIRecordUseCase(gateway, dmMapper);
const controller = new APIRecordsController(usecase, pdMapper);

console.log("passed injection\n\n\n\n\n");

module.exports = {
  hello: async (event) => {
    console.log("Inside the hello!\n\n\n\n\n\n");
    console.log(event);
    console.log("Returning!\n\n\n\n\n\n");
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
  listAPIs: async (event, context) => {
    return { statusCode: 501 };
  },
  getAPI: controller.get(),
  patchAPI: async (event, context) => {
    return { statusCode: 501 };
  },
};
