import { coreServiceLocator } from '../serviceLocator';
import { LoggingHelper } from './loggingHelper';
import { MomentHelper } from './momentHelper';


export async function initUtilsServices() {

  const cacheHelper = coreServiceLocator.get('cacheHelper');
  const privateSettings = coreServiceLocator.get('privateSettings');


  const { RequestParamsHelper } = await import('../utils/request-params-helper');
  const requestParamsHelper = new RequestParamsHelper();
  coreServiceLocator.register('requestParamsHelper', requestParamsHelper);

  const { RequestHelper } = await import('../utils/request-helper');
  const requestHelper = new RequestHelper(requestParamsHelper);
  coreServiceLocator.register('requestHelper', requestHelper);

  const momentHelper = new MomentHelper();
  coreServiceLocator.register('momentHelper', momentHelper);

  const { IpHelper } = await import('../utils/ip-helper');
  const ipHelper = new IpHelper();
  coreServiceLocator.register('ipHelper', ipHelper);

  const { URLHelper } = await import('../utils/urlHelper');
  const urlHelper = new URLHelper();
  coreServiceLocator.register('urlHelper', urlHelper);

  const loggingHelper = new LoggingHelper();
  coreServiceLocator.register('loggingHelper', loggingHelper);

  const {NeutrinoApiHelper} = await import('../utils/neutrinoApiHelper');
  const neutrinoApiHelper = new NeutrinoApiHelper(ipHelper, cacheHelper);
  coreServiceLocator.register('neutrinoApiHelper', neutrinoApiHelper);

  const {ChatGptHelper} = await import('./chat-gpt-helper');
  const chatGptHelper = new ChatGptHelper(privateSettings.OPEN_AI);
  coreServiceLocator.register('chatGptHelper', chatGptHelper);
}
