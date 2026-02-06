const { SecretsManagerClient, GetSecretValueCommand } = require("@aws-sdk/client-secrets-manager");
const logger = require('./logger');

/**
 * Validates if the secret string is valid JSON
 * @param {string} str 
 * @returns {boolean}
 */
const isValidJSON = (str) => {
    try {
        JSON.parse(str);
        return true;
    } catch (e) {
        return false;
    }
};

/**
 * Fetches secrets from AWS Secrets Manager and populates process.env
 * Only runs if ENABLE_AWS_SECRETS is 'true'
 */
const loadSecrets = async () => {
    if (process.env.ENABLE_AWS_SECRETS !== 'true') {
        logger.info('AWS Secrets Manager disabled, using local environment variables');
        return;
    }

    const secretName = process.env.AWS_SECRET_NAME;
    const region = process.env.AWS_REGION || "us-east-1";

    if (!secretName) {
        logger.warn('ENABLE_AWS_SECRETS is true but AWS_SECRET_NAME is not set');
        return;
    }

    try {
        const client = new SecretsManagerClient({ region });
        const response = await client.send(
            new GetSecretValueCommand({
                SecretId: secretName,
                VersionStage: "AWSCURRENT",
            })
        );

        if (response.SecretString) {
            if (isValidJSON(response.SecretString)) {
                const secrets = JSON.parse(response.SecretString);

                // Populate process.env, but don't overwrite existing vars if that's preferred
                // (Usually secrets manager should be the source of truth in prod)
                for (const [key, value] of Object.entries(secrets)) {
                    process.env[key] = value;
                }

                logger.info(`Successfully loaded ${Object.keys(secrets).length} secrets from AWS Secrets Manager`);
            } else {
                logger.warn('AWS Secret is not valid JSON, skipping population');
            }
        } else {
            logger.warn('AWS SecretString is empty');
        }
    } catch (error) {
        logger.error('Failed to load secrets from AWS Secrets Manager', { error: error.message });
        // In strict production, you might want to throw error and crash app
        // throw error; 
    }
};

module.exports = { loadSecrets };
