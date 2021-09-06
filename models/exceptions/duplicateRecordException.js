class DuplicateRecordException extends Error {
  constructor(message) {
    super(message);
    this.name = "DuplicateRecordException";
  }
}

module.exports = {
  DuplicateRecordException,
};
