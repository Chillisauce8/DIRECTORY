import * as _ from 'lodash';


export enum ChangeType {
  created = 'created',
  updated = 'updated',
  deleted = 'deleted',
}


export type ChangeDescription = {
  type: ChangeType;
  data: any;
  newData?: any;
}


export type DiffNode = {
  diff: any;
  dateTime: string;
}


export class RestoreHistoryStateHelper {
  constructor(private _: any,
              private backward: boolean) {}

  public restoreHistoryState(data: any, diffList: DiffNode[], ignoreFields: string[] = []): any {
    if (!diffList || !diffList.length) {
      return data;
    }

    const diffNodeListSortedByDate = this._.orderBy(diffList, ['dateTime'], [this.backward ? 'desc' : 'asc']);

    let historyState = data;

    for (const diffNode of diffNodeListSortedByDate) {
      historyState = this.restoreByDiff(historyState, diffNode.diff, ignoreFields);
    }

    return historyState;
  }

  public restoreByDiff(_data: any, diff: any, ignoreFields: string[] = [], recursive: boolean = false): any {
    let data = recursive ? _data : this._.cloneDeep(_data);

    if (!data) {
      data = {};
    }

    if (this.isInitialDiff(diff, recursive)) {
      return this.processInitialDiff(data, diff, ignoreFields);
    }

    for (const field in diff) {
      if (!diff.hasOwnProperty(field)) {
        continue;
      }

      if (ignoreFields.indexOf(field) !== -1) {
        continue;
      }

      const value = diff[field];

      if (this.isChangeDescription(value)) {
       const newValue = this.processField(value);

        if (newValue === undefined) {
          delete data[field];
        } else {
          data[field] = newValue;
        }
      } else if (Array.isArray(value)) {
        const ignoreNestedFields = this.getNestedFieldsToIgnore(ignoreFields, field);

        if (!data[field]) {
          data[field] = [];
        }

        data[field] = this.processArray(data[field], value, ignoreNestedFields);
      } else if (this._.isObject(data[field])) {
        const ignoreNestedFields = this.getNestedFieldsToIgnore(ignoreFields, field);

        if (!data[field]) {
          data[field] = {};
        }

        this.restoreByDiff(data[field], value, ignoreNestedFields, true);
      }
    }

    return data;
  }

  public isInitialDiff(diff: any, recursive: boolean): boolean {
    return !recursive && this.isChangeDescription(diff) && diff.type === ChangeType.created;
  }

  public processInitialDiff(data: any, diff: any, ignoreFields: string[] = []): any {
    const diffData = (diff as ChangeDescription)[this.backward ? 'data' : 'newData'];

    for (const field in diffData) {
      if (ignoreFields.indexOf(field) !== -1) {
        continue;
      }

      data[field] = diffData[field];
    }

    return data;
  }

  public processField(changeDescription: ChangeDescription): any {
    if (this.backward === false) {
      return changeDescription.type === ChangeType.created ? changeDescription.data : changeDescription.newData;
    }

    if (changeDescription.type === ChangeType.created) {
      return undefined;
    }

    return changeDescription.data;
  }

  public processArray(currentValue: any[], diff: any[], ignoreFields: string[] = []): any[] {
    for (const item of diff) {
      const {index, data} = item;

      if (this.isChangeDescription(data)) {
        currentValue[index] = this.processField(data);
      } else {
        if (currentValue[index] === undefined) {
          currentValue[index] = {};
        }

        currentValue[index] = this.restoreByDiff(currentValue[index], data, ignoreFields, true);
      }
    }

    return currentValue.filter(value => !_.isNil(value));
  }

  public isChangeDescription(value: any | ChangeDescription): boolean {
    if (!value) {
      return false;
    }

    if (!value.type) {
      return false;
    }

    if ([ChangeType.created, ChangeType.updated, ChangeType.deleted].indexOf(value.type) === -1) {
      return false;
    }

    if (this.backward && !value.hasOwnProperty('data')) {
      return false;
    }

    if (!this.backward && !value.hasOwnProperty('newData') && !value.hasOwnProperty('data')) {
      return false;
    }

    return true;
  }


  public getNestedFieldsToIgnore(ignoreFields: string[], currentField: string): string[] {
    if (!ignoreFields || !ignoreFields.length) {
      return [];
    }

    if (!currentField) {
      return [];
    }

    return ignoreFields
      .filter(i => i.indexOf(`${currentField}.`) !== -1)
      .map(i => i.split(`${currentField}.`)[1])
      .filter(i => !!i);
  }
}


export function restoreHistoryStateHelperFactory(backward: boolean = true) {
  return new RestoreHistoryStateHelper(_, backward);
}
