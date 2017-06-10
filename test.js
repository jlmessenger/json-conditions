const assert = require('assert');

const evaluate = require('./').evaluate;

const tests = [];
function addTest(name, fn) {
  tests.push({name, fn});
}

function testResolver(fieldName) {
  switch(fieldName) {
    case 'fieldTrue': return true;
    case 'fieldFalse': return false;
    case 'fieldNull': return null;
    case 'fieldHello': return 'hello';
    case 'fieldTen': return 10;
  }
  throw new Error(`Unknown field: ${fieldName}`);
}

addTest('Basic equal', () => {
  const out = evaluate(testResolver, {
    equalTrue: {
      equals: [
        {field: 'fieldFalse'},
        {value: false}
      ]
    },
    equalFalse: {
      equals: [
        {field: 'fieldHello'},
        {value: null}
      ]
    }
  });
  assert.deepEqual(out, {equalTrue: true, equalFalse: false});
});
addTest('Basic and', () => {
  const out = evaluate(testResolver, {
    andTrue: {
      and: [
        {equals: [
          {field: 'fieldTrue'},
          {value: true}
        ]},
        {equals: [
          {field: 'fieldFalse'},
          {value: false}
        ]},
        {equals: [
          {field: 'fieldNull'},
          {value: null}
        ]},
        {equals: [
          {field: 'fieldHello'},
          {value: 'hello'}
        ]},
        {equals: [
          {field: 'fieldTen'},
          {value: 10}
        ]}
      ]
    },
    andFalse: {
      and: [
        {equals: [
          {field: 'fieldTrue'},
          {value: true}
        ]},
        {equals: [
          {field: 'fieldHello'},
          {value: 'wrong'}
        ]}
      ]
    }
  });
  assert.deepEqual(out, {andTrue: true, andFalse: false});
});
addTest('Basic or', () => {
  const out = evaluate(testResolver, {
    orTrue: {
      or: [
        {equals: [
          {field: 'fieldTrue'},
          {value: 'wrong'}
        ]},
        {equals: [
          {field: 'fieldFalse'},
          {value: 'wrong'}
        ]},
        {equals: [
          {field: 'fieldNull'},
          {value: 'wrong'}
        ]},
        {equals: [
          {field: 'fieldHello'},
          {value: 'hello'}
        ]},
        {equals: [
          {field: 'fieldTen'},
          {value: 10}
        ]}
      ]
    },
    orFalse: {
      or: [
        {equals: [
          {field: 'fieldTrue'},
          {value: 'wrong'}
        ]},
        {equals: [
          {field: 'fieldHello'},
          {value: 'wrong'}
        ]}
      ]
    }
  });
  assert.deepEqual(out, {orTrue: true, orFalse: false});
});
addTest('Basic not', () => {
  const out = evaluate(testResolver, {
    notTrue: {
      not: {
        equals: [
          {field: 'fieldTrue'},
          {value: false}
        ]
      }
    },
    notFalse: {
      not: {
        equals: [
          {field: 'fieldTrue'},
          {value: true}
        ]
      }
    }
  });
  assert.deepEqual(out, {notTrue: true, notFalse: false});
});
addTest('Nested conditions', () => {
  const out = evaluate(testResolver, {
    orAndNotTrue: {
      or: [
        {and: [
          {equals: [
            {field: 'fieldTrue'},
            {value: false}
          ]},
          {equals: [
            {field: 'fieldTrue'},
            {value: false}
          ]}
        ]},
        {not: {
          equals: [
            {field: 'fieldTrue'},
            {value: false}
          ]
        }}
      ]
    },
    andOrNotTrue: {
      and: [
        {or: [
          {equals: [
            {field: 'fieldTrue'},
            {value: false}
          ]},
          {equals: [
            {field: 'fieldTrue'},
            {value: true}
          ]}
        ]},
        {not: {
          equals: [
            {field: 'fieldTrue'},
            {value: false}
          ]
        }}
      ]
    }
  });
  assert.deepEqual(out, {orAndNotTrue: true, andOrNotTrue: true});
});
addTest('Validate minItems and', () => {
  assert.throws(() => {
    evaluate(testResolver, {
      invalidAnd: {
        and: [
          {equals: [
            {field: 'fieldFalse'},
            {value: false}
          ]}
        ]
      }
    });
  }, (err) => {
    const minTwo = err.errors.find(({keyword}) => keyword === 'minItems');
    return minTwo && minTwo.dataPath === '[\'invalidAnd\'].and' && minTwo.params.limit === 2;
  })
});
addTest('Validate minItems or', () => {
  assert.throws(() => {
    evaluate(testResolver, {
      invalidOr: {
        or: [
          {equals: [
            {field: 'fieldFalse'},
            {value: false}
          ]}
        ]
      }
    });
  }, (err) => {
    const minTwo = err.errors.find(({keyword}) => keyword === 'minItems');
    return minTwo && minTwo.dataPath === '[\'invalidOr\'].or' && minTwo.params.limit === 2;
  })
});
addTest('Validate minItems equal', () => {
  assert.throws(() => {
    evaluate(testResolver, {
      invalidEqual: {
        equals: [
          {field: 'fieldFalse'}
        ]
      }
    });
  }, (err) => {
    const minTwo = err.errors.find(({keyword}) => keyword === 'minItems');
    return minTwo && minTwo.dataPath === '[\'invalidEqual\'].equals' && minTwo.params.limit === 2;
  })
});
addTest('Validate maxItems equal', () => {
  assert.throws(() => {
    evaluate(testResolver, {
      invalidEqual: {
        equals: [
          {field: 'fieldFalse'},
          {value: false},
          {field: 'fieldTrue'}
        ],
      }
    });
  }, (err) => {
    const maxTwo = err.errors.find(({keyword}) => keyword === 'maxItems');
    return maxTwo && maxTwo.dataPath === '[\'invalidEqual\'].equals' && maxTwo.params.limit === 2;
  })
});
addTest('Validate badparam equal', () => {
  assert.throws(() => {
    evaluate(testResolver, {
      invalidEqual: {
        equals: [
          {and: [
            {equals: [
              {field: 'fieldTrue'},
              {value: true}
            ]},
            {equals: [
              {field: 'fieldTrue'},
              {value: true}
            ]}
          ]},
          {value: true},
        ],
      }
    });
  }, (err) => {
    const notOneOf = err.errors.find(({keyword}) => keyword === 'oneOf');
    return notOneOf && notOneOf.dataPath === '[\'invalidEqual\'].equals[0]';
  })
});
addTest('Validate corrupt param', () => {
  assert.throws(() => {
    evaluate(testResolver, {
      invalidParam: {
        and: [
          {bad: 'value'},
          {equals: [
            {field: 'fieldTrue'},
            {value: true}
          ]}
        ]
      }
    });
  }, (err) => {
    const notOneOf = err.errors.find(({keyword}) => keyword === 'oneOf');
    return notOneOf && notOneOf.dataPath === '[\'invalidParam\'].and[0]';
  })
});

let failed = false;
tests.forEach(({name, fn}) => {
  let ex = false;
  const start = Date.now();
  try {
    fn();
  } catch (e) {
    ex = e;
  }
  const msTime = Date.now() - start;
  if (ex) {
    failed = true;
    console.log(`${name} - [${msTime}ms] FAILED`);
    console.log(ex);
  } else {
    console.log(`${name} - [${msTime}ms] OK`);
  }
});
if (failed) {
  process.exit(1);
}
