const express = require("express");
const prisma = require("../lib/prisma");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

// ========================================
// DASHBOARD
// GET /dashboard
// ========================================

router.get("/", authMiddleware, async (req, res) => {
    try {
        const userId = Number(req.user.userId);

        // ========================================
        // VALIDAR USUÁRIO
        // ========================================

        if (!Number.isInteger(userId) || userId <= 0) {
            return res.status(401).json({
                message: "Usuário inválido",
            });
        }

        // ========================================
        // BUSCAR ATIVIDADES
        // ========================================

       const activities = await prisma.activity.findMany({
    orderBy: {
        dueDate: "asc",
    },

    include: {
        contents: {
            orderBy: {
                order: "asc",
            },
        },

        activityProgresses: {
            where: {
                userId,
            },

            select: {
                id: true,
                completed: true,
                progress: true,
            },
        },
    },
});
        // ========================================
        // FORMATAR ATIVIDADES
        // ========================================

        const formattedActivities = activities.map((activity) => {
            const userProgress =
                activity.activityProgresses[0];

            return {
                ...activity,

                completed:
                    userProgress?.completed ?? false,

                progress:
                    userProgress?.progress ?? 0,

                activityProgresses: undefined,
            };
        });

        // ========================================
        // BUSCAR PROGRESSOS POR MATÉRIA
        // ========================================

        const progress = await prisma.progress.findMany({
            where: {
                userId,
            },

            orderBy: {
                subject: "asc",
            },
        });

        // ========================================
        // BUSCAR SESSÕES DE ESTUDO
        // ========================================

        const studySessions =
            await prisma.studySession.findMany({
                where: {
                    userId,
                },

                orderBy: {
                    startedAt: "desc",
                },
            });

        // ========================================
        // BUSCAR AGENDA
        // ========================================

        const agenda =
            await prisma.agenda.findMany({
                where: {
                    userId,
                },

                orderBy: {
                    date: "asc",
                },
            });

        // ========================================
        // RESUMO DAS ATIVIDADES
        // ========================================

        const totalActivities =
            formattedActivities.length;

        const completedActivities =
            formattedActivities.filter(
                (activity) =>
                    activity.completed === true
            ).length;

        const pendingActivities =
            totalActivities - completedActivities;

        // ========================================
        // TEMPO TOTAL DE ESTUDO
        // ========================================

        const totalStudyTime =
            studySessions.reduce(
                (total, session) => {
                    return total + session.duration;
                },
                0
            );

        // ========================================
        // MÉDIA DE PROGRESSO
        // ========================================

        const averageProgress =
            formattedActivities.length > 0
                ? Math.round(
                    formattedActivities.reduce(
                        (total, activity) =>
                            total + activity.progress,
                        0
                    ) / formattedActivities.length
                )
                : 0;

        // ========================================
        // RESPOSTA
        // ========================================

        return res.status(200).json({
            summary: {
                totalActivities,
                completedActivities,
                pendingActivities,
                totalStudyTime,
                averageProgress,
            },

            activities: formattedActivities,

            progress,

            studySessions,

            agenda,
        });

    } catch (error) {
        console.error(
            "Erro ao buscar dashboard:",
            error
        );

        return res.status(500).json({
            message:
                "Erro ao buscar dados do dashboard",
        });
    }
});

module.exports = router;