import EventEmitter from 'events';
import { logger } from '../utils/logger.js';

class EventBus extends EventEmitter {
    emit(event, payload) {
        logger.info(`[EventBus] Emitting event: ${event}`);
        return super.emit(event, payload);
    }
}

const eventBus = new EventBus();
// Increase max listeners if needed
eventBus.setMaxListeners(20);

export default eventBus;
