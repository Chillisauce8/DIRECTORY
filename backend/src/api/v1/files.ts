import { STANDARD_COLLECTIONS_DESCRIPTION } from '../../collectionNames';

import {coreServiceLocator} from '../../serviceLocator';
import {wrapDefaultDataResponse} from '../../utils';
import {XRoute, XRoutesGroup} from '../../x-route-core';
import {FilesManagement} from '../../files';
import { getCrudRequirePermissionsFor } from '../../auth/express-helpers';
import { PermissionView } from '../../auth/permissions-helper';

const multer = require('multer');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });


const privateSettings = coreServiceLocator.get('privateSettings');
const filesManagement: FilesManagement = coreServiceLocator.get('filesManagement');


const handleUpload = function(req: Request, res, next) {
    const node = req.body;
    const preparedNode = {...node, ...JSON.parse(node['additionalMeta'])};
    delete preparedNode.relativePath;
    delete preparedNode.additionalMeta;
    wrapDefaultDataResponse(res, filesManagement.upload(req, preparedNode));
};

const handleUpdate = function(req: Request, res, next) {
    const node = req.body;
    wrapDefaultDataResponse(res, filesManagement.update(req, node));
};

const handleReplace = function(req: Request, res, next) {
    const node = JSON.parse(req.body['model']);
    wrapDefaultDataResponse(res, filesManagement.replace(req, node));
};

const handleDelete = function(req: Request, res, next) {
    const nodeId = req['params'].id;
    wrapDefaultDataResponse(res, filesManagement.delete(req, nodeId));
};

const handleGetMediaById = function (req: Request, res, next) {
    const nodeId = req['params'].id;
    wrapDefaultDataResponse(res, filesManagement.getById(req, nodeId));
};

const handleGetMedia = function (req: Request, res, next) {
    wrapDefaultDataResponse(res, filesManagement.get(req));
};



module.exports = function(app, callback) {
  const { readAuth, createAuth, updateAuth, deleteAuth } =
    getCrudRequirePermissionsFor(STANDARD_COLLECTIONS_DESCRIPTION.files.name, PermissionView.any);

  app.get('/api/files', handleGetMedia);
  app.get('/api/files/:id', handleGetMediaById);
  app.post('/api/files', upload.single('file'), handleUpload);
  app.put('/api/files', handleUpdate);
  app.put('/api/files/replace', handleUpdate);
  app.delete('/api/files/:id', handleDelete);
}



