const {
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
}

module.exports = {
  PresentationDomainMapper,
};
