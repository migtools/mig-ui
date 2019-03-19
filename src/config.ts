export const JWT_API_URL =
  process.env.NODE_ENV === 'production' ? '' : 'http://localhost:8081/api/';
export const SOCKET_API_URL =
  process.env.NODE_ENV === 'production' ? '' : 'https://localhost:8080';
export const JSON_SERVER_URL =
  process.env.NODE_ENV === 'production' ? '' : 'http://localhost:3000/';
