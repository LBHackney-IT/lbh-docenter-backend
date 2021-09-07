const { PresentationDomainMapper } = require("./api-record-pd-mapper");
const {
  generateOtherDocumentation,
  generateEndpoint,
  generateDependencyAPI,
  generateDependencyScript,
  generateDependencyDatabase,
  generateEnvironmentsStrict,
  generateDependenciesStrict,
  generateAPIRecord,
} = require("../helpers/tests/generators");

const faker = require("faker");

describe("Presentation/Domain boundary mapper", () => {
  let classUnderTest;

  beforeEach(() => {
    classUnderTest = new PresentationDomainMapper();
  });

  describe("toDomain_OtherDocumentation method", () => {
    it("should correctly map the expected model fields", () => {
      // arrange
      const inputObject = generateOtherDocumentation();

      // act
      const mappedResult =
        classUnderTest.toDomain_OtherDocumentation(inputObject);

      // assert
      expect(mappedResult.businessContext).toEqual(inputObject.businessContext);
      expect(mappedResult.dataModel).toEqual(inputObject.dataModel);
    });

    it("should not map over fields that are not part of the data model", () => {
      // arrange
      const inputObject = generateOtherDocumentation();
      const nonExistingKey = faker.datatype.string(7);
      inputObject[nonExistingKey] = faker.datatype.string(5);

      // act
      const mappedResult =
        classUnderTest.toDomain_OtherDocumentation(inputObject);

      const mappedResultKeys = Object.keys(mappedResult);

      // assert
      expect(mappedResultKeys).not.toContain(nonExistingKey);
    });
  });

  describe("toDomain_Endpoint method", () => {
    it("should correctly map the expected model fields", () => {
      // arrange
      const inputObject = generateEndpoint();

      // act
      const mappedResult = classUnderTest.toDomain_Endpoint(inputObject);

      // assert
      expect(mappedResult.httpMethod).toEqual(inputObject.httpMethod);
      expect(mappedResult.name).toEqual(inputObject.name);
    });

    it("should not map over fields that are not part of the data model", () => {
      // arrange
      const inputObject = generateEndpoint();
      const nonExistingKey = faker.datatype.string(7);
      inputObject[nonExistingKey] = faker.datatype.string(5);

      // act
      const mappedResult = classUnderTest.toDomain_Endpoint(inputObject);

      const mappedResultKeys = Object.keys(mappedResult);

      // assert
      expect(mappedResultKeys).not.toContain(nonExistingKey);
    });
  });

  describe("toDomain_DependencyAPI method", () => {
    it("should correctly map the expected model fields", () => {
      // arrange
      const inputObject = generateDependencyAPI();

      // act
      const mappedResult = classUnderTest.toDomain_DependencyAPI(inputObject);

      // assert
      expect(mappedResult.apiId).toEqual(inputObject.apiId);
      expect(mappedResult.apiName).toEqual(inputObject.apiName);
      // excluding nested property check because that's a separate test
    });

    it("toDomain_DependencyAPI method calls toDomain_Endpoint method for mapping the given list of endpoints", () => {
      // arrange
      const inputObject = generateDependencyAPI();

      classUnderTest.toDomain_Endpoint = jest.fn().mockReturnValue(42);

      // act
      const mappedResult = classUnderTest.toDomain_DependencyAPI(inputObject);

      // assert
      expect(classUnderTest.toDomain_Endpoint).toHaveBeenCalledTimes(
        inputObject.endpointsUsingIt.length
      );
      expect(classUnderTest.toDomain_Endpoint).toHaveBeenLastCalledWith(
        inputObject.endpointsUsingIt[inputObject.endpointsUsingIt.length - 1]
      );
      expect(mappedResult.endpointsUsingIt).toContain(42);
    });

    it("should not map over fields that are not part of the data model", () => {
      // arrange
      const inputObject = generateDependencyAPI();
      const nonExistingKey = faker.datatype.string(7);
      inputObject[nonExistingKey] = faker.datatype.string(5);

      // act
      const mappedResult = classUnderTest.toDomain_DependencyAPI(inputObject);

      const mappedResultKeys = Object.keys(mappedResult);

      // assert
      expect(mappedResultKeys).not.toContain(nonExistingKey);
    });
  });

  describe("toDomain_DependencyScript method", () => {
    it("should correctly map the expected model fields", () => {
      // arrange
      const inputObject = generateDependencyScript();

      // act
      const mappedResult =
        classUnderTest.toDomain_DependencyScript(inputObject);

      // assert
      expect(mappedResult.name).toEqual(inputObject.name);
      expect(mappedResult.description).toEqual(inputObject.description);
    });

    it("should not map over fields that are not part of the data model", () => {
      // arrange
      const inputObject = generateDependencyScript();
      const nonExistingKey = faker.datatype.string(7);
      inputObject[nonExistingKey] = faker.datatype.string(5);

      // act
      const mappedResult =
        classUnderTest.toDomain_DependencyScript(inputObject);

      const mappedResultKeys = Object.keys(mappedResult);

      // assert
      expect(mappedResultKeys).not.toContain(nonExistingKey);
    });
  });

  describe("toDomain_DependencyDatabase method", () => {
    it("should correctly map the expected model fields", () => {
      // arrange
      const inputObject = generateDependencyDatabase();

      // act
      const mappedResult =
        classUnderTest.toDomain_DependencyDatabase(inputObject);

      // assert
      expect(mappedResult.name).toEqual(inputObject.name);
      expect(mappedResult.technicalName).toEqual(inputObject.technicalName);
      expect(mappedResult.type).toEqual(inputObject.type);
      expect(mappedResult.hostedAt).toEqual(inputObject.hostedAt);
    });

    it("should not map over fields that are not part of the data model", () => {
      // arrange
      const inputObject = generateDependencyDatabase();
      const nonExistingKey = faker.datatype.string(7);
      inputObject[nonExistingKey] = faker.datatype.string(5);

      // act
      const mappedResult =
        classUnderTest.toDomain_DependencyDatabase(inputObject);

      const mappedResultKeys = Object.keys(mappedResult);

      // assert
      expect(mappedResultKeys).not.toContain(nonExistingKey);
    });
  });

  describe("toDomain_Environments method", () => {
    it("should correctly map the expected model fields", () => {
      // arrange
      const inputObject = generateEnvironmentsStrict();

      // act
      const mappedResult = classUnderTest.toDomain_Environments(inputObject);

      // assert
      expect(mappedResult.development).toEqual(inputObject.development);
      expect(mappedResult.staging).toEqual(inputObject.staging);
      expect(mappedResult.production).toEqual(inputObject.production);
    });

    it("should not map over fields that are not part of the data model", () => {
      // arrange
      const inputObject = generateEnvironmentsStrict();
      const nonExistingKey = faker.datatype.string(7);
      inputObject[nonExistingKey] = faker.datatype.string(5);

      // act
      const mappedResult = classUnderTest.toDomain_Environments(inputObject);

      const mappedResultKeys = Object.keys(mappedResult);

      // assert
      expect(mappedResultKeys).not.toContain(nonExistingKey);
    });
  });

  describe("toDomain_Dependencies method", () => {
    it("should correctly map the expected model fields", () => {
      // arrange
      const inputObject = generateDependenciesStrict();

      classUnderTest.toDomain_DependencyAPI = jest.fn().mockReturnValue(42);
      classUnderTest.toDomain_DependencyScript = jest.fn().mockReturnValue(43);
      classUnderTest.toDomain_DependencyDatabase = jest
        .fn()
        .mockReturnValue(44);

      // act
      const mappedResult = classUnderTest.toDomain_Dependencies(inputObject);

      // assert
      expect(mappedResult.apis).toContain(42);
      expect(mappedResult.scripts).toContain(43);
      expect(mappedResult.databases).toContain(44);
    });

    it("toDomain_Dependencies method calls child entity mapper methods", () => {
      // arrange
      const inputObject = generateDependenciesStrict();

      classUnderTest.toDomain_DependencyAPI = jest.fn();
      classUnderTest.toDomain_DependencyScript = jest.fn();
      classUnderTest.toDomain_DependencyDatabase = jest.fn();

      // act
      classUnderTest.toDomain_Dependencies(inputObject);

      // assert
      expect(classUnderTest.toDomain_DependencyAPI).toHaveBeenCalledTimes(
        inputObject.apis.length
      );
      expect(classUnderTest.toDomain_DependencyAPI).toHaveBeenLastCalledWith(
        inputObject.apis[inputObject.apis.length - 1]
      );
      expect(classUnderTest.toDomain_DependencyScript).toHaveBeenCalledTimes(
        inputObject.scripts.length
      );
      expect(classUnderTest.toDomain_DependencyScript).toHaveBeenLastCalledWith(
        inputObject.scripts[inputObject.scripts.length - 1]
      );
      expect(classUnderTest.toDomain_DependencyDatabase).toHaveBeenCalledTimes(
        inputObject.databases.length
      );
      expect(
        classUnderTest.toDomain_DependencyDatabase
      ).toHaveBeenLastCalledWith(
        inputObject.databases[inputObject.databases.length - 1]
      );
    });

    it("should not map over fields that are not part of the data model", () => {
      // arrange
      const inputObject = generateDependenciesStrict();
      const nonExistingKey = faker.datatype.string(7);
      inputObject[nonExistingKey] = faker.datatype.string(5);

      // act
      const mappedResult = classUnderTest.toDomain_Dependencies(inputObject);

      const mappedResultKeys = Object.keys(mappedResult);

      // assert
      expect(mappedResultKeys).not.toContain(nonExistingKey);
    });
  });

  describe("toDomain (APIRecord) method", () => {
    it("should correctly map the expected model fields", () => {
      // arrange
      const inputObject = generateAPIRecord();

      classUnderTest.toDomain_Environments = jest.fn().mockReturnValue(42);
      classUnderTest.toDomain_Dependencies = jest.fn().mockReturnValue(43);
      classUnderTest.toDomain_OtherDocumentation = jest
        .fn()
        .mockReturnValue(44);

      // act
      const mappedResult = classUnderTest.toDomain(inputObject);

      // assert
      expect(mappedResult.id).toEqual(inputObject.id);
      expect(mappedResult.githubId).toEqual(inputObject.githubId);
      expect(mappedResult.name).toEqual(inputObject.name);
      expect(mappedResult.githubUrl).toEqual(inputObject.githubUrl);
      expect(mappedResult.status).toEqual(inputObject.status);

      expect(mappedResult.baseUrl).toEqual(42);
      expect(mappedResult.dependencies).toEqual(43);
      expect(mappedResult.otherDocumentation).toEqual(44);
    });

    it("toDomain method calls child entity mapper methods", () => {
      // arrange
      const inputObject = generateAPIRecord();

      classUnderTest.toDomain_Environments = jest.fn();
      classUnderTest.toDomain_Dependencies = jest.fn();
      classUnderTest.toDomain_OtherDocumentation = jest.fn();

      // act
      classUnderTest.toDomain(inputObject);

      // assert
      expect(classUnderTest.toDomain_Environments).toHaveBeenCalledTimes(1);
      expect(classUnderTest.toDomain_Environments).toHaveBeenLastCalledWith(
        inputObject.baseUrl
      );
      expect(classUnderTest.toDomain_Dependencies).toHaveBeenCalledTimes(1);
      expect(classUnderTest.toDomain_Dependencies).toHaveBeenLastCalledWith(
        inputObject.dependencies
      );
      expect(classUnderTest.toDomain_OtherDocumentation).toHaveBeenCalledTimes(
        1
      );
      expect(
        classUnderTest.toDomain_OtherDocumentation
      ).toHaveBeenLastCalledWith(inputObject.otherDocumentation);
    });

    it("should not map over fields that are not part of the data model", () => {
      // arrange
      const inputObject = generateAPIRecord();
      const nonExistingKey = faker.datatype.string(7);
      inputObject[nonExistingKey] = faker.datatype.string(5);

      // act
      const mappedResult = classUnderTest.toDomain(inputObject);

      const mappedResultKeys = Object.keys(mappedResult);

      // assert
      expect(mappedResultKeys).not.toContain(nonExistingKey);
    });
  });
});

// should recursively scan for keys
//keys should not contain
