import { HttpService, httpService } from '~/service/http/http.service';


export class EventService {
  constructor(private http: HttpService) {
    //
  }

  getEvents() {
    return httpService.get(`/api/query?collection=events`)
      .then((response: any) => {
        return response.data;
      });
  }

  createEvent(data: any) {
    return httpService.post(`/api/create/events`, data)
      .then((response: any) => {
        return response.data;
      });
  }
}


export const eventService = new EventService(httpService)
