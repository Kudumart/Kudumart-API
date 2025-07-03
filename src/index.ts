import dotenv from 'dotenv';
import http from 'http';
import { Server } from 'socket.io';
import createExpressApp from './services/express.service';
import sequelizeService from './services/sequelize.service'; // Adjusted to match your service structure
import apiRouter from './routes/authRoute'; // Import your routes here
import { configureSocket } from './services/socket.service';
import './config/passportConfig'; // Import Password Configuration
import passport from 'passport';
import runSubscriptionCron from './job/subscriptionCron'; // Import the cron job
import auctionStatusUpdate from './job/auctionStatusUpdate'; // Import the cron job

dotenv.config();

// Initialize the Express app
const app = createExpressApp();

// Create the HTTP server
const server = http.createServer(app);

// Attach Socket.IO to the HTTP server
const io = new Server(server, {
  cors: {
    origin: '*', // Change to specific origins in production
  },
});

app.use(passport.initialize());

app.use('/api', apiRouter); // Mount the router to /api

app.set('trust proxy', true);

// Configure Socket.IO
configureSocket(io);

// Export the io instance so it can be used elsewhere
export { io };

// Initialize and sync Sequelize
sequelizeService
  .init()
  .then(async () => {
    if (sequelizeService.connection) {
      await sequelizeService.connection.authenticate(); // Ensure the connection is established

      sequelizeService.connection.sync({ force: true });
      console.log('Database connected successfully');
    } else {
      console.error('Database connection is not initialized.');
    }
  })
  .catch((error: Error) =>
    console.error('Error connecting to the database:', error)
  );

// Create and start the HTTP server
const port = process.env.SERVER_PORT || 3000; // Get the port from the environment variables

// Start the cron job
runSubscriptionCron();
auctionStatusUpdate();

server.timeout = 300000;

server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down gracefully...');
  server.close(() => {
    console.log('HTTP server closed.');
    sequelizeService.connection?.close().then(() => {
      console.log('Database connection closed.');
      process.exit(0);
    });
  });
});
