const express = require("express");
const cors = require("cors");
require("dotenv").config();

// ========================================
// ROTAS
// ========================================

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");

const activityRoutes = require("./routes/activityRoutes");
const activityContentRoutes = require("./routes/activityContentRoutes");
const activityProgressRoutes = require("./routes/activityProgressRoutes");

const agendaRoutes = require("./routes/agendaRoutes");
const studySessionRoutes = require("./routes/studySessionRoutes");
const progressRoutes = require("./routes/progressRoutes");
const profileRoutes = require("./routes/profileRoutes");

const dashboardRoutes = require("./routes/dashboardRoutes");

// ========================================
// APP
// ========================================

const app = express();

// ========================================
// MIDDLEWARES
// ========================================

app.use(cors());
app.use(express.json());

// ========================================
// ROTA PRINCIPAL
// ========================================

app.get("/", (req, res) => {
    res.json({
        message: "Lumos Connect API funcionando!"
    });
});

// ========================================
// ROTAS DA API
// ========================================

// Autenticação
app.use("/auth", authRoutes);

// Usuários
app.use("/users", userRoutes);

// Perfil
app.use("/profile", profileRoutes);

// Conteúdos das atividades
// Deve vir ANTES de activityRoutes
// para evitar conflito com /activities/:id
app.use("/activities", activityContentRoutes);

// Progresso das atividades
app.use("/activities", activityProgressRoutes);

// Atividades
app.use("/activities", activityRoutes);

// Agenda
app.use("/agenda", agendaRoutes);

// Sessões de estudo
app.use("/study-sessions", studySessionRoutes);

// Progresso por matéria
app.use("/progress", progressRoutes);

// Dashboard
app.use("/dashboard", dashboardRoutes);

// ========================================
// ROTA NÃO ENCONTRADA
// ========================================

app.use((req, res) => {
    res.status(404).json({
        message: "Rota não encontrada"
    });
});

// ========================================
// SERVIDOR
// ========================================

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Lumos Connect API rodando na porta ${PORT}`);
});