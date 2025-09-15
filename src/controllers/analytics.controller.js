import db from '../models/index.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { AsyncHandler } from '../utils/AsyncHandler.js';

const { Booking, Event, Sequelize } = db;

const { fn, col, literal } = Sequelize;

// Top 5 Events by Booking Count
const getTopEvents = AsyncHandler(async (req, res) => {
  const results = await Booking.findAll({
    where: { status: 'confirmed' },
    attributes: [
      'event_id',
      [fn('COUNT', col('event_id')), 'bookings']
    ],
    group: ['event_id', 'event.id'],
    order: [[literal('bookings'), 'DESC']],
    limit: 5,
    include: {
      model: Event,
      as: "event",
      attributes: ['id', 'title', 'date']
    }
  });

  return res.status(200).json(new ApiResponse(200, results, 'Top events by bookings'));
});

// Daily Booking Count
const getDailyStats = AsyncHandler(async (req, res) => {
  const results = await Booking.findAll({
    attributes: [
      [fn('DATE', col('createdAt')), 'date'],
      [fn('COUNT', col('id')), 'count']
    ],
    group: ['date'],
    order: [['date', 'ASC']]
  });

  return res.status(200).json(new ApiResponse(200, results, 'Daily booking statistics'));
});

// Cancellation Rate
const getCancellationRate = AsyncHandler(async (req, res) => {
  const total = await Booking.count();
  const cancelled = await Booking.count({ where: { status: 'cancelled' } });

  const rate = total > 0 ? ((cancelled / total) * 100).toFixed(2) : 0;

  return res.status(200).json(new ApiResponse(200, { cancellationRate: `${rate}%` }, 'Cancellation rate'));
});

export {
    getTopEvents,
    getDailyStats,
    getCancellationRate
};