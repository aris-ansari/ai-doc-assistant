import dns from "dns";
import app from "./app.js";
import { connectDB } from "./config/db.js";
import { env } from "./config/env.js";

dns.setServers(["8.8.8.8", "1.1.1.1"]);

/**
 * Bootstraps database connection and starts Express HTTP server.
 */
const startServer = async () => {
  await connectDB();

  const PORT = env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running in ${env.NODE_ENV} mode on port ${PORT}`);
  });
};

startServer();
