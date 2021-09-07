class Environments {
  constructor({ development, staging, production }) {
    this.development = development;
    this.staging = staging;
    this.production = production;
  }
}

module.exports = {
  Environments,
};
