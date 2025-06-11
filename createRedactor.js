const { User } = require('./models/associations');
const bcrypt = require('bcrypt');

async function createRedactor() {
    try {
        const RedacrorData = {
            Email: 'redactor1@mail.com',
            Password: await bcrypt.hash('123', 10),
            Name: 'Redactor',
            RoleID: 3
        };

        const [redactor, created] = await User.findOrCreate({
            where: { Email: RedacrorData.Email },
            defaults: RedacrorData
        });

        if (created) {
            console.log('Редактор создан:', redactor.email);
        } else {
            console.log('Редактор уже существует');
        }
    } catch (error) {
        console.error('Ошибка при создании Редактора:', error);
    } finally {
        process.exit();
    }
}

createRedactor();