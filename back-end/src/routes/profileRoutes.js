const express = require("express");
const bcrypt = require("bcrypt");

const prisma = require("../lib/prisma");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

// ========================================
// BUSCAR PERFIL
// GET /profile
// ========================================

router.get("/", authMiddleware, async (req, res) => {
    try {
        const userId = Number(req.user.userId);

        if (!Number.isInteger(userId) || userId <= 0) {
            return res.status(401).json({
                message: "Usuário não identificado",
            });
        }

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

        if (!user) {
            return res.status(404).json({
                message: "Usuário não encontrado",
            });
        }

        return res.status(200).json(user);

    } catch (error) {
        console.error("Erro ao buscar perfil:", error);

        return res.status(500).json({
            message: "Erro ao buscar perfil",
        });
    }
});

// ========================================
// ATUALIZAR PERFIL
// PUT /profile
// ========================================

router.put("/", authMiddleware, async (req, res) => {
    try {
        const userId = Number(req.user.userId);
        const { name, email } = req.body;

        if (!Number.isInteger(userId) || userId <= 0) {
            return res.status(401).json({
                message: "Usuário não identificado",
            });
        }

        // Pelo menos um campo deve ser informado
        if (name === undefined && email === undefined) {
            return res.status(400).json({
                message: "Informe pelo menos um campo para atualizar",
            });
        }

        // Validar nome
        if (
            name !== undefined &&
            (typeof name !== "string" || !name.trim())
        ) {
            return res.status(400).json({
                message: "Nome inválido",
            });
        }

        // Validar e-mail
        if (
            email !== undefined &&
            (typeof email !== "string" || !email.trim())
        ) {
            return res.status(400).json({
                message: "E-mail inválido",
            });
        }

        const normalizedEmail =
            email !== undefined
                ? email.trim().toLowerCase()
                : undefined;

        // Verificar se o e-mail já pertence a outro usuário
        if (normalizedEmail !== undefined) {
            const existingUser = await prisma.user.findFirst({
                where: {
                    email: normalizedEmail,
                    NOT: {
                        id: userId,
                    },
                },
            });

            if (existingUser) {
                return res.status(409).json({
                    message: "Este e-mail já está cadastrado",
                });
            }
        }

        const user = await prisma.user.update({
            where: {
                id: userId,
            },
            data: {
                ...(name !== undefined && {
                    name: name.trim(),
                }),

                ...(normalizedEmail !== undefined && {
                    email: normalizedEmail,
                }),
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

        return res.status(200).json({
            message: "Perfil atualizado com sucesso",
            user,
        });

    } catch (error) {
        console.error("Erro ao atualizar perfil:", error);

        return res.status(500).json({
            message: "Erro ao atualizar perfil",
        });
    }
});

// ========================================
// ALTERAR SENHA
// PUT /profile/password
// ========================================

router.put("/password", authMiddleware, async (req, res) => {
    try {
        const userId = Number(req.user.userId);

        const {
            currentPassword,
            newPassword,
        } = req.body;

        if (!Number.isInteger(userId) || userId <= 0) {
            return res.status(401).json({
                message: "Usuário não identificado",
            });
        }

        // Validar campos
        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                message: "Senha atual e nova senha são obrigatórias",
            });
        }

        // Validar nova senha
        if (
            typeof newPassword !== "string" ||
            newPassword.length < 6
        ) {
            return res.status(400).json({
                message: "A nova senha deve ter pelo menos 6 caracteres",
            });
        }

        // Buscar senha atual
        const user = await prisma.user.findUnique({
            where: {
                id: userId,
            },
            select: {
                id: true,
                password: true,
            },
        });

        if (!user) {
            return res.status(404).json({
                message: "Usuário não encontrado",
            });
        }

        // Verificar senha atual
        const passwordValid = await bcrypt.compare(
            currentPassword,
            user.password
        );

        if (!passwordValid) {
            return res.status(401).json({
                message: "Senha atual incorreta",
            });
        }

        // Criptografar nova senha
        const hashedPassword = await bcrypt.hash(
            newPassword,
            10
        );

        await prisma.user.update({
            where: {
                id: userId,
            },
            data: {
                password: hashedPassword,
            },
        });

        return res.status(200).json({
            message: "Senha alterada com sucesso",
        });

    } catch (error) {
        console.error("Erro ao alterar senha:", error);

        return res.status(500).json({
            message: "Erro ao alterar senha",
        });
    }
});

module.exports = router;
