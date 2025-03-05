import { wrapDefaultDataResponse } from '../../utils';
import { XRoute, XRoutesGroup } from '../../x-route-core';
import { PermissionAction, PermissionView } from '../../auth/permissions-helper';
import { coreServiceLocator } from '../../serviceLocator';


const formCrud = coreServiceLocator.get('formCrud');
const permissionsHelper = coreServiceLocator.get('permissionsHelper');


const handleGetForm = (req: Request, res) => {
  const collectionName = req['params'].collectionName;
  const dataItemId = req['params'].dataItemId;

  wrapDefaultDataResponse(res, formCrud.get(req, collectionName, dataItemId));
};

const handleDeleteForm = (req: Request, res) => {
  const collectionName = req['params'].collectionName;
  const dataItemId = req['params'].dataItemId;

  wrapDefaultDataResponse(res, formCrud.delete(req, collectionName, dataItemId));
};

const handleCreateForm = (req: Request, res) => {
  const collectionName = req['params'].collectionName;
  const dataItem = req.body;

  wrapDefaultDataResponse(res, formCrud.create(req, collectionName, dataItem));
};

const handleUpdateForm = (req: Request, res) => {
  const collectionName = req['params'].collectionName;
  const dataItem = req.body;

  wrapDefaultDataResponse(res, formCrud.update(req, collectionName, dataItem));
};


module.exports = function(app, callback) {
  app.get('/api/form/:collectionName/:dataItemId',
    permissionsHelper.requireNodeTypePermissionsFor(PermissionAction.read, undefined, PermissionView.form),
    handleGetForm);
  app.delete('/api/form/:collectionName/:dataItemId',
        permissionsHelper.requireNodeTypePermissionsFor(PermissionAction.delete, undefined, PermissionView.form),
        handleDeleteForm);
  app.post('/api/form/:collectionName',
        permissionsHelper.requireNodeTypePermissionsFor(PermissionAction.create, undefined, PermissionView.form),
        handleCreateForm);
  app.put('/api/form/:collectionName',
        permissionsHelper.requireNodeTypePermissionsFor(PermissionAction.update, undefined, PermissionView.form),
        handleUpdateForm);
}
