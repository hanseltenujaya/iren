// seed3.js without external dotenv dependency
const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

// Parse .env.local manually
const fs = require('fs');
const envFile = fs.readFileSync('C:\\IREN2\\web_dashboard\\.env.local', 'utf8');
const envLine = envFile.split('\n').find(line => line.startsWith('MONGODB_URI='));
// The URI value is everything after the first '='
const uri = envLine ? envLine.substring(envLine.indexOf('=') + 1).trim() : '';

const run = async () => {
    const client = await MongoClient.connect(uri);
    const db = client.db();
    const hash = await bcrypt.hash('13021993', 12);

    await db.collection('users').insertOne({
        phone: '081289001589',
        passwordHash: hash,
        name: 'Hansel Tenujaya',
        role: 'manager',
        modules: ['scan-pack', 'gallery'],
        isActive: true,
        createdAt: new Date()
    });

    console.log('User created successfully!');
    await client.close();
};

run().catch(console.error);
