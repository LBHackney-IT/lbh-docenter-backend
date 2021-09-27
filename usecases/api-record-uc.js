const {
  DuplicateRecordException,
} = require("../models/exceptions/duplicateRecordException");

class APIRecordUseCase {
  constructor(apiRecordGateway) {
    this._apiRecordGateway = apiRecordGateway;
  }

  async executePost(domainBoundary) {
    const isDuplicate = await this._apiRecordGateway.existsCheck(
      domainBoundary?.githubId
    );
    if (isDuplicate)
      throw new DuplicateRecordException(
        `The project from this repository (githubId: ${domainBoundary?.githubId}) already exists!`
      );

    await this._apiRecordGateway.executePost(domainBoundary);
  }

  async executeGet(domainBoundary) {
    const gatewayResult = await this._apiRecordGateway.executeGet(
      domainBoundary
    );
    return gatewayResult;
  }

  async executeList() {
    return await this._apiRecordGateway.executeList();
  }
}

module.exports = {
  APIRecordUseCase,
};
