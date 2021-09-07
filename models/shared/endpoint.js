class Endpoint {
  constructor({ httpMethod, name }) {
    this.httpMethod = httpMethod;
    this.name = name;
  }
}

module.exports = {
  Endpoint,
};
