export class SearchResponseDTO {
    static formatTrainSearchError(missingCapability) {
        const error = new Error(`Missing Capability: ${missingCapability}`);
        error.statusCode = 501;
        error.isMissingCapability = true;
        error.missingCapability = [missingCapability];
        return error;
    }

    static formatTrain(train, trainRunId, scheduleFrom, scheduleTo, classes, journeyDate) {
        return {
            trainRunId,
            trainId: train.id,
            trainNumber: train.train_number,
            trainName: train.name,
            fromStation: {
                id: scheduleFrom.station_id,
                code: scheduleFrom.station_code || "",
                name: scheduleFrom.station_name || "",
                departureTime: scheduleFrom.departure_time
            },
            toStation: {
                id: scheduleTo.station_id,
                code: scheduleTo.station_code || "",
                name: scheduleTo.station_name || "",
                arrivalTime: scheduleTo.arrival_time
            },
            journeyDate,
            classes: classes || []
        };
    }
}
