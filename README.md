# JSON Conditions
JSON/YAML conditional evaluations with `and`, `or`, `not`, and `equals`.

##### Example:

```js
const conditions = require('json-conditions');

const syntax = {
  doILikeConditions: {
    not: {
      equal: [
        {field: oneVariable},
        {field: anotherVariable}
      ]}
  },
  doILoveConditions: {
    and: [
      {equal: [
        {field: someStringValue},
        {value: 'literal'}
      ]},
      {equal: [
        {field: someBooleanValue},
        {value: true}
      ]}
    ]
  }
};

const fieldData = {
  someStringValue: 'literal',
  someBooleanValue: true,
  oneVariable: 'hello',
  anotherVariable: 'goodbye'
};

function resolveField(n) {
  if (fieldData.hasOwnProperty(n)) {
    return n;
  }
  throw new Error(`Unknown field: ${n}`)
}

const result = conditions.evaluate(resolveField, syntax);

console.log(result.doILikeConditions); // false
console.log(result.doILoveConditions); // true
```

## Methods
### `evaluate(fieldResolverFn, conditionsObj)`
Evaluates each condition to its final true/false value. Fields are resolved by calling the passed-in `fieldResolverFn`.

Since your field values may be stored in a `Map`, a database ORM object or perhaps a basic `Object`,
you must provide your own resolver function which returns the value for a given fieldName. The resolver function should match the signature:  
`fieldResolverFn(fieldName) => field value as boolean | string | number | null`

For a usage example see above.

### `listFields(conditionsObj)`
Finds all `{field: 'name'}` references, and returns an array with all found field names within any
condition.

```js
const conditions = require('json-conditions');

const fieldNames = conditions.listFields({
  firstCond: {
    and: [
      {equal: [
        {field: 'fieldOne'},
        {field: 'fieldTwo'}
      ]},
      {equal: [
        {field: 'fieldThree'},
        {value: 3}
      ]}
    ]
  },
  secondCond: {
    or: [
      {equal: [
        {field: 'fieldThree'},
        {value: 3}
      ]},
      {equal: [
        {field: 'fieldFour'},
        {value: 4}
      ]}
    ]
  }
});

console.log(fieldNames); // [ 'fieldOne', 'fieldTwo', 'fieldThree', 'fieldFour' ]
```

### `validate(conditionsObj)`
Validates the condition object, and throws an error if the syntax is not valid.
The error object will include a `.errors` property with an array of validation errors.

#### Example
```js
const conditions = require('json-conditions');

conditions.validate({
  invalidCondition: {
    and: []
  }
}); // throws an Error, because 'and' must have at least two parameters
```

## Condition Syntax
### `equal`
`{equal: [valueA, valueB]}`

* Only accepts two values
* Each value can be a literal value or a field value
  * Field value `{field: 'fieldName}`, where value is resolved by function passed to `evaluate()`
  * Literal value `{value: 'hello'}`, the value can be in the following forms:
    * Boolean: `{value: true}` `{value: false}`
    * Null: `{value: null}`
    * Number: `{value: 32}`
    * String: `{value: 'string'}`
* Returns `true` if both values are strictly equal `===`

#### Examples
```js
// ensure two fields exactly match
{equal: [
  {field: 'firstField'},
  {field: 'secondField'}
]}
// ensure a field matches a literal value
{equal: [
  {field: 'firstField'},
  {value: 'literal-value'}
]}
```

### `and`
`{and: [...conditions]}`

* Must have at-least 2 conditions, but can have more
* Each condition can be an `and`, `or`, `not`, or `equal` statement
* Returns `true` only if all conditions are `true`

#### Examples
```js
// true if the two fields exactly match
// AND the third field equals 'test'
{and: [
  {equal: [
    {field: 'firstField'},
    {field: 'secondField'}
  ]},
  {equal: [
    {field: 'thirdField'},
    {value: 'test'}
  ]},
]}
```

### `or`
`{or: [...conditions]}`

* Must have at-least 2 conditions, but can have more
* Each condition can be an `and`, `or`, `not`, or `equal` statement
* Returns `true` if any conditions are `true`

#### Examples
```js
// true if the two fields exactly match
// OR the third field equals 'test'
{or: [
  {equal: [
    {field: 'firstField'},
    {field: 'secondField'}
  ]},
  {equal: [
    {field: 'thirdField'},
    {value: 'test'}
  ]},
]}
```

### `not`
`{not: condition}`

* Expects a single condition
* Condition can be an `and`, `or`, `not`, or `equal` statement
* Returns the opposite of the condition

#### Examples
```js
// false if both fields exactly match
// true if the fields do not match
{not: {equal: [
  {field: 'firstField'},
  {field: 'secondField'}
]}}
```
