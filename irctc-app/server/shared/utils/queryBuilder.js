/**
 * Builds generic query parameters for search, pagination, filtering, and sorting.
 * @param {Object} queryOptions - options from req.query
 * @param {Array} allowedSortColumns - array of allowed columns to sort by (to prevent SQL injection)
 * @param {Array} searchableColumns - array of columns that can be searched
 * @returns {Object} { limitOffsetSql, orderSql, searchSql, params }
 */
export const buildQueryOptions = (queryOptions, allowedSortColumns = ['created_at'], searchableColumns = []) => {
    let { search, limit, page, sortBy, sortOrder } = queryOptions;
    
    // Pagination
    limit = parseInt(limit) || 10;
    if (limit > 100) limit = 100; // Max 100 per page
    page = parseInt(page) || 1;
    const offset = (page - 1) * limit;
    
    const limitOffsetSql = ` LIMIT $1 OFFSET $2 `;
    const params = [limit, offset];
    let paramIndex = 3;

    // Sorting
    let orderSql = ` ORDER BY created_at DESC `;
    if (sortBy && allowedSortColumns.includes(sortBy)) {
        const order = String(sortOrder).toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
        orderSql = ` ORDER BY ${sortBy} ${order} `;
    }

    // Search (Fuzzy matching using ILIKE)
    let searchSql = '';
    if (search && searchableColumns.length > 0) {
        const searchConditions = searchableColumns.map(col => `${col} ILIKE $${paramIndex}`);
        searchSql = ` WHERE (${searchConditions.join(' OR ')}) `;
        params.push(`%${search}%`);
        paramIndex++;
    }

    return { limitOffsetSql, orderSql, searchSql, params, paramIndex };
};
