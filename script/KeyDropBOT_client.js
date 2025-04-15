// ==UserScript==
// @name         keydrop_giveaway_script_
// @namespace    https://www.favoslav.cz/
// @version      1.0.2
// @description  KeyDrop Giveaway Bot with Dynamic Label Updates and Frequency Checks
// @author       Favoslav_ & Pr0Xy
// @include      *://*key*drop*/*
// @grant        none
// ==/UserScript==

// Toggle this to true to bypass WebSocket requirement
const BYPASS_WEBSOCKET = false;

let socketConnected = false;

const labelFlagsDefault = {
    AMATEUR: [60000, false],
    CONTENDER: [300000, false],
    LEGEND: [900000, false],
    CHALLENGER: [3600000, false],
    CHAMPION: [21600000, false],
};

const woccDefault = 15000;
const wccDefault = 30000;
const skinvalueDefault = 1.6;
const allowsoundsDefault = 1;

let _refreshPageCount = 0;
let refreshPageCount_Target = 5; // bruh

const captcha_sounds = [
    "https://www.myinstants.com/media/sounds/lula-vai-todo-mindo-se-fdr.mp3",
    "https://www.myinstants.com/media/sounds/me-mata-de-uma-vez.mp3",
    "https://www.myinstants.com/media/sounds/parou-round-6-estourado.mp3",
    "https://www.myinstants.com/media/sounds/cggasa.mp3",
    "https://www.myinstants.com/media/sounds/tema-triste-chaves.mp3",
    "https://www.myinstants.com/media/sounds/lula-feijao-puro.mp3",
    "https://www.myinstants.com/media/sounds/lula-por-favor-me-ajuda.mp3",
    "https://www.myinstants.com/media/sounds/bad-to-the-bone-meme.mp3",
    "https://www.myinstants.com/media/sounds/ja-que-me-ensinou-a-beber.mp3",
    "https://www.myinstants.com/media/sounds/sons-de-fundo-chapolin-som-de-pancada.mp3",
    "https://www.myinstants.com/media/sounds/agora-fudeu-musica.mp3",
    "https://www.myinstants.com/media/sounds/hino-do-vasco.mp3",
    "https://www.myinstants.com/media/sounds/rat-dance.mp3",
    "https://www.myinstants.com/media/sounds/oiia-oiia-sound.mp3"
];

let lastSkinsBalance = 0;
const win_sounds = [
    "https://www.myinstants.com/media/sounds/dilma-parabens.mp3",
    "https://www.myinstants.com/media/sounds/parabens-da-xuxa.mp3",
    "https://www.myinstants.com/media/sounds/vou-resumir-com-duas-palavras_160k.mp3"
];

if ((!localStorage.getItem('labels') || !localStorage.getItem('wocc') || !localStorage.getItem('skinvalue') || !localStorage.getItem('allowsounds') || !localStorage.getItem('wcc')) && !BYPASS_WEBSOCKET) {
    localStorage.setItem('labels', JSON.stringify(labelFlagsDefault));
    localStorage.setItem('wocc', woccDefault);
    localStorage.setItem('wcc', wccDefault);
    localStorage.setItem('skinvalue', skinvalueDefault);
    localStorage.setItem('allowsounds', allowsoundsDefault);
} else if (BYPASS_WEBSOCKET) {
    localStorage.setItem('labels', JSON.stringify(labelFlagsDefault));
    localStorage.setItem('wocc', woccDefault);
    localStorage.setItem('wcc', wccDefault);
    localStorage.setItem('skinvalue', skinvalueDefault);
    localStorage.setItem('allowsounds', allowsoundsDefault);
}

async function setupWebSocket() {
    if (BYPASS_WEBSOCKET) {
        console.log('WebSocket bypassed. Running in standalone mode.');
        socketConnected = true;
        handlePage();
        return;
    }

    const socket = new WebSocket('ws://localhost:54321');

    socket.onopen = () => {
        console.log('WebSocket connection established.');
        socketConnected = true;
        handlePage();
    };

    socket.onerror = (error) => {
        console.error('WebSocket error detected:', error);
    };

    socket.onclose = (event) => {
        console.warn(
            `WebSocket closed (Code: ${event.code}, Reason: ${event.reason}). Retrying in 5 seconds...`
        );
        setTimeout(() => setupWebSocket(), 5000);
    };

    socket.onmessage = (event) => {
        try {
            const data = JSON.parse(event.data);
            console.log('Received WebSocket data:', data);

            if (data.action === 'get_labels') {
                const labels = JSON.parse(localStorage.getItem('labels'));

                const responseData = {
                    action: 'set_labels',
                    labels: [
                        ['AMATEUR', labels.AMATEUR[0], labels.AMATEUR[1]],
                        ['CONTENDER', labels.CONTENDER[0], labels.CONTENDER[1]],
                        ['CHAMPION', labels.CHAMPION[0], labels.CHAMPION[1]],
                        ['LEGEND', labels.LEGEND[0], labels.LEGEND[1]],
                        ['CHALLENGER', labels.CHALLENGER[0], labels.CHALLENGER[1]]
                    ],
                    wo_captcha_cooldown: parseInt(localStorage.getItem('wocc')),
                    w_captcha_cooldown: parseInt(localStorage.getItem('wcc')),
                    skin_value: parseFloat(localStorage.getItem('skinvalue')),
                    allow_sounds: (localStorage.getItem('allowsounds') == 1) ? 1 : 0,
                };

                socket.send(JSON.stringify(responseData));
                console.log('Sent labels back:', responseData);
            } else if (data.action === "update_labels") {
                const labelsObject = Object.fromEntries(data.labels.map(([key, value1, value2]) => [key, [value1, value2]]));
                localStorage.setItem('labels', JSON.stringify(labelsObject));
                localStorage.setItem('wocc', data.wo_captcha_cooldown);
                localStorage.setItem('wcc', data.w_captcha_cooldown);
                localStorage.setItem('skinvalue', data.skin_value);
                localStorage.setItem('allowsounds', data.allow_sounds);
            }
        } catch (error) {
            console.error('Error parsing WebSocket message:', error);
        }
    };
}

async function timeout(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

const labelTexts = Object.keys(labelFlagsDefault).filter((label) => labelFlagsDefault[label]);

function waitForElement(selector, timeoutMs = 15000) {
    return new Promise((resolve, reject) => {
        const startTime = Date.now();
        const element = document.querySelector(selector);
        if (element) return resolve(element);

        const observer = new MutationObserver(() => {
            const el = document.querySelector(selector);
            if (el) {
                observer.disconnect();
                resolve(el);
            } else if (Date.now() - startTime > timeoutMs) {
                observer.disconnect();
                reject(
                    new Error(
                        `Element with selector "${selector}" not found within ${timeoutMs}ms`
                    )
                );
            }
        });

        observer.observe(document.body, { childList: true, subtree: true });
    });
}

function findButtonsByLabelText(labelText) {
    const labels = document.querySelectorAll(
        'p[data-testid="label-single-card-giveaway-category"]'
    );
    for (const label of labels) {
        if (label.textContent.trim() === labelText) {
            const parentDiv = label.closest(
                'div[data-testid="div-active-giveaways-list-single-card"]'
            );
            if (parentDiv) {
                const button = parentDiv.querySelector(
                    'a[data-testid="btn-single-card-giveaway-join"]'
                );

                if (button) {
                    console.log(`Found button for category "${labelText}":`, button);
                    return button;
                }
            }
        }
    }

    console.warn(`No button found for category "${labelText}".`);
    return null;
}

function checkForCaptcha() {
    return document.querySelector(
        'iframe[src*="captcha"], iframe[src*="recaptcha"], .g-recaptcha'
    );
}

function getLabelSettings() {
    const labels = JSON.parse(localStorage.getItem('labels'));
    const wocc = parseInt(localStorage.getItem('wocc'));
    const wcc = parseInt(localStorage.getItem('wcc'));

    const frequencies = {};
    for (const [label, [cooldown, enabled]] of Object.entries(labels)) {
        if (enabled) {
            frequencies[label] = cooldown;
        }
    }

    return {
        labelFrequencies: frequencies,
        enabledLabels: Object.keys(frequencies),
        wocc,
        wcc
    };
}

async function handleCaptcha(button) {
    const settings = getLabelSettings();
    const captchaDetected = await new Promise((resolve) => {
        const observer = new MutationObserver(() => {
            if (checkForCaptcha()) {
                observer.disconnect();
                resolve(true);
            }
        });

        observer.observe(document.body, { childList: true, subtree: true });

        timeout(settings.wocc).then(() => {
            observer.disconnect();
            resolve(false);
        });
    });

    if (captchaDetected) {
        // exec Random Sound
        if (localStorage.getItem('allowsounds') == 1) {
            const randomSound = captcha_sounds[Math.floor(Math.random() * captcha_sounds.length)];

            const audio = new Audio(randomSound);
            audio.volume = 0.25;
            audio.play().catch(error => console.error("Audio Failed:", error));
        }

        console.log("CAPTCHA detected. Waiting for bot to solve it...");
        await timeout(settings.wcc - 2000);
        if (button) button.click();
        await timeout(2000);
    } else {
        console.log("No CAPTCHA detected. Proceeding...");
    }

    //window.location.replace(`${window.location.origin}/giveaways/list/`);
    window.history.back();
}

function canProcessLabel(labelText) {
    const lastAttemptKey = `lastAttempt_${labelText}`;
    const lastAttempt = localStorage.getItem(lastAttemptKey);
    const now = Date.now();
    const settings = getLabelSettings();

    if (!lastAttempt ||
        now - parseInt(lastAttempt, 10) >= settings.labelFrequencies[labelText]) {
        localStorage.setItem(lastAttemptKey, now);
        return true;
    }

    return false;
}

async function handlePage() {
    if (!socketConnected && !BYPASS_WEBSOCKET) {
        return;
    }

    const settings = getLabelSettings();
    const currentPath = window.location.pathname;
    const offset = Math.random() * 1000 + 200;

    if (currentPath.includes("/giveaways/list")) {
        console.log("You are on the /giveaways/list page");
        await waitForElement(
            'p[data-testid="label-single-card-giveaway-category"]'
        );

        let storedIndex = parseInt(
            localStorage.getItem("giveawayIndex") || "0",
            10
        );
        let processed = false;

        while (!processed) {
            const labelText = settings.enabledLabels[storedIndex];

            if (labelText && canProcessLabel(labelText)) {
                console.log(`Processing labelText: ${labelText}`);
                const button = findButtonsByLabelText(labelText);

                if (button) {
                    await timeout(offset);
                    button.click();

                    const currentIndex = (storedIndex + 1) % settings.enabledLabels.length;
                    localStorage.setItem("giveawayIndex", currentIndex);
                    console.log(`Updated index to ${currentIndex}`);
                    processed = true;
                } else {
                    console.log(
                        `No button found for "${labelText}", skipping to next index.`
                    );
                }
            }

            storedIndex = (storedIndex + 1) % settings.enabledLabels.length;
            await timeout(1000);
        }
    } else if (currentPath.includes("/giveaways/keydrop")) {
        console.log("You are on the /giveaways/keydrop page");

        await waitForElement('div[data-testid="div-giveaway-participants-board"]');
        const button = document.querySelector(
            'button[data-testid="btn-giveaway-join-the-giveaway"]'
        );

        const skinElement = document.querySelector('div.mt-2');
        console.log(skinElement);
        if (skinElement) {
            const skinText = skinElement.textContent.replace(/\u00A0/g, ' ').trim(); // remove &nbsp;

            const valueStr = skinText.split(' ')[0].replace(',', '.');
            const skinValue = parseFloat(valueStr);
            console.log("Skin Value:", skinValue);

            if (!isNaN(skinValue) && skinValue < parseFloat(localStorage.getItem('skinvalue'))) {
                console.log('Bruh value!');

                // Little Carl
                const images = [
                    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSpDIGSjpWu3c4iyaUO3YP1RrcyrzvpDmjpbH-8wsHKdGec1ii42Cm2Dj_IMJ-lKW2qLNE&usqp=CAU",
                    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQMMCmhZtAnbrDqGfEZJnOBG3MDQckvKu1LoQ&s",
                    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRGw6Dhf2fg-A1NtYdYnX8NfeRi5lYYE665uQ&s",
                    "https://i.pinimg.com/736x/88/9e/24/889e24c699ec4f0e9137c205564cb4ab.jpg",
                    "https://pt.quizur.com/_image?href=https://img.quizur.com/f/img643fd528d03641.65113640.jpg?lastEdited=1681904948&w=600&h=600&f=webp",
                    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQLh3xK9nZC-i1r6QPuhGHi2YZVnTutTGQc_Q&s"
                ];

                document.querySelectorAll('img').forEach((img, index) => {
                    if (index >= 4) {
                        const randomImage = images[Math.floor(Math.random() * images.length)];
                        img.src = randomImage;
                        img.srcset = "";
                    }
                });

                //window.location.replace(`${window.location.origin}/giveaways/list/`);
                setTimeout(() => {window.history.back();}, 1500);
                return;
            }
        }

        // override old replace method (fix outdated giveways).
        if (_refreshPageCount >= refreshPageCount_Target) {
            window.location.replace(`${window.location.origin}/giveaways/list/`);
            _refreshPageCount = 0;
        }
        _refreshPageCount++;

        if (button && button.disabled) {
            console.log("Giveaway button disabled. Redirecting...");
            //window.location.replace(`${window.location.origin}/giveaways/list/`);

            setTimeout(() => {window.history.back();}, 1500);
        } else if (button) {
            await timeout(offset);
            button.click();
            await handleCaptcha(button);
        } else {
            console.log("No button found. Redirecting...");
            //window.location.replace(`${window.location.origin}/giveaways/list/`);

            setTimeout(() => {window.history.back();}, 1500);
        }
    } else {
        console.log("You are on an unsupported page.");
    }
}

function update() {

    const totSkinsMoney = document.querySelector('span[data-testid="header-quick-sell-account-balance"]');
    //console.log(`SkinBalances`, totSkinsMoney, lastSkinsBalance);
    if (totSkinsMoney && localStorage.getItem('allowsounds') == 1) {
        const balanceText = totSkinsMoney.textContent.trim();
        const currentBalance = parseFloat(balanceText.replace('US$', '').replace(',', '.').trim());

        if (!isNaN(currentBalance) && currentBalance > lastSkinsBalance + 0.3 && lastSkinsBalance != 0) {
            console.log(`You won! yay!! Current Balance: ${currentBalance}`);

            const randomSound = win_sounds[Math.floor(Math.random() * win_sounds.length)];

            const audio = new Audio(randomSound);
            audio.volume = 0.50;
            audio.play().catch(error => console.error("Audio Failed:", error));
        }

        if (lastSkinsBalance < currentBalance) {
            lastSkinsBalance = currentBalance;
        }
    }

    setTimeout(update, 20000); // 4 sec
}
update();

(async () => {
    await setupWebSocket();

    let lastPath = window.location.pathname;

    window.addEventListener('popstate', () => {
        if (window.location.pathname !== lastPath) {
            lastPath = window.location.pathname;
            console.log('URL changed. Re-running script...');
            handlePage();
        }
    });

    window.addEventListener('hashchange', () => {
        if (window.location.pathname !== lastPath) {
            lastPath = window.location.pathname;
            console.log('Hash changed. Re-running script...');
            handlePage();
        }
    });

    new MutationObserver(() => {
        if (window.location.pathname !== lastPath) {
            lastPath = window.location.pathname;
            console.log('Page change detected. Re-running script...');
            handlePage();
        }
    }).observe(document, { subtree: true, childList: true });
})();