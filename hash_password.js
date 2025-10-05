const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');

// Hash the password "Fring779!"
const password = 'Fring779!';
const saltRounds = 12;

async function hashPassword() {
    try {
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        console.log('Original Password:', password);
        console.log('Hashed Password:', hashedPassword);

        // Create users.json with the hashed password
        const usersConfig = {
            users: [
                {
                    username: "admin",
                    password: hashedPassword,
                    role: "admin",
                    createdAt: new Date().toISOString()
                }
            ]
        };

        // Ensure config directory exists
        const configDir = path.join(__dirname, 'config');
        if (!fs.existsSync(configDir)) {
            fs.mkdirSync(configDir, { recursive: true });
        }

        // Write users.json
        const configPath = path.join(configDir, 'users.json');
        fs.writeFileSync(configPath, JSON.stringify(usersConfig, null, 2));

        console.log('✓ users.json created successfully at:', configPath);
        console.log('✓ Default user: admin');
        console.log('✓ Password:', password);
    } catch (error) {
        console.error('Error hashing password:', error);
    }
}

// Run the password hashing
hashPassword();