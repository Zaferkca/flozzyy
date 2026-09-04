const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();

app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));

const SETTINGS_FILE = path.join(__dirname, 'settings.json');


/* =========================================================
   DEFAULT SETTINGS
========================================================= */

const defaultSettings = {

    bgType: 'color',

    bgUrl: '#050505',

    musicUrl: '',

    bioText: 'Merhaba',

    adminPassword: '123',

    viewCount: 14

};


/* =========================================================
   SETTINGS OKU
========================================================= */

function getSettings() {

    try {

        if (!fs.existsSync(SETTINGS_FILE)) {

            fs.writeFileSync(
                SETTINGS_FILE,
                JSON.stringify(
                    defaultSettings,
                    null,
                    2
                ),
                'utf8'
            );

            return {
                ...defaultSettings
            };

        }


        const data = JSON.parse(
            fs.readFileSync(
                SETTINGS_FILE,
                'utf8'
            )
        );


        return {

            ...defaultSettings,

            ...data

        };


    } catch (err) {

        console.error(
            'Settings okuma hatası:',
            err
        );


        return {
            ...defaultSettings
        };

    }

}


/* =========================================================
   ANA SAYFA
========================================================= */

app.get('/', (req, res) => {

    res.redirect('/profile');

});


/* =========================================================
   PROFILE
========================================================= */

app.get('/profile', async (req, res) => {

    const settings =
        getSettings();


    /*
        Discord ID
    */

    const userId =
        '772859992109875252';


    let user = {

        id: userId,

        username:
            'morfixcik',

        global_name:
            'Flozzy',

        avatar_url:
            'https://cdn.discordapp.com/embed/avatars/0.png',

        avatar_decoration_url:
            null

    };


    try {

        const response =
            await fetch(

                `https://api.lanyard.rest/v1/users/${userId}`

            );


        const result =
            await response.json();


        if (
            result.success &&
            result.data
        ) {

            const dUser =
                result.data.discord_user;


            if (dUser) {


                /* USERNAME */

                user.username =

                    dUser.username

                    ||

                    user.username;



                /* GLOBAL NAME */

                user.global_name =

                    dUser.global_name

                    ||

                    user.global_name;



                /* AVATAR */

                if (dUser.avatar) {

                    const ext =

                        dUser.avatar
                            .startsWith('a_')

                            ?

                        'gif'

                            :

                        'png';


                    user.avatar_url =

                        `https://cdn.discordapp.com/avatars/${dUser.id}/${dUser.avatar}.${ext}?size=256`;

                }



                /* =================================================
                   SADECE BÜYÜK PROFİL İÇİN DECORATION
                ================================================= */

                const decorationData =

                    dUser.avatar_decoration_data

                    ||

                    result.data.avatar_decoration_data;


                if (
                    decorationData &&
                    decorationData.asset
                ) {

                    user.avatar_decoration_url =

                        `https://cdn.discordapp.com/avatar-decoration-presets/${decorationData.asset}.png?size=240&passthrough=true`;

                }

            }

        }


    } catch (err) {

        console.error(
            'Lanyard API hatası:',
            err
        );

    }


    res.render(
        'profile',
        {

            user,

            settings

        }
    );

});


/* =========================================================
   PROFILE VIEW COUNTER
========================================================= */

app.post(
    '/api/increment-view',
    (req, res) => {

        const settings =
            getSettings();


        settings.viewCount =
            (settings.viewCount || 14) + 1;


        fs.writeFileSync(
            SETTINGS_FILE,
            JSON.stringify(
                settings,
                null,
                2
            ),
            'utf8'
        );


        res.json({

            success: true,

            viewCount:
                settings.viewCount

        });

    }
);


/* =========================================================
   ADMIN
========================================================= */

app.get('/admin', (req, res) => {

    const settings =
        getSettings();


    res.render(
        'admin',
        {

            settings,

            success: null,

            error: null

        }
    );

});


/* =========================================================
   ADMIN SAVE
========================================================= */

app.post(
    '/admin/save',
    (req, res) => {

        const settings =
            getSettings();


        const {

            password,

            bgType,

            bgUrl,

            musicUrl,

            bioText

        } = req.body;


        if (
            password !==
            settings.adminPassword
        ) {

            return res.render(
                'admin',
                {

                    settings,

                    success: null,

                    error:
                        'Hatalı Admin Şifresi!'

                }
            );

        }


        settings.bgType =
            bgType;


        settings.bgUrl =
            bgUrl || '#050505';


        settings.musicUrl =
            musicUrl;


        settings.bioText =
            bioText;


        fs.writeFileSync(
            SETTINGS_FILE,
            JSON.stringify(
                settings,
                null,
                2
            ),
            'utf8'
        );


        res.render(
            'admin',
            {

                settings,

                success:
                    'Ayarlar başarıyla kaydedildi!',

                error: null

            }
        );

    }
);


/* =========================================================
   SERVER
========================================================= */

app.listen(
    3000,
    () => {

        console.log(
            'Sunucu aktif: http://localhost:3000/profile'
        );

    }
);