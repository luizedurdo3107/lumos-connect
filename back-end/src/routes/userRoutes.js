const express = require("express");
const prisma = require("../lib/prisma");

const authMiddleware = require("../middlewares/authMiddleware");
const adminMiddleware = require("../middlewares/adminMiddleware");

const router = express.Router();

// ========================================
// FUNÇÃO AUXILIAR
// ========================================

function getId(value) {
    const id = Number(value);

    if (!Number.isInteger(id) || id <= 0) {
        return null;
    }

    return id;
}

// ========================================
// BUSCAR MEU USUÁRIO
// GET /users/me
// USUÁRIO LOGADO
// ========================================

router.get(
    "/me",
    authMiddleware,
    async (req, res) => {
        try {
            const userId = Number(req.user.userId);

            if (!Number.isInteger(userId) || userId <= 0) {
                return res.status(401).json({
                    message: "Usuário inválido"
                });
            }

            const user = await prisma.user.findUnique({
                where: {
                    id: userId
                },

                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    createdAt: true,
                    updatedAt: true
                }
            });

            if (!user) {
                return res.status(404).json({
                    message: "Usuário não encontrado"
                });
            }

            return res.status(200).json(user);

        } catch (error) {
            console.error(
                "Erro ao buscar usuário:",
                error
            );

            return res.status(500).json({
                message: "Erro ao buscar usuário"
            });
        }
    }
);

// ========================================
// LISTAR USUÁRIOS
// GET /users
// SOMENTE ADMIN
// ========================================

router.get(
    "/",
    authMiddleware,
    adminMiddleware,
    async (req, res) => {
        try {
            const users = await prisma.user.findMany({
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    createdAt: true,
                    updatedAt: true
                },

                orderBy: {
                    id: "asc"
                }
            });

            return res.status(200).json(users);

        } catch (error) {
            console.error(
                "Erro ao listar usuários:",
                error
            );

            return res.status(500).json({
                message: "Erro ao buscar usuários"
            });
        }
    }
);

// ========================================
// BUSCAR USUÁRIO POR ID
// GET /users/:id
// SOMENTE ADMIN
// ========================================

router.get(
    "/:id",
    authMiddleware,
    adminMiddleware,
    async (req, res) => {
        try {
            const id = getId(req.params.id);

            if (!id) {
                return res.status(400).json({
                    message: "ID do usuário inválido"
                });
            }

            const user = await prisma.user.findUnique({
                where: {
                    id
                },

                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    createdAt: true,
                    updatedAt: true
                }
            });

            if (!user) {
                return res.status(404).json({
                    message: "Usuário não encontrado"
                });
            }

            return res.status(200).json(user);

        } catch (error) {
            console.error(
                "Erro ao buscar usuário:",
                error
            );

            return res.status(500).json({
                message: "Erro ao buscar usuário"
            });
        }
    }
);

// ========================================
// EDITAR USUÁRIO
// PUT /users/:id
// SOMENTE ADMIN
// ========================================

router.put(
    "/:id",
    authMiddleware,
    adminMiddleware,
    async (req, res) => {
        try {
            const id = getId(req.params.id);

            if (!id) {
                return res.status(400).json({
                    message: "ID do usuário inválido"
                });
            }

            const {
                name,
                email,
                role
            } = req.body;

            // ------------------------------------
            // VERIFICAR USUÁRIO
            // ------------------------------------

            const existingUser =
                await prisma.user.findUnique({
                    where: {
                        id
                    }
                });

            if (!existingUser) {
                return res.status(404).json({
                    message: "Usuário não encontrado"
                });
            }

            // ------------------------------------
            // VALIDAR NOME
            // ------------------------------------

            if (
                name !== undefined &&
                (
                    typeof name !== "string" ||
                    !name.trim()
                )
            ) {
                return res.status(400).json({
                    message: "O nome é inválido"
                });
            }

            // ------------------------------------
            // VALIDAR EMAIL
            // ------------------------------------

            if (
                email !== undefined &&
                (
                    typeof email !== "string" ||
                    !email.trim() ||
                    !email.includes("@")
                )
            ) {
                return res.status(400).json({
                    message: "O e-mail é inválido"
                });
            }

            // ------------------------------------
            // VALIDAR ROLE
            // ------------------------------------

            if (
                role !== undefined &&
                role !== "ADMIN" &&
                role !== "STUDENT"
            ) {
                return res.status(400).json({
                    message: "Perfil de usuário inválido"
                });
            }

            // ------------------------------------
            // VERIFICAR EMAIL DUPLICADO
            // ------------------------------------

            if (email !== undefined) {
                const emailExists =
                    await prisma.user.findFirst({
                        where: {
                            email: email.trim(),
                            NOT: {
                                id
                            }
                        }
                    });

                if (emailExists) {
                    return res.status(409).json({
                        message: "Este e-mail já está em uso"
                    });
                }
            }

            // ------------------------------------
            // ATUALIZAR
            // ------------------------------------

            const updatedUser =
                await prisma.user.update({
                    where: {
                        id
                    },

                    data: {
                        ...(name !== undefined && {
                            name: name.trim()
                        }),

                        ...(email !== undefined && {
                            email: email.trim()
                        }),

                        ...(role !== undefined && {
                            role
                        })
                    },

                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true,
                        createdAt: true,
                        updatedAt: true
                    }
                });

            return res.status(200).json(updatedUser);

        } catch (error) {
            console.error(
                "Erro ao editar usuário:",
                error
            );

            return res.status(500).json({
                message: "Erro ao editar usuário"
            });
        }
    }
);

// ========================================
// EXCLUIR USUÁRIO
// DELETE /users/:id
// SOMENTE ADMIN
// ========================================

router.delete(
    "/:id",
    authMiddleware,
    adminMiddleware,
    async (req, res) => {
        try {
            const id = getId(req.params.id);

            if (!id) {
                return res.status(400).json({
                    message: "ID do usuário inválido"
                });
            }

            // ------------------------------------
            // IMPEDIR ADMIN DE EXCLUIR A SI MESMO
            // ------------------------------------

            const currentUserId =
                Number(req.user.userId);

            if (id === currentUserId) {
                return res.status(400).json({
                    message:
                        "Você não pode excluir seu próprio usuário"
                });
            }

            // ------------------------------------
            // VERIFICAR USUÁRIO
            // ------------------------------------

            const existingUser =
                await prisma.user.findUnique({
                    where: {
                        id
                    }
                });

            if (!existingUser) {
                return res.status(404).json({
                    message: "Usuário não encontrado"
                });
            }

            // ------------------------------------
            // EXCLUIR
            // ------------------------------------

            await prisma.user.delete({
                where: {
                    id
                }
            });

            return res.status(200).json({
                message: "Usuário excluído com sucesso"
            });

        } catch (error) {
            console.error(
                "Erro ao excluir usuário:",
                error
            );

            return res.status(500).json({
                message: "Erro ao excluir usuário"
            });
        }
    }
);

module.exports = router;