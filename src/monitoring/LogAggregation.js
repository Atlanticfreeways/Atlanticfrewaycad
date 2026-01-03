const winston = require('winston');
const { ElasticsearchTransport } = require('winston-elasticsearch');

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    defaultMeta: { service: 'atlanticfrewaycard-service' },
    transports: [
        new winston.transports.Console({
            format: winston.format.simple(),
        }),
    ],
});

if (process.env.ELASTICSEARCH_URL) {
    const esTransport = new ElasticsearchTransport({
        level: 'info',
        clientOpts: { node: process.env.ELASTICSEARCH_URL },
        index: 'atlanticfrewaycard-logs',
    });

    esTransport.on('error', (error) => {
        console.error('Error in Elasticsearch transport', error);
    });

    logger.add(esTransport);
}

module.exports = logger;
