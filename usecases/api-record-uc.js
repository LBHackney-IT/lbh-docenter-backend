const {
  DuplicateRecordException,
} = require("../models/exceptions/duplicateRecordException");

class APIRecordUseCase {
  constructor(apiRecordGateway, domainDataMapper) {
    this._apiRecordGateway = apiRecordGateway;
    this._domainDataMapper = domainDataMapper;
  }

  async executePost(domainBoundary) {
    const isDuplicate = await this._apiRecordGateway.existsCheck(
      domainBoundary?.githubId
    );
    if (isDuplicate)
      throw new DuplicateRecordException(
        `The project from this repository (githubId: ${domainBoundary?.githubId}) already exists!`
      );
    const dataBoundary = this._domainDataMapper.domainToData(domainBoundary);
    await this._apiRecordGateway.executePost(dataBoundary);
  }
}

module.exports = {
  APIRecordUseCase,
};
