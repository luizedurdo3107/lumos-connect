const bcrypt = require("bcrypt");
const prisma = require("./src/lib/prisma");

async function resetPassword() {
    const userId = 4;
    const newPassword = "123456789";

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const user = await prisma.user.update({
        where: {
            id: userId,
        },
        data: {
            password: hashedPassword,
        },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
        },
    });

    console.log("Senha redefinida com sucesso!");
    console.log(user);
}

resetPassword()
    .catch((error) => {
        console.error("Erro ao redefinir senha:", error);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });