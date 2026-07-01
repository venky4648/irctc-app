import StationRepository from "../repositories/StationRepository.js";

class StationService {
    async createStation(stationData) {
        if (!stationData.code || !stationData.name || !stationData.division_id || !stationData.latitude || !stationData.longitude) {
            const err = new Error("Code, name, division_id, latitude, and longitude are required");
            err.statusCode = 400;
            throw err;
        }
        return await StationRepository.create(stationData);
    }

    async getStationById(id) {
        const station = await StationRepository.findById(id);
        if (!station) {
            const err = new Error("Station not found");
            err.statusCode = 404;
            throw err;
        }
        return station;
    }

    async searchStations(queryOptions) {
        return await StationRepository.findWithFilters(queryOptions);
    }

    async updateStation(id, stationData) {
        const station = await StationRepository.update(id, stationData);
        if (!station) {
            const err = new Error("Station not found");
            err.statusCode = 404;
            throw err;
        }
        return station;
    }

    async deleteStation(id) {
        const station = await StationRepository.delete(id);
        if (!station) {
            const err = new Error("Station not found");
            err.statusCode = 404;
            throw err;
        }
        return station;
    }
}

export default new StationService();
