const express =require('express');
const router=express.Router();
const taskController=require('./taskController');
const {protect}=require('./authMiddleware');

router.post('/',protect,taskController.createTask);
router.get('/', protect, taskController.getTasks);
router.get('/:id', protect, taskController.getTaskById);
router.put('/:id', protect, taskController.updateTask);
router.delete('/:id', protect, taskController.deleteTask);

module.exports = router;