class APIRecord {
  constructor({
    id,
    githubId,
    name,
    baseUrl,
    githubUrl,
    dependencies,
    status,
    otherDocumentation,
  }) {
    this.id = id;
    this.githubId = githubId;
    this.name = name;
    this.baseUrl = baseUrl;
    this.githubUrl = githubUrl;
    this.dependencies = dependencies;
    // status: ACTIVE, PLANNED_DEPRECATION, DEPRECATED
    this.status = status;
    this.otherDocumentation = otherDocumentation;
  }
}

module.exports = {
  APIRecord,
};
