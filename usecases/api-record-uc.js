class APIRecordUseCase {
  constructor(apiRecordGateway) {
    this._apiRecordGateway = apiRecordGateway;
  }

  async executePost() {
    return await this._apiRecordGateway.executePost();
  }
}

module.exports = {
  APIRecordUseCase,
};
