import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  Plus, Edit, Trash2, Calendar, AlertTriangle, 
  Search, Filter, CheckSquare, LogOut, Shield, User, X, Loader2, Clock
} from 'lucide-react';

interface Task {
  id: number;
  title: string;
  description: string;
  priority: 'Low' | 'Medium' | 'High';
  status: 'Open' | 'In Progress' | 'Testing' | 'Done';
  due_date: string | null;
  created_by: number;
  assigned_to: number | null;
  created_at: string;
  creator_name: string;
  assignee_name: string | null;
}

interface DBUser {
  id: number;
  name: string;
  email: string;
  role: 'Admin' | 'User';
}

export const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<DBUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters state
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPriority, setFilterPriority] = useState('');

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'create' | 'edit'>('create');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // Task Details Modal state
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [detailsTask, setDetailsTask] = useState<Task | null>(null);

  const handleOpenDetailsModal = (task: Task) => {
    setDetailsTask(task);
    setShowDetailsModal(true);
  };
  
  // Modal Form state
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formPriority, setFormPriority] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [formStatus, setFormStatus] = useState<'Open' | 'In Progress' | 'Testing' | 'Done'>('Open');
  const [formDueDate, setFormDueDate] = useState('');
  const [formAssignedTo, setFormAssignedTo] = useState<string>('');
  
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // Fetch tasks and users on mount/filter change
  const fetchTasks = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (search.trim()) params.search = search.trim();
      if (filterStatus) params.status = filterStatus;
      if (filterPriority) params.priority = filterPriority;

      const response = await api.get('/api/tasks', { params });
      setTasks(response.data);
    } catch (err: any) {
      console.error('Error fetching tasks:', err);
      setError('Failed to fetch tasks. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await api.get('/api/auth/users');
      setUsers(response.data);
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  useEffect(() => {
    fetchTasks();
    fetchUsers();
  }, [search, filterStatus, filterPriority]);

  const handleOpenCreateModal = () => {
    setModalType('create');
    setSelectedTask(null);
    setFormTitle('');
    setFormDescription('');
    setFormPriority('Medium');
    setFormStatus('Open');
    setFormDueDate('');
    setFormAssignedTo('');
    setModalError(null);
    setShowModal(true);
  };

  const handleOpenEditModal = (task: Task) => {
    setModalType('edit');
    setSelectedTask(task);
    setFormTitle(task.title);
    setFormDescription(task.description || '');
    setFormPriority(task.priority);
    setFormStatus(task.status);
    setFormDueDate(task.due_date ? task.due_date.split('T')[0] : '');
    setFormAssignedTo(task.assigned_to ? String(task.assigned_to) : '');
    setModalError(null);
    setShowModal(true);
  };

  const handleModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);

    if (!formTitle.trim()) {
      setModalError('Title is required.');
      return;
    }

    setModalLoading(true);

    const payload = {
      title: formTitle.trim(),
      description: formDescription.trim(),
      priority: formPriority,
      status: formStatus,
      dueDate: formDueDate || null,
      assignedTo: formAssignedTo ? Number(formAssignedTo) : null,
    };

    try {
      if (modalType === 'create') {
        await api.post('/api/tasks', payload);
      } else if (modalType === 'edit' && selectedTask) {
        await api.put(`/api/tasks/${selectedTask.id}`, payload);
      }
      setShowModal(false);
      fetchTasks();
    } catch (err: any) {
      console.error('Modal submit error:', err);
      const msg = err.response?.data?.error || 'Failed to save task.';
      setModalError(msg);
    } finally {
      setModalLoading(false);
    }
  };

  const handleDeleteTask = async (id: number) => {
    if (!window.confirm('Are you sure you want to permanently delete this task?')) return;
    try {
      await api.delete(`/api/tasks/${id}`);
      fetchTasks();
    } catch (err: any) {
      console.error('Delete task error:', err);
      alert(err.response?.data?.error || 'Failed to delete task.');
    }
  };

  const formatDateForDisplay = (dateStr: string | null) => {
    if (!dateStr) return 'No due date';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return 'No due date';
    return d.toLocaleDateString(undefined, { dateStyle: 'medium' });
  };

  // Helper styles
  const getPriorityStyles = (p: Task['priority']) => {
    switch (p) {
      case 'High':
        return 'bg-red-500/10 text-red-400 border border-red-500/20';
      case 'Medium':
        return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
      case 'Low':
        return 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
    }
  };

  const getStatusStyles = (s: Task['status']) => {
    switch (s) {
      case 'Done':
        return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
      case 'Testing':
        return 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20';
      case 'In Progress':
        return 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20';
      case 'Open':
        return 'bg-slate-500/10 text-slate-400 border border-slate-700/60';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-purple-950 text-white flex flex-col">
      {/* Top Header Navbar */}
      <header className="sticky top-0 z-30 backdrop-blur-md bg-slate-950/60 border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-500/20 border border-purple-500/30 rounded-xl text-purple-400">
            <CheckSquare className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white font-sans">Task Manager</h1>
            <p className="text-slate-400 text-xs hidden sm:block">Team Workflow Engine</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-1.5 text-sm">
            <User className="h-4 w-4 text-purple-400" />
            <span className="font-semibold text-slate-200">{user?.name}</span>
            <span className="text-slate-500">|</span>
            <span className="flex items-center gap-1 text-slate-400">
              <Shield className="h-3.5 w-3.5" />
              {user?.role}
            </span>
          </div>
          
          <button
            onClick={logout}
            className="flex items-center gap-2 px-3.5 py-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/30 text-red-300 hover:text-red-200 text-sm font-medium rounded-xl transition-all cursor-pointer"
          >
            <span className="hidden sm:inline">Sign Out</span>
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-6">
        
        {/* Filters and Add Actions row */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center bg-white/5 border border-white/10 p-5 rounded-2xl">
          <div className="flex flex-wrap gap-3 items-center w-full md:w-auto">
            {/* Search Box */}
            <div className="relative flex-1 sm:flex-initial min-w-[200px] group">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-purple-400 transition-colors" />
              <input
                type="text"
                placeholder="Search tasks..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-950/40 border border-slate-700/60 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 text-sm transition-all"
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="pl-3 pr-8 py-2 bg-slate-950/40 border border-slate-700/60 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 cursor-pointer appearance-none"
              >
                <option value="">All Statuses</option>
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Testing">Testing</option>
                <option value="Done">Done</option>
              </select>
              <Filter className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-400 pointer-events-none" />
            </div>

            {/* Priority Filter */}
            <div className="relative">
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="pl-3 pr-8 py-2 bg-slate-950/40 border border-slate-700/60 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 cursor-pointer appearance-none"
              >
                <option value="">All Priorities</option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
              <Filter className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-400 pointer-events-none" />
            </div>
          </div>

          <button
            onClick={handleOpenCreateModal}
            className="w-full md:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium rounded-xl shadow-lg hover:shadow-purple-500/20 active:scale-[0.98] transition-all text-sm cursor-pointer"
          >
            <Plus className="h-4.5 w-4.5" />
            <span>Create Task</span>
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 text-red-300 p-4 rounded-xl text-sm">
            <AlertTriangle className="h-5 w-5 text-red-400 shrink-0" />
            <p className="font-medium">{error}</p>
          </div>
        )}

        {/* Task Grid View */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
            <p className="text-slate-400 text-sm">Loading tasks...</p>
          </div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-20 bg-white/5 border border-dashed border-slate-700/60 rounded-2xl space-y-3">
            <CheckSquare className="h-12 w-12 text-slate-500 mx-auto" />
            <h3 className="text-lg font-semibold text-slate-200">No Tasks Found</h3>
            <p className="text-sm text-slate-400 max-w-sm mx-auto">
              Create a task to get started, or change your filters to search wider.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tasks.map((task) => {
              // Permission validations matching backend logic
              const canEdit = user?.role === 'Admin' || task.created_by === user?.id || task.assigned_to === user?.id;
              const canDelete = user?.role === 'Admin' || task.created_by === user?.id;

              return (
                <div 
                  key={task.id} 
                  className="backdrop-blur-md bg-white/5 border border-white/10 hover:border-white/20 shadow-xl rounded-2xl p-6 flex flex-col justify-between hover:scale-[1.01] transition-all duration-200"
                >
                  <div className="space-y-4">
                    {/* Top Row: Priorities & Status Badges */}
                    <div className="flex items-center justify-between">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${getPriorityStyles(task.priority)}`}>
                        {task.priority} Priority
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${getStatusStyles(task.status)}`}>
                        {task.status}
                      </span>
                    </div>

                    {/* Task Title & Desc */}
                    <div className="space-y-1.5">
                      <h3 
                        onClick={() => handleOpenDetailsModal(task)}
                        className="text-xl font-bold tracking-tight text-white font-sans text-left line-clamp-1 cursor-pointer hover:text-purple-400 hover:underline transition-colors"
                      >
                        {task.title}
                      </h3>
                      <p className="text-slate-400 text-sm text-left line-clamp-3 min-h-[4rem]">
                        {task.description || 'No description provided.'}
                      </p>
                    </div>

                    {/* Due Date Indicator */}
                    <div className="flex items-center gap-2 text-slate-400 text-xs text-left pt-2 border-t border-white/5">
                      <Calendar className="h-4 w-4 text-purple-400" />
                      <span>Due: </span>
                      <span className={task.due_date && new Date(task.due_date) < new Date() && task.status !== 'Done' ? 'text-red-400 font-semibold' : 'text-slate-300'}>
                        {formatDateForDisplay(task.due_date)}
                      </span>
                    </div>
                  </div>

                  {/* Users Section + Actions Row */}
                  <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
                    <div className="space-y-1 text-left">
                      <p>
                        <span className="text-slate-500">Created:</span> {task.creator_name}
                      </p>
                      <p>
                        <span className="text-slate-500">Assigned:</span>{' '}
                        <span className="text-slate-300 font-semibold">{task.assignee_name || 'Unassigned'}</span>
                      </p>
                    </div>

                    {/* Edit/Delete Actions */}
                    <div className="flex items-center gap-2">
                      {canEdit && (
                        <button
                          onClick={() => handleOpenEditModal(task)}
                          title="Edit Task"
                          className="p-2 bg-slate-800 hover:bg-slate-700 border border-slate-700/60 hover:border-slate-600 rounded-lg text-slate-300 hover:text-white transition-colors cursor-pointer"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </button>
                      )}
                      {canDelete && (
                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          title="Delete Task"
                          className="p-2 bg-red-950/20 hover:bg-red-950/60 border border-red-900/30 hover:border-red-950 rounded-lg text-red-400 hover:text-red-200 transition-colors cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Task Edit/Creation Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="relative w-full max-w-lg backdrop-blur-md bg-slate-900 border border-white/15 rounded-2xl shadow-2xl overflow-hidden p-6 space-y-6">
            {/* Close Button */}
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 p-1 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Modal Header */}
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-white font-sans text-left">
                {modalType === 'create' ? 'Create New Task' : 'Edit Task'}
              </h2>
              <p className="text-slate-400 text-sm text-left">
                Fill in the details to update your task boards.
              </p>
            </div>

            {/* Modal Error */}
            {modalError && (
              <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 text-red-300 p-4 rounded-xl text-sm text-left">
                <AlertTriangle className="h-5 w-5 text-red-400 shrink-0" />
                <p className="font-medium">{modalError}</p>
              </div>
            )}

            {/* Modal Form */}
            <form onSubmit={handleModalSubmit} className="space-y-4">
              {/* Title */}
              <div className="space-y-1.5 text-left">
                <label className="text-xs font-bold text-slate-300 block">Title *</label>
                <input
                  type="text"
                  required
                  placeholder="Task title"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-950/40 border border-slate-700/60 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-sm"
                />
              </div>

              {/* Description */}
              <div className="space-y-1.5 text-left">
                <label className="text-xs font-bold text-slate-300 block">Description</label>
                <textarea
                  placeholder="Describe the task details..."
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-950/40 border border-slate-700/60 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-sm resize-none"
                />
              </div>

              {/* Priorities & Status */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5 text-left">
                  <label className="text-xs font-bold text-slate-300 block">Priority</label>
                  <select
                    value={formPriority}
                    onChange={(e) => setFormPriority(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 cursor-pointer"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>

                <div className="space-y-1.5 text-left">
                  <label className="text-xs font-bold text-slate-300 block">Status</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 cursor-pointer"
                  >
                    <option value="Open">Open</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Testing">Testing</option>
                    <option value="Done">Done</option>
                  </select>
                </div>
              </div>

              {/* Due Date & Assignee */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5 text-left">
                  <label className="text-xs font-bold text-slate-300 block">Due Date</label>
                  <input
                    type="date"
                    value={formDueDate}
                    onChange={(e) => setFormDueDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 cursor-pointer"
                  />
                </div>

                <div className="space-y-1.5 text-left">
                  <label className="text-xs font-bold text-slate-300 block">Assignee</label>
                  <select
                    value={formAssignedTo}
                    onChange={(e) => setFormAssignedTo(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 cursor-pointer"
                  >
                    <option value="">Unassigned</option>
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.role})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700/60 rounded-xl text-slate-300 hover:text-white text-sm transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium rounded-xl hover:shadow-lg active:scale-[0.98] transition-all text-sm cursor-pointer"
                >
                  {modalLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save Task</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Task Details Modal */}
      {showDetailsModal && detailsTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="relative w-full max-w-lg backdrop-blur-md bg-slate-900 border border-white/15 rounded-2xl shadow-2xl overflow-hidden p-6 space-y-6 text-left">
            {/* Close Button */}
            <button
              onClick={() => {
                setShowDetailsModal(false);
                setDetailsTask(null);
              }}
              className="absolute top-4 right-4 p-1 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Modal Header */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${getPriorityStyles(detailsTask.priority)}`}>
                  {detailsTask.priority} Priority
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${getStatusStyles(detailsTask.status)}`}>
                  {detailsTask.status}
                </span>
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-white font-sans leading-tight">
                {detailsTask.title}
              </h2>
            </div>

            {/* Content Details */}
            <div className="space-y-4 py-2 border-y border-white/10 text-sm">
              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Description</span>
                <p className="text-slate-300 whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto">
                  {detailsTask.description || 'No description provided.'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Due Date</span>
                  <div className="flex items-center gap-2 text-slate-300">
                    <Calendar className="h-4 w-4 text-purple-400" />
                    <span>{formatDateForDisplay(detailsTask.due_date)}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Created On</span>
                  <div className="flex items-center gap-2 text-slate-300">
                    <Clock className="h-4 w-4 text-purple-400" />
                    <span>{formatDateForDisplay(detailsTask.created_at)}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Created By</span>
                  <span className="text-slate-300">{detailsTask.creator_name}</span>
                </div>

                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Assigned To</span>
                  <span className="text-slate-300 font-semibold">{detailsTask.assignee_name || 'Unassigned'}</span>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowDetailsModal(false);
                  setDetailsTask(null);
                }}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700/60 rounded-xl text-slate-300 hover:text-white text-sm font-medium transition-all cursor-pointer"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
