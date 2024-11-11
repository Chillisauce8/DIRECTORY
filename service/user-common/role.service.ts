import {RoleStore} from '~/store/roles';


export abstract class RoleService {
  public abstract getBaseURL(): string;
  public abstract getDefaultQueryNodeCount(): number;
  // public abstract get(id: string): Promise<any>;
  public abstract getByName(name: string): Promise<any>;
}


export interface GetRolesConfig {
  count?: number;
  page?: number;
  orderBy?: string;
  searchString?: string;
  fields?: any;
  ignoreCache?: boolean;
}


export class RoleServiceImpl extends RoleService {
  private rolesCacheMap: {[name: string]: any} = {};

  constructor(private rolesStore: RoleStore) {
    super();
  }

  getBaseURL(): string {
    return '/api/query?collection=roles';
  }

  getDefaultQueryNodeCount(): number {
    return 40;
  }

  // get(id: string): Promise<any> {
  //   return this.store.dispatch(this.getBaseURL() + '&value-id=' + id)
  //     .then(response => {
  //       return response.data?.data;
  //     });
  // }

  async getByName(name: string): Promise<any> {
    if (name in this.rolesCacheMap) {
      return this.rolesCacheMap[name];
    }

    return this.rolesStore.fetchByName({roleName: name})
      .then((response: any) => {
        return this.rolesStore.byName(name);
      });
  }
}
