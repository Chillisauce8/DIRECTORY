import * as chai from 'chai';
import {expect} from 'chai';
import * as spies from 'chai-spies';
import 'mocha';
import {
  ChangeType,
  DiffNode,
  RestoreHistoryStateHelper,
  restoreHistoryStateHelperFactory,
} from './restoreHistoryStateHelper';


chai.use(spies);


describe('restoreHistoryState', () => {
  let restoreHistoryStateHelper: RestoreHistoryStateHelper;

  beforeEach(() => {
    restoreHistoryStateHelper = restoreHistoryStateHelperFactory();
  });

  describe('#isChangeDescription', () => {
    it('should return FALSE if "value" is not defined', () => {
      const result = restoreHistoryStateHelper.isChangeDescription(null);

      expect(result).to.equal(false);
    });

    it('should return FALSE if "type" field in not defined', () => {
      const result = restoreHistoryStateHelper.isChangeDescription({});

      expect(result).to.equal(false);
    });

    it('should return FALSE if value of "type" field is not correct', () => {
      const result = restoreHistoryStateHelper.isChangeDescription({type: 'incorrect'});

      expect(result).to.equal(false);
    });

    it('should return FALSE if there isn\'t "data" fields', () => {
      const result = restoreHistoryStateHelper.isChangeDescription({type: ChangeType.created});

      expect(result).to.equal(false);
    });

    it('should return TRUE if "type" is "created" and "data" exists', () => {
      const result = restoreHistoryStateHelper.isChangeDescription({type: ChangeType.created, data: null});

      expect(result).to.equal(true);
    });

    it('should return TRUE if "type" is "updated" and "data" exists', () => {
      const result = restoreHistoryStateHelper.isChangeDescription({type: ChangeType.updated, data: null});

      expect(result).to.equal(true);
    });

    it('should return TRUE if "type" is "deleted" and "data" exists', () => {
      const result = restoreHistoryStateHelper.isChangeDescription({type: ChangeType.deleted, data: null});

      expect(result).to.equal(true);
    });
  });

  describe('#processField', () => {
    it('should return UNDEFINED if changeDescription.type === "created"', () => {
      const result = restoreHistoryStateHelper.processField({
        type: ChangeType.created,
        data: 123
      });

      expect(result).to.equal(undefined);
    });

    it('should return changeDescription.data value if changeDescription.type === "updated"', () => {
      const oldValue = 321;
      const currentValue = 123;

      const result = restoreHistoryStateHelper.processField({
        type: ChangeType.updated,
        data: oldValue,
        newData: currentValue
      });

      expect(result).to.equal(oldValue);
    });

    it('should return changeDescription.data value if changeDescription.type === "deleted"', () => {
      const oldValue = 312;

      const result = restoreHistoryStateHelper.processField({
        type: ChangeType.deleted,
        data: oldValue
      });

      expect(result).to.equal(oldValue);
    });
  });

  describe('#processArray', () => {
    const spyProcessField = () => {
      chai.spy.on(restoreHistoryStateHelper, 'processField', () => null);
    };

    const spyRestore = () => {
      chai.spy.on(restoreHistoryStateHelper, 'restoreByDiff', () => null);
    };

    afterEach(() => chai.spy.restore());

    it('should call this.processField if diff.item.data is a changeDescription', () => {
      spyProcessField();

      const diffData = {type: ChangeType.updated, data: 123};

      restoreHistoryStateHelper.processArray([null, null, null], [{index: 0, data: diffData}]);

      expect(restoreHistoryStateHelper.processField).to.have.been.called.with(diffData);
    });

    it('should call this.restoreByDiff if diff.item.data is a changeDescription', () => {
      spyRestore();

      const diffData = {test: {type: ChangeType.updated, data: 123}};

      restoreHistoryStateHelper.processArray([1, 2, 3], [{index: 0, data: diffData}]);

      expect(restoreHistoryStateHelper.restoreByDiff).to.have.been.called.with(1, diffData);
    });

    it('should filter null and undefined values from array', () => {
      spyProcessField();

      const diffData = {type: ChangeType.created, data: 123};

      const result = restoreHistoryStateHelper
          .processArray([1, 123, 123], [{index: 1, data: diffData}, {index: 2, data: diffData}]);

      expect(result).to.deep.equal([1]);
    });
  });

  describe('#isInitialDiff', () => {
    it('should return FALSE if diff is not ChangeDescription', () => {
      const result = restoreHistoryStateHelper.isInitialDiff({data: null}, false);

      expect(result).to.equal(false);
    });

    it('should return FALSE if diff.type !== ChangeType.created', () => {
      const result = restoreHistoryStateHelper.isInitialDiff({type: ChangeType.updated, data: null}, false);

      expect(result).to.equal(false);
    });

    it('should return FALSE it\'s recursive call', () => {
      const result = restoreHistoryStateHelper.isInitialDiff({type: ChangeType.created, data: null}, true);

      expect(result).to.equal(false);
    });

    it('should return TRUE if it is not recursive call and diff.type === ChangeType.created', () => {
      const result = restoreHistoryStateHelper.isInitialDiff({type: ChangeType.created, data: null}, false);

      expect(result).to.equal(true);
    });
  });

  describe('#processInitialDiff', () => {
    it('should replace fields in DATA with fields from diff.data', () => {
      const data = {test: 'test'};

      const diff = {type: ChangeType.created, data: {test: 'testNew', test2: 'test2'}};

      const result = restoreHistoryStateHelper.processInitialDiff(data, diff);

      expect(result.test).to.equal(diff.data.test);
      expect(result.test2).to.equal(diff.data.test2);
    });

    it('should ignore field if it\'s name specified in ignoreFields list', () => {
      const data = {test: 'test'};

      const diff = {type: ChangeType.created, data: {test: 'testNew', test2: 'test2'}};

      const ignoreFields = ['test2'];

      const result = restoreHistoryStateHelper.processInitialDiff(data, diff, ignoreFields);

      expect(result.test).to.equal(diff.data.test);
      expect(result.test2).to.equal(undefined);
    });
  });

  describe('#restoreByDiff', () => {
    it('should set fields from diff.data if it\'s first diff of the node', () => {
      const data = {test: 'test'};

      const diff = {type: ChangeType.created, data: {test: 'testNew', test2: 'test2'}};

      const result = restoreHistoryStateHelper.restoreByDiff(data, diff);

      expect(result.test).to.equal(diff.data.test);
      expect(result.test2).to.equal(diff.data.test2);
    });

    it('should skip fields from diff.data in they are specified in ignoreFields list', () => {
      const data = {test: 'test'};

      const diff = {type: ChangeType.created, data: {test: 'testNew', test2: 'test2'}};

      const result = restoreHistoryStateHelper.restoreByDiff(data, diff, ['test']);

      expect(result.test).to.equal(data.test);
      expect(result.test).not.to.equal(diff.data.test);
      expect(result.test2).to.equal(diff.data.test2);
    });

    it('should remove field from DATA if diff.type === created', () => {
      const data = {
        test: '123',
      };

      const diff = {
        test: {
          type: ChangeType.created,
          data: '123'
        },
      };

      const result = restoreHistoryStateHelper.restoreByDiff(data, diff);

      expect(result.test).to.equal(undefined);
    });

    it('should restore field in DATA with diff.data if diff.type === updated', () => {
      const data = {
        test: '321',
      };

      const oldValue = '123';

      const diff = {
        test: {
          type: ChangeType.updated,
          data: oldValue,
          newDate: '321',
        },
      };

      const result = restoreHistoryStateHelper.restoreByDiff(data, diff);

      expect(result.test).to.equal(oldValue);
    });

    it('should restore field in DATA with diff.data if diff.type === removed', () => {
      const data = {
        test: '321',
      };

      const oldValue = '123';

      const diff = {
        test: {
          type: ChangeType.deleted,
          data: oldValue,
        },
      };

      const result = restoreHistoryStateHelper.restoreByDiff(data, diff);

      expect(result.test).to.equal(oldValue);
    });

    it('should skip field in DATA if field name in ignoreFields list', () => {
      const data = {
        test: '321',
      };

      const oldValue = '123';

      const diff = {
        test: {
          type: ChangeType.updated,
          data: oldValue,
          newData: '321',
        },
      };

      const result = restoreHistoryStateHelper.restoreByDiff(data, diff, ['test']);

      expect(result.test).to.equal(data.test);
    });

    it('should remove NESTED field from DATA if diff.type === created', () => {
      const data = {
        field: {
          nested: 'value'
        },
      };

      const diff = {
        field: {
          nested: {
            type: ChangeType.created,
            data: 'value'
          }
        }
      };

      const result = restoreHistoryStateHelper.restoreByDiff(data, diff);

      expect(result.field).not.to.be.undefined;
      expect(result.field.nested).to.be.undefined;
    });

    it('should restore NESTED field in DATA with diff.data if diff.type === updated', () => {
      const data = {
        field: {
          nested: 'value'
        },
      };

      const oldData = 'oldValue';

      const diff = {
        field: {
          nested: {
            type: ChangeType.updated,
            data: oldData,
            newData: 'value',
          }
        }
      };

      const result = restoreHistoryStateHelper.restoreByDiff(data, diff);

      expect(result.field).not.to.be.undefined;
      expect(result.field.nested).to.equal(oldData);
    });

    it('should restore NESTED field in DATA with diff.data if diff.type === removed', () => {
      const data = {
        field: {
          nested: 'value'
        },
      };

      const oldData = 'oldValue';

      const diff = {
        field: {
          nested: {
            type: ChangeType.deleted,
            data: oldData,
            newData: 'value',
          }
        }
      };

      const result = restoreHistoryStateHelper.restoreByDiff(data, diff);

      expect(result.field).not.to.be.undefined;
      expect(result.field.nested).to.equal(oldData);
    });

    it('should skip nested fields in DATA if field specified in ignoreFields', () => {
      const data = {
        field: {
          nested: 'value'
        },
      };

      const oldData = 'oldValue';

      const diff = {
        field: {
          nested: {
            type: ChangeType.updated,
            data: oldData,
            newData: 'value',
          }
        }
      };

      const result = restoreHistoryStateHelper.restoreByDiff(data, diff, ['field.nested']);

      expect(result.field).not.to.be.undefined;
      expect(result.field.nested).to.equal(data.field.nested);
    });

    it('should remove ARRAY item in DATA if diff.type === created', () => {
      const data = {
        array: ['item'],
      };

      const diff = {
        array: [{
          index: 0,
          data: {
            type: ChangeType.created,
            data: 'item'
          }
        }],
      };

      const result = restoreHistoryStateHelper.restoreByDiff(data, diff);

      expect(result.array[0]).to.be.undefined;
      expect(result.array.length).to.equal(0);
    });

    it('should restore ARRAY ITEM value in DATA with diff.data if diff.type === updated', () => {
      const data = {
        array: ['item'],
      };

      const oldItem = 'oldItem';

      const diff = {
        array: [{
          index: 0,
          data: {
            type: ChangeType.updated,
            data: oldItem,
            newData: 'item'
          }
        }],
      };

      const result = restoreHistoryStateHelper.restoreByDiff(data, diff);

      expect(result.array[0]).not.to.be.undefined;
      expect(result.array[0]).to.equal(oldItem);
    });

    it('should restore ARRAY ITEM value in DATA with diff.data if diff.type === deleted', () => {
      const data = {
        array: ['item'],
      };

      const oldItem = 'oldItem';

      const diff = {
        array: [{
          index: 0,
          data: {
            type: ChangeType.deleted,
            data: oldItem,
            newData: 'item'
          }
        }],
      };

      const result = restoreHistoryStateHelper.restoreByDiff(data, diff);

      expect(result.array[0]).not.to.be.undefined;
      expect(result.array[0]).to.equal(oldItem);
    });

    it('should remove fields in ARRAY ITEM if diff.type === created', () => {
      const data = {
        array: [{value: 'value'}],
      };

      const diff = {
        array: [{
          index: 0,
          data: {
            value: {
              type: ChangeType.created,
              data: 'value',
            },
          }
        }],
      };

      const result = restoreHistoryStateHelper.restoreByDiff(data, diff);

      expect(result.array[0]).not.to.be.undefined;
      expect(result.array[0].value).to.be.undefined;
    });

    it('should restore fields in ARRAY ITEM with diff.data if diff.type === updated', () => {
      const data = {
        array: [{value: 'value'}],
      };

      const oldValue = 'oldValue';

      const diff = {
        array: [{
          index: 0,
          data: {
            value: {
              type: ChangeType.updated,
              data: oldValue,
              newData: 'value',
            },
          }
        }],
      };

      const result = restoreHistoryStateHelper.restoreByDiff(data, diff);

      expect(result.array[0]).not.to.be.undefined;
      expect(result.array[0].value).to.equal(oldValue);
    });

    it('should restore fields in ARRAY ITEM with diff.data if diff.type === deleted', () => {
      const data = {
        array: [{value: 'value'}],
      };

      const oldValue = 'oldValue';

      const diff = {
        array: [{
          index: 0,
          data: {
            value: {
              type: ChangeType.deleted,
              data: oldValue,
              newData: 'value',
            },
          }
        }],
      };

      const result = restoreHistoryStateHelper.restoreByDiff(data, diff);

      expect(result.array[0]).not.to.be.undefined;
      expect(result.array[0].value).to.equal(oldValue);
    });

    it('should skip nested fields in ARRAY ITEM in DATA if field specified in ignoreFields', () => {
      const data = {
        array: [{value: 'value'}],
      };

      const oldValue = 'oldValue';

      const diff = {
        array: [{
          index: 0,
          data: {
            value: {
              type: ChangeType.updated,
              data: oldValue,
              newData: 'value',
            },
          }
        }],
      };

      const result = restoreHistoryStateHelper.restoreByDiff(data, diff, ['array.value']);

      expect(result.array[0]).not.to.be.undefined;
      expect(result.array[0].value).to.equal(data.array[0].value);
    });

  });

  describe('#restoreHistoryState', () => {
    const data = {
      field: 'value',
      object: {nested: 'value'},
      array: [{item: 'value'}, {item: 'value1'}, {item: 'value2'}],
      ignore: [{stat: 1}, {stat: 2}, {stat: 3}],
      arraySimpleFields: ['value1', 'value2', 'value3', 'value4',]
    };

    it('should return DATA if diffList is empty', () => {
      const result = restoreHistoryStateHelper.restoreHistoryState(data, []);

      expect(result).to.equal(data);
    });

    it('should restore DATA by diffList sorted by dateTime in reverse order', () => {
      const oldestValue = 'oldestValue';

      const diffList: DiffNode[] = [
        {
          diff: {
            field: {
              type: ChangeType.updated,
              data: 'oldValue',
              newData: 'prevValue',
            }
          },
          dateTime: '2019-12-31T21:00:59Z',
        }, {
          diff: {
            field: {
              type: ChangeType.updated,
              data: 'prevValue',
              newData: 'value',
            },
          },
          dateTime: '2020-12-31T21:00:59Z',
        }, {
          diff: {
            field: {
              type: ChangeType.updated,
              data: oldestValue,
              newData: 'oldValue',
            },
          },
          dateTime: '2018-12-31T21:00:59Z',
        }
      ];

      const result = restoreHistoryStateHelper.restoreHistoryState(data, diffList);

      expect(result.field).to.equal(oldestValue);
    });

    it('should call this.restoreByDiff for each diffItem', () => {
      chai.spy.on(restoreHistoryStateHelper, 'restoreByDiff', v => v);

      const diffNodeList: DiffNode[] = [
        {diff: {}, dateTime: ''},
        {diff: {}, dateTime: ''},
        {diff: {}, dateTime: ''},
      ];

      restoreHistoryStateHelper.restoreHistoryState(data, diffNodeList);

      expect(restoreHistoryStateHelper.restoreByDiff).to.have.been.called.exactly(diffNodeList.length);

      chai.spy.restore();
    });

    it('should skip fields from ignoreFields list', () => {
      const diffNodeList: DiffNode[] = [
        {
          diff: {
            ignore: [{
              index: 0,
              data: {
                stat: {
                  type: ChangeType.updated,
                  data: 0,
                  newData: 1
                }
              }
            }],
          },
          dateTime: '2019-12-31T21:00:59Z',
        }, {
          diff: {
            ignore: [{
              index: 2,
              data: {
                type: ChangeType.created,
                data: {stat: 3},
              }
            }],
          },
          dateTime: '2019-12-31T21:10:59Z',
        }
      ];

      const result = restoreHistoryStateHelper.restoreHistoryState(data, diffNodeList, ['ignore']);

      expect(result.ignore).to.deep.equal(data.ignore);
    });

    it('complex test with array processing', () => {
      const diffList: DiffNode[] = [
        {
          diff: {
            array: [
              {
                index: 1,
                data: {
                  item: {
                    type: ChangeType.updated,
                    data: 'value2',
                    newData: 'value1',
                  }
                }
              }, {
                index: 2,
                data: {
                  type: ChangeType.created,
                  data: {item: 'value2'},
                }
              }
            ],
          },
          dateTime: '2019-12-31T21:00:59Z',
        }, {
          diff: {
            array: [
              {
                index: 1,
                data: {
                  type: ChangeType.created,
                  data: {item: 'value2'}
                }
              }
            ],
          },
          dateTime: '2019-12-30T21:00:59Z',
        }, {
          diff: {
            array: [
              {
                index: 0,
                data: {
                  item: {
                    type: ChangeType.updated,
                    data: 'oldValue',
                    newData: 'value'
                  }
                }
              }, {
                index: 1,
                data: {
                  type: ChangeType.deleted,
                  data: {item: 'oldValue1'}
                }
              }
            ],
          },
          dateTime: '2019-12-30T20:00:59Z',
        }
      ];

      const result = restoreHistoryStateHelper.restoreHistoryState(data, diffList);

      expect(result.array).to.deep.equal([{item: 'oldValue'}, {item: 'oldValue1'}]);
    });
  });

  describe('#getNestedFieldsToIgnore', () => {
    it('should return empty array if there is not ignoreFields array', () => {
      const result = restoreHistoryStateHelper.getNestedFieldsToIgnore(null, 'field');

      expect(result).to.deep.equal([]);
    });

    it('should return empty array if there is not currentField value', () => {
      const result = restoreHistoryStateHelper.getNestedFieldsToIgnore(['field'], '');

      expect(result).to.deep.equal([]);
    });

    it('should return list of nested fields', () => {
      const ignoreFields = ['field.nested', 'field', 'field.nestedDeep.nested', 'anotherField', 'thirdField.nested'];

      const field = 'field';

      const result = restoreHistoryStateHelper.getNestedFieldsToIgnore(ignoreFields, field);

      expect(result).to.deep.equal(['nested', 'nestedDeep.nested']);
    });
  });
});
