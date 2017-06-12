const fs = require('fs');

const Ajv = require('ajv');

const conditionEngine = require('./condition-engine');
const searchEngine = require('./search-engine');
const schemaCondition = require('./schema-condition');

const ajv = new Ajv();
const conditionValidator = ajv.compile(schemaCondition);

// validates the conditional data
// to ensure it passes the json schema
function validate(conditionObject) {
  var valid = conditionValidator(conditionObject);
  if (!valid) {
    const ex = new Error('Failed json-schema Validation');
    ex.errors = conditionValidator.errors;
    throw ex;
  }
}

// evaluates the conditionals for each property
// to get the true/false output for each
// fieldResolver - function(fieldName) => fieldValue
// conditionsObject - object that describes the conditional logic
function evaluate(fieldResolver, conditionsObject) {
  validate(conditionsObject);
  return Object.keys(conditionsObject).reduce((copy, key) => {
    const conditionObject = conditionsObject[key];
    //console.log(`-${key}:`);
    copy[key] = conditionEngine(fieldResolver, conditionObject);
    return copy;
  }, {});
}

// builds a list of all fields used in any conditionals
// conditionsObject - object that describes the conditional logic
function listFields(conditionsObject) {
  validate(conditionsObject);
  const fieldNames = new Set();
  const fieldCollector = (fieldName) => {
    fieldNames.add(fieldName);
  };
  Object.keys(conditionsObject).forEach((key) => {
    const conditionObject = conditionsObject[key];
    searchEngine(fieldCollector, conditionObject);
  });
  return Array.from(fieldNames);
}

module.exports = {
  validate,
  evaluate,
  listFields
};
