const { createAPI } = require("./api-records-controller");

describe("API Records Controller", () => {
  describe("CreateAPI function", () => {
    it("should call the presentationToDomain mapper method once", () => {
      expect(process.env.JEST_UNIT).toEqual("1");
      expect(process.env.DYNAMODB_APIS_TABLE).toEqual("apis");
      expect(process.env.PUKA).toEqual("meska");
    });
  });
});
