import { sysService, SysService } from '../http/sys.service';
import { SchemaParser, schemaParserFactory, SchemaParserFactory } from './schemaParser.factory';


export class SchemaPaths {
  private parsersMap: any = {};
  private pathTreeMap: any = {};

  constructor(
    private sysService: SysService,
    private schemaParserFactory: SchemaParserFactory) {
    //
  }

  async addSchema(schemaName: string): Promise<SchemaParser> {
    if (this.parsersMap[schemaName]) {
      return this.parsersMap[schemaName];
    }

    return this.sysService.getSchema(schemaName)
      .then((schema: any) => {
        this.parsersMap[schemaName] = this.schemaParserFactory.getInstance(schema);
        return this.parsersMap[schemaName];
      });
  }

  getItem(schemaName: string, path: string): any {
    const schemaParser: SchemaParser = this.parsersMap[schemaName];

    if (!schemaParser) {
      return null;
    }

    try {
      return schemaParser.getItem(path);
    } catch {
      return {};
    }
  }

  parseItemFormType(schemaName: string, node: any) {
    const schemaParser: SchemaParser = this.parsersMap[schemaName];

    if (!schemaParser) {
      return null;
    }

    return schemaParser.parseItemFormType(node);
  }

  getAllPathTree(schemaName: string, fields?: string[], showBrackets = true) {
    const key = this.preparePathTreeMapKey(schemaName, fields, showBrackets);
    if (this.pathTreeMap[key]) {
      return this.pathTreeMap[key];
    }

    const schemaParser: SchemaParser = this.parsersMap[schemaName];

    if (!schemaParser) {
      return null;
    }

    const result = schemaParser.getAllPathTree(fields, showBrackets);
    this.pathTreeMap[key] = result;

    return result;
  }

  private preparePathTreeMapKey(schemaName: string, fields?: string[], showBrackets = true): string {
    return `${schemaName}_${fields ? fields.join('_') : ''}_${showBrackets.toString()}`;
  }
}


export const schemaPaths = new SchemaPaths(sysService, schemaParserFactory);
