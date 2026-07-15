import API from '../utils/api';

export const authApi = {
    login: (credentials) => API.post('/auth/login', credentials),
    register: (userData) => API.post('/auth/register', userData)
};
