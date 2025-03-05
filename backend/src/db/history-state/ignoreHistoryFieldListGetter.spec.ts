import { expect } from 'chai';
import 'mocha';
import {IgnoreHistoryFieldListGetter, ignoreHistoryFieldListGetterFactory} from './ignoreHistoryFieldListGetter';


describe('ignoreHistoryFieldListGetter', () => {
  let ignoreHistoryFieldListGetter: IgnoreHistoryFieldListGetter;

  beforeEach(() => {
    ignoreHistoryFieldListGetter = ignoreHistoryFieldListGetterFactory();
  });

  describe('#process', () => {
    it('should return empty list if there isn\'t definition', () => {
      const result = ignoreHistoryFieldListGetter.process(null);

      expect(result).to.deep.equal([]);
    });

    it('should use "ignoreHistory" from simple fields', () => {
      const definition = {
        properties: {
          field: {
            type: 'object',
            properties: {
              nested: {
                type: 'string'
              }
            }
          },
          anotherField: {
            ignoreHistory: true,
            type: 'string',
          }
        }
      };

      const result = ignoreHistoryFieldListGetter.process(definition);

      expect(result).to.deep.equal(['anotherField']);
    });

    it('should use "ignoreHistory" from nested simple fields', () => {
      const definition = {
        properties: {
          field: {
            type: 'object',
            properties: {
              nested: {
                ignoreHistory: true,
                type: 'string'
              }
            }
          },
          anotherField: {
            type: 'string',
          }
        }
      };

      const result = ignoreHistoryFieldListGetter.process(definition);

      expect(result).to.deep.equal(['field.nested']);
    });

    it('should use "ignoreHistory" array in top level of object', () => {
      const definition = {
        ignoreHistory: [
          'field',
        ],
        properties: {
          field: {
            type: 'string',
          },
          anotherField: {
            type: 'string',
          }
        }
      };

      const result = ignoreHistoryFieldListGetter.process(definition);

      expect(result).to.deep.equal(['field']);
    });

    it('should use "ignoreHistory" array in nested object', () => {
      const definition = {
        properties: {
          field: {
            ignoreHistory: [
              'nested',
            ],
            type: 'object',
            properties: {
              nested: {
                type: 'string'
              }
            }
          },
          anotherField: {
            type: 'string',
          }
        }
      };

      const result = ignoreHistoryFieldListGetter.process(definition);

      expect(result).to.deep.equal(['field.nested']);
    });

    it('should use "ignoreHistory" array from array field items description', () => {
      const definition = {
        properties: {
          array: {
            type: 'array',
            items: {
              ignoreHistory: [
                'nested'
              ],
              type: 'object',
              properties: {
                nested: {
                  type: 'string',
                }
              }
            }
          }
        }
      };

      const result = ignoreHistoryFieldListGetter.process(definition);

      expect(result).to.deep.equal(['array.nested']);
    });

    it('should use "ignoreHistory" field from array nested fields', () => {
      const definition = {
        properties: {
          array: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                nested: {
                  ignoreHistory: true,
                  type: 'string',
                }
              }
            }
          }
        }
      };

      const result = ignoreHistoryFieldListGetter.process(definition);

      expect(result).to.deep.equal(['array.nested']);
    });

    it('should use "ignoreHistory" field of array description', () => {
      const definition = {
        properties: {
          array: {
            ignoreHistory: true,
            type: 'array',
            items: {
              type: 'object',
              properties: {}
            }
          }
        }
      };

      const result = ignoreHistoryFieldListGetter.process(definition);

      expect(result).to.deep.equal(['array']);
    });

    it('should use "ignoreHistory" array from array field description', () => {
      const definition = {
        properties: {
          array: {
            ignoreHistory: ['test'],
            type: 'array',
            items: {
              type: 'object',
              properties: {
                test: {},
                testTwo: {}
              }
            }
          }
        }
      };

      const result = ignoreHistoryFieldListGetter.process(definition);

      expect(result).to.deep.equal(['array.test']);
    });

    it('deep nested field test', () => {
      const definition = {
        properties: {
          array: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                nested: {
                  type: 'object',
                  properties: {
                    deep: {
                      type: 'object',
                      properties: {
                        array: {
                          type: 'array',
                          items: {
                            ignoreHistory: [
                              'test'
                            ],
                            type: 'object',
                            properties: {
                              test: {
                                type: 'string',

                              }
                            }
                          }
                        },
                        test: {
                          ignoreHistory: true,
                          type: 'string'
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      };

      const result = ignoreHistoryFieldListGetter.process(definition);

      expect(result).to.deep.equal(['array.nested.deep.array.test', 'array.nested.deep.test']);
    });
  });
});
