import API from '../utils/api';

export const searchApi = {
    searchTrains: (from, to, date, classId, quota) => {
        let url = `/search/trains?from=${from}&to=${to}&date=${date}`;
        if (classId) url += `&class=${classId}`;
        if (quota) url += `&quota=${quota}`;
        return API.get(url);
    },
    getSeats: (trainRunId) => API.get(`/search/train-runs/${trainRunId}/seats`),
    getFare: (trainRunId, classId, quotaId, passengerCount) => {
        let url = `/search/fare?train_run_id=${trainRunId}&class_id=${classId}&quota_id=${quotaId}&passenger_count=${passengerCount}`;
        return API.get(url);
    },
    previewBooking: (payload) => API.post('/search/preview', payload)
};
