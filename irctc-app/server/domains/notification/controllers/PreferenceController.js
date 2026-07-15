import preferenceService from '../services/PreferenceService.js';

class PreferenceController {
    async getPreferences(req, res, next) {
        try {
            const prefs = await preferenceService.getPreferences(req.user.id);
            res.status(200).json({ success: true, data: prefs });
        } catch (error) {
            next(error);
        }
    }

    async updatePreferences(req, res, next) {
        try {
            const prefs = await preferenceService.updatePreferences(req.user.id, req.body);
            res.status(200).json({ success: true, data: prefs });
        } catch (error) {
            next(error);
        }
    }
}

export default new PreferenceController();
