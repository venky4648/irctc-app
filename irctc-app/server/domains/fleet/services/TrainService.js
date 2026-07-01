import TrainRepository from "../repositories/TrainRepository.js";

class TrainService {
    async createTrain(trainData) {
        if (!trainData.train_number || !trainData.name || !trainData.operator_id || !trainData.category_id || !trainData.type_id) {
            const err = new Error("Train number, name, operator_id, category_id, and type_id are required");
            err.statusCode = 400;
            throw err;
        }
        return await TrainRepository.create(trainData);
    }

    async getTrainById(id) {
        const train = await TrainRepository.findById(id);
        if (!train) {
            const err = new Error("Train not found");
            err.statusCode = 404;
            throw err;
        }
        return train;
    }

    async searchTrains(queryOptions) {
        return await TrainRepository.findWithFilters(queryOptions);
    }

    async updateTrain(id, trainData) {
        const train = await TrainRepository.update(id, trainData);
        if (!train) {
            const err = new Error("Train not found");
            err.statusCode = 404;
            throw err;
        }
        return train;
    }

    async deleteTrain(id) {
        const train = await TrainRepository.delete(id);
        if (!train) {
            const err = new Error("Train not found");
            err.statusCode = 404;
            throw err;
        }
        return train;
    }
}

export default new TrainService();
