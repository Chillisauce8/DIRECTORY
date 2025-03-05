

export class CoreServiceLocator {
    private services = {};
    private groups = {};

    register(name: string, service: any, groupName?: string) {
        this.services[name] = service;

        if (groupName) {
            if (!this.groups[groupName]) {
                this.groups[groupName] = [];
            }

            this.groups[groupName].push(service);
        }
    }

    get<ServiceType extends unknown = any>(name: string, optional= false): ServiceType {
        if (!this.has(name) && !optional) {
            throw new Error(`No service with name: ${name}`);
        }

        return this.services[name];
    }

    has(name) {
        return !!this.services[name];
    }

    all() {
        return this.services;
    }

    getServicesGroup(groupName: string): any[] {
        return this.groups[groupName] || [];
    }
}

export const coreServiceLocator = new CoreServiceLocator();
