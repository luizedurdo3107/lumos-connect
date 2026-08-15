require("dotenv").config();

const bcrypt = require("bcrypt");
const prisma = require("../src/lib/prisma");

async function main() {
    const password = await bcrypt.hash("lumos1234", 10);

    const admin = await prisma.user.upsert({
        where: {
            email: "luiz@lumos.com"
        },

        update: {
            role: "ADMIN",
            password
        },

        create: {
            name: "Luiz Eduardo",
            email: "luiz@lumos.com",
            password,
            role: "ADMIN"
        }
    });

    console.log("=================================");
    console.log("ADMIN criado/encontrado com sucesso!");
    console.log("=================================");

    console.log({
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role
    });
}

main()
    .catch((error) => {
        console.error("Erro no seed:", error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });