import RouteRepository from "../repositories/RouteRepository.js";

class RouteService {
    async createRoute(routeData) {
        if (!routeData.code || !routeData.origin_station_id || !routeData.destination_station_id || !routeData.total_distance_km) {
            const err = new Error("Code, origin_station_id, destination_station_id, and total_distance_km are required");
            err.statusCode = 400;
            throw err;
        }
        if (routeData.origin_station_id === routeData.destination_station_id) {
            const err = new Error("Origin and destination cannot be the same");
            err.statusCode = 400;
            throw err;
        }
        return await RouteRepository.create(routeData);
    }

    async getRouteById(id) {
        const route = await RouteRepository.findById(id);
        if (!route) {
            const err = new Error("Route not found");
            err.statusCode = 404;
            throw err;
        }
        return route;
    }

    async searchRoutes(queryOptions) {
        return await RouteRepository.findWithFilters(queryOptions);
    }

    async updateRoute(id, routeData) {
        const route = await RouteRepository.update(id, routeData);
        if (!route) {
            const err = new Error("Route not found");
            err.statusCode = 404;
            throw err;
        }
        return route;
    }

    async deleteRoute(id) {
        const route = await RouteRepository.delete(id);
        if (!route) {
            const err = new Error("Route not found");
            err.statusCode = 404;
            throw err;
        }
        return route;
    }
}

export default new RouteService();
