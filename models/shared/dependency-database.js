class DependencyDatabase {
  constructor({ name, type, hostedAt, technicalName, endpointsUsingIt }) {
    this.name = name;
    // cloud resource name
    this.technicalName = technicalName;
    this.type = type;
    this.hostedAt = hostedAt;
    this.endpointsUsingIt = endpointsUsingIt;
  }
}

module.exports = {
  DependencyDatabase,
};
