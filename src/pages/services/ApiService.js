// features/chat/ApiService.js
export default class ApiService {
  constructor(baseUrl, token) {
    this.baseUrl = baseUrl;
    this.token = token;
  }

  setToken(token) { this.token = token; }
  setBaseUrl(baseUrl) { this.baseUrl = baseUrl; }

  async makeRequest(method, endpoint, body = null, params = null) {
    try {
      const url = new URL(`${this.baseUrl}${endpoint}`);
      if (params) {
        Object.keys(params).forEach(key =>
          url.searchParams.append(key, params[key])
        );
      }
      const options = {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`,
        },
      };
      if (['POST', 'PUT', 'PATCH'].includes(method) && body) {
        options.body = JSON.stringify(body);
      }

      const response = await fetch(url, options);
      const text = await response.text();
      const data = text ? JSON.parse(text) : {};
      return { status: response.status, statusText: response.statusText, data, ok: response.ok };
    } catch (err) {
      return { status: -1, statusText: err.message, data: null, ok: false };
    }
  }

  // ...chat room & message methods as you already have
}
