import { coreServiceLocator } from '../serviceLocator';
import { google } from 'googleapis';
import { CustomUserNodeChangesSyncExecutor } from './sync-executors/custom-user-node-changes-sync-executor';
import { NodeChangesSyncExecutorGroupName } from '../node-changes/nodeChangesSyncExecutor';
import { DateHelper } from 'x-utils';


export async function initAuthServices() {

  const privateSettings = coreServiceLocator.get('privateSettings');
  const dataCrudService = coreServiceLocator.get('dataCrudService');
  const cacheHelper = coreServiceLocator.get('cacheHelper');
  const ipHelper = coreServiceLocator.get('ipHelper');
  const templateManagement = coreServiceLocator.get('templateManagement');
  const emailHelper = coreServiceLocator.get('emailHelper');
  const definitionCrud = coreServiceLocator.get('definitionCrud');

  const dateHelper = new DateHelper();

  const {UserHelper} = await import('./userHelper');
  const userHelper = new UserHelper(coreServiceLocator);
  coreServiceLocator.register('userHelper', userHelper);

  const {RoleManagement} = await import('./roleManagement');
  const roleManagement = new RoleManagement(userHelper, dataCrudService);
  coreServiceLocator.register('roleManagement', roleManagement);

  const {PasswordHelper} = await import('./passwordHelper');
  const passwordHelper = new PasswordHelper(dataCrudService);
  coreServiceLocator.register('passwordHelper', passwordHelper);

  const {UserManagement} = await import('./userManagement');
  const userManagement = new UserManagement(dateHelper, userHelper,
    dataCrudService, emailHelper);
  coreServiceLocator.register('userManagement', userManagement);

  const {AuthHelper} = await import('./auth-helper');
  const authHelper = new AuthHelper(userHelper,
      passwordHelper, dataCrudService, cacheHelper, ipHelper, templateManagement);
  coreServiceLocator.register('authHelper', authHelper);

  const {PermissionsHelper} = await import('./permissions-helper');
  const permissionsHelper = new PermissionsHelper(userHelper, roleManagement);
  coreServiceLocator.register('permissionsHelper', permissionsHelper);

  const {OAuthGoogleHelper} = await import('./oAuthGoogleHelper');
  const oAuthGoogleHelper = new OAuthGoogleHelper(privateSettings.SWP_GOOGLE_OAUTH, google);
  coreServiceLocator.register('oAuthGoogleHelper', oAuthGoogleHelper);

  const oAuthGoogleManagementConfig = {
      defaultRedirectUrl: '/oAuthGoogleLogin',
      defaultScopeList: [
          'https://www.googleapis.com/auth/userinfo.email',
          'https://www.googleapis.com/auth/gmail.send',
          'https://www.googleapis.com/auth/gmail.readonly'
      ],
  };

  const {OAuthGoogleManagement} = await import('./oAuthGoogleManagement');
  const oAuthGoogleManagement = new OAuthGoogleManagement(oAuthGoogleManagementConfig, oAuthGoogleHelper,
      userManagement, cacheHelper, authHelper);
  coreServiceLocator.register('oAuthGoogleManagement', oAuthGoogleManagement);

  const {LoginManagement} = await import('./loginManagement');
  const loginManagement = new LoginManagement(userHelper, userManagement, authHelper);
  coreServiceLocator.register('loginManagement', loginManagement);

  const {RegistrationManagement} = await import('./registrationManagement');
  const registrationManagement = new RegistrationManagement(userHelper, userManagement, loginManagement,
      passwordHelper, emailHelper, authHelper, definitionCrud);
  coreServiceLocator.register('registrationManagement', registrationManagement);

  const customUserNodeChangesSyncExecutor = new CustomUserNodeChangesSyncExecutor(dataCrudService,
      registrationManagement, userManagement, privateSettings.APPS_BASE_SETTINGS);
  coreServiceLocator.register('customUserNodeChangesSyncExecutor', customUserNodeChangesSyncExecutor,
      NodeChangesSyncExecutorGroupName);
}
