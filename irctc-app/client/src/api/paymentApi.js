import API from '../utils/api';

export const paymentApi = {
  initiatePayment: (data) => API.post('/payment/initiate', data),
  verifyPayment: (data) => API.post('/payment/verify', data)
};
