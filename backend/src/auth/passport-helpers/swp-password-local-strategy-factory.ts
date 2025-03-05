import {PassportLocalVerifyUserStrategy} from './swp-passport-local-verify-user';
import { coreServiceLocator } from '../../serviceLocator';
import {
  type PassportLocalStrategyConfig,
  passportLocalStrategyFactory,
  type PassportVerifyUserStrategyBaseConfig
} from '../index';


export function swpPassportLocalStrategyFactory() {
  const authHelper = coreServiceLocator.get('authHelper');
  const userManagement = coreServiceLocator.get('userManagement');
  const passwordHelper = coreServiceLocator.get('passwordHelper');
  const userHelper = coreServiceLocator.get('userHelper');

  const localVerifyUserStrategyConfig: PassportVerifyUserStrategyBaseConfig = {
  };

  const localVerifyUserStrategy =
    new PassportLocalVerifyUserStrategy(localVerifyUserStrategyConfig, authHelper, passwordHelper,
        userManagement, userHelper);

  const localStrategyConfig: PassportLocalStrategyConfig = {
    usernameField: 'username',
    passwordField: 'password',
    verifyUserStrategy: localVerifyUserStrategy,
  };

  return passportLocalStrategyFactory(localStrategyConfig);
}
