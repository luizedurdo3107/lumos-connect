const prisma = require("../lib/prisma");

async function adminMiddleware(req, res, next) {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: req.user.userId,
      },
      select: {
        id: true,
        role: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        message: "Usuário não encontrado",
      });
    }

    if (user.role !== "ADMIN") {
      return res.status(403).json({
        message: "Você não tem permissão para realizar esta ação",
      });
    }

    next();
  } catch (error) {
    console.error("Erro ao verificar permissões:", error);

    return res.status(500).json({
      message: "Erro ao verificar permissões",
    });
  }
}

module.exports = adminMiddleware;