const statLabels = {
    HP: { label: "Health", unit: "HP" },
    attackPower: { label: "Attack Power", unit: "" },
    spellPower: { label: "Spell Power", unit: "" },
    hitChance: { label: "Hit Chance", unit: "%" },
    haste: { label: "Haste", unit: "%" },
    critChance: { label: "Crit Chance", unit: "%" },
    dodge: { label: "Dodge", unit: "%" },
    critMod: { label: "Crit Multiplier", unit: "%" },
    magIn: { label: "Magic Damage Taken", unit: "%" },
    magOut: { label: "Magic Damage Dealt", unit: "%" },
};

const modelLabels = {
    meleeTank: "Tank Melee",
    meleeDodge: "Dodge Melee",
    meleePower: "Power Melee",
    casterOffensive: "Offensive Caster",
    casterDefensive: "Defensive Caster",
    casterPower: "Power Caster",
    hybridFull: "Full Hybrid",
    hybridLuck: "Luck Hybrid",
};

const resultSummary = document.getElementById("result-summary");
const resultsGrid = document.getElementById("results-grid");
const emptyState = document.getElementById("empty-state");

let savedResult;
try {
    savedResult = sessionStorage.getItem("aqwCalcResult");
} catch (error) {
    console.error("Unable to read the calculated stats from browser storage.", error);
    resultSummary.textContent = "Your browser blocked access to the saved build.";
    emptyState.hidden = false;
}

if (savedResult) {
    try {
        const { playerStats, modelName, result } = JSON.parse(savedResult);
        if (!playerStats || !result || !modelLabels[modelName]) {
            throw new Error("Saved calculator results have an invalid format.");
        }

        resultSummary.textContent =
            `${modelLabels[modelName]} · Level ${playerStats.currentLevel}`;

        for (const [key, value] of Object.entries(result)) {
            const stat = statLabels[key];
            if (!stat || !Number.isFinite(value)) {
                continue;
            }

            const card = document.createElement("article");
            card.className = "result-card";

            const label = document.createElement("h2");
            label.textContent = stat.label;

            const statValue = document.createElement("p");
            statValue.className = "result-value";
            const formattedValue = stat.unit === "%"
                ? value.toFixed(2)
                : Number(value.toFixed(2)).toString();
            statValue.textContent = `${formattedValue}${stat.unit ? ` ${stat.unit}` : ""}`;

            card.append(label, statValue);
            resultsGrid.append(card);
        }
    } catch (error) {
        console.error("Unable to display the saved calculator results.", error);
        resultSummary.textContent = "Those results could not be read.";
        emptyState.hidden = false;
    }
} else if (emptyState.hidden) {
    resultSummary.textContent = "Your build report will appear here after calculation.";
    emptyState.hidden = false;
}
