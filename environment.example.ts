// import { NitroRouteConfig } from "nitropack";

const serverURL = 'https://test.chillisauce.com';

export interface EnvironmentHttpConfiguration {
  serverBaseURL?: string;
  serverDomain?: string;
  headers?: Record<string, string>;
}


export interface EnvironmentConfiguration {
  IS_LOCAL: boolean,
  IS_LIVE?: boolean,
  IS_STAGING?: boolean,
  ST_SITE_REFERENCE: string,

  ssr?: boolean;
  http?: EnvironmentHttpConfiguration;
  devProxy?: Record<string, string>;
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


const env: EnvironmentConfiguration = {
  ssr: true,
  http: {
    serverBaseURL: serverURL,
  },
  devProxy: {
    '/api/': serverURL,
  },
  IS_LOCAL: true,
  IS_LIVE: false,
  IS_STAGING: false,
  ST_SITE_REFERENCE: 'test_chillisaucelimited97423',
  enableLogRocket: false,
  leaveDebuggers: false,
  navigationDebug: false,
  enableZukoTracking: false,
};


export default env;
