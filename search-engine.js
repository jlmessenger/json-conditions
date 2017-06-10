function searchThemAll(fieldCollector, conditions) {
  conditions.forEach(condition => {
    search(fieldCollector, condition)
  });
}
const searchMethods = {
  equals(fieldCollector, [valueA, valueB]) {
    search(fieldCollector, valueA);
    search(fieldCollector, valueB);
  },
  and: searchThemAll,
  or: searchThemAll,
  not(fieldCollector, condition) {
    search(fieldCollector, condition);
  },
  value(fieldCollector, literal) {},
  field(fieldCollector, fieldName) {
    fieldCollector(fieldName);
  }
}
function search(fieldCollector, conditionObject) {
  const keys = Object.keys(conditionObject);
  const methodName = keys.find(k => searchMethods[k]);
  const fn = searchMethods[methodName];
  const args = conditionObject[methodName];
  fn(fieldCollector, args);
}

module.exports = search;
