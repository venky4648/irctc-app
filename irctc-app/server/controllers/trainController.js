import Train from "../models/train.js";
import TrainRoute from "../models/trainRoute.js";
import { SeatOccupancy } from "../models/seatOccupancy.js";
import { Booking } from "../models/bookings.js";

// Add Train
export const addTrain = async (req, res) => {
  try {
    const {
      trainNumber,
      trainName,
      from,
      to,
      route,
      departureTime,
      arrivalTime,
      classes,
      scheduleType,
      runningDays,
      runningDates,
    } = req.body;

    const calculateSeats = (clsObj) => {
      if (!clsObj) return undefined;
      const coachCount = Number(clsObj.coachCount) || 0;
      const seatsPerCoach = Number(clsObj.seatsPerCoach) || 0;
      const totalSeats = coachCount * seatsPerCoach;
      return {
        coachCount,
        seatsPerCoach,
        totalSeats,
        availableSeats: totalSeats,
        price: Number(clsObj.price) || 0,
        racCapacity: Number(clsObj.racCapacity) || 20
      };
    };

    const formattedClasses = classes ? {
      general: calculateSeats(classes.general),
      sleeper: calculateSeats(classes.sleeper),
      ac3: calculateSeats(classes.ac3),
      ac2: calculateSeats(classes.ac2),
      ac1: calculateSeats(classes.ac1),
    } : undefined;

    const train = await Train.create({
      trainNumber,
      trainName,
      from,
      to,
      departureTime,
      arrivalTime,
      classes: formattedClasses,
      scheduleType,
      runningDays,
      runningDates,
    });

    if (route && Array.isArray(route) && route.length > 0) {
      const routeDocs = route.map((station, index) => ({
        train: train._id,
        stationName: station.stationName,
        arrivalDay: station.arrivalDay || 1,
        arrivalTime: station.arrivalTime,
        departureDay: station.departureDay || 1,
        departureTime: station.departureTime,
        distanceFromSource: station.distanceFromSource || 0,
        stationOrder: index + 1
      }));
      await TrainRoute.insertMany(routeDocs);
    }

    res.status(201).json({
      success: true,
      train,
    });
  } catch (err) {
    let errorMessage = "Failed to add train";
    if (err.code === 11000) errorMessage = "Train number already exists!";
    else if (err.message) errorMessage = err.message;
    res.status(500).json({
      success: false,
      message: errorMessage,
      error: err.message,
    });
  }
};

const getJoinedTrains = async () => {
  const trains = await Train.aggregate([
    {
      $lookup: {
        from: 'trainroutes',
        localField: '_id',
        foreignField: 'train',
        as: 'route'
      }
    }
  ]);

  // Sort routes by stationOrder for each train
  trains.forEach(t => {
    if (t.route && t.route.length > 0) {
      t.route.sort((a, b) => a.stationOrder - b.stationOrder);
    }
  });

  return trains;
};

// Get All Trains
export const getTrains = async (req, res) => {
  try {
    const trains = await getJoinedTrains();
    
    console.log("=== DEBUG GET TRAINS API ===");
    console.log(`Total Trains Fetched: ${trains.length}`);
    trains.forEach(t => {
      console.log(`Train: ${t.trainName} | Routes Count: ${t.route ? t.route.length : 0}`);
      if(t.route && t.route.length > 0) {
        console.log(`  Route Details:`, JSON.stringify(t.route));
      }
    });

    res.status(200).json({
      success: true,
      trains,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
};

// Search Trains
export const searchTrains = async (req, res) => {
  const { from, to, date } = req.query;

  try {
    const allTrains = await getJoinedTrains();
    
    const matchedTrains = [];

    for (const train of allTrains) {
      let arrivalDayOffset = 0;
      let requestedSegments = [];
      let matchesSearch = false;

      // 1. Verify route order and fallback logic
      if (train.route && train.route.length > 0) {
        // Sort the route array just in case
        train.route.sort((a, b) => a.stationOrder - b.stationOrder);
        
        const fromIndex = train.route.findIndex(s => s.stationName.toLowerCase().includes(from.toLowerCase()));
        const toIndex = train.route.findIndex(s => s.stationName.toLowerCase().includes(to.toLowerCase()));

        if (fromIndex !== -1 && toIndex !== -1 && fromIndex < toIndex) {
          // Both found in route
          matchesSearch = true;
          arrivalDayOffset = (train.route[fromIndex].arrivalDay || 1) - 1;
          for (let i = fromIndex; i < toIndex; i++) {
            requestedSegments.push(i);
          }
        } else if (train.from.toLowerCase().includes(from.toLowerCase()) && train.to.toLowerCase().includes(to.toLowerCase())) {
          // Matches the main source and dest, but they might not be explicitly in the route timeline
          matchesSearch = true;
          arrivalDayOffset = 0;
          for (let i = 0; i < train.route.length; i++) {
            requestedSegments.push(i);
          }
        }
      } else {
        // No intermediate route defined
        if (train.from.toLowerCase().includes(from.toLowerCase()) && train.to.toLowerCase().includes(to.toLowerCase())) {
          matchesSearch = true;
          requestedSegments = [0]; // fallback one main segment
        }
      }

      if (!matchesSearch) {
        continue;
      }

      // 2. Schedule Check
      if (date) {
        const userJourneyDate = new Date(date);
        const originDate = new Date(userJourneyDate);
        originDate.setDate(originDate.getDate() - arrivalDayOffset);
        
        const originDateString = originDate.toISOString().split('T')[0];
        const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
        const originWeekday = days[originDate.getDay()];

        if (train.scheduleType === 'WEEKLY') {
          if (!train.runningDays || !train.runningDays.includes(originWeekday)) {
            continue;
          }
        } else if (train.scheduleType === 'SPECIAL') {
          if (!train.runningDates || !train.runningDates.includes(originDateString)) {
            continue;
          }
        }
      }

      // 3. Segment Availability Calculation
      let classes = train.classes;
      if (!classes && train.seatAvailable !== undefined) {
        classes = {
          general: { totalSeats: train.seatAvailable, price: train.price || 0 }
        };
      }
      
      if (classes && requestedSegments.length > 0 && date) {
        for (const [cls, data] of Object.entries(classes)) {
          if (data.totalSeats > 0) {
            const occupiedRecords = await SeatOccupancy.find({
              trainId: train._id,
              journeyDate: date,
              travelClass: cls,
              segmentIndex: { $in: requestedSegments }
            }).lean();
            
            const occupiedSeats = new Set(occupiedRecords.map(r => r.seatNumber));
            const availableSeats = data.totalSeats - occupiedSeats.size;
            
            classes[cls].availableSeats = availableSeats;

            const activeBookings = await Booking.find({
              train: train._id,
              journeyDate: date,
              travelClass: cls,
              bookingStatus: "confirmed"
            }).lean();

            let maxWl = 0;
            let currentWl = 0;

            for (const booking of activeBookings) {
              for (const p of booking.passengers) {
                if (p.status === "WL") {
                  currentWl++;
                  if (p.waitingListNumber > maxWl) maxWl = p.waitingListNumber;
                }
              }
            }

            if (availableSeats > 0) {
              classes[cls].statusMsg = "Available";
              classes[cls].statusCount = availableSeats;
            } else {
              classes[cls].statusMsg = "WL";
              classes[cls].statusCount = currentWl;
            }
          }
        }
      } else if (classes) {
        // Fallback
        for (const [cls, data] of Object.entries(classes)) {
           if (data.availableSeats === undefined && data.totalSeats !== undefined) {
             classes[cls].availableSeats = data.totalSeats;
             classes[cls].statusMsg = "Available";
             classes[cls].statusCount = data.totalSeats;
           }
        }
      }
      
      train.classes = classes;
      matchedTrains.push(train);
    }

    if (matchedTrains.length === 0) {
      return res.status(404).json({
        message: "No trains found for the specified route",
      });
    }

    res.status(200).json({
      success: true,
      trains: matchedTrains,
    });
  } catch (err) {
    res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
};

// Update Train
export const updateTrain = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      trainNumber,
      trainName,
      from,
      to,
      route,
      departureTime,
      arrivalTime,
      classes,
      scheduleType,
      runningDays,
      runningDates,
    } = req.body;

    const calculateSeats = (clsObj) => {
      if (!clsObj) return undefined;
      const coachCount = Number(clsObj.coachCount) || 0;
      const seatsPerCoach = Number(clsObj.seatsPerCoach) || 0;
      const totalSeats = coachCount * seatsPerCoach;
      return {
        coachCount,
        seatsPerCoach,
        totalSeats,
        availableSeats: totalSeats, // Note: For update, this overrides existing availableSeats. That might be a limitation but matches standard behavior.
        price: Number(clsObj.price) || 0,
        racCapacity: Number(clsObj.racCapacity) || 20
      };
    };

    const formattedClasses = classes ? {
      general: calculateSeats(classes.general),
      sleeper: calculateSeats(classes.sleeper),
      ac3: calculateSeats(classes.ac3),
      ac2: calculateSeats(classes.ac2),
      ac1: calculateSeats(classes.ac1),
    } : undefined;

    const train = await Train.findByIdAndUpdate(
      id,
      {
        trainNumber,
        trainName,
        from,
        to,
        departureTime,
        arrivalTime,
        classes: formattedClasses,
        scheduleType,
        runningDays,
        runningDates,
      },
      { new: true }
    );

    if (!train) {
      return res.status(404).json({ message: "Train not found" });
    }

    // Update routes: delete old, insert new
    await TrainRoute.deleteMany({ train: id });

    if (route && Array.isArray(route) && route.length > 0) {
      const routeDocs = route.map((station, index) => ({
        train: id,
        stationName: station.stationName,
        arrivalDay: station.arrivalDay || 1,
        arrivalTime: station.arrivalTime,
        departureDay: station.departureDay || 1,
        departureTime: station.departureTime,
        distanceFromSource: station.distanceFromSource || 0,
        stationOrder: index + 1
      }));
      await TrainRoute.insertMany(routeDocs);
    }

    res.status(200).json({
      success: true,
      train,
    });
  } catch (err) {
    let errorMessage = "Failed to update train";
    if (err.code === 11000) errorMessage = "Train number already exists!";
    else if (err.message) errorMessage = err.message;
    res.status(500).json({
      success: false,
      message: errorMessage,
      error: err.message,
    });
  }
};

// Delete Train
export const deleteTrain = async (req, res) => {
  try {
    const { id } = req.params;
    
    const train = await Train.findByIdAndDelete(id);
    if (!train) {
      return res.status(404).json({ message: "Train not found" });
    }

    // Delete associated routes
    await TrainRoute.deleteMany({ train: id });

    res.status(200).json({
      success: true,
      message: "Train and routes deleted successfully",
    });
  } catch (err) {
    res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
};