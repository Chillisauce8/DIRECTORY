import environment from './environment';
import {EnvironmentHttpConfiguration} from '~/environment.example';


declare module 'nuxt/schema' {
  interface AppConfigInput {
    appId: string,
    environment: string,
    IS_LOCAL: boolean,
    IS_LIVE: boolean,
    ST_SITE_REFERENCE: string,
    http?: EnvironmentHttpConfiguration;
    adminAreaDomain?: string;
  }

  interface AppConfig {
    appId: string,
    environment: string,
    IS_LOCAL: boolean,
    IS_LIVE: boolean,
    ST_SITE_REFERENCE: string,
    http?: EnvironmentHttpConfiguration;
    adminAreaDomain?: string;
  }

  interface NuxtAppConfig {
    appId: string,
    environment: string,
    IS_LOCAL: boolean,
    IS_LIVE: boolean,
    ST_SITE_REFERENCE: string,
    http?: EnvironmentHttpConfiguration;
    adminAreaDomain?: string;
  }
}



function getServerBaseUrl() {
  if (environment?.http?.serverBaseURL) {
    return environment.http.serverBaseURL;
  }

  return `http://localhost:${getServerInternalPort()}`;
}


function getServerInternalPort() {
  return process?.env?.PORT || 8081;
}


export default defineAppConfig({
  head: {
    title: 'car',
    htmlAttrs: {
      lang: 'en',
    },
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: '' },
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
    ],
  },

  http: {
    serverBaseURL: getServerBaseUrl(),
    headers: environment?.http?.headers,
  },

  IS_LOCAL: environment.IS_LOCAL,
  IS_LIVE: environment.IS_LIVE,
  appId: environment.appId,
  environment: environment.environment,
  adminAreaDomain: environment?.adminAreaDomain ?? null,
});
