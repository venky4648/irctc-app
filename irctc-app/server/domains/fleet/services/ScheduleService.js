import ScheduleRepository from "../repositories/ScheduleRepository.js";

class ScheduleService {
    async createSchedule(scheduleData) {
        if (!scheduleData.train_id || !scheduleData.station_id || !scheduleData.halt_order || scheduleData.distance_from_origin === undefined) {
            const err = new Error("Train ID, Station ID, halt_order, and distance_from_origin are required");
            err.statusCode = 400;
            throw err;
        }
        if (scheduleData.halt_order <= 0) {
            const err = new Error("Halt order must be greater than 0");
            err.statusCode = 400;
            throw err;
        }
        return await ScheduleRepository.create(scheduleData);
    }

    async getScheduleById(train_id, station_id) {
        const schedule = await ScheduleRepository.findById(train_id, station_id);
        if (!schedule) {
            const err = new Error("Schedule not found");
            err.statusCode = 404;
            throw err;
        }
        return schedule;
    }

    async searchSchedules(queryOptions) {
        if (!queryOptions.train_id) {
            const err = new Error("Train ID is required for searching schedules");
            err.statusCode = 400;
            throw err;
        }
        return await ScheduleRepository.findWithFilters(queryOptions);
    }

    async updateSchedule(train_id, station_id, scheduleData) {
        const schedule = await ScheduleRepository.update(train_id, station_id, scheduleData);
        if (!schedule) {
            const err = new Error("Schedule not found");
            err.statusCode = 404;
            throw err;
        }
        return schedule;
    }

    async deleteSchedule(train_id, station_id) {
        const schedule = await ScheduleRepository.delete(train_id, station_id);
        if (!schedule) {
            const err = new Error("Schedule not found");
            err.statusCode = 404;
            throw err;
        }
        return schedule;
    }
}

export default new ScheduleService();
