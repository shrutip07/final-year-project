const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const fireSafetyController = require('../controllers/fireSafetyController');

router.get('/', authenticateToken, authorizeRoles('clerk'), fireSafetyController.getFireSafetyInfo);
router.put('/', authenticateToken, authorizeRoles('clerk'), fireSafetyController.updateFireSafetyInfo);
router.post('/drill', authenticateToken, authorizeRoles('clerk'), fireSafetyController.addFireDrill);

module.exports = router;
