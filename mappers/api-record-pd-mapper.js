const {
  DependencyAPI,
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

  toDomain_DependencyAPI(userInput) {
    return new DependencyAPI({
      apiId: userInput.apiId,
      apiName: userInput.apiName,
      endpointsUsingIt: userInput.endpointsUsingIt.map((endpoint) =>
        this.toDomain_Endpoint(endpoint)
      ),
    });
  }
}

module.exports = {
  PresentationDomainMapper,
};
