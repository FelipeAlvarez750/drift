// ─────────────────────────────────────────────────────────────
// Página principal de la aplicación. Contiene el tablero Kanban,
// la gestión de tableros, columnas y tareas.
// ─────────────────────────────────────────────────────────────

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { sileo } from 'sileo';
import api from '../services/api';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon, Trash2, Pencil, LayoutDashboard, LogOut, Plus, Check } from 'lucide-react';

// ─── Tipos de datos ───────────────────────────────────────────

interface Task {
  id: number;
  title: string;
  description?: string;
  completed: boolean;  // Indica si la tarea fue marcada como completada
  order: number;
  columnId: number;
}

interface Column {
  id: number;
  name: string;
  order: number;
  tasks: Task[];
}

interface Board {
  id: number;
  name: string;
  columns: Column[];
}

// ─── Componente principal ─────────────────────────────────────

export default function DashboardPage() {
  // Contextos globales de autenticación y tema
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  // Estado local de la página
  const [boards, setBoards] = useState<Board[]>([]);
  const [selectedBoard, setSelectedBoard] = useState<Board | null>(null);
  const [newBoardName, setNewBoardName] = useState('');
  const [loading, setLoading] = useState(true);

  // Cargar tableros al montar el componente
  useEffect(() => { fetchBoards(); }, []);

  // ─── Funciones de tableros ───────────────────────────────────

  // Obtiene todos los tableros del usuario autenticado
  const fetchBoards = async () => {
    try {
      const res = await api.get('/boards');
      setBoards(res.data);
      if (res.data.length > 0) setSelectedBoard(res.data[0]);
    } catch {
      sileo.error({ title: 'Error', description: 'No se pudieron cargar los tableros' });
    } finally {
      setLoading(false);
    }
  };

  // Actualiza el nombre de un tablero existente
  const updateBoard = async (boardId: number, newName: string) => {
    try {
      await api.put(`/boards/${boardId}`, { name: newName });
      const updated = boards.map(b => b.id === boardId ? { ...b, name: newName } : b);
      setBoards(updated);
      if (selectedBoard?.id === boardId) setSelectedBoard({ ...selectedBoard, name: newName });
      sileo.success({ title: 'Tablero actualizado' });
    } catch {
      sileo.error({ title: 'Error', description: 'No se pudo actualizar el tablero' });
    }
  };

  // Crea un nuevo tablero con tres columnas por defecto
  const createBoard = async () => {
    if (!newBoardName.trim()) return;
    try {
      const res = await api.post('/boards', { name: newBoardName });
      setBoards([...boards, res.data]);
      setSelectedBoard(res.data);
      setNewBoardName('');
      sileo.success({ title: 'Tablero creado', description: `"${res.data.name}" listo para usar` });
    } catch {
      sileo.error({ title: 'Error', description: 'No se pudo crear el tablero' });
    }
  };

  // Muestra confirmación antes de eliminar un tablero
  const deleteBoard = async (boardId: number, boardName: string) => {
    sileo.action({
      title: '¿Eliminar tablero?',
      description: `Se eliminarán todas las tareas de "${boardName}"`,
      button: {
        title: 'Eliminar',
        onClick: async () => {
          try {
            await api.delete(`/boards/${boardId}`);
            const updated = boards.filter(b => b.id !== boardId);
            setBoards(updated);
            setSelectedBoard(updated.length > 0 ? updated[0] : null);
            sileo.success({ title: 'Tablero eliminado' });
          } catch {
            sileo.error({ title: 'Error', description: 'No se pudo eliminar el tablero' });
          }
        },
      },
    });
  };

  // ─── Funciones de tareas ─────────────────────────────────────

  // Crea una nueva tarea en la columna indicada
  const createTask = async (columnId: number, title: string) => {
    try {
      const res = await api.post('/tasks', { title, columnId });
      if (!selectedBoard) return;
      const updatedBoard = {
        ...selectedBoard,
        columns: selectedBoard.columns.map(col =>
          col.id === columnId ? { ...col, tasks: [...col.tasks, res.data] } : col
        )
      };
      setSelectedBoard(updatedBoard);
      setBoards(boards.map(b => b.id === updatedBoard.id ? updatedBoard : b));
      sileo.success({ title: 'Tarea creada' });
    } catch {
      sileo.error({ title: 'Error', description: 'No se pudo crear la tarea' });
    }
  };

  // Muestra confirmación antes de eliminar una tarea
  const deleteTask = async (taskId: number, columnId: number, taskTitle: string) => {
    sileo.action({
      title: '¿Eliminar tarea?',
      description: `"${taskTitle}" será eliminada permanentemente`,
      button: {
        title: 'Eliminar',
        onClick: async () => {
          try {
            await api.delete(`/tasks/${taskId}`);
            if (!selectedBoard) return;
            const updatedBoard = {
              ...selectedBoard,
              columns: selectedBoard.columns.map(col =>
                col.id === columnId
                  ? { ...col, tasks: col.tasks.filter(t => t.id !== taskId) }
                  : col
              )
            };
            setSelectedBoard(updatedBoard);
            setBoards(boards.map(b => b.id === updatedBoard.id ? updatedBoard : b));
            sileo.success({ title: 'Tarea eliminada' });
          } catch {
            sileo.error({ title: 'Error', description: 'No se pudo eliminar la tarea' });
          }
        },
      },
    });
  };

  // Actualiza el título de una tarea existente
  const updateTask = async (taskId: number, columnId: number, newTitle: string) => {
    try {
      await api.put(`/tasks/${taskId}`, { title: newTitle });
      if (!selectedBoard) return;
      const updatedBoard = {
        ...selectedBoard,
        columns: selectedBoard.columns.map(col =>
          col.id === columnId
            ? { ...col, tasks: col.tasks.map(t => t.id === taskId ? { ...t, title: newTitle } : t) }
            : col
        )
      };
      setSelectedBoard(updatedBoard);
      setBoards(boards.map(b => b.id === updatedBoard.id ? updatedBoard : b));
      sileo.success({ title: 'Tarea actualizada' });
    } catch {
      sileo.error({ title: 'Error', description: 'No se pudo actualizar la tarea' });
    }
  };

  // Alterna el estado completado de una tarea (tachar / destachar)
const toggleTask = async (taskId: number, columnId: number, _completed: boolean) => {    try {
      const res = await api.patch(`/tasks/${taskId}/complete`);
      if (!selectedBoard) return;
      const updatedBoard = {
        ...selectedBoard,
        columns: selectedBoard.columns.map(col =>
          col.id === columnId
            ? { ...col, tasks: col.tasks.map(t => t.id === taskId ? { ...t, completed: res.data.completed } : t) }
            : col
        )
      };
      setSelectedBoard(updatedBoard);
      setBoards(boards.map(b => b.id === updatedBoard.id ? updatedBoard : b));
    } catch {
      sileo.error({ title: 'Error', description: 'No se pudo actualizar la tarea' });
    }
  };

  // ─── Pantalla de carga ────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 dark:text-gray-400 text-sm">Cargando tus tableros...</p>
        </div>
      </div>
    );
  }

  // ─── Render principal ─────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white">

      {/* Barra de navegación superior */}
      <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4 flex items-center justify-between shadow-sm">
        {/* Logo y nombre de la app */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <LayoutDashboard size={16} className="text-white" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">drift</h1>
        </div>

        {/* Controles del usuario: avatar, toggle de tema y cerrar sesión */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center">
              <span className="text-indigo-600 dark:text-indigo-300 font-semibold text-sm">
                {user?.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-900 dark:text-white">{user?.name}</span>
              <span className="text-xs text-gray-400">{user?.email}</span>
            </div>
          </div>

          {/* Botón toggle claro/oscuro */}
          <button
            onClick={toggleTheme}
            className="flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            title={isDark ? 'Modo claro' : 'Modo oscuro'}
          >
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          {/* Botón de cierre de sesión con confirmación */}
          <button
            onClick={() => {
              sileo.action({
                title: '¿Cerrar sesión?',
                description: 'Se cerrará tu sesión actual',
                fill: '#5c54c5',
                button: { title: 'Salir', onClick: logout },
              });
            }}
            className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-red-500 border border-gray-200 dark:border-gray-700 hover:border-red-200 px-3 py-1.5 rounded-lg transition"
          >
            <LogOut size={14} />
            Cerrar sesión
          </button>
        </div>
      </nav>

      <div className="flex h-[calc(100vh-65px)]">

        {/* Sidebar: lista de tableros y formulario para crear uno nuevo */}
        <aside className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 p-4 flex flex-col gap-4 shadow-sm">
          <div>
            <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-3">Mis tableros</p>
            <div className="space-y-1">
              <AnimatePresence>
                {boards.map(board => (
                  <BoardItem
                    key={board.id}
                    board={board}
                    isSelected={selectedBoard?.id === board.id}
                    onDelete={deleteBoard}
                    onUpdate={updateBoard}
                    onClick={() => setSelectedBoard(board)}
                  />
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* Formulario para crear un nuevo tablero */}
          <div className="mt-auto border-t border-gray-200 dark:border-gray-700 pt-4">
            <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">Nuevo tablero</p>
            <input
              type="text"
              value={newBoardName}
              onChange={(e) => setNewBoardName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && createBoard()}
              placeholder="Nombre del tablero..."
              className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition shadow-sm"
            />
            <button
              onClick={createBoard}
              className="w-full mt-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold py-2 rounded-lg transition shadow-md"
            >
              + Crear tablero
            </button>
          </div>
        </aside>

        {/* Área principal del tablero Kanban */}
        <main className="flex-1 p-6 overflow-x-auto bg-gray-50 dark:bg-gray-950">
          {!selectedBoard ? (
            // Estado vacío cuando no hay tablero seleccionado
            <div className="flex flex-col items-center justify-center h-full gap-3">
              <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center">
                <span className="text-3xl">📋</span>
              </div>
              <p className="text-gray-500 dark:text-gray-400 font-medium">Crea un tablero para empezar</p>
              <p className="text-gray-400 dark:text-gray-500 text-sm">Usa el panel izquierdo para crear tu primer tablero</p>
            </div>
          ) : (
            <div>
              {/* Título del tablero activo y contador de tareas */}
              <div className="flex items-center gap-3 mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedBoard.name}</h2>
                <span className="text-sm text-gray-400 bg-gray-100 dark:bg-gray-800 dark:text-gray-400 px-2 py-0.5 rounded-full">
                  {selectedBoard.columns.reduce((acc, col) => acc + col.tasks.length, 0)} tareas
                </span>
              </div>

              {/* Columnas del tablero */}
              <div className="flex gap-4 items-start">
                {selectedBoard.columns.map(column => (
                  <KanbanColumn
                    key={column.id}
                    column={column}
                    onCreateTask={createTask}
                    onDeleteTask={deleteTask}
                    onUpdateTask={updateTask}
                    onToggleTask={toggleTask}
                  />
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

// ─── Colores de las columnas según su nombre ──────────────────
const columnColors: Record<string, string> = {
  'Por hacer':   'bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400 font-semibold',
  'En progreso': 'bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400 font-semibold',
  'Hecho':       'bg-green-200 text-green-800 dark:bg-green-500/20 dark:text-green-300 font-semibold',
};

// ─── Componente: Columna del tablero Kanban ───────────────────

function KanbanColumn({
  column,
  onCreateTask,
  onDeleteTask,
  onUpdateTask,
  onToggleTask,
}: {
  column: Column;
  onCreateTask: (columnId: number, title: string) => void;
  onDeleteTask: (taskId: number, columnId: number, taskTitle: string) => void;
  onUpdateTask: (taskId: number, columnId: number, newTitle: string) => void;
  onToggleTask: (taskId: number, columnId: number, completed: boolean) => void;
}) {
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [adding, setAdding] = useState(false);
  const colorClass = columnColors[column.name] || 'bg-indigo-100 text-indigo-600';

  const handleAdd = () => {
    if (!newTaskTitle.trim()) return;
    onCreateTask(column.id, newTaskTitle);
    setNewTaskTitle('');
    setAdding(false);
  };

  return (
    <div className="w-72 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex-shrink-0">
      {/* Encabezado de la columna con nombre y contador */}
      <div className="p-4 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm text-gray-700 dark:text-gray-200">{column.name}</h3>
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${colorClass}`}>
            {column.tasks.length}
          </span>
        </div>
      </div>

      {/* Lista de tareas con animación de entrada y salida */}
      <div className="p-3 space-y-2 min-h-[100px]">
        <AnimatePresence>
          {column.tasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              columnId={column.id}
              onDelete={onDeleteTask}
              onUpdate={onUpdateTask}
              onToggle={onToggleTask}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Formulario para agregar una nueva tarea */}
      <div className="p-3 border-t border-gray-100 dark:border-gray-700">
        {adding ? (
          <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
            <input
              type="text"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              placeholder="Título de la tarea..."
              className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-700 dark:text-white placeholder-gray-400 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition"
              autoFocus
            />
            <div className="flex gap-2">
              <button onClick={handleAdd} className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white text-sm py-1.5 rounded-lg transition">
                Agregar
              </button>
              <button onClick={() => { setAdding(false); setNewTaskTitle(''); }} className="flex-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 text-sm py-1.5 rounded-lg transition">
                Cancelar
              </button>
            </div>
          </motion.div>
        ) : (
          <button
            onClick={() => setAdding(true)}
            className="w-full text-gray-600 dark:text-gray-400 font-medium hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 text-sm py-2 rounded-lg transition flex items-center justify-center gap-1 border border-dashed border-gray-300 dark:border-gray-600 hover:border-indigo-300"
          >
            <Plus size={14} /> Agregar tarea
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Componente: Tarjeta de tarea individual ──────────────────

function TaskCard({
  task,
  columnId,
  onDelete,
  onUpdate,
  onToggle,
}: {
  task: Task;
  columnId: number;
  onDelete: (taskId: number, columnId: number, taskTitle: string) => void;
  onUpdate: (taskId: number, columnId: number, newTitle: string) => void;
  onToggle: (taskId: number, columnId: number, completed: boolean) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);

  const handleSave = () => {
    if (editTitle.trim() && editTitle !== task.title) {
      onUpdate(task.id, columnId, editTitle);
    }
    setEditing(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.15 }}
      className="bg-gray-50 dark:bg-gray-800 hover:bg-white dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-500 hover:shadow-md shadow-sm rounded-lg p-3 group transition-all duration-200"
    >
      {editing ? (
        // Modo edición: input con botones de guardar y cancelar
        <div className="space-y-2">
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') setEditing(false); }}
            className="w-full bg-white dark:bg-gray-700 border border-indigo-300 rounded px-2 py-1 text-sm text-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-100"
            autoFocus
          />
          <div className="flex gap-1">
            <button onClick={handleSave} className="flex-1 bg-indigo-600 text-white text-xs py-1 rounded transition hover:bg-indigo-500">
              Guardar
            </button>
            <button onClick={() => setEditing(false)} className="flex-1 bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-200 text-xs py-1 rounded transition hover:bg-gray-300">
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        // Modo visualización: título con tachado si está completada
        <div className="flex items-start justify-between gap-2">
          <p
            className={`text-sm font-medium cursor-pointer flex-1 transition-all ${
              task.completed
                ? 'line-through text-red-400 dark:text-red-400'  // Tachado en rojo si completada
                : 'text-gray-900 dark:text-white'
            }`}
            onClick={() => onToggle(task.id, columnId, task.completed)}   // Un clic tacha/destacha
            onDoubleClick={() => setEditing(true)}                         // Doble clic abre editor
          >
            {task.title}
          </p>

          {/* Botones de editar y eliminar, visibles al hacer hover */}
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
            <button onClick={() => setEditing(true)} className="text-gray-400 hover:text-indigo-500 p-1 rounded transition" title="Editar">
              <Pencil size={14} />
            </button>
            <button onClick={() => onDelete(task.id, columnId, task.title)} className="text-gray-400 hover:text-red-500 p-1 rounded transition" title="Eliminar">
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Fecha de creación de la tarea */}
      <div className="mt-2">
        <span className="text-xs text-gray-400 dark:text-gray-500">
          {new Date(Date.now()).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })}
        </span>
      </div>
    </motion.div>
  );
}

// ─── Componente: Item de tablero en el sidebar ────────────────

function BoardItem({
  board,
  isSelected,
  onDelete,
  onUpdate,
  onClick,
}: {
  board: Board;
  isSelected: boolean;
  onDelete: (boardId: number, boardName: string) => void;
  onUpdate: (boardId: number, newName: string) => void;
  onClick: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(board.name);

  const handleSave = () => {
    if (editName.trim() && editName !== board.name) {
      onUpdate(board.id, editName);
    }
    setEditing(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -10 }}
      className={`group flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition ${
        isSelected
          ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-700'
          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
      }`}
      onClick={onClick}
    >
      {editing ? (
        // Modo edición del nombre del tablero
        <div className="flex items-center gap-1 flex-1" onClick={(e) => e.stopPropagation()}>
          <input
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') setEditing(false); }}
            className="flex-1 bg-white dark:bg-gray-700 border border-indigo-300 rounded px-2 py-0.5 text-sm text-gray-900 dark:text-white focus:outline-none"
            autoFocus
          />
          <button onClick={handleSave} className="text-indigo-500 hover:text-indigo-700 p-0.5">
            <Check size={14} />
          </button>
        </div>
      ) : (
        // Modo visualización con botones de editar y eliminar al hover
        <>
          <span className="text-sm font-medium truncate">{board.name}</span>
          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition">
            <button
              onClick={(e) => { e.stopPropagation(); setEditing(true); }}
              className="text-gray-400 hover:text-indigo-500 p-1 rounded-md transition"
              title="Editar nombre"
            >
              <Pencil size={12} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(board.id, board.name); }}
              className="text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition p-1 rounded-md"
              title="Eliminar tablero"
            >
              <Trash2 size={12} />
            </button>
          </div>
        </>
      )}
    </motion.div>
  );
}
