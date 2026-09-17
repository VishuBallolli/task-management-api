const express = require('express');
const {
	getTasks,
	createTask,
	 getTaskById,
	 updateTask,
	 deleteTask
} = require('../controllers/taskController');

const router = express.Router();

router.get('/', getTasks);
router.post('/', createTask);
router.get('/:id', getTaskById);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);

module.exports = router;
