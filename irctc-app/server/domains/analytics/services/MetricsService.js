import MetricsRepository from "../repositories/MetricsRepository.js";

class MetricsService {
    async getDashboardMetrics() {
        const today = new Date().toISOString().split('T')[0];
        
        const [dailyRevenue, activeBookings, systemLoad] = await Promise.all([
            MetricsRepository.getDailyRevenue(today),
            MetricsRepository.getActiveBookingsCount(),
            MetricsRepository.getSystemLoad()
        ]);

        return {
            date: today,
            dailyRevenue,
            activeBookings,
            systemLoad,
            status: 'HEALTHY'
        };
    }
}

export default new MetricsService();
