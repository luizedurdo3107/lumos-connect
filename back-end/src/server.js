const express = require("express");
const cors = require("cors");
require("dotenv").config();

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

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        message: "Lumos Connect API funcionando!"
    });
});

app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/profile", profileRoutes);

app.use("/activities", activityContentRoutes);
app.use("/activities", activityProgressRoutes);
app.use("/activities", activityRoutes);

app.use("/agenda", agendaRoutes);
app.use("/study-sessions", studySessionRoutes);
app.use("/progress", progressRoutes);
app.use("/dashboard", dashboardRoutes);

app.use((req, res) => {
    res.status(404).json({
        message: "Rota não encontrada"
    });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Lumos Connect API rodando na porta ${PORT}`);
});
