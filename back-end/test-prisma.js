require("dotenv").config();

const prisma = require("./src/lib/prisma");

async function test() {
  try {
    const user = await prisma.user.findUnique({
      where: {
        email: "luiz@lumos.com",
      },
    });

    if (!user) {
      console.log("Usuário não encontrado.");
      return;
    }

    console.log("Usuário encontrado:");
    console.log({
      id: user.id,
      name: user.name,
      email: user.email,
    });
  } catch (error) {
    console.error("Erro ao consultar usuário:");
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

test();