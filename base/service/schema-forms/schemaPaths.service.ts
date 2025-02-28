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

  /**
   * Adds a new schema to the parser cache
   * @param schemaName Name of schema to add
   * @returns Promise resolving with SchemaParser instance
   */
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

  /**
   * Gets a schema item at a specific path
   * @param schemaName Name of schema
   * @param path Path to item
   * @returns Schema item or null if not found
   */
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
