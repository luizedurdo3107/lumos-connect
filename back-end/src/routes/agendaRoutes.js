const express = require("express");
const prisma = require("../lib/prisma");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

// ========================================
// LISTAR EVENTOS DA AGENDA
// GET /agenda
// ========================================

router.get("/", authMiddleware, async (req, res) => {
  try {
    const userId = Number(req.user.userId);

    const events = await prisma.agenda.findMany({
      where: {
        userId,
      },
      orderBy: {
        date: "asc",
      },
    });

    return res.status(200).json(events);
  } catch (error) {
    console.error("Erro ao buscar agenda:", error);

    return res.status(500).json({
      message: "Erro ao buscar agenda",
    });
  }
});

// ========================================
// BUSCAR EVENTO POR ID
// GET /agenda/:id
// ========================================

router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const userId = Number(req.user.userId);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        message: "ID do evento inválido",
      });
    }

    const event = await prisma.agenda.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!event) {
      return res.status(404).json({
        message: "Evento não encontrado",
      });
    }

    return res.status(200).json(event);
  } catch (error) {
    console.error("Erro ao buscar evento:", error);

    return res.status(500).json({
      message: "Erro ao buscar evento",
    });
  }
});

// ========================================
// CRIAR EVENTO
// POST /agenda
// ========================================

router.post("/", authMiddleware, async (req, res) => {
  try {
    const userId = Number(req.user.userId);

    const {
      title,
      description,
      date,
      type,
    } = req.body;

    // ------------------------------------
    // VALIDAR TÍTULO
    // ------------------------------------

    if (
      !title ||
      typeof title !== "string" ||
      !title.trim()
    ) {
      return res.status(400).json({
        message: "O título é obrigatório",
      });
    }

    // ------------------------------------
    // VALIDAR DESCRIÇÃO
    // ------------------------------------

    if (
      description !== undefined &&
      description !== null &&
      typeof description !== "string"
    ) {
      return res.status(400).json({
        message: "A descrição deve ser um texto",
      });
    }

    // ------------------------------------
    // VALIDAR DATA
    // ------------------------------------

    if (!date) {
      return res.status(400).json({
        message: "A data é obrigatória",
      });
    }

    const eventDate = new Date(date);

    if (Number.isNaN(eventDate.getTime())) {
      return res.status(400).json({
        message: "A data informada é inválida",
      });
    }

    // ------------------------------------
    // VALIDAR TIPO
    // ------------------------------------

    if (
      type !== undefined &&
      type !== null &&
      typeof type !== "string"
    ) {
      return res.status(400).json({
        message: "O tipo deve ser um texto",
      });
    }

    // ------------------------------------
    // CRIAR EVENTO
    // ------------------------------------

    const event = await prisma.agenda.create({
      data: {
        title: title.trim(),

        description:
          description !== undefined &&
          description !== null
            ? description.trim()
            : null,

        date: eventDate,

        type:
          type !== undefined &&
          type !== null
            ? type.trim()
            : null,

        userId,
      },
    });

    return res.status(201).json(event);
  } catch (error) {
    console.error("Erro ao criar evento:", error);

    return res.status(500).json({
      message: "Erro ao criar evento",
    });
  }
});

// ========================================
// ATUALIZAR EVENTO
// PUT /agenda/:id
// ========================================

router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const userId = Number(req.user.userId);

    const {
      title,
      description,
      date,
      type,
    } = req.body;

    // ------------------------------------
    // VALIDAR ID
    // ------------------------------------

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        message: "ID do evento inválido",
      });
    }

    // ------------------------------------
    // VERIFICAR PROPRIEDADE
    // ------------------------------------

    const existingEvent = await prisma.agenda.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!existingEvent) {
      return res.status(404).json({
        message: "Evento não encontrado",
      });
    }

    // ------------------------------------
    // VALIDAR TÍTULO
    // ------------------------------------

    if (
      title !== undefined &&
      (
        typeof title !== "string" ||
        !title.trim()
      )
    ) {
      return res.status(400).json({
        message: "O título não pode estar vazio",
      });
    }

    // ------------------------------------
    // VALIDAR DESCRIÇÃO
    // ------------------------------------

    if (
      description !== undefined &&
      description !== null &&
      typeof description !== "string"
    ) {
      return res.status(400).json({
        message: "A descrição deve ser um texto",
      });
    }

    // ------------------------------------
    // VALIDAR DATA
    // ------------------------------------

    let newDate;

    if (date !== undefined) {
      if (date === null) {
        return res.status(400).json({
          message: "A data não pode ser nula",
        });
      }

      newDate = new Date(date);

      if (Number.isNaN(newDate.getTime())) {
        return res.status(400).json({
          message: "A data informada é inválida",
        });
      }
    }

    // ------------------------------------
    // VALIDAR TIPO
    // ------------------------------------

    if (
      type !== undefined &&
      type !== null &&
      typeof type !== "string"
    ) {
      return res.status(400).json({
        message: "O tipo deve ser um texto",
      });
    }

    // ------------------------------------
    // ATUALIZAR
    // ------------------------------------

    const event = await prisma.agenda.update({
      where: {
        id,
      },

      data: {
        ...(title !== undefined && {
          title: title.trim(),
        }),

        ...(description !== undefined && {
          description:
            description === null
              ? null
              : description.trim(),
        }),

        ...(date !== undefined && {
          date: newDate,
        }),

        ...(type !== undefined && {
          type:
            type === null
              ? null
              : type.trim(),
        }),
      },
    });

    return res.status(200).json(event);
  } catch (error) {
    console.error("Erro ao atualizar evento:", error);

    return res.status(500).json({
      message: "Erro ao atualizar evento",
    });
  }
});

// ========================================
// EXCLUIR EVENTO
// DELETE /agenda/:id
// ========================================

router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const userId = Number(req.user.userId);

    // ------------------------------------
    // VALIDAR ID
    // ------------------------------------

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        message: "ID do evento inválido",
      });
    }

    // ------------------------------------
    // VERIFICAR PROPRIEDADE
    // ------------------------------------

    const existingEvent = await prisma.agenda.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!existingEvent) {
      return res.status(404).json({
        message: "Evento não encontrado",
      });
    }

    // ------------------------------------
    // EXCLUIR
    // ------------------------------------

    await prisma.agenda.delete({
      where: {
        id,
      },
    });

    return res.status(200).json({
      message: "Evento excluído com sucesso",
    });
  } catch (error) {
    console.error("Erro ao excluir evento:", error);

    return res.status(500).json({
      message: "Erro ao excluir evento",
    });
  }
});

module.exports = router;