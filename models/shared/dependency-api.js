class DependencyAPI {
  constructor({ apiId, apiName, endpointsUsingIt }) {
    this.apiId = apiId;
    this.apiName = apiName;
    this.endpointsUsingIt = endpointsUsingIt || [];
  }
}

module.exports = {
  DependencyAPI,
};
