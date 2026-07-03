import app from "./src/app.js";
import connectDb from "./src/config/database.js";
import { env } from "./src/config/env.js";
import { retryPendingNotifications } from "./src/services/notificationService.js";

const startServer = async () => {
  await connectDb();

  app.listen(env.PORT, () => {
    console.log(`AMS API running on port ${env.PORT}`);
  });

  setInterval(() => {
    retryPendingNotifications().catch((error) => {
      console.error("Notification retry failed", error);
    });
  }, env.NOTIFICATION_RETRY_INTERVAL_MS);
};

startServer().catch((error) => {
  console.error("Unable to start server", error);
  process.exit(1);
});
