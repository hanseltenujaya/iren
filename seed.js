const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });

const run = async () => {
    const client = await MongoClient.connect(process.env.MONGODB_URI);
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
