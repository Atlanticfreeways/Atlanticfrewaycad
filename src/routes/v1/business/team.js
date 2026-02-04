const express = require('express');
const { authenticate, authorize } = require('../../../middleware/authenticate');
const { csrfProtection } = require('../../../middleware/csrfProtection');
const asyncHandler = require('../../../utils/asyncHandler');
const Joi = require('joi');
const crypto = require('crypto');

const router = express.Router();

router.use(authenticate);
router.use(csrfProtection);

/**
 * GET /api/v1/business/team
 * List all team members for the current user's company
 */
router.get('/', authorize(['admin', 'finance_manager']), asyncHandler(async (req, res) => {
    if (!req.user.company_id) {
        return res.status(403).json({
            success: false,
            error: 'Not a business account'
        });
    }

    const members = await req.repositories.db('users')
        .where({ company_id: req.user.company_id })
        .select(
            'id',
            'email',
            'full_name',
            'role',
            'created_at',
            'last_login_at as last_active'
        )
        .orderBy('created_at', 'asc');

    // Add status based on email verification
    const membersWithStatus = members.map(m => ({
        ...m,
        status: m.email_verified ? 'active' : 'pending'
    }));

    res.json({
        success: true,
        team: membersWithStatus
    });
}));

/**
 * POST /api/v1/business/team/invite
 * Invite a new team member
 */
const inviteSchema = Joi.object({
    email: Joi.string().email().required(),
    role: Joi.string().valid('admin', 'finance_manager', 'operator', 'viewer').required()
});

router.post('/invite', authorize(['admin']), asyncHandler(async (req, res) => {
    if (!req.user.company_id) {
        return res.status(403).json({
            success: false,
            error: 'Not a business account'
        });
    }

    const { error, value } = inviteSchema.validate(req.body);
    if (error) {
        return res.status(400).json({
            success: false,
            error: error.details[0].message
        });
    }

    const { email, role } = value;

    // Check if user already exists
    const existing = await req.repositories.db('users')
        .where({ email })
        .first();

    if (existing) {
        return res.status(400).json({
            success: false,
            error: 'User with this email already exists'
        });
    }

    // Generate temporary password
    const tempPassword = crypto.randomBytes(16).toString('hex');
    const bcrypt = require('bcryptjs');
    const passwordHash = await bcrypt.hash(tempPassword, 10);

    // Create user
    const [newMember] = await req.repositories.db('users')
        .insert({
            email,
            full_name: email.split('@')[0], // Temporary name
            role,
            company_id: req.user.company_id,
            password_hash: passwordHash,
            email_verified: false,
            account_type: 'business'
        })
        .returning('*');

    // Send invitation email (if email service available)
    if (req.emailService) {
        try {
            await req.emailService.send({
                to: email,
                template: 'team-invitation',
                data: {
                    inviter_name: req.user.full_name,
                    company: req.user.company,
                    role,
                    temp_password: tempPassword,
                    login_url: `${process.env.FRONTEND_URL}/login`
                }
            });
        } catch (emailError) {
            console.error('Failed to send invitation email:', emailError);
        }
    }

    // Create notification for inviter
    await req.repositories.db('notifications').insert({
        user_id: req.user.id,
        type: 'system',
        title: 'Team Member Invited',
        message: `Successfully invited ${email} to join your team as ${role}`,
        data: { user_id: newMember.id, email, role }
    });

    // Audit log
    await req.repositories.db('audit_logs').insert({
        user_id: req.user.id,
        action: 'team_member_invited',
        resource_type: 'user',
        resource_id: newMember.id,
        ip_address: req.ip,
        user_agent: req.get('user-agent'),
        status: 'success',
        metadata: { email, role }
    });

    delete newMember.password_hash;

    res.json({
        success: true,
        message: 'Invitation sent',
        member: newMember
    });
}));

/**
 * PATCH /api/v1/business/team/:id/role
 * Update team member role
 */
router.patch('/:id/role', authorize(['admin']), asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { role } = req.body;

    if (!['admin', 'finance_manager', 'operator', 'viewer'].includes(role)) {
        return res.status(400).json({
            success: false,
            error: 'Invalid role'
        });
    }

    // Verify member belongs to same company
    const member = await req.repositories.db('users')
        .where({ id, company_id: req.user.company_id })
        .first();

    if (!member) {
        return res.status(404).json({
            success: false,
            error: 'Team member not found'
        });
    }

    // Update role
    await req.repositories.db('users')
        .where({ id })
        .update({
            role,
            updated_at: new Date()
        });

    // Audit log
    await req.repositories.db('audit_logs').insert({
        user_id: req.user.id,
        action: 'team_member_role_updated',
        resource_type: 'user',
        resource_id: id,
        ip_address: req.ip,
        user_agent: req.get('user-agent'),
        status: 'success',
        metadata: { old_role: member.role, new_role: role }
    });

    res.json({ success: true });
}));

/**
 * DELETE /api/v1/business/team/:id
 * Remove team member
 */
router.delete('/:id', authorize(['admin']), asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Cannot remove yourself
    if (id === req.user.id) {
        return res.status(400).json({
            success: false,
            error: 'Cannot remove yourself from the team'
        });
    }

    // Verify member belongs to same company
    const member = await req.repositories.db('users')
        .where({ id, company_id: req.user.company_id })
        .first();

    if (!member) {
        return res.status(404).json({
            success: false,
            error: 'Team member not found'
        });
    }

    // Remove from company (don't delete user, just unlink)
    await req.repositories.db('users')
        .where({ id })
        .update({
            company_id: null,
            role: null,
            updated_at: new Date()
        });

    // Audit log
    await req.repositories.db('audit_logs').insert({
        user_id: req.user.id,
        action: 'team_member_removed',
        resource_type: 'user',
        resource_id: id,
        ip_address: req.ip,
        user_agent: req.get('user-agent'),
        status: 'success',
        metadata: { removed_email: member.email }
    });

    res.json({ success: true });
}));

module.exports = router;
