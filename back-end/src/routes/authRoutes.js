
const express = require("express");
const router = express.Router();

const prisma = require("../lib/prisma");
const authService = require("../services/authService");
const authMiddleware = require("../middlewares/authMiddleware");

// ========================================
// CADASTRO
// POST /auth/register
// ========================================

router.post("/register", async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Campos obrigatórios
        if (!name || !email || !password) {
            return res.status(400).json({
                message: "Nome, e-mail e senha são obrigatórios",
            });
        }

        // Validar nome
        if (typeof name !== "string" || !name.trim()) {
            return res.status(400).json({
                message: "Nome inválido",
            });
        }

        // Validar e-mail
        if (typeof email !== "string" || !email.trim()) {
            return res.status(400).json({
                message: "E-mail inválido",
            });
        }

        // Validar senha
        if (typeof password !== "string" || password.length < 6) {
            return res.status(400).json({
                message: "A senha deve ter pelo menos 6 caracteres",
            });
        }

        // Criar usuário
        const user = await authService.register(
            name.trim(),
            email.trim().toLowerCase(),
            password
        );

        return res.status(201).json({
            message: "Usuário cadastrado com sucesso",
            user,
        });

    } catch (error) {
        console.error("Erro no cadastro:", error);

        return res.status(400).json({
            message: error.message || "Erro ao cadastrar usuário",
        });
    }
});

// ========================================
// LOGIN
// POST /auth/login
// ========================================

router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        // Campos obrigatórios
        if (!email || !password) {
            return res.status(400).json({
                message: "E-mail e senha são obrigatórios",
            });
        }

        // Realizar login
        const result = await authService.login(
            email.trim().toLowerCase(),
            password
        );

        return res.status(200).json({
            message: "Login realizado com sucesso",
            ...result,
        });

    } catch (error) {
        console.error("Erro no login:", error);

        return res.status(401).json({
            message: error.message || "E-mail ou senha inválidos",
        });
    }
});

// ========================================
// USUÁRIO LOGADO
// GET /auth/me
// ========================================

router.get("/me", authMiddleware, async (req, res) => {
    try {
        // O authMiddleware coloca o payload do JWT em req.user
        const userId = Number(req.user.userId);

        // Validar ID do usuário
        if (!Number.isInteger(userId) || userId <= 0) {
            return res.status(401).json({
                message: "Usuário não identificado",
            });
        }

        // Buscar usuário
        const user = await prisma.user.findUnique({
            where: {
                id: userId,
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        // Usuário não encontrado
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
        });
    }
});

// ========================================
// EXPORTAR ROTAS
// ========================================

module.exports = router;
