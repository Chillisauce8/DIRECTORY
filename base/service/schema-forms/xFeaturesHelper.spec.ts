import {evalInContext, prepareRelativeJs, XFeaturesHelper} from './xFeaturesHelper';


describe('xFeaturesHelper2', () => {
  let xFeaturesHelper;

  beforeEach(() => {
    xFeaturesHelper = new XFeaturesHelper(null, null);
  });

  it('should be defined', function () {
    expect(xFeaturesHelper).toBeDefined();
  });

  describe('isFormulaTypeValue method', () => {

    it('should return false for undefined', () => {
      const result = xFeaturesHelper.isFormulaTypeValue(undefined);
      expect(result).toBeFalsy();
    });
  });

  describe('evalInContext function', () => {

    it('should execute js expression', () => {
      const result = evalInContext('2 + 3 > 1 + 2');
      expect(result).toEqual(true);
    });

    it('should execute js expression with context', () => {
      const result = evalInContext('this.a + 3 > this.b.c + 2', {a: 2, b: {c: 1}});
      expect(result).toEqual(true);
    });

    it('should execute js expression with context', () => {
      const result = evalInContext('this.a+this.b.c+2', {a: 2, b: {c: 1}});
      expect(result).toEqual(5);
    });
  });

  describe('prepareRelativeJs function', () => {

    it('should do nothing with not relative js', () => {
      const input = 'a > 2';
      const result = prepareRelativeJs(input, '');
      expect(result).toEqual(input);
    });

    it('should replace G/ with this.', () => {
      const input = 'G/indexes.length > 2';
      const result = prepareRelativeJs(input, '');
      expect(result).toEqual('this.global.indexes.length > 2');
    });

    it('should replace several G/ with this.', () => {
      const input = 'G/indexes.length == G/supplier.count';
      const result = prepareRelativeJs(input, '');
      expect(result).toEqual('this.global.indexes.length == this.global.supplier.count');
    });

    it('should replace ./ with this. and absolute paths', () => {
      const input = './model.length == ./model.count';
      const result = prepareRelativeJs(input, 'test.path');
      expect(result).toEqual('this.test.path.model.length == this.test.path.model.count');
    });

    it('should replace / with this.', () => {
      const input = '/model.length / /model.count == 2';
      const result = prepareRelativeJs(input, '');
      expect(result).toEqual('this.model.length / this.model.count == 2');
    });

    it('should replace / with this. if it borders with (', () => {
      const input = '(/model.length) / (/model.count) == 2';
      const result = prepareRelativeJs(input, '');
      expect(result).toEqual('(this.model.length) / (this.model.count) == 2');
    });

    it('should replace all ../ with this. and paths', () => {
      const input = './model + ../model + ../../model == ../../../model + /model';
      const result = prepareRelativeJs(input, 'a.b.c.d');

      expect(result).toEqual(
        'this.a.b.c.d.model + this.a.b.c.model + this.a.b.model == this.a.model + this.model');
    });
  });

  describe('prepareExecutionContext method', () => {

    it('should execute js expression', () => {
      const description = {
        rawData: {
          'let a': 'this.eventSummary.section + " test"',
          'let b': '" - " + this.test',
          'let c': 'this.a + this.b',
        }
      };

      const context = {
        eventSummary: {
          section: 'stag'
        },
        test: '23',
        _cachedFunction: {},
      };

      const executionContext = xFeaturesHelper.prepareExecutionContext(description, context);

      expect(executionContext.test).toEqual('23');
      expect(executionContext.eventSummary.section).toEqual('stag');
      expect(executionContext.a).toEqual('stag test');
      expect(executionContext.b).toEqual(' - 23');
      expect(executionContext.c).toEqual('stag test - 23');
    });
  });

  describe('getValueValue method', () => {

    it('should get value without "then"', () => {
      const cachePath = 'testPath';

      const keyDescription = {
        value: true
      };

      const executionContext = {
        test: '23',
        _cachedFunction: {},
      };

      const value = xFeaturesHelper.getValueValue('', cachePath, cachePath, keyDescription, executionContext);
      expect(value).toEqual(true);
    });

    it('should get value with "then"', () => {
      const cachePath = 'testPath';

      const keyDescription = {
        then: {
          value: true
        }
      };

      const executionContext = {
        test: '23',
        _cachedFunction: {},
      };

      const value = xFeaturesHelper.getValueValue('', cachePath, cachePath, keyDescription, executionContext);
      expect(value).toEqual(true);
    });

    it('should Calculate value with "then"', () => {
      const cachePath = 'testPath';

      const keyDescription = {
        then: {
          value: '2 * this.test'
        }
      };

      const executionContext = {
        test: '23',
        _cachedFunction: {},
      };

      const value = xFeaturesHelper.getValueValue('', cachePath, cachePath, keyDescription, executionContext);
      expect(value).toEqual(46);
    });

    it('should return object as result if it is set', () => {
      const cachePath = 'testPath';

      const keyDescription = {
        then: {
          value: {
            hide: true,
            required: false,
          }
        }
      };

      const executionContext = {
        test: '23',
        _cachedFunction: {},
      };

      const value = xFeaturesHelper.getValueValue('', cachePath, cachePath, keyDescription, executionContext);
      expect(value).toEqual({
        hide: true,
        required: false,
      });
    });
  });

  describe('getValueForXKey method', () => {

    it('should get value without "then"', () => {
      const description = {
        path: 'testPath',
        rawData: {
          hide: {
            if: 'this.test > 10',
            value: 30,
          }
        },
      };

      const keyName = 'hide';

      const executionContext = {
        test: '23',
        _cachedFunction: {},
      };

      const value = xFeaturesHelper.getValueForXKey(keyName, description, executionContext);
      expect(value).toEqual(30);
    });

    it('should get value without "then" and complex if', () => {
      const description = {
        path: 'testPath',
        rawData: {
          required: {
            if: 'this.test > 10 && this.test2.test3 === 10',
            value: 20,
          },
          hide: {
            if: 'this.test > 10 && this.test2.test3 === 10',
            value: 30,
          }
        },
      };

      const keyName = 'hide';

      const executionContext = {
        test: 23,
        test2: {
          test3: 10
        },
        _cachedFunction: {},
      };

      const value = xFeaturesHelper.getValueForXKey(keyName, description, executionContext);
      expect(value).toEqual(30);
    });

    it('should get value with "then"', () => {
      const description = {
        path: 'testPath',
        rawData: {
          hide: {
            if: 'this.test > 10',
            then: {
              value: 30,
            }
          }
        },
      };

      const keyName = 'hide';

      const executionContext = {
        test: '23',
        _cachedFunction: {},
      };

      const value = xFeaturesHelper.getValueForXKey(keyName, description, executionContext);
      expect(value).toEqual(30);
    });
  });

  it('should get value of else if', () => {
    const description = {
      path: 'testPath',
      rawData: {
        hide: {
          if: 'this.test < 10',
          value: 30,
          else: [{
            if: 'this.test < 20',
            value: 20,
          }, {
            if: 'this.test < 30',
            value: 10,
          }]
        }
      },
    };

    const keyName = 'hide';

    const executionContext = {
      test: '23',
      _cachedFunction: {},
    };

    const value = xFeaturesHelper.getValueForXKey(keyName, description, executionContext);
    expect(value).toEqual(10);
  });

  describe('getControlFeatures method', () => {

    it('should work for function level if', () => {

      const description = {
        path: 'testPath',
        rawData: {
          'let a': 'this.level1.level2 * 2',
          'let b': 'this.test',
          hide: {
            if: 'this.a + this.b < 30',
            value: true,
          },
          required: {
            if: 'this.a + this.b > 30',
            value: true,
            else: {
              value: false
            }
          },
          readOnly: {
            if: 'this.a + this.b > 30',
            value: true,
            else: [{
              if: 'this.a + this.b < 30',
              then: {
                value: false
              }
            }]
          }
        }
      };

      const context = {
        level1: {
          level2: 3
        },
        test: 23,
        _cachedFunction: {},
      };

      const values = xFeaturesHelper.getControlFeatures(description, context);
      expect(values).toEqual({hide: true, required: false, readOnly: false});
    });

    it('should work for if level', () => {

      const description = {
        path: 'testPath',
        rawData: {
          'let a': 'this.level1.level2 * 2',
          'let b': 'this.test',
          if: 'this.a + this.b < 30',
          value: {
            hide: true,
            required: false,
          }
        }
      };

      const context = {
        level1: {
          level2: 3
        },
        test: 23,
        _cachedFunction: {},
      };

      const values = xFeaturesHelper.getControlFeatures(description, context);
      expect(values).toEqual({hide: true, required: false});
    });

    it('should work for function level switch with then', () => {

      const description = {
        path: 'testPath',
        rawData: {
          'let a': 'this.level1.level2 * 2',
          'let b': 'this.test',
          hide: {
            switch: 'this.a + this.b',
            cases: [{
                case: 30,
                then: {
                  value: false
                }
              }, {
                case: 29,
                then: {
                  value: true
                }
              }]
          }
        }
      };

      const context = {
        level1: {
          level2: 3
        },
        test: 23,
        _cachedFunction: {},
      };

      const values = xFeaturesHelper.getControlFeatures(description, context);
      expect(values).toEqual({hide: true});
    });

    it('should work for function level switch without then', () => {

      const description = {
        path: 'testPath',
        rawData: {
          'let a': 'this.level1.level2 * 2',
          'let b': 'this.test',
          hide: {
            switch: 'this.a + this.b',
            cases: [{
              case: 29,
              value: false
            }, {
              case: 30,
                value: true
            }]
          }
        }
      };

      const context = {
        level1: {
          level2: 3
        },
        test: 23,
        _cachedFunction: {},
      };

      const values = xFeaturesHelper.getControlFeatures(description, context);
      expect(values).toEqual({hide: false});
    });

    it('should work for function level switch default', () => {

      const description = {
        path: 'testPath',
        rawData: {
          'let a': 'this.level1.level2 * 2',
          'let b': 'this.test',
          hide: {
            switch: 'this.a + this.b',
            cases: [{
              case: 31,
              value: true
            }, {
              case: 30,
              value: true
            }, {
              value: false
            }]
          }
        }
      };

      const context = {
        level1: {
          level2: 3
        },
        test: 23,
        _cachedFunction: {},
      };

      const values = xFeaturesHelper.getControlFeatures(description, context);
      expect(values).toEqual({hide: false});
    });

    it('should work for function level switch and if', () => {

      const description = {
        path: 'testPath',
        rawData: {
          'let a': 'this.level1.level2 * 2',
          'let b': 'this.test',
          hide: {
            switch: 'this.a + this.b',
            cases: [{
              case: 29,
              value: true
            }, {
              case: 30,
              value: false
            }, {
              value: false
            }]
          },
          required: {
            if: 'this.a + this.b > 30',
            value: true,
            else: {
              value: false
            }
          },
        }
      };

      const context = {
        level1: {
          level2: 3
        },
        test: 23,
        _cachedFunction: {},
      };

      const values = xFeaturesHelper.getControlFeatures(description, context);
      expect(values).toEqual({hide: true, required: false});
    });

    it('should work for switch level', () => {

      const description = {
        path: 'testPath',
        rawData: {
          'let a': 'this.level1.level2 * 2',
          'let b': 'this.test',
          switch: 'this.a + this.b',
          cases: [{
            case: 30,
            value: {
              hide: false,
              required: true,
            }
          }, {
            case: 29,
            value: {
              hide: true,
              required: false,
            }
          }]
        }
      };

      const context = {
        level1: {
          level2: 3
        },
        test: 23,
        _cachedFunction: {},
      };

      const values = xFeaturesHelper.getControlFeatures(description, context);
      expect(values).toEqual({hide: true, required: false});
    });

  });


});
