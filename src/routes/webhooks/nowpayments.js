const express = require('express');
const router = express.Router();
const nowPaymentsService = require('../../services/NowPaymentsService');
const walletRepository = require('../../database/repositories/WalletRepository');
const dbConnection = require('../../database/connection');
const logger = require('../../utils/logger');

/**
 * NOWPayments IPN Handler
 * POST /webhooks/nowpayments
 */
router.post('/nowpayments', express.json(), async (req, res) => {
    const signature = req.headers['x-nowpayments-sig'];
    const event = req.body;

    // 1. Verify Signature
    if (!nowPaymentsService.verifyIpnSignature(signature, event)) {
        logger.warn('Invalid NOWPayments IPN signature');
        return res.status(401).send('Forbidden');
    }

    logger.info(`Received NOWPayments IPN: ${event.payment_status}`, {
        paymentId: event.payment_id,
        orderId: event.order_id
    });

    try {
        // Only process finished payments
        // Statuses: 'finished', 'failed', 'refunded', 'expired'
        if (event.payment_status === 'finished') {
            await handlePaymentFinished(event);
        } else if (['failed', 'expired'].includes(event.payment_status)) {
            logger.warn(`NOWPayments funding failed/expired for order: ${event.order_id}`);
        }

        res.status(200).send('OK');
    } catch (error) {
        logger.error('Error processing NOWPayments IPN:', error);
        res.status(500).send('Internal Server Error');
    }
});

async function handlePaymentFinished(data) {
    // order_id format: FUND_{userId}_{timestamp}
    const orderParts = data.order_id.split('_');
    if (orderParts[0] !== 'FUND') return;

    const userId = orderParts[1];
    const amountReceived = parseFloat(data.actually_paid);
    const currency = data.pay_currency; // Original pay currency
    const priceCurrency = data.price_currency; // Usually USD (the wallet target)

    // We assume the wallet target is what the user expects to see in their dashboard
    // Convert to target amount if different (NOWPayments actually_paid is in pay_currency)
    // However, data.price_amount is what we requested. 
    // Usually, we should credit the price_amount if everything match.

    const amountToCredit = parseFloat(data.actually_paid_at_fiat) || data.price_amount;

    const walletRepo = new walletRepository(dbConnection.getPostgres());

    logger.info(`Crediting NOWPayments funding: ${userId} +${amountToCredit} ${priceCurrency}`);

    await walletRepo.addFunds(userId, amountToCredit, priceCurrency.toUpperCase());
    await walletRepo.recordTransaction(userId, amountToCredit, 'deposit', `crypto_nowpayments_${data.payment_id}`);
}

module.exports = router;
