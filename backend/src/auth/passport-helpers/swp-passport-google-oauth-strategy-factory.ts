import {PassportGoogleOAuthVerifyUserStrategy} from './swp-passport-google-oauth';
import { coreServiceLocator } from '../../serviceLocator';
import {
  type OAuthUserAuthData, type OAuthUserProfile,
  passportOAuth2StrategyFactory,
  type PassportOAuth2StrategyConfig,
  type UserNode,
} from '../index';


export function passportGoogleOAuth2StrategyFactory() {
  const privateSettings = coreServiceLocator.get('privateSettings');
  const authHelper = coreServiceLocator.get('authHelper');
  const userManagement = coreServiceLocator.get('userManagement');
  const registrationManagement = coreServiceLocator.get('registrationManagement');
  const userHelper = coreServiceLocator.get('userHelper');

  const googleOAuthVerifyUserStrategy =
    new PassportGoogleOAuthVerifyUserStrategy(
      {},
      authHelper,
      userManagement,
      registrationManagement,
      userHelper
    );

  const googleOAuthSettings = privateSettings.SWP_GOOGLE_OAUTH.clientSecret.web;

  const localStrategyConfig: PassportOAuth2StrategyConfig<UserNode, OAuthUserAuthData<OAuthUserProfile>> = {
    verifyUserStrategy: googleOAuthVerifyUserStrategy,
    clientID: googleOAuthSettings.client_id,
    clientSecret: googleOAuthSettings.client_secret,
    callbackURL: googleOAuthSettings.redirect_uris[0],
  };

  return passportOAuth2StrategyFactory(localStrategyConfig);
}
