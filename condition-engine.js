const conditionMethods = {
  equal(fieldResolver, [valueA, valueB]) {
    const a = execute(fieldResolver, valueA);
    const b = execute(fieldResolver, valueB);
    //console.log('  equal:', a === b);
    return a === b;
  },
  and(fieldResolver, conditions) {
    const foundFalse = conditions.findIndex(condition => {
      const x = execute(fieldResolver, condition);
      return x === false;
    });
    //console.log('  and:', foundFalse === -1);
    return foundFalse === -1; // want all true
  },
  or(fieldResolver, conditions) {
    const foundTrue = conditions.findIndex(condition => {
      const x = execute(fieldResolver, condition);
      return x === true;
    });
    //console.log('  or:', foundTrue > -1);
    return foundTrue > -1; // want any item true
  },
  not(fieldResolver, condition) {
    const x = execute(fieldResolver, condition);
    //console.log('  not:', !x);
    return !x;
  },
  value(fieldResolver, literal) {
    //console.log('  value:', literal);
    return literal;
  },
  field(fieldResolver, fieldName) {
    const x = fieldResolver(fieldName);
    //console.log(`  field ${fieldName}:`, x);
    return x;
  }
};

function execute(fieldResolver, conditionObject) {
  const keys = Object.keys(conditionObject);
  const methodName = keys.find(k => conditionMethods[k]);
  const fn = conditionMethods[methodName];
  const args = conditionObject[methodName];
  return fn(fieldResolver, args);
}

module.exports = execute;
