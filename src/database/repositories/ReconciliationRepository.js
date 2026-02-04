const BaseRepository = require('../BaseRepository');

class ReconciliationRepository extends BaseRepository {
    async createReport(report) {
        return await this.query(`
            INSERT INTO reconciliation_reports (date, status, discrepancies, total_volume, processed_count)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        `, [
            report.date,
            report.status,
            JSON.stringify(report.discrepancies || []),
            report.total_volume || 0,
            report.processed_count || 0
        ]);
    }

    async findByDate(date) {
        const result = await this.query(`
            SELECT * FROM reconciliation_reports WHERE date = $1
        `, [date]);
        return result.rows[0];
    }
}

module.exports = ReconciliationRepository;
