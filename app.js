function readPlayerStats() {
    const readNumber = (id, fallback) => {
        const value = document.getElementById(id).value;
        return value === "" ? fallback : Number(value);
    };

    return {
        str: readNumber("str", 0),
        int: readNumber("int", 0),
        wis: readNumber("wis", 0),
        dex: readNumber("dex", 0),
        luck: readNumber("luck", 0),
        end: readNumber("end", 0),
        currentLevel: readNumber("playerLvl", 100),
    };
}

const statModels = {
    meleeTank: {
        HP: { end: 5 },
        attackPower: { str: 2, luck: 0.7 },
        spellPower: { int: 2 },
        hitChance: { base: 90, dex: 0.2, luck: 0.1 },
        haste: { dex: 0.3, luck: 0.1 },
        critChance: { base: 5, str: 0.4, luck: 0.2 },
        dodge: { base: 4, dex: 0.3, wis: 0.3, luck: 0.1 },
        critMod: { base: 150, luck: 5 },
        magIn: { base: 100, int: -1},
        magOut: { base: 100 },
    },

    meleeDodge: {
        HP: { end: 5 },
        attackPower: { str: 2, luck: 0.7 },
        spellPower: { int: 2 },
        hitChance: { base: 90, dex: 0.2, luck: 0.1 },
        haste: { dex: 0.5, luck: 0.1 },
        critChance: { base: 5, str: 0.4, luck: 0.2 },
        dodge: { base: 4, dex: 0.5, wis: 0.3, luck: 0.1 },
        critMod: { base: 150, luck: 5 },
        magIn: { base: 100, int: -1},
        magOut: { base: 100 },
    },
    meleePower: {
        HP: { end: 5 },
        attackPower: { str: 2, luck: 0.7 },
        spellPower: { int: 2 },
        hitChance: { base: 90, dex: 0.2, luck: 0.1 },
        haste: { dex: 0.5, luck: 0.1 },
        critChance: { base: 5, str: 0.7, luck: 0.2 },
        dodge: { base: 4, dex: 0.3, wis: 0.3, luck: 0.1 },
        critMod: { base: 150, luck: 5 },
        magIn: { base: 100, int: -1},
        magOut: { base: 100 },
    },
    casterOffensive: {
        HP: { end: 5 },
        attackPower: { str: 2 },
        spellPower: { int: 2, luck: 0.7 },
        hitChance: { base: 90, wis: 0.2, luck: 0.1 },
        haste: { int: 0.3, luck: 0.1 },
        critChance: { base: 5, wis: 0.7, luck: 0.2 },
        dodge: { base: 4, dex: 0.3, wis: 0.3, luck: 0.1 },
        critMod: { base: 150, luck: 5 },
        magIn: { base: 100, int: -1},
        magOut: { base: 100, int: 1 },
    },
    casterDefensive: {
        HP: { end: 5 },
        attackPower: { str: 2 },
        spellPower: { int: 2, luck: 0.7 },
        hitChance: { base: 90, wis: 0.2, luck: 0.1 },
        haste: { int: 0.5, luck: 0.1 },
        critChance: { base: 5, wis: 0.4, luck: 0.2 },
        dodge: { base: 4, dex: 0.3, wis: 0.3, luck: 0.1 },
        critMod: { base: 150, luck: 5 },
        magIn: { base: 100, int: -1},
        magOut: { base: 100, int: 1 },
    },
    casterPower: {
        HP: { end: 5 },
        attackPower: { str: 2 },
        spellPower: { int: 2, luck: 0.7 },
        hitChance: { base: 90, wis: 0.2, luck: 0.1 },
        haste: { int: 0.3, luck: 0.1 },
        critChance: { base: 5, wis: 0.4, luck: 0.2 },
        dodge: { base: 4, dex: 0.3, wis: 0.3, luck: 0.1 },
        critMod: { base: 150, luck: 5 },
        magIn: { base: 100, int: -1},
        magOut: { base: 100, int: 1 },
    },
    hybridFull: {
        HP: { end: 5 },
        attackPower: { str: 2, luck: 0.7 },
        spellPower: { int: 2, luck: 0.7 },
        hitChance: { base: 90, dex: 0.2, luck: 0.1 },
        haste: { int: 0.3,dex: 0.3, luck: 0.1 },
        critChance: { base: 5, str: 0.4, luck: 0.2 },
        dodge: { base: 4, dex: 0.5, wis: 0.3, luck: 0.1 },
        critMod: { base: 150, luck: 5 },
        magIn: { base: 100, int: -1},
        magOut: { base: 100, int: 1 },
    },
    hybridLuck: {
        HP: { end: 5 },
        attackPower: { str: 1.4, luck: 1 },
        spellPower: { int: 1.4, luck: 1 },
        hitChance: { base: 90, dex: 0.2, wis: 0.2, luck: 0.1 },
        haste: { int: 0.3, dex: 0.3, luck: 0.3 },
        critChance: { base: 5, str: 0.4, wis: 0.4,luck: 0.3 },
        dodge: { base: 4, dex: 0.3, wis: 0.3, luck: 0.25 },
        critMod: { base: 150, luck: 2.5 },
        magIn: { base: 100, int: -1},
        magOut: { base: 100 },
    },

};

function calculateStats(playerStats, statModel) {
    const model = statModels[statModel];

    if (!model) {
        throw new Error(`Stat model "${statModel}" not found.`);
    }

    const baseHP =
        ((playerStats.currentLevel - 1) / (100 - 1)) ** 0.66 *
            1640 +
        360;
    const efficiency = 16000 / (63 * baseHP);
    const efficiencyStats = new Set([
        "hitChance", "haste", "critChance", "dodge", "critMod", "magIn", "magOut",
    ]);
    const twoDecimalStats = new Set([
        "critChance", "hitChance", "critMod", "dodge", "haste", "magIn", "magOut"
    ]);

    const stats = {};
    for (const [stat, values] of Object.entries(model)) {
        const { base: modelBase = 0, ...weights } = values;
        const base = stat === "HP" ? baseHP : modelBase;
        const convertedStats = Object.entries(weights).reduce((total, [key, multiplier]) => {
            return total + playerStats[key] * multiplier;
        }, 0);

        const value =
            base + convertedStats * (efficiencyStats.has(stat) ? efficiency : 1);
        stats[stat] = ["attackPower", "spellPower"].includes(stat)
            ? Math.round(value)
            : twoDecimalStats.has(stat)
              ? Number(value.toFixed(2))
              : value;
    }

    return stats;
};

try {
    const savedResult = sessionStorage.getItem("aqwCalcResult");
    if (savedResult) {
        const { playerStats, modelName } = JSON.parse(savedResult);
        const inputIds = {
            str: "str",
            int: "int",
            wis: "wis",
            dex: "dex",
            luck: "luck",
            end: "end",
            currentLevel: "playerLvl",
        };

        for (const [stat, id] of Object.entries(inputIds)) {
            if (Number.isFinite(playerStats?.[stat])) {
                document.getElementById(id).value = playerStats[stat];
            }
        }

        if (statModels[modelName]) {
            document.getElementById("stat-model").value = modelName;
        }
    }
} catch (error) {
    console.error("Unable to restore the previous calculator inputs.", error);
}

document.getElementById("stats-form").addEventListener("submit", (event) => {
    event.preventDefault(); // Keep the page from reloading.

    const form = event.currentTarget;
    if (!form.reportValidity()) {
        return;
    }

    const modelName = document.getElementById("stat-model").value;
    const playerStats = readPlayerStats();
    if (playerStats.currentLevel > playerStats.maxLevel) {
        const currentLevelInput = document.getElementById("current-level");
        currentLevelInput.setCustomValidity("Current level cannot exceed max level.");
        currentLevelInput.reportValidity();
        currentLevelInput.setCustomValidity("");
        return;
    }

    const result = calculateStats(playerStats, modelName);

    try {
        sessionStorage.setItem("aqwCalcResult", JSON.stringify({
            playerStats,
            modelName,
            result,
        }));
    } catch (error) {
        console.error("Unable to save the calculated stats for the results page.", error);
        window.alert("Your browser could not open the results page. Please check your browser storage settings and try again.");
        return;
    }

    window.location.href = "results.html";
});
