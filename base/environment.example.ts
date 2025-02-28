// import { NitroRouteConfig } from "nitropack";

const serverURL = 'https://test.chillisauce.com';

export interface EnvironmentHttpConfiguration {
  serverBaseURL?: string;
  serverDomain?: string;
  headers?: Record<string, string>;
}


export interface EnvironmentConfiguration {
  appId: string,
  environment: string,
  IS_LOCAL: boolean,
  IS_LIVE?: boolean,
  IS_STAGING?: boolean,

  ssr?: boolean;
  http?: EnvironmentHttpConfiguration;
  devProxy?: Record<string, any>;
  routeRules?: Record<string, any>;
  adminAreaDomain?: string;
  enableLogRocket?: boolean;
  leaveDebuggers?: boolean;
  navigationDebug?: boolean;
  enableZukoTracking?: boolean;

  googleAuth?: {
    scope: string;
    clientId: string;
  };
}


const appId = 'car';
const environment = 'development';


const env: EnvironmentConfiguration = {
  appId,
  environment,
  ssr: true,
  http: {
    serverBaseURL: serverURL,
    headers: {
      'x-app-id': appId,
      'x-app-environment': environment,
    },
  },
  devProxy: {
    '/api/': serverURL,
  },
  IS_LOCAL: true,
  IS_LIVE: false,
  IS_STAGING: false,
  enableLogRocket: false,
  leaveDebuggers: false,
  navigationDebug: false,
  enableZukoTracking: false,
};


export default env;
