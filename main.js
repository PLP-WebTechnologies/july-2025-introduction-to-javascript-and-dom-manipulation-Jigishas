let portfolio = [];
let marketPrices = {};
let autoSimulationInterval = null;

const tradingTips = [
    "Diversification is key - don't put all eggs in one basket!",
    "Buy low, sell high - but timing the market is nearly impossible.",
    "Research before investing - understand what you're buying.",
    "Set stop-losses to limit your downside risk.",
    "Dollar-cost averaging can reduce timing risk.",
    "Never invest money you can't afford to lose.",
    "Emotions are the enemy of good trading decisions.",
    "The market can stay irrational longer than you can stay solvent."
];

const stockCategories = {
    'AAPL': 'Technology',
    'GOOGL': 'Technology', 
    'AMZN': 'E-commerce',
    'TSLA': 'Electric Vehicles',
    'MSFT': 'Technology',
    'NVDA': 'Semiconductors'
};

function initializeApp() {
    console.log("Trading Portfolio Tracker initialized!");
    updateDashboard();
    
    const initialStocks = ['AAPL', 'GOOGL', 'AMZN', 'TSLA', 'MSFT', 'NVDA'];
    for (let i = 0; i < initialStocks.length; i++) {
        marketPrices[initialStocks[i]] = Math.random() * 200 + 50;
    }
}

function addStock() {
    const symbol = document.getElementById('stock-symbol').value.toUpperCase().trim();
    const shares = parseInt(document.getElementById('shares').value);
    const buyPrice = parseFloat(document.getElementById('buy-price').value);
    
    if (!symbol || !shares || !buyPrice) {
        alert('Please fill in all fields!');
        return;
    }
    
    if (shares <= 0 || buyPrice <= 0) {
        alert('Values must be positive!');
        return;
    }
    
    const existingStock = portfolio.find(stock => stock.symbol === symbol);
    
    if (existingStock) {
        const totalShares = existingStock.shares + shares;
        const totalCost = (existingStock.shares * existingStock.buyPrice) + (shares * buyPrice);
        existingStock.buyPrice = totalCost / totalShares;
        existingStock.shares = totalShares;
    } else {
        const newStock = {
            symbol: symbol,
            shares: shares,
            buyPrice: buyPrice,
            currentPrice: buyPrice
        };
        portfolio.push(newStock);
    }
    
    if (!marketPrices[symbol]) {
        marketPrices[symbol] = buyPrice;
    }
    
    updatePortfolioDisplay();
    updateDashboard();
    updateSimulatorDropdown();
    clearForm();
    
    alert(`Successfully added ${shares} shares of ${symbol} to your portfolio!`);
}

function calculatePortfolioStats() {
    let totalValue = 0;
    let totalCost = 0;
    let stockCount = portfolio.length;
    
    for (let i = 0; i < portfolio.length; i++) {
        const stock = portfolio[i];
        const currentPrice = marketPrices[stock.symbol] || stock.buyPrice;
        
        totalValue += stock.shares * currentPrice;
        totalCost += stock.shares * stock.buyPrice;
    }
    
    const gainLoss = totalValue - totalCost;
    
    return {
        totalValue: totalValue,
        totalCost: totalCost,
        gainLoss: gainLoss,
        stockCount: stockCount,
        gainLossPercent: totalCost > 0 ? (gainLoss / totalCost) * 100 : 0
    };
}

function formatCurrency(amount) {
    const isNegative = amount < 0;
    const absAmount = Math.abs(amount);
    const formatted = '$' + absAmount.toFixed(2);
    return isNegative ? '-' + formatted : formatted;
}

function generatePriceMovement(currentPrice) {
    const changePercent = (Math.random() - 0.5) * 0.1;
    const newPrice = currentPrice * (1 + changePercent);
    return Math.max(newPrice, 0.01);
}

function updatePortfolioDisplay() {
    const container = document.getElementById('portfolio-container');
    
    if (portfolio.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #666; margin: 20px 0;">No stocks in portfolio. Add your first stock above!</p>';
        return;
    }
    
    let htmlContent = '';
    
    for (let i = 0; i < portfolio.length; i++) {
        const stock = portfolio[i];
        const currentPrice = marketPrices[stock.symbol] || stock.buyPrice;
        const currentValue = stock.shares * currentPrice;
        const costBasis = stock.shares * stock.buyPrice;
        const gainLoss = currentValue - costBasis;
        const gainLossPercent = (gainLoss / costBasis) * 100;
        
        const cardClass = gainLoss >= 0 ? 'stock-item' : 'stock-item loss';
        const profitClass = gainLoss >= 0 ? 'profit' : 'loss';
        
        htmlContent += `
            <div class="${cardClass}" data-symbol="${stock.symbol}">
                <h4>${stock.symbol} - ${stockCategories[stock.symbol] || 'General'}</h4>
                <p><strong>Shares:</strong> ${stock.shares}</p>
                <p><strong>Avg Cost:</strong> ${formatCurrency(stock.buyPrice)}</p>
                <p><strong>Current Price:</strong> ${formatCurrency(currentPrice)}</p>
                <p><strong>Current Value:</strong> ${formatCurrency(currentValue)}</p>
                <p class="${profitClass}"><strong>P&L:</strong> ${formatCurrency(gainLoss)} (${gainLossPercent.toFixed(2)}%)</p>
                <button onclick="removeStock('${stock.symbol}')" class="danger">Remove</button>
            </div>
        `;
    }
    
    container.innerHTML = htmlContent;
}

function updateAllMarketPrices() {
    const symbols = Object.keys(marketPrices);
    
    symbols.forEach(function(symbol) {
        marketPrices[symbol] = generatePriceMovement(marketPrices[symbol]);
    });
    
    updatePortfolioDisplay();
    updateDashboard();
    updateCurrentPriceDisplay();
}

function generateMarketAnalysis() {
    let analysis = "📊 Market Analysis Report:\n\n";
    let symbolIndex = 0;
    const symbols = Object.keys(marketPrices);
    
    while (symbolIndex < symbols.length) {
        const symbol = symbols[symbolIndex];
        const price = marketPrices[symbol];
        const category = stockCategories[symbol] || 'General';
        
        if (price > 200) {
            analysis += `${symbol} (${category}): Premium stock at ${formatCurrency(price)} - High value play\n`;
        } else if (price > 100) {
            analysis += `${symbol} (${category}): Mid-cap stock at ${formatCurrency(price)} - Balanced choice\n`;
        } else {
            analysis += `${symbol} (${category}): Value stock at ${formatCurrency(price)} - Potential opportunity\n`;
        }
        
        symbolIndex++;
    }
    
    return analysis;
}

function updateDashboard() {
    const stats = calculatePortfolioStats();
    
    document.getElementById('total-value').textContent = formatCurrency(stats.totalValue);
    document.getElementById('total-value').className = 'stat-value';
    
    const gainLossElement = document.getElementById('total-gain-loss');
    gainLossElement.textContent = formatCurrency(stats.gainLoss);
    gainLossElement.className = stats.gainLoss >= 0 ? 'stat-value profit' : 'stat-value loss';
    
    document.getElementById('stock-count').textContent = stats.stockCount;
}

function startAutoSimulation() {
    if (Object.keys(marketPrices).length === 0) {
        alert('Add some stocks to your portfolio first!');
        return;
    }
    
    document.getElementById('auto-sim-btn').classList.add('hidden');
    document.getElementById('stop-sim-btn').classList.remove('hidden');
    
    autoSimulationInterval = setInterval(function() {
        updateAllMarketPrices();
    }, 2000);
}

function stopAutoSimulation() {
    if (autoSimulationInterval) {
        clearInterval(autoSimulationInterval);
        autoSimulationInterval = null;
    }
    
    document.getElementById('auto-sim-btn').classList.remove('hidden');
    document.getElementById('stop-sim-btn').classList.add('hidden');
}

function showTradingTip() {
    const randomIndex = Math.floor(Math.random() * tradingTips.length);
    const tip = tradingTips[randomIndex];
    
    const contentDiv = document.getElementById('education-content');
    contentDiv.innerHTML = `
        <h4>💡 Trading Tip #${randomIndex + 1}</h4>
        <p style="margin-top: 10px; font-size: 16px; line-height: 1.5;">${tip}</p>
    `;
}

function simulateMarketMovement() {
    const selectedSymbol = document.getElementById('sim-symbol').value;
    
    if (!selectedSymbol) {
        alert('Please select a stock first!');
        return;
    }
    
    const oldPrice = marketPrices[selectedSymbol];
    const newPrice = generatePriceMovement(oldPrice);
    marketPrices[selectedSymbol] = newPrice;
    
    updatePortfolioDisplay();
    updateDashboard();
    updateCurrentPriceDisplay();
}

function updateCurrentPriceDisplay() {
    const selectedSymbol = document.getElementById('sim-symbol').value;
    const priceDisplay = document.getElementById('current-price');
    
    if (selectedSymbol && marketPrices[selectedSymbol]) {
        priceDisplay.textContent = `${selectedSymbol}: ${formatCurrency(marketPrices[selectedSymbol])}`;
    } else {
        priceDisplay.textContent = 'Select a stock to see price';
    }
}

function updateSimulatorDropdown() {
    const dropdown = document.getElementById('sim-symbol');
    const currentValue = dropdown.value;
    
    dropdown.innerHTML = '<option value="">Choose a stock...</option>';
    
    portfolio.forEach(function(stock) {
        const option = document.createElement('option');
        option.value = stock.symbol;
        option.textContent = stock.symbol;
        dropdown.appendChild(option);
    });
    
    if (currentValue && portfolio.find(stock => stock.symbol === currentValue)) {
        dropdown.value = currentValue;
        document.getElementById('simulate-btn').disabled = false;
    } else {
        document.getElementById('simulate-btn').disabled = dropdown.value === '';
    }
}

function removeStock(symbol) {
    if (confirm(`Are you sure you want to remove ${symbol} from your portfolio?`)) {
        portfolio = portfolio.filter(stock => stock.symbol !== symbol);
        
        updatePortfolioDisplay();
        updateDashboard();
        updateSimulatorDropdown();
    }
}

function clearForm() {
    document.getElementById('stock-symbol').value = '';
    document.getElementById('shares').value = '';
    document.getElementById('buy-price').value = '';
}

function clearPortfolio() {
    if (portfolio.length === 0) {
        alert('Portfolio is already empty!');
        return;
    }
    
    if (confirm('Are you sure you want to clear your entire portfolio?')) {
        portfolio = [];
        stopAutoSimulation();
        updatePortfolioDisplay();
        updateDashboard();
        updateSimulatorDropdown();
    }
}

function sortPortfolio(criteria) {
    if (portfolio.length === 0) {
        alert('No stocks to sort!');
        return;
    }
    
    if (criteria === 'symbol') {
        portfolio.sort(function(a, b) {
            return a.symbol.localeCompare(b.symbol);
        });
    } else if (criteria === 'value') {
        portfolio.sort(function(a, b) {
            const valueA = a.shares * (marketPrices[a.symbol] || a.buyPrice);
            const valueB = b.shares * (marketPrices[b.symbol] || b.buyPrice);
            return valueB - valueA;
        });
    }
    
    updatePortfolioDisplay();
}

function calculateRiskReward() {
    if (portfolio.length === 0) {
        document.getElementById('education-content').innerHTML = `
            <h4>⚖️ Risk/Reward Calculator</h4>
            <p>Add stocks to your portfolio first to calculate risk/reward ratios!</p>
        `;
        return;
    }
    
    let content = '<h4>⚖️ Portfolio Risk/Reward Analysis</h4>';
    let totalRisk = 0;
    
    for (let i = 0; i < portfolio.length; i++) {
        const stock = portfolio[i];
        const currentPrice = marketPrices[stock.symbol] || stock.buyPrice;
        const riskPercent = Math.abs((currentPrice - stock.buyPrice) / stock.buyPrice * 100);
        totalRisk += riskPercent;
        
        content += `<p><strong>${stock.symbol}:</strong> ${riskPercent.toFixed(1)}% volatility</p>`;
    }
    
    const avgRisk = totalRisk / portfolio.length;
    content += `<p style="margin-top: 15px;"><strong>Portfolio Average Risk:</strong> ${avgRisk.toFixed(1)}%</p>`;
    
    if (avgRisk > 15) {
        content += '<p style="color: #e74c3c;">⚠️ High risk portfolio - consider diversification!</p>';
    } else if (avgRisk > 8) {
        content += '<p style="color: #f39c12;">⚡ Moderate risk portfolio - well balanced!</p>';
    } else {
        content += '<p style="color: #27ae60;">✅ Low risk portfolio - conservative approach!</p>';
    }
    
    document.getElementById('education-content').innerHTML = content;
}

function showMarketAnalysis() {
    const analysis = generateMarketAnalysis();
    document.getElementById('education-content').innerHTML = `
        <h4>📈 Live Market Analysis</h4>
        <pre style="white-space: pre-wrap; margin-top: 10px;">${analysis}</pre>
    `;
}

document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    
    document.getElementById('sim-symbol').addEventListener('change', function() {
        const isSelected = this.value !== '';
        document.getElementById('simulate-btn').disabled = !isSelected;
        updateCurrentPriceDisplay();
    });
    
    document.getElementById('stock-symbol').addEventListener('input', function() {
        this.value = this.value.replace(/[^A-Za-z]/g, '');
    });
    
    document.getElementById('shares').addEventListener('input', function() {
        if (this.value < 0) this.value = '';
    });
    
    document.getElementById('buy-price').addEventListener('input', function() {
        if (this.value < 0) this.value = '';
    });
});
