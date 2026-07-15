import preferenceRepository from '../repositories/PreferenceRepository.js';

class PreferenceService {
    async getPreferences(userId) {
        let prefs = await preferenceRepository.getByUserId(userId);
        if (!prefs) {
            // Default preferences if none exist yet
            prefs = { user_id: userId, email_enabled: true, in_app_enabled: true };
        }
        return prefs;
    }

    async updatePreferences(userId, data) {
        return preferenceRepository.upsert(userId, {
            email_enabled: data.email_enabled !== undefined ? data.email_enabled : true,
            in_app_enabled: data.in_app_enabled !== undefined ? data.in_app_enabled : true
        });
    }
}

export default new PreferenceService();
