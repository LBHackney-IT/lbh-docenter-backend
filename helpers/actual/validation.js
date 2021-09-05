const nonEmpty = (text) =>
  typeof text === "string" && Boolean(text?.replace(/\s+/g, ""));

module.exports = {
  nonEmpty,
};
