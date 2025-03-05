import * as _ from "lodash";
import {deletePropertiesWithPrefix} from "x-utils";


export class ValidationSchemaGenerator {
    private standardProps: Array<string> = ['title', 'description', 'type', 'enum', 'maximum', 'minimum', 'maxLength',
      'minLength'];
    private simplePropTypes: Array<string> = ['number', 'boolean', 'string'];

    public convertDefinitionToMongoValidator = (sourceSchema : any) => {
        let convertResult = {};

        if (sourceSchema){
            this.processCs5Schema(sourceSchema, convertResult);
        }

        this.removeStructureTags(convertResult);

        return {
            "$jsonSchema": convertResult
        };
    };

    private removeStructureTags(definition) {
        deletePropertiesWithPrefix(definition, (key) => {
            const match = key.match(/^\d+_.+/);
            return match && !!match[0];
        }, true);
    }

    private processCs5Schema = (obj, resultObj) => {
        if (obj.type) {
            this.getFieldProcessingFunc(obj.type)(obj, resultObj);
        }
    };

    private processObject = (obj, result) => {
        result["properties"] = {};

        if (obj.required){
            result.required = obj.required;
        }

        this.copyStandardPropsTo(obj, result);

        for (let prop in obj.properties){
            let item = obj.properties[prop];
            result.properties[prop] = {};

            if (item?.type) {
                this.getFieldProcessingFunc(item.type)(item, result.properties[prop]);
            }
        }
    };

    private processArray = (arrayObj, result) => {
        this.copyStandardPropsTo(arrayObj, result);

        if (_.isArray(arrayObj.items)){
            result.items = [];

            _.forEach(arrayObj.items, (arrayItem) => {
                let resultArrayItem = {};
                this.getFieldProcessingFunc(arrayItem.type)(arrayItem, resultArrayItem);
                result.item.push(resultArrayItem);
            });
        }
        else if (arrayObj.items?.type) {
            //object
            result.items = {};
            this.getFieldProcessingFunc(arrayObj.items.type)(arrayObj.items, result.items);
        }
    };

    private getFieldProcessingFunc = (type: string) => {
        if (_.includes(this.simplePropTypes, type)) {
            return this.processSimpleField;
        }
        else if (type === 'object') {
            return this.processObject;
        }
        else if (type === 'array') {
            return this.processArray;
        }

        return () => {};
    };

    private processSimpleField = (numberObj, result) =>{
        this.copyStandardPropsTo(numberObj, result);
    };

    private copyStandardPropsTo = (srcObj, destObj) => {
        _.forEach(this.standardProps, (prop) => {
            let value = srcObj[prop];
            if (value){
                destObj[prop] = value;
            }
        });
    };
}

