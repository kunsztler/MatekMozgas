// ========================================
// MATEKGO – JÁTÉK
// Páros vagy páratlan?
// ========================================


// ========================================
// ÁLLAPOT
// ========================================

const state = {
    running: false,
    sound: true,

    total: 300,

gameTime: 5,
thinkingTime: 5,
    answer: 0,

    timer: null,
    next: null,
    thinkingTimer: null,

    max: 25,

    ops: ['+', '-', '×', '÷']
};


// ========================================
// SEGÉDFÜGGVÉNYEK
// ========================================

const $ = (id) => document.getElementById(id);


// Véletlen egész szám
function rand(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}


// Idő formázása
function fmt(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;

    return (
        String(minutes).padStart(2, '0') +
        ':' +
        String(secs).padStart(2, '0')
    );
}


// ========================================
// HANG
// ========================================

function beep(frequency = 520, duration = 70) {

    if (!state.sound) return;

    try {
        const AudioCtx =
            window.AudioContext ||
            window.webkitAudioContext;

        const context = new AudioCtx();

        const oscillator = context.createOscillator();
        const gain = context.createGain();

        oscillator.frequency.value = frequency;
        oscillator.type = 'sine';

        gain.gain.value = 0.045;

        oscillator.connect(gain);
        gain.connect(context.destination);

        oscillator.start();

        setTimeout(() => {
            oscillator.stop();
            context.close();
        }, duration);

    } catch (error) {
        // A játék hang nélkül is működjön.
    }
}


// ========================================
// FELADAT GENERÁLÁSA
// ========================================

function makeProblem() {

    const operator =
        state.ops[rand(0, state.ops.length - 1)];

    let x;
    let y;
    let answer;


    // ÖSSZEADÁS
    if (operator === '+') {

        x = rand(1, state.max);
        y = rand(1, state.max);

        answer = x + y;
    }


    // KIVONÁS
    if (operator === '-') {

        x = rand(1, state.max);
        y = rand(1, x);

        answer = x - y;
    }


    // SZORZÁS
    if (operator === '×') {

        const limit = Math.min(12, state.max);

        x = rand(1, limit);
        y = rand(1, limit);

        answer = x * y;
    }


    // OSZTÁS
    if (operator === '÷') {

        const limit = Math.min(12, state.max);

        y = rand(1, limit);
        answer = rand(1, limit);

        // Mindig egész szám legyen az eredmény.
        x = y * answer;
    }


    $('a').textContent = x;
    $('b').textContent = y;
    $('op').textContent = operator;

    state.answer = answer;
}


// ========================================
// GONDOLKODÁSI IDŐ
// ========================================

function thinking() {

    if (!state.running) return;


    // Előző eredmény eltüntetése
    $('result').classList.remove('show');
    $('result').style.opacity = '0';


    // Új feladat
    makeProblem();


    // 5 másodperc
let number = state.thinkingTime;

$('countdown').textContent = number;

    beep();


    // Előző visszaszámláló törlése
    clearInterval(state.thinkingTimer);


    state.thinkingTimer = setInterval(() => {

        if (!state.running) {

            clearInterval(state.thinkingTimer);
            return;
        }


        number--;


        if (number > 0) {

            $('countdown').textContent = number;

            beep();

        } else {

            clearInterval(state.thinkingTimer);

            reveal();
        }

    }, 1000);
}


// ========================================
// EREDMÉNY
// ========================================

function reveal() {

    if (!state.running) return;


    const even = state.answer % 2 === 0;

    $('result').classList.remove('even', 'odd');
    $('result').classList.add(even ? 'even' : 'odd');


    $('resultNumber').textContent =
        state.answer;


    $('resultLabel').textContent =
        even ? 'PÁROS!' : 'PÁRATLAN!';


    $('resultAction').textContent =
        even ? 'UGORJ!' : 'GUGGOLJ!';


    // Animáció újraindítása
    $('result').classList.remove('show');

    void $('result').offsetWidth;

    $('result').classList.add('show');


    $('countdown').textContent =
        'Mozdulj!';


    beep(
        even ? 760 : 620,
        120
    );


    // Következő feladat
    state.next = setTimeout(() => {

        if (state.running) {
            thinking();
        }

    }, 3000);
}


// ========================================
// JÁTÉK INDÍTÁSA
// ========================================

function startGame() {

    if (state.running) return;


    // Indításkor teljes képernyőre váltás.
    // A start gomb kattintása felhasználói művelet, ezért a böngésző engedélyezi.
    if (!document.fullscreenElement) {

        document.documentElement.requestFullscreen?.().catch(() => {});

    }


state.running = true;
state.total = state.gameTime * 60;


    // Idő visszaállítása
    $('totalTimer').textContent =
        fmt(state.total);


    // Gombok
    $('startBtn').classList.add('hidden');
    $('stopBtn').classList.remove('hidden');


    // 5 perces játékidő
    state.timer = setInterval(() => {

        state.total--;

        $('totalTimer').textContent =
            fmt(state.total);


        if (state.total <= 0) {
            endGame();
        }

    }, 1000);


    // Első feladat
    thinking();
}


// ========================================
// JÁTÉK VÉGE
// ========================================

function endGame() {

    state.running = false;


    // Minden időzítő törlése
    clearInterval(state.timer);
    clearInterval(state.thinkingTimer);
    clearTimeout(state.next);


    state.timer = null;
    state.thinkingTimer = null;
    state.next = null;


    // Eredmény eltüntetése
    $('result').classList.remove('show');
    $('result').style.opacity = '0';


    // Gombok
    $('startBtn').classList.remove('hidden');
    $('stopBtn').classList.add('hidden');


    // Üzenet
    $('countdown').textContent =
        '🎉 Ügyesek vagytok!';
}


// ========================================
// HANG KI / BE
// ========================================

function toggleSound() {

    state.sound = !state.sound;

    $('soundBtn').textContent =
        state.sound ? '🔊' : '🔇';
}


// ========================================
// BEÁLLÍTÁSOK
// ========================================

const overlay = $('overlay');


function openSettings() {
    overlay.classList.add('open');
}


function closeSettings() {
    overlay.classList.remove('open');
}


$('settingsBtn').onclick = openSettings;

$('closeX').onclick = closeSettings;

$('closeSettings').onclick = closeSettings;


overlay.onclick = (event) => {

    if (event.target === overlay) {
        closeSettings();
    }
};


document.addEventListener('keydown', (event) => {

    if (event.key === 'Escape') {
        closeSettings();
    }
});


// ========================================
// MAXIMÁLIS SZÁM
// ========================================

$('maxValue').oninput = (event) => {

    state.max = Number(event.target.value);

    $('maxValueText').textContent =
        state.max;
};
// ========================================
// JÁTÉKIDŐ
// ========================================

$('gameTime').oninput = (event) => {

    state.gameTime = Number(event.target.value);

    $('gameTimeText').textContent =
        state.gameTime + ' perc';
};


// ========================================
// GONDOLKODÁSI IDŐ
// ========================================

$('thinkingTime').oninput = (event) => {

    state.thinkingTime = Number(event.target.value);

    $('thinkingTimeText').textContent =
        state.thinkingTime + ' másodperc';
};

// ========================================
// MŰVELETI JELEK
// ========================================

document
    .querySelectorAll('.opcheck')
    .forEach((button) => {

        button.onclick = () => {

            button.classList.toggle('on');


            const selectedOperations = [
                ...document.querySelectorAll('.opcheck.on')
            ].map((element) => element.dataset.op);


            // Legalább egy művelet maradjon.
            if (selectedOperations.length > 0) {

                state.ops = selectedOperations;

            } else {

                button.classList.add('on');

                state.ops = [
                    button.dataset.op
                ];
            }
        };
    });


// ========================================
// ÉRTESÍTÉS
// ========================================

function toast(message) {

    $('toast').textContent = message;

    $('toast').classList.add('show');


    setTimeout(() => {

        $('toast').classList.remove('show');

    }, 1400);
}


// ========================================
// JÁTÉK VÁLASZTÁSA
// ========================================

document
    .querySelectorAll('.game-select')
    .forEach((button) => {

        button.onclick = () => {

            if (button.classList.contains('locked')) {

                toast(
                    'Ez a játék hamarosan érkezik! 🚀'
                );
            }
        };
    });


// ========================================
// TELJES KÉPERNYŐ
// ========================================

const fullscreenBtn = $('fullscreenBtn');


if (fullscreenBtn) {

    fullscreenBtn.onclick = async () => {

        try {

            if (!document.fullscreenElement) {

                await document.documentElement.requestFullscreen();

            } else {

                await document.exitFullscreen();
            }

        } catch (error) {

            console.log(
                'A teljes képernyő nem érhető el.',
                error
            );
        }
    };
}


// ========================================
// GOMBOK
// ========================================

$('startBtn').onclick = startGame;

$('stopBtn').onclick = endGame;

$('soundBtn').onclick = toggleSound;


// ========================================
// INDULÁSKOR AZ IDŐ
// ========================================

$('totalTimer').textContent =
    fmt(state.total);