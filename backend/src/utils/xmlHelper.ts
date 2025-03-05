var xml2js = require('xml2js');
import * as Promise from 'bluebird';


export class XmlHelper {
    createRequest(params, rootName) {
        const builder = new xml2js.Builder({headless: false, rootName: rootName});
        return builder.buildObject(params);
    }

    parse(xml) {
        return new Promise(function (accept, reject) {
            xml2js.parseString(xml, function (err, result) {
                if (err) reject(err)
                else accept(result);
            });
        });
    }
}

export const xmlHelper = new XmlHelper();
