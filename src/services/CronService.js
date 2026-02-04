const cron = require('node-cron');
const logger = require('../utils/logger');

class CronService {
    constructor(services, repositories) {
        this.statementService = services.statement;
        this.userRepo = repositories.user;
        this.initJobs();
    }

    initJobs() {
        logger.info('Initializing Cron Jobs...');

        // 1. Monthly Financial Statements
        // Schedule: 0 0 1 * * (At 00:00 on day-of-month 1)
        cron.schedule('0 0 1 * *', async () => {
            logger.info('Running Cron Job: Generate Monthly Statements');
            await this.generateMonthlyStatements();
        });

        // 2. Daily Reconciliation (internal vs external)
        // Schedule: 0 0 2 * * (At 02:00 every day)
        cron.schedule('0 0 2 * *', async () => {
            logger.info('Running Cron Job: Daily Reconciliation');
            try {
                // Reconcile processing for Yesterday (T-1)
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                await this.reconciliationService.reconcileDaily(yesterday);
            } catch (err) {
                logger.error('Failed to run Daily Reconciliation', err);
            }
        });
    }

    async generateMonthlyStatements() {
        try {
            // Calculate previous month range
            const now = new Date();
            const firstDayPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            const lastDayPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0);

            // Fetch all active users
            // Note: In production, paginate this query!
            const users = await this.userRepo.findAll();

            for (const user of users) {
                try {
                    await this.statementService.generateStatement(user.id, firstDayPrevMonth, lastDayPrevMonth);
                } catch (err) {
                    logger.error(`Failed to generate statement for user ${user.id}`, err);
                }
            }
            logger.info(`Completed generating statements for ${users.length} users.`);
        } catch (error) {
            logger.error('Critical Error in Monthly Statement Cron Job', error);
        }
    }
}

module.exports = CronService;
