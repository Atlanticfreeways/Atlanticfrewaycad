const express = require('express');
const { authenticate } = require('../../middleware/authenticate');
const { csrfProtection } = require('../../middleware/csrfProtection');
const asyncHandler = require('../../utils/asyncHandler');
const Joi = require('joi');
const CardService = require('../../services/CardService');

const router = express.Router();

router.use(authenticate);
router.use(csrfProtection);

const createCardSchema = Joi.object({
    name: Joi.string().required(),
    type: Joi.string().valid('VIRTUAL', 'PHYSICAL').default('VIRTUAL'),
    currency: Joi.string().default('USD')
});

/**
 * POST /api/v1/cards
 * Issue a new card
 */
router.post('/', asyncHandler(async (req, res) => {
    const { error, value } = createCardSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ success: false, error: error.details[0].message });
    }

    // Use CardService to create card
    // Assuming CardService exists or we use repository directly
    const cardRepo = req.repositories.card;
    const newCard = await cardRepo.create({
        user_id: req.user.id,
        name: value.name,
        type: value.type,
        currency: value.currency,
        status: 'active',
        last_four: Math.floor(1000 + Math.random() * 9000).toString(), // Mock last four
        limit: 1000 // Default limit
    });

    res.status(201).json({ success: true, card: newCard });
}));

/**
 * POST /api/v1/cards/:id/freeze
 */
router.post('/:id/freeze', asyncHandler(async (req, res) => {
    const cardRepo = req.repositories.card;
    const card = await cardRepo.findById(req.params.id);

    if (!card || card.user_id !== req.user.id) {
        return res.status(404).json({ success: false, error: 'Card not found' });
    }

    const updated = await cardRepo.update(card.id, { status: 'inactive' });
    res.json({ success: true, card: updated });
}));

/**
 * POST /api/v1/cards/:id/unfreeze
 */
router.post('/:id/unfreeze', asyncHandler(async (req, res) => {
    const cardRepo = req.repositories.card;
    const card = await cardRepo.findById(req.params.id);

    if (!card || card.user_id !== req.user.id) {
        return res.status(404).json({ success: false, error: 'Card not found' });
    }

    const updated = await cardRepo.update(card.id, { status: 'active' });
    res.json({ success: true, card: updated });
}));

/**
 * PUT /api/v1/cards/:id/limits
 */
router.put('/:id/limits', asyncHandler(async (req, res) => {
    // Validate body
    const { dailyLimit } = req.body;

    const cardRepo = req.repositories.card;
    const card = await cardRepo.findById(req.params.id);

    if (!card || card.user_id !== req.user.id) {
        return res.status(404).json({ success: false, error: 'Card not found' });
    }

    const updated = await cardRepo.update(card.id, { limit: dailyLimit });
    res.json({ success: true, card: updated });
}));

module.exports = router;
