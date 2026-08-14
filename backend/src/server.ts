import dns from "dns";
import app from "./app.js";
import { connectDB } from "./config/db.js";
import { env } from "./config/env.js";

const dnsServers = process.env.DNS_SERVERS?.split(",").map((server) =>
  server.trim(),
);

if (dnsServers?.length) {
  dns.setServers(dnsServers);
}

const startServer = async () => {
  await connectDB();

  const PORT = env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running in ${env.NODE_ENV} mode on port ${PORT}`);
  });
};

startServer();
