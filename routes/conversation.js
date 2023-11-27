const router = require('express').Router();
const { getOrAddConversation, getAllConversations, deleteConversation} = require('../controllers/conversation')

router.route('/').post(getOrAddConversation).get(getAllConversations).delete(deleteConversation);

module.exports = router