class Dependencies {
  constructor({ apis, scripts, databases, packages }) {
    this.apis = apis || [];
    this.scripts = scripts || [];
    this.databases = databases || [];
    this.packages = packages || [];
  }
}

module.exports = {
  Dependencies,
};
