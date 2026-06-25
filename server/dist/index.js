"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const board_routes_1 = __importDefault(require("./routes/board.routes"));
const column_routes_1 = __importDefault(require("./routes/column.routes"));
const task_routes_1 = __importDefault(require("./routes/task.routes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use('/api/auth', auth_routes_1.default);
app.use('/api/boards', board_routes_1.default);
app.use('/api/columns', column_routes_1.default);
app.use('/api/tasks', task_routes_1.default);
app.get('/', (req, res) => {
    res.json({ message: 'Drift API running' });
});
console.log('Starting server...');
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
