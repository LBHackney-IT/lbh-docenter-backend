const {
  APIRecord,
  Environments,
  Dependencies,
  DependencyDatabase,
  DependencyAPI,
  Endpoint,
  DependencyScript,
  OtherDocumentation,
} = require("../../models");

const faker = require("faker");
const randexp = require("randexp").randexp;

const maybeItem = (generatorFunc) =>
  faker.datatype.boolean() ? null : generatorFunc();
const nItems = (n, itemProducer, ...args) =>
  [...Array(n)].map((_) => itemProducer(...args));
const randInt = (mn, mx) => faker.datatype.number({ min: mn, max: mx });

const generateEndpoint = () =>
  new Endpoint({
    httpMethod: randexp(/GET|POST|PATCH|DELETE|UPDATE|OPTIONS/),
    name: faker.lorem.words(randInt(1, 3)),
  });

const generateDependencyAPI = () =>
  new DependencyAPI({
    apiId: randexp(/[^\W_]{8}/),
    apiName: `${faker.lorem.words(randInt(1, 3))} API`,
    endpointsUsingIt: nItems(randInt(1, 3), generateEndpoint),
  });

const generateDependencyScript = () =>
  new DependencyScript({
    name: faker.lorem.words(randInt(2, 5)),
    description: faker.lorem.sentence(),
  });

const generateDependencyDatabase = () => {
  const randName = faker.lorem.words(randInt(2, 4));
  return new DependencyDatabase({
    name: randName,
    technicalName: randName.replace(" ", "_") + "_DB",
    type: randexp(/MongoDB|Airtable|S3 Bucket|DynamoDB|PostgreSQL|TSQL/),
    hostedAt: randexp(/AWS|GCP|Airtable|On-premises/) + faker.lorem.word(),
  });
};

const generateOtherDocumentation = () => {
  return new OtherDocumentation({
    businessContext: faker.lorem.paragraph(),
    dataModel: faker.internet.url(),
  });
};

const generateDependencies = () =>
  new Dependencies({
    apis: nItems(randInt(1, 3), generateDependencyAPI),
    scripts: maybeItem(() => nItems(randInt(1, 2), generateDependencyScript)),
    databases: nItems(randInt(1, 4), generateDependencyDatabase),
  });

const generateDependenciesStrict = () =>
  new Dependencies({
    apis: nItems(randInt(1, 3), generateDependencyAPI),
    scripts: nItems(randInt(1, 2), generateDependencyScript),
    databases: nItems(randInt(1, 4), generateDependencyDatabase),
  });

const generateEnvironmentsStrict = () => {
  return new Environments({
    development: faker.datatype.string(8),
    staging: faker.datatype.string(8),
    production: faker.datatype.string(8),
  });
};

const generateAPIRecord = () => {
  return new APIRecord({
    githubId: faker.datatype.number(10 ** 9, 10 ** 10 - 1),
    name: faker.random.words(3),
    baseUrl: new Environments({
      [randexp(/development|staging|production/)]: faker.internet.url(),
    }),
    githubUrl: faker.internet.url(),
    dependencies: generateDependencies(),
    status: randexp(/ACTIVE|DECOMMISSIONING WARNING|DEPRECATED/),
    otherDocumentation: generateOtherDocumentation(),
  });
};

module.exports = {
  generateAPIRecord,
  generateDependencies,
  generateOtherDocumentation,
  generateDependencyDatabase,
  generateDependencyScript,
  generateDependencyAPI,
  generateEndpoint,
  generateEnvironmentsStrict,
  generateDependenciesStrict,
};
