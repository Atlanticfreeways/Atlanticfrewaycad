const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authenticate');

router.get('/metrics', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const companyId = req.user.company_id;

    const metrics = {
      totalSpend: { current: 0, previous: 0, change: 0 },
      activeCards: 0,
      pendingApprovals: 0,
      availableBalance: 0
    };

    if (companyId) {
      const spendQuery = await req.repositories.transaction.query(
        `SELECT COALESCE(SUM(amount), 0) as total 
         FROM transactions t 
         JOIN cards c ON t.card_id = c.id 
         JOIN users u ON c.user_id = u.id 
         WHERE u.company_id = $1 AND t.created_at >= date_trunc('month', CURRENT_DATE)`,
        [companyId]
      );
      metrics.totalSpend.current = parseFloat(spendQuery.rows[0]?.total || 0);

      const cardsQuery = await req.repositories.card.query(
        `SELECT COUNT(*) as count FROM cards c 
         JOIN users u ON c.user_id = u.id 
         WHERE u.company_id = $1 AND c.status = 'active'`,
        [companyId]
      );
      metrics.activeCards = parseInt(cardsQuery.rows[0]?.count || 0);
    }

    const wallet = await req.repositories.wallet.findByUser(userId);
    // Default USD balance for backward compatibility
    const usdBal = wallet?.balances?.find(b => b.currency === 'USD')?.balance || 0;
    metrics.availableBalance = parseFloat(usdBal);
    metrics.balances = wallet?.balances || [];

    res.json(metrics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/transactions', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const limit = parseInt(req.query.limit) || 10;

    const result = await req.repositories.transaction.query(
      `SELECT t.*, c.last_four, u.first_name, u.last_name 
       FROM transactions t
       JOIN cards c ON t.card_id = c.id
       JOIN users u ON t.user_id = u.id
       WHERE t.user_id = $1
       ORDER BY t.created_at DESC
       LIMIT $2`,
      [userId, limit]
    );

    res.json({ transactions: result.rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/overview', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const companyId = req.user.company_id;

    const overview = {
      user: await req.repositories.user.findById(userId),
      company: companyId ? await req.repositories.company.findById(companyId) : null,
      cards: await req.repositories.card.findByUser(userId),
      recentTransactions: []
    };

    const txResult = await req.repositories.transaction.query(
      'SELECT * FROM transactions WHERE user_id = $1 ORDER BY created_at DESC LIMIT 5',
      [userId]
    );
    overview.recentTransactions = txResult.rows;

    delete overview.user.password_hash;

    res.json(overview);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
