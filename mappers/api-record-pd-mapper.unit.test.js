const { PresentationDomainMapper } = require("./api-record-pd-mapper");
const { generateOtherDocumentation } = require("../helpers/tests/generators");

const faker = require("faker");

describe("Presentation/Domain boundary mapper", () => {
  let classUnderTest;

  beforeAll(() => {
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
});

// should recursively scan for keys
//keys should not contain
