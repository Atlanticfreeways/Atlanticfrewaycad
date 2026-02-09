const express = require('express');
const { authenticate } = require('../../middleware/authenticate');
const { csrfProtection } = require('../../middleware/csrfProtection');
const asyncHandler = require('../../utils/asyncHandler');
const Joi = require('joi');

const router = express.Router();

router.use(authenticate);
router.use(csrfProtection);

/**
 * GET /api/v1/team
 * List team members
 */
router.get('/', asyncHandler(async (req, res) => {
    // Mock team response for now, as we might not have a full team/organization schema set up
    // In a real app, this would query users where company_id = req.user.company_id
    const companyId = req.user.company_id;

    let members = [];
    if (companyId) {
        members = await req.repositories.db('users')
            .where({ company_id: companyId })
            .select('id', 'first_name', 'last_name', 'email', 'role', 'status');
    } else {
        // If no company, just return the current user
        members = [{
            id: req.user.id,
            first_name: req.user.first_name,
            last_name: req.user.last_name,
            email: req.user.email,
            role: 'owner',
            status: 'active'
        }];
    }

    res.json({ success: true, members });
}));

/**
 * POST /api/v1/team/invite
 * Invite a new member
 */
router.post('/invite', asyncHandler(async (req, res) => {
    const schema = Joi.object({
        email: Joi.string().email().required(),
        role: Joi.string().valid('admin', 'member').default('member')
    });

    const { error, value } = schema.validate(req.body);
    if (error) return res.status(400).json({ success: false, error: error.details[0].message });

    // Mock invitation logic
    // In real app: create invite record, send email

    res.json({ success: true, message: `Invitation sent to ${value.email}` });
}));

module.exports = router;
