const mongoose = require("mongoose");
const validator = require("validator");

const problemvalidate = (prob) => {
  console.log("problem des :", prob);

  const requiredFields = [
    "title",
    "description",
    "difficulty",
    "tags",
    "visibleTestCases",
    "startCode",
    "hiddenTestCases"
  ];

  const isValid = requiredFields.every((item) => prob.hasOwnProperty(item));
  if (!isValid) throw new Error("invalid user input missing required fields");

  // --- visibleTestCases ---
  if (!Array.isArray(prob.visibleTestCases))
    throw new Error("visibleTestCases must be an array");

  for (let i of prob.visibleTestCases) {
    if (!i.input || !i.output || !i.explanation) {
      throw new Error(
        "Each visibleTestCase must have input, output, and explanation"
      );
    }
    if (
      !validator.isLength(i.input, { min: 1 }) ||
      !validator.isLength(i.output, { min: 1 }) ||
      !validator.isLength(i.explanation, { min: 1 })
    ) {
      throw new Error("visibleTestCase fields cannot be empty");
    }
  }

  // --- hiddenTestCases ---
  if (!Array.isArray(prob.hiddenTestCases))
    throw new Error("hiddenTestCases must be an array");

  for (let i of prob.hiddenTestCases) {
    if (!i.input || !i.output) {
      throw new Error("Each hiddenTestCase must have input and output");
    }
  }

  // --- startCode ---
  if (!Array.isArray(prob.startCode))
    throw new Error("startCode must be an array");

  for (let i of prob.startCode) {
    if (!i.language || !i.initialCode) {
      throw new Error("Each startCode must have language and initialCode");
    }
  }

  return true; 
};

module.exports = problemvalidate;

// --- problemcreator ---
//   if (!validator.isMongoId(prob.problemcreator.toString())) {
//     throw new Error("problemcreator must be a valid MongoDB ObjectId");
//   }
