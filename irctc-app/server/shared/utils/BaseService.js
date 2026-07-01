export class BaseService {
    constructor(repository) {
        this.repository = repository;
    }

    async create(data) {
        return await this.repository.create(data);
    }

    async getById(id) {
        const item = await this.repository.findById(id);
        if (!item) {
            const err = new Error("Resource not found");
            err.statusCode = 404;
            throw err;
        }
        return item;
    }

    async getAll(queryOptions) {
        return await this.repository.findAll(queryOptions);
    }

    async update(id, data) {
        const item = await this.repository.update(id, data);
        if (!item) {
            const err = new Error("Resource not found");
            err.statusCode = 404;
            throw err;
        }
        return item;
    }

    async delete(id) {
        const item = await this.repository.delete(id);
        if (!item) {
            const err = new Error("Resource not found");
            err.statusCode = 404;
            throw err;
        }
        return item;
    }
}
