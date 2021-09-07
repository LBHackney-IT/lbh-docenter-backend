class RecordNotFoundException extends Error {
  constructor(message) {
    super(message);
    this.name = "RecordNotFoundException";
  }
}

module.exports = {
  RecordNotFoundException,
};
