const fs = require('fs');

const Ajv = require('ajv');
const yaml = require('js-yaml');

const conditionEngine = require('./condition-engine');

const schemaCondition = yaml.safeLoad(fs.readFileSync('schema-condition.yml', 'utf8'));

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

module.exports = {
  validate,
  evaluate
};
