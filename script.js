document.addEventListener("DOMContentLoaded", () => {
    const leagueSelect = document.getElementById("league-select");
    const player1Input = document.getElementById("player1-input");
    const player2Input = document.getElementById("player2-input");
    const compareBtn = document.getElementById("compare-btn");
    const resultDiv = document.getElementById("comparison-result");
    
    let allData = {};
    let selectedLeague = "";
    let playerNames = [];

    leagueSelect.addEventListener("change", () => {
        selectedLeague = leagueSelect.value;
        player1Input.value = "";
        player2Input.value = "";
        resultDiv.innerHTML = "";
        compareBtn.disabled = true;

        document.getElementById("suggestions1").innerHTML = ""; // Clear previous suggestions
        document.getElementById("suggestions2").innerHTML = ""; // Clear previous suggestions

        player1Input.disabled = false;
        player2Input.disabled = false;

        fetchDataForLeague(selectedLeague);
    });

    function fetchDataForLeague(leagueName) {
        fetch(`jsons/${leagueName}.json`)
            .then(response => response.json())
            .then(data => {
                allData = data;
                playerNames = Object.keys(data[Object.keys(data)[0]]);
            })
            .catch(error => {
                console.error("Error loading data:", error);
            });
    }

    player1Input.addEventListener("input", () => {
        showSuggestions(player1Input.value, "suggestions1");
    });

    player2Input.addEventListener("input", () => {
        showSuggestions(player2Input.value, "suggestions2");
    });

    function showSuggestions(input, suggestionsId) {
        const suggestionsDiv = document.getElementById(suggestionsId);
        suggestionsDiv.innerHTML = ""; // Clear previous suggestions
        const filteredNames = playerNames.filter(name => name.toLowerCase().includes(input.toLowerCase()));
        
        filteredNames.forEach(name => {
            const suggestion = document.createElement("div");
            suggestion.textContent = name;
            suggestion.classList.add("suggestion-item");
            suggestion.addEventListener("click", () => {
                if (suggestionsId === "suggestions1") {
                    player1Input.value = name;
                } else {
                    player2Input.value = name;
                }
                suggestionsDiv.innerHTML = ""; // Clear suggestions after selection
                compareBtn.disabled = false; // Enable compare button if both inputs are filled
                checkInputs();
            });
            suggestionsDiv.appendChild(suggestion);
        });
    }

    function checkInputs() {
        const player1 = player1Input.value;
        const player2 = player2Input.value;
        compareBtn.disabled = !player1 || !player2 || player1 === player2;
    }

    compareBtn.addEventListener("click", () => {
        const player1 = player1Input.value;
        const player2 = player2Input.value;

        if (player1 === player2) {
            alert("Please choose different players.");
            return;
        }

        const comparisonData = {};
        for (const stat in allData) {
            comparisonData[stat] = {
                [player1]: allData[stat][player1],
                [player2]: allData[stat][player2]
            };
        }

        displayComparison(comparisonData, player1, player2);
    });

    function displayComparison(comparisonData, player1, player2) {
        resultDiv.innerHTML = "<h2>Results</h2>";
        const table = document.createElement("table");

        table.innerHTML = "<tr><th>Stats</th><th>" + player1 + "</th><th>" + player2 + "</th></tr>";

        const statOrder = [
            "FotMob Rating",
            "Goals",
            "Expected Goals (xG)",
            "Goals (per match)",
            "Expected Goals (xG - per match)",
            "Assists",
            "Expected Assists (xA)",
            "Expected Assists (xA - per match)",
            "Goals + Assists",
            "xG + xA (per match)",
            "Goals Conceded (per match)",
            "Goals Prevented",
            "Shots (per match)",
            "Shots on Target (per match)",
            "Big Chances Created",
            "Big Chances Missed",
            "Penalties Awarded",
            "Penalties Conceded",
            "Accurate Long Balls (per match)",
            "Accurate Passes (per match)",
            "Successful Dribbles (per match)",
            "Possession Won Final 3rd (per match)",
            "Blocks (per match)",
            "Successful Tackles (per match)",
            "Clearences (per match)",
            "Interceptions (per match)",
            "Fouls (per match)",
            "Saves (per match)",
            "Save Percentage",
            "Clean Sheets",
            "Red Card",
            "Yellow Card"
        ];

        const lowerIsBetterStats = [
            "Big Chances Missed",
            "Fouls (per match)",
            "Goals Conceded (per match)",
            "Penalties Conceded",
            "xG Conceded",
            "Yellow Card",
            "Red Card"
        ];

        statOrder.forEach(stat => {
            if (comparisonData[stat]) {
                const row = document.createElement("tr");
                const value1 = comparisonData[stat][player1];
                const value2 = comparisonData[stat][player2];

                const cell1Class = lowerIsBetterStats.includes(stat) ? (value1 < value2 ? 'highlight' : '') : (value1 > value2 ? 'highlight' : '');
                const cell2Class = lowerIsBetterStats.includes(stat) ? (value2 < value1 ? 'highlight' : '') : (value2 > value1 ? 'highlight' : '');

                row.innerHTML = `
                    <td>${stat}</td>
                    <td class="${cell1Class}">${value1}</td>
                    <td class="${cell2Class}">${value2}</td>`;
                table.appendChild(row);
            }
        });

        resultDiv.appendChild(table);
    }
});
function filterSuggestions(inputValue, suggestionsContainer) {
    suggestionsContainer.innerHTML = ""; // Clear previous suggestions
    if (inputValue) {
        const filteredPlayers = players.filter(player =>
            player.name.toLowerCase().includes(inputValue.toLowerCase())
        );

        filteredPlayers.forEach(player => {
            const suggestionItem = document.createElement("div");
            suggestionItem.classList.add("suggestion-item");
            suggestionItem.textContent = player.name;
            suggestionItem.onclick = () => {
                document.getElementById(suggestionsContainer.id.replace("suggestions", "input")).value = player.name;
                suggestionsContainer.innerHTML = ""; // Clear suggestions after selection
            };
            suggestionsContainer.appendChild(suggestionItem);
        });
    }
}

// Enable/disable player inputs based on league selection
document.getElementById("league-select").addEventListener("change", function() {
    document.getElementById("player1-input").disabled = false;
    document.getElementById("player2-input").disabled = false;
});

// Handle input for player 1
const player1Input = document.getElementById("player1-input");
const suggestions1 = document.getElementById("suggestions1");

player1Input.addEventListener("input", function() {
    filterSuggestions(player1Input.value, suggestions1);
});

player1Input.addEventListener("blur", function() {
    setTimeout(() => {
        suggestions1.innerHTML = ""; // Clear suggestions on blur
    }, 100); // Timeout to allow click on suggestion
});

// Handle input for player 2
const player2Input = document.getElementById("player2-input");
const suggestions2 = document.getElementById("suggestions2");

player2Input.addEventListener("input", function() {
    filterSuggestions(player2Input.value, suggestions2);
});

player2Input.addEventListener("blur", function() {
    setTimeout(() => {
        suggestions2.innerHTML = ""; // Clear suggestions on blur
    }, 100); // Timeout to allow click on suggestion
});

// Optional: Prevent suggestions from disappearing when clicking on a suggestion
suggestions1.addEventListener("mousedown", function(event) {
    event.preventDefault(); // Prevent blur event from firing
});

suggestions2.addEventListener("mousedown", function(event) {
    event.preventDefault(); // Prevent blur event from firing
});