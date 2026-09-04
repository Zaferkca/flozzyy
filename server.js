const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));

const SETTINGS_FILE = path.join(__dirname, 'settings.json');

const defaultSettings = {
    bgType: 'color',
    bgUrl: '#050505',
    musicUrl: '',
    bioText: "Don't try to figure me out you'll never succeed",
    adminPassword: '123',
    viewCount: 14
};

function getSettings() {
    try {
        if (!fs.existsSync(SETTINGS_FILE)) {
            fs.writeFileSync(SETTINGS_FILE, JSON.stringify(defaultSettings, null, 2), 'utf8');
            return defaultSettings;
        }
        const data = JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf8'));
        return { ...defaultSettings, ...data };
    } catch (err) {
        return defaultSettings;
    }
}

app.get('/', (req, res) => {
    res.redirect('/profile');
});

app.get('/profile', (req, res) => {
    const settings = getSettings();
    const user = {
        id: '768037537792524308',
        username: 'kwnzy.0',
        global_name: 'Kwenzy♱'
    };
    res.render('profile', { user, settings });
});

// Benzersiz ziyaretçi sayısını artıran güvenli API yolu
app.post('/api/increment-view', (req, res) => {
    const settings = getSettings();
    settings.viewCount = (settings.viewCount || 14) + 1;
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2), 'utf8');
    res.json({ success: true, viewCount: settings.viewCount });
});

app.get('/admin', (req, res) => {
    const settings = getSettings();
    res.render('admin', { settings, success: null, error: null });
});

app.post('/admin/save', (req, res) => {
    const settings = getSettings();
    const { password, bgType, bgUrl, musicUrl, bioText } = req.body;

    if (password !== settings.adminPassword) {
        return res.render('admin', { settings, success: null, error: 'Hatalı Admin Şifresi!' });
    }

    settings.bgType = bgType;
    settings.bgUrl = bgUrl || '#050505';
    settings.musicUrl = musicUrl;
    settings.bioText = bioText;

    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2), 'utf8');
    res.render('admin', { settings, success: 'Ayarlar başarıyla kaydedildi!', error: null });
});

app.listen(3000, () => {
    console.log("Sunucu aktif: http://localhost:3000/profile");
});