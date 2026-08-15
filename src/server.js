const express = require("express");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const activityRoutes = require("./routes/activityRoutes");
const activityContentRoutes = require("./routes/activityContentRoutes");
const activityProgressRoutes = require("./routes/activityProgressRoutes");
const agendaRoutes = require("./routes/agendaRoutes");

const app = express();

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
// ROTAS
// ========================================

app.use("/auth", authRoutes);

app.use("/users", userRoutes);

app.use("/activities", activityRoutes);

app.use("/activities", activityContentRoutes);

app.use("/activities", activityProgressRoutes);

app.use("/agenda", agendaRoutes);


// ========================================
// SERVIDOR
// ========================================

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Lumos Connect API rodando na porta ${PORT}`);
});