import * as chai from 'chai';
import * as spies from 'chai-spies';
import { expect } from 'chai';
import 'mocha';

import {coreServiceLocator} from '../serviceLocator';
import { returnForbidden } from '../utils';

chai.use(spies as any);


const userHelper = coreServiceLocator.get('userHelper');
const authHelpers = coreServiceLocator.get('authHelpers');
const USER_PERMISSIONS = coreServiceLocator.get('USER_PERMISSIONS');


describe('authHelper', () => {
  let nextSpy;

  beforeEach(() => {
    nextSpy = chai.spy();

    chai.spy(returnForbidden, () => {});

    const userData = {
      _type: 'staff'
    };

    chai.spy.on(userHelper, 'getCurrentUserSync', () => userData);

    const roles = [{
      staffArea: {
        "canAccess": "yes",
        "categories": [
          "view",

          "viewJson",
          "editJson"
        ],
        "rawData": [
          "view",
          "edit"
        ],
        "companies": [
          "view",
          "editView"
        ],
      }
    }];

    chai.spy.on(authHelpers, 'getUserOwnRoles', async () => roles);
  });

  afterEach(() => {
    chai.spy.restore();
  });

  describe('#anyOfPermissionFunctions()', () => {

    it('should call next() for 1 allowed permission', async () => {

      const readRawDataAuth = authHelpers.requireReadPermissionsFor(
        USER_PERMISSIONS.feature.staffArea.rawData);

      const func = authHelpers.anyOfPermissionFunctions([readRawDataAuth]);

      await func({}, {}, nextSpy);

      expect(nextSpy).to.have.been.called();
      expect(returnForbidden).to.not.have.been.called();
    });

    it('should call next() for 2 allowed permission', async () => {

      const readRawDataAuth = authHelpers.requireReadPermissionsFor(
        USER_PERMISSIONS.feature.staffArea.rawData);
      const readCategoriesAuth = authHelpers.requireReadPermissionsFor(
        USER_PERMISSIONS.feature.staffArea.categories);

      const func = authHelpers.anyOfPermissionFunctions([readCategoriesAuth, readRawDataAuth]);

      await func({}, {}, nextSpy);

      expect(nextSpy).to.have.been.called();
      expect(returnForbidden).to.not.have.been.called();
    });

    it('should call next() for 1 allowed permission of two permissions', async () => {

      const readRawDataAuth = authHelpers.requireReadPermissionsFor(
        USER_PERMISSIONS.feature.staffArea.rawData);
      const writeCategoriesAuth_notAllowed = authHelpers.requireWritePermissionsFor(
        USER_PERMISSIONS.feature.staffArea.categories);

      const func = authHelpers.anyOfPermissionFunctions([writeCategoriesAuth_notAllowed, readRawDataAuth]);

      await func({}, {}, nextSpy);

      expect(nextSpy).to.have.been.called();
      expect(returnForbidden).to.not.have.been.called();
    });

    it('should NOT call next() for 0 allowed permission of two permissions', async () => {

      const writeCategoriesAuth_notAllowed = authHelpers.requireWritePermissionsFor(
        USER_PERMISSIONS.feature.staffArea.categories);
      const writeCompaniesAuth_notAllowed = authHelpers.requireWritePermissionsFor(
        USER_PERMISSIONS.feature.staffArea.companies);

      const func = authHelpers.anyOfPermissionFunctions([writeCategoriesAuth_notAllowed, writeCompaniesAuth_notAllowed]);

      await func({}, {}, nextSpy);

      expect(nextSpy).to.not.have.been.called();
      expect(returnForbidden).to.have.been.called();
    });
  });
});
