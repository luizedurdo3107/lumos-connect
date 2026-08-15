const express = require("express");
const prisma = require("../lib/prisma");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

// Listar eventos da agenda
router.get("/", authMiddleware, async (req, res) => {
  try {
    const agenda = await prisma.agenda.findMany({
      where: {
        userId: req.user.userId,
      },
      orderBy: {
        date: "asc",
      },
    });

    res.json(agenda);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Erro ao buscar agenda",
    });
  }
});

// Criar evento
router.post("/", authMiddleware, async (req, res) => {
  try {
    const {
      title,
      description,
      date,
      type,
    } = req.body;

    if (!title) {
      return res.status(400).json({
        message: "O título do evento é obrigatório",
      });
    }

    if (!date) {
      return res.status(400).json({
        message: "A data do evento é obrigatória",
      });
    }

    const agenda = await prisma.agenda.create({
      data: {
        title,
        description,
        date: new Date(date),
        type,
        userId: req.user.userId,
      },
    });

    res.status(201).json(agenda);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Erro ao criar evento",
    });
  }
});

// Buscar evento por ID
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const id = Number(req.params.id);

    const agenda = await prisma.agenda.findFirst({
      where: {
        id,
        userId: req.user.userId,
      },
    });

    if (!agenda) {
      return res.status(404).json({
        message: "Evento não encontrado",
      });
    }

    res.json(agenda);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Erro ao buscar evento",
    });
  }
});

// Atualizar evento
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const id = Number(req.params.id);

    const existingAgenda = await prisma.agenda.findFirst({
      where: {
        id,
        userId: req.user.userId,
      },
    });

    if (!existingAgenda) {
      return res.status(404).json({
        message: "Evento não encontrado",
      });
    }

    const {
      title,
      description,
      date,
      type,
    } = req.body;

    const agenda = await prisma.agenda.update({
      where: {
        id,
      },
      data: {
        title,
        description,
        date: date ? new Date(date) : undefined,
        type,
      },
    });

    res.json(agenda);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Erro ao atualizar evento",
    });
  }
});

// Excluir evento
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const id = Number(req.params.id);

    const existingAgenda = await prisma.agenda.findFirst({
      where: {
        id,
        userId: req.user.userId,
      },
    });

    if (!existingAgenda) {
      return res.status(404).json({
        message: "Evento não encontrado",
      });
    }

    await prisma.agenda.delete({
      where: {
        id,
      },
    });

    res.json({
      message: "Evento excluído com sucesso",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Erro ao excluir evento",
    });
  }
});

module.exports = router;