const { User } = require('./models/associations');
const bcrypt = require('bcrypt');

async function createAdmin() {
    try {
        const adminData = {
            Email: 'admin@example.com',
            Password: await bcrypt.hash('123', 10),
            Name: 'Admin',
            RoleID: 1
        };

        const [admin, created] = await User.findOrCreate({
            where: { Email: adminData.Email },
            defaults: adminData
        });

        if (created) {
            console.log('Администратор создан:', admin.email);
        } else {
            console.log('Администратор уже существует');
        }
    } catch (error) {
        console.error('Ошибка при создании администратора:', error);
    } finally {
        process.exit();
    }
}

createAdmin();