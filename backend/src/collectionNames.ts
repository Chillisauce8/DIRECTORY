
export const DB_TYPES = {
    Master: 'Master',
    User: 'User'
}

export const STANDARD_COLLECTIONS_DESCRIPTION = {
    settings: {
        name: 'settings',
        hasDefinition: true,
        readonly: true,
    },
    users: {
        name: 'users',
        hasDefinition: true,
        readonly: true,
    },
    userSecurity: {
        name: 'userSecurity',
        hasDefinition: false,
        readonly: true,
    },
    userActivity: {
        name: 'userActivity',
        hasDefinition: false,
        readonly: true,
    },
    roles: {
        name: 'roles',
        hasDefinition: true,
        readonly: false,
    },
    collections: {
        name: 'collections',
        hasDefinition: false,
        readonly: true,
    },
    webPushSubscription: {
        name: 'webPushSubscription',
        hasDefinition: false,
        readonly: true,
    },
    associationDetails: {
        name: 'associationDetails',
        hasDefinition: false,
        readonly: true,
    },
    associationTasks: {
        name: 'associationTasks',
        hasDefinition: false,
        readonly: true,
    },
    associations: {
        name: 'associations',
        hasDefinition: false,
        readonly: true,
    },
    static: {
        name: 'static',
        hasDefinition: false,
        readonly: true,
    },
    logErrors: {
        name: 'logErrors',
        hasDefinition: false,
        readonly: true,
    },
    grids: {
        name: 'grids',
        hasDefinition: true,
        readonly: false,
    },
    gridViews: {
        name: 'gridViews',
        hasDefinition: true,
        readonly: false,
    },
    comms: {
        name: 'comms',
        hasDefinition: true,
        readonly: true,
    },
    commsExecution: {
        name: 'commsExecution',
        hasDefinition: true,
        readonly: true,
    },
    commsHistory: {
        name: 'commsHistory',
        hasDefinition: true,
        readonly: true,
    },
    nodeChangeTask: {
        name: 'nodeChangeTask',
        hasDefinition: true,
        readonly: true,
    },
    slugs: {
        name: 'slugs',
        hasDefinition: true,
    },
    shortener: {
        name: 'shortener',
        hasDefinition: false,
        readonly: false,
    },
    serviceScriptResult: {
        name: 'serviceScriptResult',
        hasDefinition: false,
        readonly: true,
        feature: true,
    },
    sessions: {
        name: 'sessions',
        hasDefinition: true,
        readonly: true,
        feature: true,
    },
    nodeChangesScripts: {
        name: 'nodeChangesScripts',
        hasDefinition: true,
        readonly: true,
        dbTypes: [DB_TYPES.User],
        feature: true,
    },
    files: {
        name: 'files',
        hasDefinition: true,
        dbTypes: [DB_TYPES.User],
        feature: true,
        readonly: true,
    },
}
