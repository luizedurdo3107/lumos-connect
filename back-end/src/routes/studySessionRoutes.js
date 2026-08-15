const express = require("express");
const prisma = require("../lib/prisma");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

// ========================================
// LISTAR SESSÕES DE ESTUDO
// GET /study-sessions
// ========================================

router.get("/", authMiddleware, async (req, res) => {
    try {
        const sessions = await prisma.studySession.findMany({
            where: {
                userId: req.user.userId,
            },
            orderBy: {
                startedAt: "desc",
            },
        });

        return res.status(200).json(sessions);

    } catch (error) {
        console.error("Erro ao buscar sessões:", error);

        return res.status(500).json({
            message: "Erro ao buscar sessões de estudo",
        });
    }
});


// ========================================
// CRIAR SESSÃO DE ESTUDO
// POST /study-sessions
// ========================================

router.post("/", authMiddleware, async (req, res) => {
    try {
        const {
            subject,
            duration,
            startedAt,
        } = req.body;


        // ========================================
        // VALIDAR MATÉRIA
        // ========================================

        if (
            !subject ||
            typeof subject !== "string" ||
            !subject.trim()
        ) {
            return res.status(400).json({
                message: "A matéria é obrigatória",
            });
        }


        // ========================================
        // VALIDAR DURAÇÃO
        // ========================================

        const parsedDuration = Number(duration);

        if (
            !Number.isInteger(parsedDuration) ||
            parsedDuration <= 0
        ) {
            return res.status(400).json({
                message:
                    "A duração deve ser um número inteiro maior que zero",
            });
        }


        // ========================================
        // VALIDAR DATA
        // ========================================

        let sessionDate = new Date();

        if (startedAt !== undefined) {
            sessionDate = new Date(startedAt);

            if (Number.isNaN(sessionDate.getTime())) {
                return res.status(400).json({
                    message: "A data de início é inválida",
                });
            }
        }


        // ========================================
        // CRIAR SESSÃO
        // ========================================

        const session = await prisma.studySession.create({
            data: {
                subject: subject.trim(),
                duration: parsedDuration,
                startedAt: sessionDate,
                userId: req.user.userId,
            },
        });


        return res.status(201).json(session);

    } catch (error) {
        console.error("Erro ao criar sessão:", error);

        return res.status(500).json({
            message: "Erro ao criar sessão de estudo",
        });
    }
});


// ========================================
// BUSCAR SESSÃO POR ID
// GET /study-sessions/:id
// ========================================

router.get("/:id", authMiddleware, async (req, res) => {
    try {
        const id = Number(req.params.id);


        // ========================================
        // VALIDAR ID
        // ========================================

        if (
            !Number.isInteger(id) ||
            id <= 0
        ) {
            return res.status(400).json({
                message: "ID inválido",
            });
        }


        // ========================================
        // BUSCAR SESSÃO
        // SOMENTE DO USUÁRIO AUTENTICADO
        // ========================================

        const session = await prisma.studySession.findFirst({
            where: {
                id,
                userId: req.user.userId,
            },
        });


        if (!session) {
            return res.status(404).json({
                message: "Sessão de estudo não encontrada",
            });
        }


        return res.status(200).json(session);

    } catch (error) {
        console.error("Erro ao buscar sessão:", error);

        return res.status(500).json({
            message: "Erro ao buscar sessão de estudo",
        });
    }
});


// ========================================
// ATUALIZAR SESSÃO
// PUT /study-sessions/:id
// ========================================

router.put("/:id", authMiddleware, async (req, res) => {
    try {
        const id = Number(req.params.id);

        const {
            subject,
            duration,
            startedAt,
        } = req.body;


        // ========================================
        // VALIDAR ID
        // ========================================

        if (
            !Number.isInteger(id) ||
            id <= 0
        ) {
            return res.status(400).json({
                message: "ID inválido",
            });
        }


        // ========================================
        // VERIFICAR SE A SESSÃO PERTENCE AO USUÁRIO
        // ========================================

        const existingSession =
            await prisma.studySession.findFirst({
                where: {
                    id,
                    userId: req.user.userId,
                },
            });


        if (!existingSession) {
            return res.status(404).json({
                message: "Sessão de estudo não encontrada",
            });
        }


        // ========================================
        // OBJETO DE ATUALIZAÇÃO
        // ========================================

        const data = {};


        // ========================================
        // VALIDAR MATÉRIA
        // ========================================

        if (subject !== undefined) {
            if (
                typeof subject !== "string" ||
                !subject.trim()
            ) {
                return res.status(400).json({
                    message: "A matéria não pode estar vazia",
                });
            }

            data.subject = subject.trim();
        }


        // ========================================
        // VALIDAR DURAÇÃO
        // ========================================

        if (duration !== undefined) {
            const parsedDuration = Number(duration);

            if (
                !Number.isInteger(parsedDuration) ||
                parsedDuration <= 0
            ) {
                return res.status(400).json({
                    message:
                        "A duração deve ser um número inteiro maior que zero",
                });
            }

            data.duration = parsedDuration;
        }


        // ========================================
        // VALIDAR DATA
        // ========================================

        if (startedAt !== undefined) {
            const parsedDate = new Date(startedAt);

            if (Number.isNaN(parsedDate.getTime())) {
                return res.status(400).json({
                    message: "A data de início é inválida",
                });
            }

            data.startedAt = parsedDate;
        }


        // ========================================
        // ATUALIZAR SESSÃO
        // ========================================

        const session =
            await prisma.studySession.update({
                where: {
                    id,
                },

                data,
            });


        return res.status(200).json(session);

    } catch (error) {
        console.error("Erro ao atualizar sessão:", error);

        return res.status(500).json({
            message: "Erro ao atualizar sessão de estudo",
        });
    }
});


// ========================================
// EXCLUIR SESSÃO
// DELETE /study-sessions/:id
// ========================================

router.delete("/:id", authMiddleware, async (req, res) => {
    try {
        const id = Number(req.params.id);


        // ========================================
        // VALIDAR ID
        // ========================================

        if (
            !Number.isInteger(id) ||
            id <= 0
        ) {
            return res.status(400).json({
                message: "ID inválido",
            });
        }


        // ========================================
        // VERIFICAR SE A SESSÃO PERTENCE AO USUÁRIO
        // ========================================

        const existingSession =
            await prisma.studySession.findFirst({
                where: {
                    id,
                    userId: req.user.userId,
                },
            });


        if (!existingSession) {
            return res.status(404).json({
                message: "Sessão de estudo não encontrada",
            });
        }


        // ========================================
        // EXCLUIR
        // ========================================

        await prisma.studySession.delete({
            where: {
                id,
            },
        });


        return res.status(200).json({
            message: "Sessão de estudo excluída com sucesso",
        });

    } catch (error) {
        console.error("Erro ao excluir sessão:", error);

        return res.status(500).json({
            message: "Erro ao excluir sessão de estudo",
        });
    }
});


// ========================================
// EXPORTAR ROTAS
// ========================================

module.exports = router;