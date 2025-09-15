import { createBullBoard } from "@bull-board/api";
import { BullMQAdapter } from "@bull-board/api/bullMQAdapter";
import { ExpressAdapter } from "@bull-board/express";
import BookingQueue from "../queues/booking.queue.js"; // your queue file

const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath("/admin/queues");

// Register queues you want to monitor
createBullBoard({
  queues: [new BullMQAdapter(BookingQueue)],
  serverAdapter,
});

export default serverAdapter;