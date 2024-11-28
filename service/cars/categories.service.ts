import {httpService, HttpService} from '~/service/http/http.service';
import {serviceComposableFactory} from '~/service/service-composable-factory';

interface CategoryRelator {
  id: string;
  name: string;
}


interface ImageRelatorContent {
  id: string;
  name: string;
  description: string;
}


interface ImageRelator {
  image: ImageRelatorContent;
}


export interface CategoryDbNode {
  _id: string;
  _doc: string;
  name: string;
  description: string;
  categories: CategoryRelator[];
  images: ImageRelator[];
}


export class CategoriesService {
  private collectionName: string = 'categories';

  constructor(private httpService: HttpService) {}

  public async getList(): Promise<CategoryDbNode[]> {
    return (await this.httpService.get<CategoryDbNode[]>('/api/query', {
      collection: this.collectionName,
    })).data as CategoryDbNode[];
  }
}


export const useCategoriesService = serviceComposableFactory('useCategoriesService', nuxtApp => {
  return new CategoriesService(httpService);
});
