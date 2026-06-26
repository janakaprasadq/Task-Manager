const db = require('./db');

// 1. Create a task

exports.createTask = async (req, res) => {
    try {
        const { title, description, priority, status, dueDate, assignedTo } = req.body;
        const createdBy = req.user.id;

        if (!title) {
            return res.status(400).json({ error: "Task title is required." });
        }

        const [result] = await db.query(
            `INSERT INTO tasks (title, description, priority, status, due_date, created_by, assigned_to) 
             VALUES (?, ?, ?, ?, ?, ?, ? )`,
            [title, description, priority || 'Medium', status || 'Open', dueDate, createdBy, assignedTo || null]
        );

        res.status(201).json({
            message: "Task created successfully!",
            taskId: result.insertId
        });

    } catch (error) {
        console.error("Error creating task:", error);
        res.status(500).json({ error: "Internal server error." });
    }
};

// 2. Get all tasks with filters

exports.getTasks = async (req, res) => {
    try {
        const { id, role } = req.user;
        const { status, priority, search } = req.query;

        let query = `SELECT t.*,u1.name AS creator_name, u2.name AS assignee_name
        FROM tasks t
        LEFT JOIN users u1 ON t.created_by = u1.id
        LEFT JOIN users u2 ON t.assigned_to = u2.id`;

        let queryParams = [];
        let whereClauses = [];

        if (role !== 'Admin') {
            whereClauses.push(`(t.created_by = ? OR t.assigned_to = ?)`);
            queryParams.push(id, id);
        }

        if (status) {
            whereClauses.push(`t.status = ?`);
            queryParams.push(status);
        }
        if (priority) {
            whereClauses.push(`t.priority = ?`);
            queryParams.push(priority);
        }
        if (search) {
            whereClauses.push(`t.title LIKE ?`);
            queryParams.push(`%${search}%`);
        }

        if (whereClauses.length > 0) {
            query += ` WHERE ` + whereClauses.join(' AND ');
        }

        query += ` ORDER BY t.created_at DESC`;

        const [tasks] = await db.query(query, queryParams);
        res.json(tasks);

    } catch (error) {
        console.error("Error fetching tasks:", error);
        res.status(500).json({ error: "Internal server error." });
    }
};

// 3. get a single task details

exports.getTaskById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const role = req.user.role;

        const [tasks] = await db.query(`SELECT * FROM tasks WHERE id=?`, [id]);
        if (tasks.length === 0) {
            return res.status(404).json({ error: "Task not found." });
        }

        const task = tasks[0];

        if (role !== 'Admin' && task.created_by !== userId && task.assigned_to !== userId) {
            return res.status(403).json({ error: "Access denied to this task resource." });
        }

        res.json(task);
    } catch (error) {
        console.error("Error fetching task details:", error);
        res.status(500).json({ error: "Internal server error." });
    }
};

exports.updateTask = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, priority, status, dueDate, assignedTo } = req.body;
        const userId = req.user.id;
        const role = req.user.role;

        const [tasks] = await db.query(`SELECT * FROM tasks WHERE id = ?`, [id]);
        if (tasks.length === 0) {
            return res.status(404).json({ error: "Task not found." })
        }

        if (role !== 'Admin' && tasks[0].created_by !== userId && tasks[0].assigned_to !== userId) {
            return res.status(403).json({ error: "You do not have permission to modify this task." });
        }

        await db.query(
            `UPDATE tasks SET title = ?, description = ?, priority = ?, status = ?, due_date = ?, assigned_to = ? 
             WHERE id = ?`,
            [title, description, priority, status, dueDate, assignedTo, id]
        );

        res.json({ message: "Task updated successfully." });
    } catch (error) {
        console.error("Error updating task:", error);
        res.status(500).json({ error: "Internal server error." });
    }
}

// 5. Delete a task

exports.deleteTask = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const role = req.user.role;

        const [tasks] = await db.query('SELECT * FROM tasks WHERE id = ?', [id]);
        if (tasks.length === 0) {
            return res.status(404).json({ error: "Task not found." });
        }

        if (role !== 'Admin' && tasks[0].created_by !== userId) {
            return res.status(403).json({ error: "Only the creator or an Admin can delete this task." });
        }

        await db.query('DELETE FROM tasks WHERE id = ?', [id]);
        res.json({ message: "Task permanently deleted." });
    } catch (error) {
        console.error("Error deleting task:", error);
        res.status(500).json({ error: "Internal server error." });
    }
};