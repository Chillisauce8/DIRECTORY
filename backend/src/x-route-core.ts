

export class XRoute {
    constructor(
        public name: string,
        public method: string,
        public path: string,
        public handlers: Function[] | (() => void)[],
        public addPathPrefix: boolean = true
    ) {
        //
    }
}


export class XRoutesGroup {
    name: string;
    routes: XRoute[] = [];

    getRouteByName(name: string): XRoute | null {
        return this.routes.find(item => item.name === name) || null;
    }
}


export class XRoutesStore {
    routeGroups: XRoutesGroup[] = [];

    getRouteGroupByName(name: string): XRoutesGroup | null {
        return this.routeGroups.find(item => item.name === name) || null;
    }
}
