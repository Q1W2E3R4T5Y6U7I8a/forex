// Build Flat24 URL based on filters
function buildFlat24Url() {
    const cityId = document.getElementById('city-select').value;
    const priceMin = document.getElementById('price-min').value;
    const priceMax = document.getElementById('price-max').value;
    const sqmMax = document.getElementById('sqm-max').value;
    const sort = document.getElementById('sort-select').value;
    
    return `https://flatfy.ua/uk/search?currency=USD&geo_id=${cityId}&has_eoselia=false&is_without_fee=false&price_max=${priceMax}&price_min=${priceMin}&price_sqm_currency=USD&price_sqm_max=${sqmMax}&section_id=1&sort=${sort}`;
}

// Update Flat24 link
function updateFlat24Link() {
    const url = buildFlat24Url();
    document.getElementById('flat24-url').href = url;
}

// Investment calculator
// Tab switching
function switchCalcTab(tab) {
    document.querySelectorAll('.calc-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.calculator-pane').forEach(p => p.classList.remove('active'));
    
    event.target.classList.add('active');
    document.getElementById(`calc-${tab}`).classList.add('active');
}

// Cash calculator with appreciation
function updateCashAppreciation() {
    const val = document.getElementById('cash-appreciation').value;
    document.getElementById('cash-appreciation-value').textContent = val + '%';
}

function calculateCash() {
    const price = parseFloat(document.getElementById('cash-price').value) || 0;
    const area = parseFloat(document.getElementById('cash-area').value) || 1;
    const rent = parseFloat(document.getElementById('cash-rent').value) || 0;
    const maintenance = parseFloat(document.getElementById('cash-maintenance').value) || 0;
    const appreciation = parseFloat(document.getElementById('cash-appreciation').value) || 0;
    
    const pricePerSqm = price / area;
    const annualRent = rent * 12;
    const annualExpenses = maintenance;
    const netRentalIncome = annualRent - annualExpenses;
    const appreciationGain = price * (appreciation / 100);
    const totalAnnualIncome = netRentalIncome + appreciationGain;
    
    const roi = price > 0 ? (totalAnnualIncome / price) * 100 : 0;
    const capRate = price > 0 ? (netRentalIncome / price) * 100 : 0;
    const payback = netRentalIncome > 0 ? price / netRentalIncome : 999;
    
    document.getElementById('cash-price-per-sqm').textContent = '$' + pricePerSqm.toFixed(0);
    document.getElementById('cash-rental-income').textContent = '$' + annualRent.toFixed(0);
    document.getElementById('cash-expenses').textContent = '$' + annualExpenses.toFixed(0);
    document.getElementById('cash-net-rental').textContent = '$' + netRentalIncome.toFixed(0);
    document.getElementById('cash-appreciation-gain').textContent = '$' + appreciationGain.toFixed(0);
    document.getElementById('cash-total-income').textContent = '$' + totalAnnualIncome.toFixed(0);
    document.getElementById('cash-roi').textContent = roi.toFixed(1) + '%';
    document.getElementById('cash-cap-rate').textContent = capRate.toFixed(1) + '%';
    document.getElementById('cash-payback').textContent = payback < 50 ? payback.toFixed(1) + ' років' : '>50 років';
    
    // Color coding
    document.getElementById('cash-net-rental').style.color = netRentalIncome >= 0 ? '#4ade80' : '#ef4444';
}

// Yeoselya calculator
function calculateYeoselya() {
    const price = parseFloat(document.getElementById('yeoselya-price').value) || 0;
    const downPercent = parseFloat(document.getElementById('yeoselya-down').value) || 20;
    const term = parseInt(document.getElementById('yeoselya-term').value) || 20;
    const rate1 = parseFloat(document.getElementById('yeoselya-rate1').value) || 3;
    const rate2 = parseFloat(document.getElementById('yeoselya-rate2').value) || 6;
    const insuranceRate = parseFloat(document.getElementById('yeoselya-insurance').value) || 1.25;
    const feeRate = parseFloat(document.getElementById('yeoselya-fee').value) || 1;
    const extra = parseFloat(document.getElementById('yeoselya-extra').value) || 0;
    
    const downPayment = price * (downPercent / 100);
    const loanAmount = price - downPayment;
    const monthlyRate1 = rate1 / 100 / 12;
    const monthlyRate2 = rate2 / 100 / 12;
    const payments1 = Math.min(term, 10) * 12;
    const payments2 = Math.max(0, term - 10) * 12;
    
    // Monthly payment first 10 years
    let payment1 = 0;
    if (payments1 > 0 && monthlyRate1 > 0) {
        payment1 = loanAmount * 
            (monthlyRate1 * Math.pow(1 + monthlyRate1, payments1 + payments2)) / 
            (Math.pow(1 + monthlyRate1, payments1 + payments2) - 1);
    } else {
        payment1 = loanAmount / (payments1 + payments2);
    }
    
    // Monthly payment after 10 years
    let payment2 = payment1;
    if (payments2 > 0 && monthlyRate2 > 0) {
        const remainingAfter10 = loanAmount * Math.pow(1 + monthlyRate1, payments1) - 
            payment1 * (Math.pow(1 + monthlyRate1, payments1) - 1) / monthlyRate1;
        payment2 = remainingAfter10 * 
            (monthlyRate2 * Math.pow(1 + monthlyRate2, payments2)) / 
            (Math.pow(1 + monthlyRate2, payments2) - 1);
    }
    
    const monthlyInsurance = (price * (insuranceRate / 100)) / 12;
    const upfrontFees = loanAmount * (feeRate / 100) + extra;
    const totalInterest = (payment1 * payments1 + payment2 * payments2) - loanAmount;
    
    document.getElementById('yeoselya-loan').textContent = formatMoney(loanAmount) + ' грн';
    document.getElementById('yeoselya-down-amount').textContent = formatMoney(downPayment) + ' грн';
    document.getElementById('yeoselya-payment1').textContent = formatMoney(payment1 + monthlyInsurance) + ' грн';
    document.getElementById('yeoselya-payment2').textContent = formatMoney(payment2 + monthlyInsurance) + ' грн';
    document.getElementById('yeoselya-ins-month').textContent = formatMoney(monthlyInsurance) + ' грн';
    document.getElementById('yeoselya-upfront').textContent = formatMoney(upfrontFees) + ' грн';
    document.getElementById('yeoselya-total-interest').textContent = formatMoney(totalInterest) + ' грн';
}

// Custom mortgage calculator
function updateCustomAppreciation() {
    const val = document.getElementById('custom-appreciation').value;
    document.getElementById('custom-appreciation-value').textContent = val + '%';
}

function calculateCustom() {
    const price = parseFloat(document.getElementById('custom-price').value) || 0;
    const downPercent = parseFloat(document.getElementById('custom-down').value) || 20;
    const rate = parseFloat(document.getElementById('custom-rate').value) || 5;
    const term = parseInt(document.getElementById('custom-term').value) || 20;
    const rent = parseFloat(document.getElementById('custom-rent').value) || 0;
    const appreciation = parseFloat(document.getElementById('custom-appreciation').value) || 0;
    
    const downPayment = price * (downPercent / 100);
    const loanAmount = price - downPayment;
    const monthlyRate = rate / 100 / 12;
    const payments = term * 12;
    
    let monthlyPayment = 0;
    if (payments > 0 && monthlyRate > 0) {
        monthlyPayment = loanAmount * 
            (monthlyRate * Math.pow(1 + monthlyRate, payments)) / 
            (Math.pow(1 + monthlyRate, payments) - 1);
    } else {
        monthlyPayment = loanAmount / payments;
    }
    
    const annualRent = rent * 12;
    const annualAppreciation = price * (appreciation / 100);
    const annualMortgage = monthlyPayment * 12;
    const netAnnualIncome = annualRent - annualMortgage + annualAppreciation;
    const roi = downPayment > 0 ? (netAnnualIncome / downPayment) * 100 : 0;
    const dscr = annualMortgage > 0 ? annualRent / annualMortgage : 0;
    
    document.getElementById('custom-loan').textContent = '$' + loanAmount.toFixed(0);
    document.getElementById('custom-down-amount').textContent = '$' + downPayment.toFixed(0);
    document.getElementById('custom-payment').textContent = '$' + monthlyPayment.toFixed(0);
    document.getElementById('custom-net').textContent = '$' + (rent - monthlyPayment).toFixed(0);
    document.getElementById('custom-roi').textContent = roi.toFixed(1) + '%';
    document.getElementById('custom-dscr').textContent = dscr.toFixed(2);
    
    document.getElementById('custom-net').style.color = (rent - monthlyPayment) >= 0 ? '#4ade80' : '#ef4444';
}

// Helper functions
function formatMoney(amount) {
    return Math.round(amount).toLocaleString('uk-UA');
}

// Build Flat24 URL
function buildFlat24Url() {
    const cityId = document.getElementById('city-select').value;
    const priceMin = document.getElementById('price-min').value;
    const priceMax = document.getElementById('price-max').value;
    const sqmMax = document.getElementById('sqm-max').value;
    const sort = document.getElementById('sort-select').value;
    
    return `https://flatfy.ua/uk/search?currency=USD&geo_id=${cityId}&price_max=${priceMax}&price_min=${priceMin}&price_sqm_max=${sqmMax}&section_id=1&sort=${sort}`;
}

// Update Flat24 link
document.getElementById('search-btn').addEventListener('click', function(e) {
    e.preventDefault();
    window.open(buildFlat24Url(), '_blank');
});

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    calculateCash();
    calculateYeoselya();
    calculateCustom();
});

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    updateFlat24Link();
    calculateInvestment();
    initComparisonChart();
    
    document.getElementById('search-btn').addEventListener('click', function(e) {
        e.preventDefault();
        updateFlat24Link();
        window.open(buildFlat24Url(), '_blank');
    });
    
    ['city-select', 'price-min', 'price-max', 'sqm-max', 'sort-select'].forEach(id => {
        document.getElementById(id).addEventListener('change', updateFlat24Link);
    });
});