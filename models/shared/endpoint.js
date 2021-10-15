class Endpoint {
  constructor({ httpMethod, name, path }) {
    this.httpMethod = httpMethod;
    this.name = name;
    this.path = path;
  }
}

module.exports = {
  Endpoint,
};
