const express = require("express");
const router = express.Router();

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const authService = require("../services/authService");
const authMiddleware = require("../middlewares/authMiddleware");

// =========================
// CADASTRO
// =========================
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Nome, e-mail e senha são obrigatórios",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "A senha deve ter pelo menos 6 caracteres",
      });
    }

    const user = await authService.register(
      name,
      email,
      password
    );

    return res.status(201).json({
      message: "Usuário cadastrado com sucesso",
      user,
    });
  } catch (error) {
    console.error("Erro no cadastro:", error);

    return res.status(400).json({
      message: error.message,
    });
  }
});

// =========================
// LOGIN
// =========================
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "E-mail e senha são obrigatórios",
      });
    }

    const result = await authService.login(
      email,
      password
    );

    return res.status(200).json({
      message: "Login realizado com sucesso",
      ...result,
    });
  } catch (error) {
    console.error("Erro no login:", error);

    return res.status(401).json({
      message: error.message,
    });
  }
});

// =========================
// USUÁRIO LOGADO
// =========================
router.get("/me", authMiddleware, async (req, res) => {
  try {
    console.log("req.userId:", req.userId);

    const user = await prisma.user.findUnique({
      where: {
        id: Number(req.userId),
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        message: "Usuário não encontrado",
      });
    }

    return res.status(200).json(user);
  } catch (error) {
    console.error("ERRO NO /auth/me:", error);

    return res.status(500).json({
      message: "Erro ao buscar usuário",
      error: error.message,
    });
  }
});

module.exports = router;