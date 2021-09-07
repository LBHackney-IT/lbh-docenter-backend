const {
  Endpoint,
  OtherDocumentation,
} = require("../models");

class PresentationDomainMapper {
  toDomain(userInput) {}

  // sub-mappers
  toDomain_OtherDocumentation(userInput) {
    return new OtherDocumentation({
      businessContext: userInput.businessContext,
      dataModel: userInput.dataModel,
    });
  }

  toDomain_Endpoint(userInput) {
    return new Endpoint({
      httpMethod: userInput.httpMethod,
      name: userInput.name,
    });
  }
}

module.exports = {
  PresentationDomainMapper,
};
