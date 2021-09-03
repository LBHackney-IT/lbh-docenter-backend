class APIRecordUseCase {
  constructor(apiRecordGateway, domainDataMapper) {
    this._apiRecordGateway = apiRecordGateway;
    this._domainDataMapper = domainDataMapper;
  }

  async executePost(domainBoundary) {
    const dataBoundary = this._domainDataMapper.domainToData(domainBoundary);
    await this._apiRecordGateway.executePost(dataBoundary);
  }
}

module.exports = {
  APIRecordUseCase,
};
