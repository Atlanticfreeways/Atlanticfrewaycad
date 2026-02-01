class WebhookProcessorService {
  constructor(repositories) {
    this.transactionRepo = repositories.transaction;
    this.cardRepo = repositories.card;
  }

  async processTransaction(webhookData) {
    const { token, card_token, user_token, amount, state, merchant } = webhookData;

    const card = await this.cardRepo.findByMarqetaToken(card_token);
    if (!card) {
      console.warn('Card not found for transaction:', card_token);
      return;
    }

    const existingTx = await this.transactionRepo.findByMarqetaToken(token);
    if (existingTx) {
      console.log('Transaction already processed:', token);
      return existingTx;
    }

    const MerchantEnrichmentService = require('../MerchantEnrichmentService');
    const enrichment = MerchantEnrichmentService.enrich(merchant?.name || 'Unknown', merchant?.mcc || null);

    const transaction = await this.transactionRepo.create({
      marqetaTransactionToken: token,
      cardId: card.id,
      userId: card.user_id,
      amount: parseFloat(amount),
      currency: 'USD',
      merchantName: enrichment.name,
      merchantCategory: enrichment.category,
      status: state,
      metadata: {
        webhook_data: webhookData,
        original_merchant: merchant?.name,
        mcc: merchant?.mcc,
        group: enrichment.group,
        parent_brand: enrichment.parentBrand
      }
    });

    console.log('Transaction processed:', transaction.id);
    return transaction;
  }

  async processCardStateChange(webhookData) {
    const { token, state } = webhookData;

    const card = await this.cardRepo.findByMarqetaToken(token);
    if (!card) {
      console.warn('Card not found:', token);
      return;
    }

    const statusMap = {
      'ACTIVE': 'active',
      'SUSPENDED': 'frozen',
      'TERMINATED': 'terminated'
    };

    await this.cardRepo.update(card.id, {
      status: statusMap[state] || 'active'
    });

    console.log('Card state updated:', token, state);
  }
}

module.exports = WebhookProcessorService;
