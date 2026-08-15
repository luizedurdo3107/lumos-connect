const express = require("express");
const prisma = require("../lib/prisma");
const authMiddleware = require("../middlewares/authMiddleware");
const adminMiddleware = require("../middlewares/adminMiddleware");

const router = express.Router();

// ========================================
// FUNÇÕES AUXILIARES
// ========================================

function getId(value) {
    const id = Number(value);

    if (!Number.isInteger(id) || id <= 0) {
        return null;
    }

    return id;
}

function getDate(value) {
    if (!value) {
        return null;
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return null;
    }

    return date;
}

// ========================================
// LISTAR ATIVIDADES
// GET /activities
// ========================================

router.get("/", authMiddleware, async (req, res) => {
    try {
        const userId = Number(req.user.userId);

        if (!Number.isInteger(userId) || userId <= 0) {
            return res.status(401).json({
                message: "Usuário inválido"
            });
        }

        const activities = await prisma.activity.findMany({
            orderBy: {
                dueDate: "asc"
            },

            include: {
                contents: {
                    orderBy: {
                        order: "asc"
                    }
                },

                activityProgresses: {
                    where: {
                        userId
                    },

                    select: {
                        id: true,
                        completed: true,
                        progress: true
                    }
                }
            }
        });

        const formattedActivities = activities.map((activity) => {
            const userProgress = activity.activityProgresses[0] || {
                completed: false,
                progress: 0
            };

            const {
                activityProgresses,
                ...activityData
            } = activity;

            return {
                ...activityData,
                completed: userProgress.completed,
                progress: userProgress.progress
            };
        });

        return res.status(200).json(formattedActivities);

    } catch (error) {
        console.error("Erro ao listar atividades:", error);

        return res.status(500).json({
            message: "Erro ao buscar atividades"
        });
    }
});

// ========================================
// BUSCAR UMA ATIVIDADE
// GET /activities/:id
// ========================================

router.get("/:id", authMiddleware, async (req, res) => {
    try {
        const id = getId(req.params.id);
        const userId = Number(req.user.userId);

        if (!id) {
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
                id
            },

            include: {
                contents: {
                    orderBy: {
                        order: "asc"
                    }
                },

                activityProgresses: {
                    where: {
                        userId
                    },

                    select: {
                        id: true,
                        completed: true,
                        progress: true
                    }
                }
            }
        });

        if (!activity) {
            return res.status(404).json({
                message: "Atividade não encontrada"
            });
        }

        const userProgress = activity.activityProgresses[0] || {
            completed: false,
            progress: 0
        };

        const {
            activityProgresses,
            ...activityData
        } = activity;

        return res.status(200).json({
            ...activityData,
            completed: userProgress.completed,
            progress: userProgress.progress
        });

    } catch (error) {
        console.error("Erro ao buscar atividade:", error);

        return res.status(500).json({
            message: "Erro ao buscar atividade"
        });
    }
});

// ========================================
// CRIAR ATIVIDADE
// POST /activities
// SOMENTE ADMIN
// ========================================

router.post(
    "/",
    authMiddleware,
    adminMiddleware,
    async (req, res) => {
        try {
            const {
                title,
                description,
                subject,
                dueDate
            } = req.body;

            if (
                typeof title !== "string" ||
                !title.trim()
            ) {
                return res.status(400).json({
                    message: "O título da atividade é obrigatório"
                });
            }

            let parsedDate = null;

            if (dueDate) {
                parsedDate = getDate(dueDate);

                if (!parsedDate) {
                    return res.status(400).json({
                        message: "Data de entrega inválida"
                    });
                }
            }

            const activity = await prisma.activity.create({
                data: {
                    title: title.trim(),

                    description:
                        typeof description === "string" &&
                        description.trim()
                            ? description.trim()
                            : null,

                    subject:
                        typeof subject === "string" &&
                        subject.trim()
                            ? subject.trim()
                            : null,

                    dueDate: parsedDate,

                    userId: req.user.userId
                }
            });

            return res.status(201).json(activity);

        } catch (error) {
            console.error("Erro ao criar atividade:", error);

            return res.status(500).json({
                message: "Erro ao criar atividade"
            });
        }
    }
);

// ========================================
// EDITAR ATIVIDADE
// PUT /activities/:id
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
                    message: "ID da atividade inválido"
                });
            }

            const {
                title,
                description,
                subject,
                dueDate
            } = req.body;

            const existingActivity =
                await prisma.activity.findFirst({
                    where: {
                        id,
                        userId: req.user.userId
                    }
                });

            if (!existingActivity) {
                return res.status(404).json({
                    message: "Atividade não encontrada"
                });
            }

            if (
                title !== undefined &&
                (
                    typeof title !== "string" ||
                    !title.trim()
                )
            ) {
                return res.status(400).json({
                    message: "O título da atividade é inválido"
                });
            }

            let parsedDate = existingActivity.dueDate;

            if (dueDate !== undefined) {
                parsedDate = getDate(dueDate);

                if (dueDate && !parsedDate) {
                    return res.status(400).json({
                        message: "Data de entrega inválida"
                    });
                }
            }

            const activity = await prisma.activity.update({
                where: {
                    id
                },

                data: {
                    ...(title !== undefined && {
                        title: title.trim()
                    }),

                    ...(description !== undefined && {
                        description:
                            typeof description === "string" &&
                            description.trim()
                                ? description.trim()
                                : null
                    }),

                    ...(subject !== undefined && {
                        subject:
                            typeof subject === "string" &&
                            subject.trim()
                                ? subject.trim()
                                : null
                    }),

                    ...(dueDate !== undefined && {
                        dueDate: parsedDate
                    })
                }
            });

            return res.status(200).json(activity);

        } catch (error) {
            console.error("Erro ao editar atividade:", error);

            return res.status(500).json({
                message: "Erro ao editar atividade"
            });
        }
    }
);

// ========================================
// EXCLUIR ATIVIDADE
// DELETE /activities/:id
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
                    message: "ID da atividade inválido"
                });
            }

            const existingActivity =
                await prisma.activity.findFirst({
                    where: {
                        id,
                        userId: req.user.userId
                    }
                });

            if (!existingActivity) {
                return res.status(404).json({
                    message: "Atividade não encontrada"
                });
            }

            await prisma.activity.delete({
                where: {
                    id
                }
            });

            return res.status(200).json({
                message: "Atividade excluída com sucesso"
            });

        } catch (error) {
            console.error("Erro ao excluir atividade:", error);

            return res.status(500).json({
                message: "Erro ao excluir atividade"
            });
        }
    }
);

// ========================================
// CONCLUIR / DESMARCAR ATIVIDADE
// PATCH /activities/:id/complete
// PROGRESSO INDIVIDUAL
// ========================================

router.patch(
    "/:id/complete",
    authMiddleware,
    async (req, res) => {
        try {
            const id = getId(req.params.id);
            const userId = Number(req.user.userId);

            if (!id) {
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
                    id
                }
            });

            if (!activity) {
                return res.status(404).json({
                    message: "Atividade não encontrada"
                });
            }

            const currentProgress =
                await prisma.activityProgress.findUnique({
                    where: {
                        activityId_userId: {
                            activityId: id,
                            userId
                        }
                    }
                });

            const newCompleted =
                !(currentProgress?.completed ?? false);

            const updatedProgress =
                await prisma.activityProgress.upsert({
                    where: {
                        activityId_userId: {
                            activityId: id,
                            userId
                        }
                    },

                    update: {
                        completed: newCompleted,

                        progress: newCompleted
                            ? 100
                            : (currentProgress?.progress ?? 0)
                    },

                    create: {
                        activityId: id,
                        userId,
                        completed: true,
                        progress: 100
                    }
                });

            return res.status(200).json({
                ...activity,
                completed: updatedProgress.completed,
                progress: updatedProgress.progress
            });

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

module.exports = router;