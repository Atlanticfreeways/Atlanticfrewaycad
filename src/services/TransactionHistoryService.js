const { ValidationError } = require('../errors/AppError');
const fs = require('fs');
const path = require('path');
const { parse } = require('json2csv');
// const PDFDocument = require('pdfkit-table'); // Uncomment if PDF needed

class TransactionHistoryService {
    constructor(repositories) {
        this.txRepo = repositories.transaction;
        this.cardRepo = repositories.card;
    }

    /**
     * Get filtered transaction history
     */
    async getHistory(userId, filters) {
        const transactions = await this.txRepo.findByUser(userId, filters);
        const totalCount = await this.txRepo.countByUser(userId, filters);

        return {
            data: transactions,
            pagination: {
                total: totalCount,
                page: parseInt(filters.page) || 1,
                limit: parseInt(filters.limit) || 50,
                pages: Math.ceil(totalCount / (parseInt(filters.limit) || 50))
            }
        };
    }

    /**
     * Export transactions to CSV
     */
    async exportCSV(userId, filters) {
        // Fetch all matching records (no pagination)
        const exportFilters = { ...filters };
        delete exportFilters.limit;
        delete exportFilters.page;

        const transactions = await this.txRepo.findByUser(userId, exportFilters);

        if (!transactions.length) {
            throw new ValidationError('No transactions found to export');
        }

        const fields = ['id', 'created_at', 'merchant_name', 'merchant_category', 'amount', 'currency', 'status', 'last_four'];
        const opts = { fields };

        try {
            const csv = parse(transactions, opts);
            return csv;
        } catch (err) {
            throw new Error('Failed to generate CSV');
        }
    }

    // Placeholder for PDF export
    // async exportPDF(userId, filters) { ... }
}

module.exports = TransactionHistoryService;
