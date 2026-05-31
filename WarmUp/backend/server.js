const http = require('http');
const app = require('./app');
const connectDB = require('./config/db');
const { initSockets } = require('./sockets/socketHandler');

const PORT = process.env.PORT || 5000;

// 1. Establish database connection
connectDB();

// 2. Wrap express app with node HTTP server
const server = http.createServer(app);

// 3. Initialize Socket.IO instance
initSockets(server);

// 4. Listen on PORT
server.listen(PORT, () => {
  console.log(`Travel Planning server running on port ${PORT}`);
});
