import fetch from 'node-fetch';


class SeederHttpService {
  private baseUrl = 'https://test.skunkworksproject.com'; //http://localhost:2999';

  async get<T>(url: string, params?: any): Promise<{ data: T[] }> {
    const queryString = Object.entries(params || {})
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
      .join('&');

    const fullUrl = `${this.baseUrl}${url}${queryString ? '?' + queryString : ''}`;
    console.log('Making GET request to:', fullUrl);

    const response = await fetch(fullUrl, {
      headers: {
        'Accept': 'application/json',
        'x-app-id': 'car',
        'x-app-environment': 'development',
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async update<T>(url: string, data: any): Promise<{ data: T }> {
    console.log('Making UPDATE request to:', `${this.baseUrl}${url}`);

    const response = await fetch(`${this.baseUrl}${url}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'x-app-id': 'car',
        'x-app-environment': 'development',
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async post<T>(url: string, data: any): Promise<{ data: T }> {
    console.log('Making POST request to:', `${this.baseUrl}/api/create${url}`);

    const response = await fetch(`${this.baseUrl}/api/create${url}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'x-app-id': 'car',
        'x-app-environment': 'development',
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }
}

export const seederHttpService = new SeederHttpService();
