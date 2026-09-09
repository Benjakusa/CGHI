require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:8080'],
    credentials: true
}));
app.use(express.json({ limit: '10mb' }));

// Serve uploaded images from public/uploads
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/heroes', require('./routes/heroes'));
app.use('/api/news', require('./routes/news'));
app.use('/api/partners', require('./routes/partners'));
app.use('/api/jobs', require('./routes/jobs'));

// Admin stats (overview)
app.get('/api/admin/stats', require('./middleware/auth'), (req, res) => {
    const db = require('./db');
    const stat = (table) => {
        const total = db.prepare(`SELECT COUNT(*) as c FROM ${table}`).get().c;
        const published = db.prepare(`SELECT COUNT(*) as c FROM ${table} WHERE published=1`).get().c;
        return { total, published, unpublished: total - published };
    };
    res.json({
        heroes: stat('heroes'),
        news: stat('news'),
        partners: stat('partners'),
        jobs: stat('jobs')
    });
});

app.listen(PORT, () => {
    console.log(`[CGHI API] Running on http://localhost:${PORT}`);
});
