class DependencyScript {
  constructor({ name, githubUrl, description }) {
    this.name = name;
    this.githubUrl = githubUrl;
    this.description = description;
  }
}

module.exports = {
  DependencyScript,
};
