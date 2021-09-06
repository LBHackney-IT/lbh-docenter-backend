class DependencyDatabase {
  constructor({ name, type, hostedAt, technicalName }) {
    this.name = name;
    // cloud resource name
    this.technicalName = technicalName;
    this.type = type;
    this.hostedAt = hostedAt;
  }
}

module.exports = {
  DependencyDatabase,
};
