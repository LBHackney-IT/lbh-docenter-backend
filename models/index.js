const { APIRecord } = require("./entities/api-record");
const { Environments } = require("./shared/environments");
const { Dependencies } = require("./shared/dependencies");
const { OtherDocumentation } = require("./shared/other-documentation");
const { DependencyDatabase } = require("./shared/dependency-database");
const { DependencyAPI } = require("./shared/dependency-api");
const { Endpoint } = require("./shared/endpoint");
const { DependencyScript } = require("./shared/dependency-script");

// Currently these models are getting used by the Presentation, Domain and Entity layers.
// It's because current endpoints implementation doesn't do anything different between
// these layers. However, in the future Domain layer could add calculated fields & Entity
// layer could change entirely if the dynamodb database gets swapped out for something else.

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
