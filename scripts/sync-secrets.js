require('dotenv').config();
const { SecretsManagerClient, UpdateSecretCommand, CreateSecretCommand, GetSecretValueCommand } = require("@aws-sdk/client-secrets-manager");
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const secretNameArg = args.find(arg => arg.startsWith('--secret-name='));
const regionArg = args.find(arg => arg.startsWith('--region='));

const secretName = secretNameArg ? secretNameArg.split('=')[1] : process.env.AWS_SECRET_NAME;
const region = regionArg ? regionArg.split('=')[1] : process.env.AWS_REGION || "us-east-1";

if (!secretName) {
    console.error('Error: Secret name is required. Use --secret-name=NAME or set AWS_SECRET_NAME env var.');
    process.exit(1);
}

const envPath = path.resolve(process.cwd(), '.env');
if (!fs.existsSync(envPath)) {
    console.error('Error: .env file not found at', envPath);
    process.exit(1);
}

// Parse .env file
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        if (key && valueParts.length > 0) {
            let value = valueParts.join('=');
            // Remove quotes if present
            if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
                value = value.slice(1, -1);
            }
            envVars[key.trim()] = value;
        }
    }
});

const client = new SecretsManagerClient({ region });

const syncSecrets = async () => {
    console.log(`Syncing .env to AWS Secret: ${secretName} in ${region}`);

    try {
        // Check if secret exists
        try {
            await client.send(new GetSecretValueCommand({ SecretId: secretName }));

            // Update existing secret
            console.log('Secret exists. Updating...');
            await client.send(new UpdateSecretCommand({
                SecretId: secretName,
                SecretString: JSON.stringify(envVars)
            }));
            console.log('Successfully updated secret.');

        } catch (err) {
            if (err.name === 'ResourceNotFoundException') {
                // Create new secret
                console.log('Secret does not exist. Creating...');
                await client.send(new CreateSecretCommand({
                    Name: secretName,
                    SecretString: JSON.stringify(envVars)
                }));
                console.log('Successfully created secret.');
            } else {
                throw err;
            }
        }

    } catch (error) {
        console.error('Failed to sync secrets:', error.message);
        process.exit(1);
    }
};

syncSecrets();
