const express = require("express");
const prisma = require("../lib/prisma");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

// ========================================
// LISTAR PROGRESSOS
// GET /progress
// ========================================

router.get("/", authMiddleware, async (req, res) => {
    try {
        const progress = await prisma.progress.findMany({
            where: {
                userId: req.user.userId,
            },
            orderBy: {
                subject: "asc",
            },
        });

        res.json(progress);

    } catch (error) {
        console.error("Erro ao buscar progressos:", error);

        res.status(500).json({
            message: "Erro ao buscar progressos",
        });
    }
});

// ========================================
// CRIAR PROGRESSO
// POST /progress
// ========================================

router.post("/", authMiddleware, async (req, res) => {
    try {
        const { subject, percentage } = req.body;

        // Validar matéria
        if (
            !subject ||
            typeof subject !== "string" ||
            !subject.trim()
        ) {
            return res.status(400).json({
                message: "A matéria é obrigatória",
            });
        }

        // Validar porcentagem
        if (
            percentage !== undefined &&
            (!Number.isInteger(percentage) ||
                percentage < 0 ||
                percentage > 100)
        ) {
            return res.status(400).json({
                message: "A porcentagem deve ser um número inteiro entre 0 e 100",
            });
        }

        // Verificar se já existe progresso para essa matéria
        const existingProgress = await prisma.progress.findFirst({
            where: {
                subject: subject.trim(),
                userId: req.user.userId,
            },
        });

        if (existingProgress) {
            return res.status(409).json({
                message: "Já existe um progresso cadastrado para essa matéria",
            });
        }

        const progress = await prisma.progress.create({
            data: {
                subject: subject.trim(),
                percentage: percentage ?? 0,
                userId: req.user.userId,
            },
        });

        res.status(201).json(progress);

    } catch (error) {
        console.error("Erro ao criar progresso:", error);

        res.status(500).json({
            message: "Erro ao criar progresso",
        });
    }
});

// ========================================
// BUSCAR PROGRESSO POR ID
// GET /progress/:id
// ========================================

router.get("/:id", authMiddleware, async (req, res) => {
    try {
        const id = Number(req.params.id);

        // Validar ID
        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                message: "ID inválido",
            });
        }

        const progress = await prisma.progress.findFirst({
            where: {
                id,
                userId: req.user.userId,
            },
        });

        if (!progress) {
            return res.status(404).json({
                message: "Progresso não encontrado",
            });
        }

        res.json(progress);

    } catch (error) {
        console.error("Erro ao buscar progresso:", error);

        res.status(500).json({
            message: "Erro ao buscar progresso",
        });
    }
});

// ========================================
// ATUALIZAR PROGRESSO
// PUT /progress/:id
// ========================================

router.put("/:id", authMiddleware, async (req, res) => {
    try {
        const id = Number(req.params.id);

        const {
            subject,
            percentage,
        } = req.body;

        // Validar ID
        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                message: "ID inválido",
            });
        }

        // Verificar se pertence ao usuário
        const existingProgress = await prisma.progress.findFirst({
            where: {
                id,
                userId: req.user.userId,
            },
        });

        if (!existingProgress) {
            return res.status(404).json({
                message: "Progresso não encontrado",
            });
        }

        // Validar matéria
        if (
            subject !== undefined &&
            (
                typeof subject !== "string" ||
                !subject.trim()
            )
        ) {
            return res.status(400).json({
                message: "A matéria não pode estar vazia",
            });
        }

        // Validar porcentagem
        if (
            percentage !== undefined &&
            (
                !Number.isInteger(percentage) ||
                percentage < 0 ||
                percentage > 100
            )
        ) {
            return res.status(400).json({
                message: "A porcentagem deve ser um número inteiro entre 0 e 100",
            });
        }

        // Verificar se a nova matéria já existe
        if (subject !== undefined) {
            const duplicateProgress = await prisma.progress.findFirst({
                where: {
                    subject: subject.trim(),
                    userId: req.user.userId,
                    NOT: {
                        id,
                    },
                },
            });

            if (duplicateProgress) {
                return res.status(409).json({
                    message: "Já existe um progresso cadastrado para essa matéria",
                });
            }
        }

        const progress = await prisma.progress.update({
            where: {
                id,
            },
            data: {
                ...(subject !== undefined && {
                    subject: subject.trim(),
                }),

                ...(percentage !== undefined && {
                    percentage,
                }),
            },
        });

        res.json(progress);

    } catch (error) {
        console.error("Erro ao atualizar progresso:", error);

        res.status(500).json({
            message: "Erro ao atualizar progresso",
        });
    }
});

// ========================================
// EXCLUIR PROGRESSO
// DELETE /progress/:id
// ========================================

router.delete("/:id", authMiddleware, async (req, res) => {
    try {
        const id = Number(req.params.id);

        // Validar ID
        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                message: "ID inválido",
            });
        }

        // Verificar se pertence ao usuário
        const existingProgress = await prisma.progress.findFirst({
            where: {
                id,
                userId: req.user.userId,
            },
        });

        if (!existingProgress) {
            return res.status(404).json({
                message: "Progresso não encontrado",
            });
        }

        await prisma.progress.delete({
            where: {
                id,
            },
        });

        res.json({
            message: "Progresso excluído com sucesso",
        });

    } catch (error) {
        console.error("Erro ao excluir progresso:", error);

        res.status(500).json({
            message: "Erro ao excluir progresso",
        });
    }
});

// ========================================
// EXPORTAR ROTAS
// ========================================

module.exports = router;