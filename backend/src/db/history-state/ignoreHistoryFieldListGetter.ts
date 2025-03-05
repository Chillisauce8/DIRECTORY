export class IgnoreHistoryFieldListGetter {
  public process(definition: any): string[] {
    if (!definition || !definition.properties) {
      return [];
    }

    return this.processObject(definition);
  }

  private processObject(data: any, prevPart: string = ''): string[] {
    if (data && data.ignoreHistory === true) {
      return [prevPart];
    }

    let ignoreHistory: string[] = (data.ignoreHistory || []).map(v => this.getPath(prevPart, v));

    for (const field in data.properties) {
      if ((data.ignoreHistory || []).indexOf(field) !== -1) {
        continue;
      }

      const value = data.properties[field];

      const path = this.getPath(prevPart, field);

      if (value.ignoreHistory === true) {
        ignoreHistory.push(this.getPath(prevPart, field));
        continue;
      }

      if (value.type === 'object') {
        const childIgnoreHistory = this.processObject(value, path);

        ignoreHistory = ignoreHistory.concat(childIgnoreHistory);
      } else if (value.type === 'array') {
        const childIgnoreHistory = this.processArray(value, path);

        ignoreHistory = ignoreHistory.concat(childIgnoreHistory);
      }
    }

    return ignoreHistory;
  }

  private processArray(data: any, prevPart: string = '') {
    if (data && data.ignoreHistory === true) {
      return [prevPart];
    }

    if (!data && !data.items) {
      return [];
    }

    const ignoreHistory: string[] = (data.ignoreHistory || []).map(v => this.getPath(prevPart, v));

    if (data.items.type === 'object') {
      return ignoreHistory.concat(this.processObject(data.items, prevPart));
    } else if (data.items.ignoreHistory === true) {
      return [...ignoreHistory, prevPart];
    }

    return ignoreHistory;
  }

  private getPath(prevPath: string, currentPath: string) {
    if (!prevPath) {
      return currentPath;
    }

    return `${prevPath}.${currentPath}`;
  }
}


export function ignoreHistoryFieldListGetterFactory(): IgnoreHistoryFieldListGetter {
  return new IgnoreHistoryFieldListGetter();
}
