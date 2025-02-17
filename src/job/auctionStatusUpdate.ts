import cron from 'node-cron';
import { Op } from 'sequelize';
import AuctionProduct from '../models/auctionproduct';
import logger from '../middlewares/logger';

// Runs every minute to check and update auction statuses
const auctionStatusUpdate = () => {
    cron.schedule('* * * * *', async () => {
        logger.info('Running auction status update...');

        try {
            // Move 'upcoming' auctions to 'ongoing' when startDate is reached
            await AuctionProduct.update(
                { auctionStatus: 'ongoing' },
                {
                    where: {
                        auctionStatus: 'upcoming',
                        startDate: { [Op.lte]: new Date(new Date().toISOString()) }, // startDate <= now
                    },
                }
            );

            // Move 'ongoing' auctions to 'ended' when endDate is reached
            await AuctionProduct.update(
                { auctionStatus: 'ended' },
                {
                    where: {
                        auctionStatus: 'ongoing',
                        endDate: { [Op.lte]: new Date(new Date().toISOString()) }, // endDate <= now
                    },
                }
            );

            logger.info('Auction status updated successfully.');
        } catch (error) {
            logger.info('Error updating auction status:', error);
        }
    });
};

export default auctionStatusUpdate;