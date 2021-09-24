const {
  APIRecord,
  Environments,
  Dependencies,
  DependencyDatabase,
  DependencyAPI,
  Endpoint,
  DependencyScript,
  OtherDocumentation,
} = require("../models");

class PresentationDomainMapper {
  toDomain(userInput) {
    return new APIRecord({
      id: userInput.id,
      githubId: userInput.githubId,
      name: userInput.name,
      githubUrl: userInput.githubUrl,
      status: userInput.status,
      baseUrl: this.toDomain_Environments(userInput.baseUrl),
      dependencies: this.toDomain_Dependencies(userInput.dependencies),
      otherDocumentation: this.toDomain_OtherDocumentation(
        userInput.otherDocumentation
      ),
    });
  }

  // sub-mappers
  toDomain_OtherDocumentation(userInput) {
    return new OtherDocumentation({
      businessContext: userInput?.businessContext,
      dataModel: userInput?.dataModel,
    });
  }

  toDomain_Endpoint(userInput) {
    return new Endpoint({
      httpMethod: userInput?.httpMethod,
      name: userInput?.name,
    });
  }

  toDomain_DependencyAPI(userInput) {
    return new DependencyAPI({
      apiId: userInput?.apiId,
      apiName: userInput?.apiName,
      endpointsUsingIt: userInput?.endpointsUsingIt?.map((endpoint) =>
        this.toDomain_Endpoint(endpoint)
      ),
    });
  }

  toDomain_DependencyScript(userInput) {
    return new DependencyScript({
      name: userInput?.name,
      description: userInput?.description,
    });
  }

  toDomain_DependencyDatabase(userInput) {
    return new DependencyDatabase({
      name: userInput?.name,
      technicalName: userInput?.technicalName,
      type: userInput?.type,
      hostedAt: userInput?.hostedAt,
    });
  }

  toDomain_Environments(userInput) {
    return new Environments({
      development: userInput?.development,
      staging: userInput?.staging,
      production: userInput?.production,
    });
  }

  toDomain_Dependencies(userInput) {
    return new Dependencies({
      apis: userInput?.apis?.map((api) => this.toDomain_DependencyAPI(api)),
      scripts: userInput?.scripts?.map((script) =>
        this.toDomain_DependencyScript(script)
      ),
      databases: userInput?.databases?.map((database) =>
        this.toDomain_DependencyDatabase(database)
      ),
    });
  }
}

module.exports = {
  PresentationDomainMapper,
};
