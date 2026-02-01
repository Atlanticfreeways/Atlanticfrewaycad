const logger = require('../utils/logger');
const QueryStream = require('pg-query-stream');
const { AsyncParser } = require('json2csv');

class ComplianceService {
    constructor(db) {
        this.db = db;
    }

    /**
     * Generates a CSV report stream of all currency conversions within a date range.
     * Uses PostgreSQL streaming to handle large datasets efficiently.
     * @param {string} startDate - ISO Date string
     * @param {string} endDate - ISO Date string
     * @returns {Promise<Stream>} Readable stream of CSV data
     */
    async generateConversionReportStream(startDate, endDate) {
        logger.info(`Generating streaming compliance report from ${startDate} to ${endDate}`);

        const queryText = `
      SELECT 
        id, 
        user_id, 
        from_currency, 
        to_currency, 
        amount_source::float, 
        amount_target::float, 
        rate_applied::float, 
        spread_fee::float, 
        created_at as timestamp
      FROM currency_conversion_logs 
      WHERE created_at BETWEEN $1 AND $2
      ORDER BY created_at DESC
    `;

        const client = await this.db.connect();
        const query = new QueryStream(queryText, [startDate, endDate]);
        const stream = client.query(query);

        // Release the client when the stream is finished
        stream.on('end', () => client.release());
        stream.on('error', (err) => {
            logger.error('Stream query error', err);
            client.release();
        });

        const fields = ['id', 'user_id', 'from_currency', 'to_currency', 'amount_source', 'amount_target', 'rate_applied', 'spread_fee', 'timestamp'];
        const opts = { fields };
        const asyncParser = new AsyncParser(opts);

        // Convert the query results (JSON objects) into CSV rows in a memory-efficient way
        return stream.pipe(asyncParser.toStream());
    }

    // Keeping old method for small queries or compatibility if needed, 
    // but refactored to be clean.
    async generateConversionReport(startDate, endDate) {
        try {
            const query = `
        SELECT 
          id, 
          user_id, 
          from_currency, 
          to_currency, 
          amount_source::float, 
          amount_target::float, 
          rate_applied::float, 
          spread_fee::float, 
          created_at as timestamp
        FROM currency_conversion_logs 
        WHERE created_at BETWEEN $1 AND $2
        ORDER BY created_at DESC
      `;
            const result = await this.db.query(query, [startDate, endDate]);
            return result.rows;
        } catch (error) {
            logger.error('Failed to generate compliance report', error);
            throw error;
        }
    }
}

module.exports = ComplianceService;
