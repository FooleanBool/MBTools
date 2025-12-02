// Handicap Bonus Calculator Logic
function calculateHandicap() {
    // Get input values
    const mainBackStake = parseFloat(document.getElementById('mainBackStake').value) || 0;
    const mainBackOdds = parseFloat(document.getElementById('mainBackOdds').value) || 0;
    const mainLayOdds = parseFloat(document.getElementById('mainLayOdds').value) || 0;
    const mainLayCommission = parseFloat(document.getElementById('mainLayCommission').value) || 0;
    
    const h1LayOdds = parseFloat(document.getElementById('h1LayOdds').value) || 0;
    const h1Commission = parseFloat(document.getElementById('h1Commission').value) || 0;
    
    const h2LayOdds = parseFloat(document.getElementById('h2LayOdds').value) || 0;
    const h2Commission = parseFloat(document.getElementById('h2Commission').value) || 0;

    // Clear previous error message
    document.getElementById('errorMessage').style.display = 'none';

    // Validation
    if (mainBackStake <= 0 || mainBackOdds < 1 || mainLayOdds < 1 || 
        h1LayOdds < 1 || h2LayOdds < 1 ||
        mainLayCommission < 0 || mainLayCommission > 1 ||
        h1Commission < 0 || h1Commission > 1 ||
        h2Commission < 0 || h2Commission > 1) {
        showError('Please enter valid values. Odds must be ≥ 1.0, commission between 0-1, stake > 0');
        return;
    }

    // Calculate main bet results
    const mainBetResults = calculateMainBet(mainBackStake, mainBackOdds, mainLayOdds, mainLayCommission);
    
    // Calculate handicap lay stakes
    // Based on user instruction: "divide the main bet potential bookmaker profit by the lay stake"
    // Bookmaker profit = (back odds - 1) * back stake
    const bookmakerProfit = (mainBackOdds - 1) * mainBackStake;
    
    // Calculate lay stakes for handicaps
    const h1LayStake = h1LayOdds > 0 ? bookmakerProfit / h1LayOdds : 0;
    const h2LayStake = h2LayOdds > 0 ? bookmakerProfit / h2LayOdds : 0;
    
    // Calculate liabilities for handicaps
    const h1Liability = h1LayStake * (h1LayOdds - 1);
    const h2Liability = h2LayStake * (h2LayOdds - 1);
    
    // Calculate main bet liability
    const mainBetLiability = mainBetResults.totalLayStake * (mainLayOdds - 1);
    
    // Calculate total liability (main bet + both handicap lay bets)
    const totalLiability = mainBetLiability + h1Liability + h2Liability;
    
    // Display main bet results
    document.getElementById('totalBackStake').textContent = mainBetResults.totalBackStake.toFixed(2);
    document.getElementById('totalLayStake').textContent = mainBetResults.totalLayStake.toFixed(2);
    document.getElementById('qualifyingLoss').textContent = mainBetResults.qualifyingLoss.toFixed(2);
    
    // Display handicap results (combined format)
    document.getElementById('h1Combined').textContent = `${h1LayStake.toFixed(2)} (£${h1Liability.toFixed(2)})`;
    document.getElementById('h2Combined').textContent = `${h2LayStake.toFixed(2)} (£${h2Liability.toFixed(2)})`;
    
    // Calculate and display summary results
    const summaryResults = calculateSummary(mainBetResults, bookmakerProfit, h1LayStake, h2LayStake);
    
    document.getElementById('totalLiability').textContent = totalLiability.toFixed(2);
    document.getElementById('layH1Stake').textContent = h1LayStake.toFixed(2);
    document.getElementById('layH2Stake').textContent = h2LayStake.toFixed(2);
    document.getElementById('combinedProfit').textContent = summaryResults.combinedProfit.toFixed(2);
}

function calculateMainBet(backStake, backOdds, layOdds, layCommission) {
    // Calculate optimal lay stake using matched betting formula
    // Lay stake = (back odds / (lay odds - commission)) * back stake
    const totalLayStake = (backOdds / (layOdds - layCommission)) * backStake;
    
    // Calculate profit if back bet wins
    // Profit = (back odds - 1) * back stake - (lay odds - 1) * lay stake
    const backWinProfit = (backOdds - 1) * backStake - (layOdds - 1) * totalLayStake;
    
    // Calculate profit if lay bet wins (qualifying loss)
    // Profit = lay stake * (1 - commission) - back stake
    const qualifyingLoss = totalLayStake * (1 - layCommission) - backStake;
    
    return {
        totalBackStake: backStake,
        totalLayStake: totalLayStake,
        backWinProfit: backWinProfit,
        qualifyingLoss: qualifyingLoss
    };
}

function calculateSummary(mainBetResults, bookmakerProfit, h1LayStake, h2LayStake) {
    // Bookmaker return (minus stake) = profit if back bet wins
    const bookmakerReturn = mainBetResults.backWinProfit;
    
    // Combined profit overall:
    // Bookmaker return (minus stake) + lay h1 stake + lay h2 stake
    const combinedProfit = bookmakerReturn + h1LayStake + h2LayStake;
    
    return {
        bookmakerReturn: bookmakerReturn,
        combinedProfit: combinedProfit
    };
}

function showError(message) {
    const errorDiv = document.getElementById('errorMessage');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';

    // Clear all results
    const resultIds = [
        'totalBackStake', 'totalLayStake', 'qualifyingLoss',
        'h1Combined', 'h2Combined',
        'totalLiability', 'layH1Stake', 'layH2Stake', 'combinedProfit'
    ];
    
    resultIds.forEach(id => {
        document.getElementById(id).textContent = '--';
    });
}



// Add event listeners for real-time calculation
document.addEventListener('DOMContentLoaded', function() {
    const inputs = [
        'mainBackStake', 'mainBackOdds', 'mainLayOdds', 'mainLayCommission',
        'h1LayOdds', 'h1Commission',
        'h2LayOdds', 'h2Commission'
    ];

    inputs.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('input', calculateHandicap);
        }
    });
});