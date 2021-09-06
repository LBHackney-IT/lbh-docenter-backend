const { APIRecord } = require("./entities/api-record");
const { Environments } = require("./shared/environments");
const { Dependencies } = require("./shared/dependencies");
const { OtherDocumentation } = require("./shared/other-documentation");
const { DependencyDatabase } = require("./shared/dependency-database");
const { DependencyAPI } = require("./shared/dependency-api");
const { Endpoint } = require("./shared/endpoint");
const { DependencyScript } = require("./shared/dependency-script");

module.exports = {
  APIRecord,
  Environments,
  Dependencies,
  OtherDocumentation,
  DependencyDatabase,
  DependencyAPI,
  Endpoint,
  DependencyScript,
};
