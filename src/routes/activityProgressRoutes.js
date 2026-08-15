const express = require("express");
const prisma = require("../lib/prisma");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

// ========================================
// BUSCAR PROGRESSO DO USUÁRIO
// GET /activities/:activityId/progress
// ========================================

router.get(
    "/:activityId/progress",
    authMiddleware,
    async (req, res) => {
        try {
            const activityId = Number(req.params.activityId);
            const userId = Number(req.user.userId);

            if (!Number.isInteger(activityId) || activityId <= 0) {
                return res.status(400).json({
                    message: "ID da atividade inválido"
                });
            }

            if (!Number.isInteger(userId) || userId <= 0) {
                return res.status(401).json({
                    message: "Usuário inválido"
                });
            }

            const activity = await prisma.activity.findUnique({
                where: {
                    id: activityId
                }
            });

            if (!activity) {
                return res.status(404).json({
                    message: "Atividade não encontrada"
                });
            }

            let activityProgress =
                await prisma.activityProgress.findUnique({
                    where: {
                        activityId_userId: {
                            activityId,
                            userId
                        }
                    }
                });

            if (!activityProgress) {
                activityProgress =
                    await prisma.activityProgress.create({
                        data: {
                            activityId,
                            userId,
                            completed: false,
                            progress: 0
                        }
                    });
            }

            return res.status(200).json(activityProgress);

        } catch (error) {
            console.error(
                "Erro ao buscar progresso da atividade:",
                error
            );

            return res.status(500).json({
                message: "Erro ao buscar progresso da atividade"
            });
        }
    }
);

// ========================================
// ATUALIZAR PROGRESSO
// PUT /activities/:activityId/progress
// ========================================

router.put(
    "/:activityId/progress",
    authMiddleware,
    async (req, res) => {
        try {
            const activityId = Number(req.params.activityId);
            const userId = Number(req.user.userId);

            const {
                progress,
                completed
            } = req.body;

            if (!Number.isInteger(activityId) || activityId <= 0) {
                return res.status(400).json({
                    message: "ID da atividade inválido"
                });
            }

            if (!Number.isInteger(userId) || userId <= 0) {
                return res.status(401).json({
                    message: "Usuário inválido"
                });
            }

            if (
                progress !== undefined &&
                (
                    !Number.isInteger(progress) ||
                    progress < 0 ||
                    progress > 100
                )
            ) {
                return res.status(400).json({
                    message: "O progresso deve ser um número inteiro entre 0 e 100"
                });
            }

            if (
                completed !== undefined &&
                typeof completed !== "boolean"
            ) {
                return res.status(400).json({
                    message: "completed deve ser booleano"
                });
            }

            const activity = await prisma.activity.findUnique({
                where: {
                    id: activityId
                }
            });

            if (!activity) {
                return res.status(404).json({
                    message: "Atividade não encontrada"
                });
            }

            const activityProgress =
                await prisma.activityProgress.upsert({
                    where: {
                        activityId_userId: {
                            activityId,
                            userId
                        }
                    },

                    update: {
                        ...(progress !== undefined && {
                            progress
                        }),

                        ...(completed !== undefined && {
                            completed
                        })
                    },

                    create: {
                        activityId,
                        userId,
                        progress: progress ?? 0,
                        completed: completed ?? false
                    }
                });

            return res.status(200).json(activityProgress);

        } catch (error) {
            console.error(
                "Erro ao atualizar progresso da atividade:",
                error
            );

            return res.status(500).json({
                message: "Erro ao atualizar progresso da atividade"
            });
        }
    }
);

// ========================================
// CONCLUIR / DESMARCAR
// PATCH /activities/:activityId/progress/complete
// ========================================

router.patch(
    "/:activityId/progress/complete",
    authMiddleware,
    async (req, res) => {
        try {
            const activityId = Number(req.params.activityId);
            const userId = Number(req.user.userId);

            if (!Number.isInteger(activityId) || activityId <= 0) {
                return res.status(400).json({
                    message: "ID da atividade inválido"
                });
            }

            if (!Number.isInteger(userId) || userId <= 0) {
                return res.status(401).json({
                    message: "Usuário inválido"
                });
            }

            const activity = await prisma.activity.findUnique({
                where: {
                    id: activityId
                }
            });

            if (!activity) {
                return res.status(404).json({
                    message: "Atividade não encontrada"
                });
            }

            const current =
                await prisma.activityProgress.findUnique({
                    where: {
                        activityId_userId: {
                            activityId,
                            userId
                        }
                    }
                });

            const newCompleted =
                !(current?.completed ?? false);

            const activityProgress =
                await prisma.activityProgress.upsert({
                    where: {
                        activityId_userId: {
                            activityId,
                            userId
                        }
                    },

                    update: {
                        completed: newCompleted,

                        progress: newCompleted
                            ? 100
                            : (current?.progress ?? 0)
                    },

                    create: {
                        activityId,
                        userId,
                        completed: true,
                        progress: 100
                    }
                });

            return res.status(200).json(activityProgress);

        } catch (error) {
            console.error(
                "Erro ao atualizar conclusão:",
                error
            );

            return res.status(500).json({
                message: "Erro ao atualizar conclusão da atividade"
            });
        }
    }
);

module.exports = router;