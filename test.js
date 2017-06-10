const assert = require('assert');

const {evaluate, listFields} = require('./');

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

addTest('List Fields', () => {
  const fields = listFields({
    andCond: {
      and: [
        {equal: [
          {field: 'one'},
          {field: 'two'}
        ]},
        {equal: [
          {field: 'three'},
          {value: 3}
        ]}
      ]
    },
    orCond: {
      or: [
        {equal: [
          {field: 'one'},
          {field: 'two'}
        ]},
        {equal: [
          {field: 'three'},
          {value: 3}
        ]}
      ]
    },
    notCond: {
      not: {equal: [
        {field: 'four'},
        {field: 'three'}
      ]}
    },
    equalCond: {
      equal: [
        {field: 'five'},
        {value: 'val'}
      ]
    },
    mixedCond: {
      or: [
        {and: [
          {not: {equal: [
              {field: 'six'},
              {value: 6}
          ]}},
          {equal: [
            {field: 'seven'},
            {value: 7}
          ]}
        ]},
        {equal: [
          {field: 'five'},
          {value: 5}
        ]}
      ]
    }
  });
  assert.deepEqual(fields, ['one', 'two', 'three', 'four', 'five', 'six', 'seven'])
});

addTest('Basic equal', () => {
  const out = evaluate(testResolver, {
    equalTrue: {
      equal: [
        {field: 'fieldFalse'},
        {value: false}
      ]
    },
    equalFalse: {
      equal: [
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
        {equal: [
          {field: 'fieldTrue'},
          {value: true}
        ]},
        {equal: [
          {field: 'fieldFalse'},
          {value: false}
        ]},
        {equal: [
          {field: 'fieldNull'},
          {value: null}
        ]},
        {equal: [
          {field: 'fieldHello'},
          {value: 'hello'}
        ]},
        {equal: [
          {field: 'fieldTen'},
          {value: 10}
        ]}
      ]
    },
    andFalse: {
      and: [
        {equal: [
          {field: 'fieldTrue'},
          {value: true}
        ]},
        {equal: [
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
        {equal: [
          {field: 'fieldTrue'},
          {value: 'wrong'}
        ]},
        {equal: [
          {field: 'fieldFalse'},
          {value: 'wrong'}
        ]},
        {equal: [
          {field: 'fieldNull'},
          {value: 'wrong'}
        ]},
        {equal: [
          {field: 'fieldHello'},
          {value: 'hello'}
        ]},
        {equal: [
          {field: 'fieldTen'},
          {value: 10}
        ]}
      ]
    },
    orFalse: {
      or: [
        {equal: [
          {field: 'fieldTrue'},
          {value: 'wrong'}
        ]},
        {equal: [
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
        equal: [
          {field: 'fieldTrue'},
          {value: false}
        ]
      }
    },
    notFalse: {
      not: {
        equal: [
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
          {equal: [
            {field: 'fieldTrue'},
            {value: false}
          ]},
          {equal: [
            {field: 'fieldTrue'},
            {value: false}
          ]}
        ]},
        {not: {
          equal: [
            {field: 'fieldTrue'},
            {value: false}
          ]
        }}
      ]
    },
    andOrNotTrue: {
      and: [
        {or: [
          {equal: [
            {field: 'fieldTrue'},
            {value: false}
          ]},
          {equal: [
            {field: 'fieldTrue'},
            {value: true}
          ]}
        ]},
        {not: {
          equal: [
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
          {equal: [
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
          {equal: [
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
        equal: [
          {field: 'fieldFalse'}
        ]
      }
    });
  }, (err) => {
    const minTwo = err.errors.find(({keyword}) => keyword === 'minItems');
    return minTwo && minTwo.dataPath === '[\'invalidEqual\'].equal' && minTwo.params.limit === 2;
  })
});
addTest('Validate maxItems equal', () => {
  assert.throws(() => {
    evaluate(testResolver, {
      invalidEqual: {
        equal: [
          {field: 'fieldFalse'},
          {value: false},
          {field: 'fieldTrue'}
        ],
      }
    });
  }, (err) => {
    const maxTwo = err.errors.find(({keyword}) => keyword === 'maxItems');
    return maxTwo && maxTwo.dataPath === '[\'invalidEqual\'].equal' && maxTwo.params.limit === 2;
  })
});
addTest('Validate badparam equal', () => {
  assert.throws(() => {
    evaluate(testResolver, {
      invalidEqual: {
        equal: [
          {and: [
            {equal: [
              {field: 'fieldTrue'},
              {value: true}
            ]},
            {equal: [
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
    return notOneOf && notOneOf.dataPath === '[\'invalidEqual\'].equal[0]';
  })
});
addTest('Validate corrupt param', () => {
  assert.throws(() => {
    evaluate(testResolver, {
      invalidParam: {
        and: [
          {bad: 'value'},
          {equal: [
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
