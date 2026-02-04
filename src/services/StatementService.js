const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

class StatementService {
    constructor(repositories) {
        this.ledgerRepo = repositories.ledger;
        this.userRepo = repositories.user;
        this.pool = repositories.ledger.pool; // Access to DB pool for direct queries
    }

    /**
     * Generate monthly statement for a user
     * @param {string} userId 
     * @param {Date} startDate 
     * @param {Date} endDate 
     */
    async generateStatement(userId, startDate, endDate) {
        logger.info(`Generating statement for user: ${userId} (${startDate.toISOString()} - ${endDate.toISOString()})`);

        // 1. Fetch User
        const user = await this.userRepo.findById(userId);
        if (!user) throw new Error('User not found');

        // 2. Fetch Transactions (Debit/Credit for User Account)
        const transactions = await this.ledgerRepo.getAccountTransactions(userId, startDate, endDate);

        // 3. Generate PDF
        const doc = new PDFDocument();
        const fileName = `statement_${userId}_${startDate.toISOString().split('T')[0]}.pdf`;
        const filePath = path.join(__dirname, '../../uploads', fileName); // Ensure this dir exists

        // Create uploads dir if not exists (Synchronous for simplicity here, better in startup)
        if (!fs.existsSync(path.join(__dirname, '../../uploads'))) {
            fs.mkdirSync(path.join(__dirname, '../../uploads'), { recursive: true });
        }

        const stream = fs.createWriteStream(filePath);
        doc.pipe(stream);

        // Header
        doc.fontSize(20).text('Atlantic Freeway Card', { align: 'center' });
        doc.fontSize(12).text('Monthly Financial Statement', { align: 'center' });
        doc.moveDown();
        doc.text(`User: ${user.first_name} ${user.last_name} (${user.email})`);
        doc.text(`Period: ${startDate.toDateString()} - ${endDate.toDateString()}`);
        doc.moveDown();

        // Table Header
        const tableTop = 150;
        doc.font('Helvetica-Bold');
        doc.text('Date', 50, tableTop);
        doc.text('Description', 150, tableTop);
        doc.text('Amount', 400, tableTop, { width: 90, align: 'right' });
        doc.text('Type', 500, tableTop);

        // Table Rows
        let y = tableTop + 25;
        doc.font('Helvetica');

        let totalCredits = 0;
        let totalDebits = 0;

        for (const tx of transactions) {
            if (y > 700) { // New Page
                doc.addPage();
                y = 50;
            }

            const dateStr = new Date(tx.posted_at).toLocaleDateString();
            doc.text(dateStr, 50, y);
            doc.text(tx.description.substring(0, 40), 150, y);

            // Format Amount
            const amount = parseFloat(tx.amount).toFixed(2);
            doc.text(`$${amount}`, 400, y, { width: 90, align: 'right' });

            // Type (Debit vs Credit) based on entry direction
            // We know ledgerRepo.getAccountTransactions result structure is crucial here.
            // Let's assume it returns normalized view or raw entries.
            // Since we don't have getAccountTransactions yet, we will mock/implement query below.
            doc.text(tx.entry_type.toUpperCase(), 500, y);

            if (tx.entry_type === 'credit') totalCredits += parseFloat(tx.amount);
            else totalDebits += parseFloat(tx.amount);

            y += 20;
        }

        // Summary
        doc.moveDown();
        doc.font('Helvetica-Bold');
        doc.text('Summary:', 50, y + 20);
        doc.text(`Total Loads/Credits: $${totalCredits.toFixed(2)}`, 50, y + 40);
        doc.text(`Total Spends/Debits: $${totalDebits.toFixed(2)}`, 50, y + 60);
        doc.text(`Net Change: $${(totalCredits - totalDebits).toFixed(2)}`, 50, y + 80);

        doc.end();

        // 4. Save Record to DB
        return new Promise((resolve, reject) => {
            stream.on('finish', async () => {
                try {
                    const res = await this.pool.query(
                        `INSERT INTO statements (user_id, period_start, period_end, file_url, status)
                     VALUES ($1, $2, $3, $4, 'generated') RETURNING *`,
                        [userId, startDate, endDate, filePath]
                    );
                    resolve(res.rows[0]);
                } catch (e) {
                    reject(e);
                }
            });
            stream.on('error', reject);
        });
    }
}

module.exports = StatementService;
