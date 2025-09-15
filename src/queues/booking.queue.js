import IORedis from "ioredis";
import pkg from "bullmq";
import db from "../models/index.js";

const { Queue, Worker } = pkg;
const { Booking, Event, WaitlistEntry } = db;

const connection = new IORedis({
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: process.env.REDIS_PORT || 6379,
  maxRetriesPerRequest: null, 
});

// Create queue (no QueueScheduler needed in v4)
const BookingQueue = new Queue("BookingQueue", { connection });

// Worker
const BookingWorker = new Worker(
  "BookingQueue",
  async (job) => {
    switch (job.name) {
      case "booking-confirmed":
        console.log(`✅ Booking confirmed:`, job.data);
        break;

      case "booking-cancelled":
        const { event_id } = job.data;
        const event = await Event.findByPk(event_id);

        if (!event) {
          console.warn(
            `⚠️ Event ${event_id} not found during waitlist promotion.`
          );
          return;
        }

        const confirmedCount = await Booking.count({
          where: { event_id, status: "confirmed" },
        });

        if (confirmedCount >= event.capacity) {
          console.log("🚫 Event still full. No promotion.");
          return;
        }

        const nextWaitlistEntry = await WaitlistEntry.findOne({
          where: { event_id },
          order: [["joined_at", "ASC"]],
        });

        if (!nextWaitlistEntry) {
          console.log("📭 No one on waitlist to promote.");
          return;
        }

        const newBooking = await Booking.create({
          user_id: nextWaitlistEntry.user_id,
          event_id,
          booked_at: new Date(),
          status: "confirmed",
        });

        await nextWaitlistEntry.destroy();
        console.log(
          `🎉 Promoted user ${newBooking.user_id} from waitlist to confirmed booking.`
        );
        break;

      default:
        console.log(`❓ Unknown job type: ${job.name}`);
    }
  },
  { connection }
);

BookingWorker.on("completed", (job) => {
  console.log(`✅ Job ${job.id} (${job.name}) completed`);
});

BookingWorker.on("failed", (job, err) => {
  console.error(`❌ Job ${job?.name} failed:`, err);
});

export default BookingQueue;
