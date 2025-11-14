
const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const adminController = require('../controllers/adminController');

// Use destructure if you want:
const { getFormQuestions } = adminController;

// Routes (no /api/forms prefix here!)
router.post('/create', authenticateToken, authorizeRoles('admin'), adminController.createForm);
router.patch('/:formId/deactivate', authenticateToken, authorizeRoles('admin'), adminController.deactivateForm);
router.get('/:formId/responses', authenticateToken, authorizeRoles('admin'), adminController.getFormResponses);
router.get('/active', authenticateToken, adminController.getActiveForms);

// Use this route (matches: /api/forms/:formId/questions)
router.get('/:formId/questions', authenticateToken, getFormQuestions);

router.post('/:formId/submit', authenticateToken, adminController.submitFormResponse);
router.get('/:formId', authenticateToken, adminController.getFormById);
module.exports = router;
