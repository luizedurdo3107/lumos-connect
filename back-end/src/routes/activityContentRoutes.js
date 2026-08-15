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

const allowedTypes = [
    "TEXT",
    "VIDEO",
    "AUDIO",
    "EXERCISE",
    "FLASHCARD"
];

function validateType(type) {
    return allowedTypes.includes(type);
}

function parseOptionalInteger(value, fieldName, min = 0) {
    if (value === undefined || value === null || value === "") {
        return {
            valid: true,
            value: null
        };
    }

    const number = Number(value);

    if (!Number.isInteger(number) || number < min) {
        return {
            valid: false,
            message: `${fieldName} deve ser um número inteiro maior ou igual a ${min}`
        };
    }

    return {
        valid: true,
        value: number
    };
}

// ========================================
// LISTAR CONTEÚDOS DE UMA ATIVIDADE
// GET /activities/:activityId/content
// ========================================

router.get(
    "/:activityId/content",
    authMiddleware,
    async (req, res) => {
        try {
            const activityId = getId(req.params.activityId);

            if (!activityId) {
                return res.status(400).json({
                    message: "ID da atividade inválido"
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

            const contents = await prisma.activityContent.findMany({
                where: {
                    activityId
                },
                orderBy: {
                    order: "asc"
                }
            });

            return res.status(200).json(contents);

        } catch (error) {
            console.error(
                "Erro ao buscar conteúdos:",
                error
            );

            return res.status(500).json({
                message: "Erro ao buscar conteúdos da atividade"
            });
        }
    }
);

// ========================================
// CRIAR CONTEÚDO
// POST /activities/:activityId/content
// SOMENTE ADMIN
// ========================================

router.post(
    "/:activityId/content",
    authMiddleware,
    adminMiddleware,
    async (req, res) => {
        try {
            const activityId = getId(req.params.activityId);

            const {
                type,
                title,
                content,
                url,
                duration,
                order
            } = req.body;

            // ------------------------------------
            // VALIDAR ID
            // ------------------------------------

            if (!activityId) {
                return res.status(400).json({
                    message: "ID da atividade inválido"
                });
            }

            // ------------------------------------
            // VERIFICAR ATIVIDADE
            // ------------------------------------

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

            // ------------------------------------
            // VALIDAR TIPO
            // ------------------------------------

            if (
                typeof type !== "string" ||
                !validateType(type)
            ) {
                return res.status(400).json({
                    message: "Tipo de conteúdo inválido"
                });
            }

            // ------------------------------------
            // VALIDAR TÍTULO
            // ------------------------------------

            if (
                title !== undefined &&
                title !== null &&
                typeof title !== "string"
            ) {
                return res.status(400).json({
                    message: "O título deve ser um texto"
                });
            }

            // ------------------------------------
            // VALIDAR CONTEÚDO
            // ------------------------------------

            if (
                content !== undefined &&
                content !== null &&
                typeof content !== "string"
            ) {
                return res.status(400).json({
                    message: "O conteúdo deve ser um texto"
                });
            }

            // ------------------------------------
            // VALIDAR URL
            // ------------------------------------

            if (
                url !== undefined &&
                url !== null &&
                typeof url !== "string"
            ) {
                return res.status(400).json({
                    message: "A URL deve ser um texto"
                });
            }

            // ------------------------------------
            // VALIDAR DURAÇÃO
            // ------------------------------------

            const durationResult =
                parseOptionalInteger(
                    duration,
                    "A duração",
                    0
                );

            if (!durationResult.valid) {
                return res.status(400).json({
                    message: durationResult.message
                });
            }

            // ------------------------------------
            // VALIDAR ORDEM
            // ------------------------------------

            const orderResult =
                parseOptionalInteger(
                    order,
                    "A ordem",
                    0
                );

            if (!orderResult.valid) {
                return res.status(400).json({
                    message: orderResult.message
                });
            }

            // ------------------------------------
            // CRIAR CONTEÚDO
            // ------------------------------------

            const newContent =
                await prisma.activityContent.create({
                    data: {
                        type,

                        title:
                            title !== undefined &&
                            title !== null &&
                            title.trim()
                                ? title.trim()
                                : null,

                        content:
                            content !== undefined &&
                            content !== null &&
                            content.trim()
                                ? content.trim()
                                : null,

                        url:
                            url !== undefined &&
                            url !== null &&
                            url.trim()
                                ? url.trim()
                                : null,

                        duration:
                            durationResult.value,

                        order:
                            orderResult.value ?? 0,

                        activityId
                    }
                });

            return res.status(201).json(newContent);

        } catch (error) {
            console.error(
                "Erro ao criar conteúdo:",
                error
            );

            return res.status(500).json({
                message: "Erro ao criar conteúdo"
            });
        }
    }
);

// ========================================
// EDITAR CONTEÚDO
// PUT /activities/content/:id
// SOMENTE ADMIN
// ========================================

router.put(
    "/content/:id",
    authMiddleware,
    adminMiddleware,
    async (req, res) => {
        try {
            const id = getId(req.params.id);

            const {
                type,
                title,
                content,
                url,
                duration,
                order
            } = req.body;

            // ------------------------------------
            // VALIDAR ID
            // ------------------------------------

            if (!id) {
                return res.status(400).json({
                    message: "ID do conteúdo inválido"
                });
            }

            // ------------------------------------
            // BUSCAR CONTEÚDO
            // ------------------------------------

            const existingContent =
                await prisma.activityContent.findUnique({
                    where: {
                        id
                    }
                });

            if (!existingContent) {
                return res.status(404).json({
                    message: "Conteúdo não encontrado"
                });
            }

            // ------------------------------------
            // VALIDAR TIPO
            // ------------------------------------

            if (
                type !== undefined &&
                (
                    typeof type !== "string" ||
                    !validateType(type)
                )
            ) {
                return res.status(400).json({
                    message: "Tipo de conteúdo inválido"
                });
            }

            // ------------------------------------
            // VALIDAR TÍTULO
            // ------------------------------------

            if (
                title !== undefined &&
                title !== null &&
                typeof title !== "string"
            ) {
                return res.status(400).json({
                    message: "O título deve ser um texto"
                });
            }

            // ------------------------------------
            // VALIDAR CONTEÚDO
            // ------------------------------------

            if (
                content !== undefined &&
                content !== null &&
                typeof content !== "string"
            ) {
                return res.status(400).json({
                    message: "O conteúdo deve ser um texto"
                });
            }

            // ------------------------------------
            // VALIDAR URL
            // ------------------------------------

            if (
                url !== undefined &&
                url !== null &&
                typeof url !== "string"
            ) {
                return res.status(400).json({
                    message: "A URL deve ser um texto"
                });
            }

            // ------------------------------------
            // VALIDAR DURAÇÃO
            // ------------------------------------

            const durationResult =
                parseOptionalInteger(
                    duration,
                    "A duração",
                    0
                );

            if (!durationResult.valid) {
                return res.status(400).json({
                    message: durationResult.message
                });
            }

            // ------------------------------------
            // VALIDAR ORDEM
            // ------------------------------------

            const orderResult =
                parseOptionalInteger(
                    order,
                    "A ordem",
                    0
                );

            if (!orderResult.valid) {
                return res.status(400).json({
                    message: orderResult.message
                });
            }

            // ------------------------------------
            // ATUALIZAR
            // ------------------------------------

            const updatedContent =
                await prisma.activityContent.update({
                    where: {
                        id
                    },

                    data: {
                        ...(type !== undefined && {
                            type
                        }),

                        ...(title !== undefined && {
                            title:
                                title === null
                                    ? null
                                    : title.trim()
                        }),

                        ...(content !== undefined && {
                            content:
                                content === null
                                    ? null
                                    : content.trim()
                        }),

                        ...(url !== undefined && {
                            url:
                                url === null
                                    ? null
                                    : url.trim()
                        }),

                        ...(duration !== undefined && {
                            duration:
                                durationResult.value
                        }),

                        ...(order !== undefined && {
                            order:
                                orderResult.value
                        })
                    }
                });

            return res.status(200).json(updatedContent);

        } catch (error) {
            console.error(
                "Erro ao editar conteúdo:",
                error
            );

            return res.status(500).json({
                message: "Erro ao editar conteúdo"
            });
        }
    }
);

// ========================================
// EXCLUIR CONTEÚDO
// DELETE /activities/content/:id
// SOMENTE ADMIN
// ========================================

router.delete(
    "/content/:id",
    authMiddleware,
    adminMiddleware,
    async (req, res) => {
        try {
            const id = getId(req.params.id);

            // ------------------------------------
            // VALIDAR ID
            // ------------------------------------

            if (!id) {
                return res.status(400).json({
                    message: "ID do conteúdo inválido"
                });
            }

            // ------------------------------------
            // VERIFICAR CONTEÚDO
            // ------------------------------------

            const existingContent =
                await prisma.activityContent.findUnique({
                    where: {
                        id
                    }
                });

            if (!existingContent) {
                return res.status(404).json({
                    message: "Conteúdo não encontrado"
                });
            }

            // ------------------------------------
            // EXCLUIR
            // ------------------------------------

            await prisma.activityContent.delete({
                where: {
                    id
                }
            });

            return res.status(200).json({
                message: "Conteúdo excluído com sucesso"
            });

        } catch (error) {
            console.error(
                "Erro ao excluir conteúdo:",
                error
            );

            return res.status(500).json({
                message: "Erro ao excluir conteúdo"
            });
        }
    }
);

module.exports = router;