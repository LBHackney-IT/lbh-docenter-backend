const { APIRecordUseCase } = require("./api-record-uc");

describe("Post API Record UC method", () => {
  let mockGateway;
  let classUnderTest;

  beforeAll(() => {
    mockGateway = { executePost: jest.fn() };
    classUnderTest = new APIRecordUseCase(mockGateway);
  });

  afterEach(() => {
    mockGateway.executePost.mockReset();
  });

  it("should call the gateway Post method once", () => {
    // arrange
    const irrelenvantArg = {};

    // act
    classUnderTest.executePost(irrelenvantArg);

    // assert
    expect(mockGateway.executePost).toHaveBeenCalledTimes(1);
  });
});
