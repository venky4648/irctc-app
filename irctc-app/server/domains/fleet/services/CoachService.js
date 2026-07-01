import CoachRepository from "../repositories/CoachRepository.js";

class CoachService {
    async createCoach(coachData) {
        if (!coachData.serial_number || !coachData.coach_type_id || !coachData.layout_id) {
            const err = new Error("Serial number, coach_type_id, and layout_id are required");
            err.statusCode = 400;
            throw err;
        }
        return await CoachRepository.create(coachData);
    }

    async getCoachById(id) {
        const coach = await CoachRepository.findById(id);
        if (!coach) {
            const err = new Error("Coach not found");
            err.statusCode = 404;
            throw err;
        }
        return coach;
    }

    async searchCoaches(queryOptions) {
        return await CoachRepository.findWithFilters(queryOptions);
    }

    async updateCoach(id, coachData) {
        const coach = await CoachRepository.update(id, coachData);
        if (!coach) {
            const err = new Error("Coach not found");
            err.statusCode = 404;
            throw err;
        }
        return coach;
    }

    async deleteCoach(id) {
        const coach = await CoachRepository.delete(id);
        if (!coach) {
            const err = new Error("Coach not found");
            err.statusCode = 404;
            throw err;
        }
        return coach;
    }
}

export default new CoachService();
