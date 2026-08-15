require("dotenv").config();

const bcrypt = require("bcrypt");
const prisma = require("./src/lib/prisma");

async function testPassword() {
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

    const valid = await bcrypt.compare(
      "lumos1234",
      user.password
    );

    console.log("Senha correta:", valid);
  } catch (error) {
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

testPassword();