"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_cron_1 = __importDefault(require("node-cron"));
const sequelize_1 = require("sequelize");
const auctionproduct_1 = __importDefault(require("../models/auctionproduct"));
const logger_1 = __importDefault(require("../middlewares/logger"));
// Runs every minute to check and update auction statuses
const auctionStatusUpdate = () => {
    node_cron_1.default.schedule('* * * * *', () => __awaiter(void 0, void 0, void 0, function* () {
        logger_1.default.info('Running auction status update...');
        try {
            // Move 'upcoming' auctions to 'ongoing' when startDate is reached
            yield auctionproduct_1.default.update({ auctionStatus: 'ongoing' }, {
                where: {
                    auctionStatus: 'upcoming',
                    startDate: { [sequelize_1.Op.lte]: new Date(new Date().toISOString()) }, // startDate <= now
                },
            });
            // Move 'ongoing' auctions to 'ended' when endDate is reached
            yield auctionproduct_1.default.update({ auctionStatus: 'ended' }, {
                where: {
                    auctionStatus: 'ongoing',
                    endDate: { [sequelize_1.Op.lte]: new Date(new Date().toISOString()) }, // endDate <= now
                },
            });
            logger_1.default.info('Auction status updated successfully.');
        }
        catch (error) {
            logger_1.default.info('Error updating auction status:', error);
        }
    }));
};
exports.default = auctionStatusUpdate;
//# sourceMappingURL=auctionStatusUpdate.js.map