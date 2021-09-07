const { PresentationDomainMapper } = require("./api-record-pd-mapper");
const {
  generateOtherDocumentation,
  generateEndpoint,
  generateDependencyAPI,
  generateDependencyScript,
  generateDependencyDatabase,
  generateEnvironmentsStrict,
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
});

// should recursively scan for keys
//keys should not contain
