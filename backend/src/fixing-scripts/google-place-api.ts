import {Client, PlaceData, PlaceInputType} from '@googlemaps/google-maps-services-js';


export const GOOGLE_MAPS_API_KEY = 'AIzaSyAbAGy9QYd8BZCetr2UHu35DOVOV7IUwVA';


export async function getPlaceFromText(placeText: string, apiKey: string): Promise<Partial<PlaceData>> {
  const client = getGoogleMapsClient();

  let response;

  try {
    response = await client.findPlaceFromText({
      params: {
        input: placeText,
        inputtype: PlaceInputType.textQuery,
        key: apiKey
      }
    });
  } catch (e) {
    console.error(e);
    return null;
  }

  const place = response?.data?.candidates?.[0];

  if (!place) {
    return null;
  }

  const placeId = place.place_id;

  let placeDetailsResponse;

  try {
    placeDetailsResponse = await client.placeDetails({
      params: {
        place_id: placeId,
        key: apiKey
      }
    });
  } catch (e) {
    console.error(e);
    return null;
  }

  const placeDetails = placeDetailsResponse?.data?.result;

  if (!placeDetails) {
    return null;
  }

  return placeDetails;
}


function getGoogleMapsClient(): Client {
  return new Client();
}