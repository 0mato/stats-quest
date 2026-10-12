const damageForm = document.getElementById("damage-form");
const damageType = document.getElementById("damage-type");
const damageTypeNote = document.getElementById("damage-type-note");
const pendingFormulaTitle = document.getElementById("pending-formula-title");
const pendingFormulaDescription = document.getElementById("pending-formula-description");
const damageModifierHelp = document.getElementById("damage-modifier-help");
const damageOutFields = {
    phys: document.getElementById("phys-out-field"),
    mag: document.getElementById("mag-out-field"),
};
const healingModifiersFieldset = document.getElementById("healing-modifiers-fieldset");
const allOutField = document.getElementById("all-out-field");
const weaponBoostField = document.getElementById("weapon-boost-field");
const armorBoostField = document.getElementById("armor-boost-field");
const standardDamageModifiers = document.getElementById("standard-damage-modifiers");
const damageFormulaField = document.getElementById("damage-formula-field");
const weaponDpsField = document.getElementById("weapon-dps-field");
const attackPowerField = document.getElementById("attack-power-field");
const spellPowerField = document.getElementById("spell-power-field");
const coefficientField = document.getElementById("coefficient-field");
const dotFunctionTypeField = document.getElementById("dot-function-type-field");
const dotFunctionType = document.getElementById("dot-function-type");
const dotFunctionFields = {
    ap: document.getElementById("dot-attack-power-field"),
    sp: document.getElementById("dot-spell-power-field"),
    hp: document.getElementById("dot-max-hp-field"),
    fixed: document.getElementById("dot-fixed-number-field"),
    duration: document.getElementById("dot-duration-field"),
    secondsPerTick: document.getElementById("dot-seconds-per-tick-field"),
    maxStacks: document.getElementById("dot-max-stacks-field"),
    stacks: document.getElementById("dot-current-stacks-field"),
};
const critMultiplierField = document.getElementById("crit-multiplier-field");
const damageModifiersFieldset = document.getElementById("damage-modifiers-fieldset");
const enemyDefensesFieldset = document.getElementById("enemy-defenses-fieldset");
const dotStaticGroup = document.getElementById("dot-static-group");
const dotDynamicGroup = document.getElementById("dot-dynamic-group");
const enemyDefenseFields = {
    phys: document.getElementById("phys-in-field"),
    mag: document.getElementById("mag-in-field"),
    all: document.getElementById("all-in-field"),
    dot: document.getElementById("dot-in-field"),
    dotAll: document.getElementById("dot-all-in-field"),
};
const damageResult = document.getElementById("damage-result");
const damageResultLabel = document.getElementById("damage-result-label");
const damageResultNonCrit = document.getElementById("damage-result-non-crit");
const damageResultCrit = document.getElementById("damage-result-crit");
const damageResultNonCritLabel = document.getElementById("damage-result-non-crit-label");
const damageResultCritItem = document.getElementById("damage-result-crit-item");
const damageResultValues = [
    damageResultNonCrit,
    damageResultCrit,
];
const dotFormulaNote = document.getElementById("dot-formula-note");
const damageFormula = document.getElementById("damage-formula");
const healingSignNote = document.getElementById("healing-sign-note");

function setDamageResultState(isHealing) {
    damageResult.classList.toggle("damage-result--healing", isHealing);
    damageResult.classList.toggle("damage-result--damage", !isHealing);
    damageResultValues.forEach((value) => {
        value.classList.toggle("damage-result-value--healing", isHealing);
        value.classList.toggle("damage-result-value--damage", !isHealing);
    });
}

const readNumber = (id, fallback = 0) => {
    const value = document.getElementById(id).value;
    return value === "" ? fallback : Number(value);
};

const readModifier = (id) => readNumber(id, 1);

function getDotBaseAuraAmount() {
    const functionType = dotFunctionType.value;
    if (functionType === "fixed") {
        return readNumber("dot-fixed-number");
    }

    if (functionType === "hp") {
        return readNumber("coefficient") * readNumber("dot-max-hp");
    }

    const baseFunction = calculateBaseFormula(
        functionType,
        readNumber("weapon-dps", 85),
        readNumber("dot-attack-power"),
        readNumber("dot-spell-power"),
    );
    return readNumber("coefficient") * baseFunction;
}

function isHealingInput() {
    if (damageType.value === "true") {
        return false;
    }

    if (damageType.value === "dot") {
        const signedDotBoost =
            readModifier("dot-static-all-out") *
            readModifier("dot-out") *
            readModifier("dot-dynamic-all-out") *
            readModifier("dot-mag-out");
        return getDotBaseAuraAmount() * signedDotBoost < 0;
    }

    return readNumber("coefficient") < 0;
}

function updateDamageFields() {
    const type = damageType.value;
    const trueDamage = type === "true";
    const dotDamage = type === "dot";
    const healing = isHealingInput();
    const formula = damageFormula.value;
    const dotFunction = dotFunctionType.value;
    const attackPowerRequired = !dotDamage && formula !== "SP1" && formula !== "SP2";
    const spellPowerRequired = !dotDamage && formula !== "AP1" && formula !== "AP2";
    const attackPowerUsed = formula !== "SP1" && formula !== "SP2";
    const spellPowerUsed = formula !== "AP1" && formula !== "AP2";

    damageFormulaField.hidden = dotDamage;
    dotFunctionTypeField.hidden = !dotDamage;
    const dotUsesAp = dotFunction === "AP1" || dotFunction === "AP2";
    const dotUsesSp = dotFunction === "SP1" || dotFunction === "SP2";
    weaponDpsField.hidden = dotDamage && (dotFunction === "hp" || dotFunction === "fixed");
    attackPowerField.hidden = dotDamage || !attackPowerUsed;
    spellPowerField.hidden = dotDamage || !spellPowerUsed;
    dotFunctionFields.ap.hidden = !dotDamage || !dotUsesAp;
    dotFunctionFields.sp.hidden = !dotDamage || !dotUsesSp;
    dotFunctionFields.hp.hidden = !dotDamage || dotFunction !== "hp";
    const fixedDotFunction = dotDamage && dotFunction === "fixed";
    coefficientField.hidden = fixedDotFunction;
    attackPowerField.querySelector("input").required = attackPowerRequired;
    spellPowerField.querySelector("input").required = spellPowerRequired;
    const coefficientInput = coefficientField.querySelector("input");
    coefficientInput.required = !fixedDotFunction;
    if (trueDamage) {
        coefficientInput.min = "0";
    } else {
        coefficientInput.removeAttribute("min");
    }
    dotFunctionFields.fixed.hidden = !fixedDotFunction;
    dotFunctionFields.duration.hidden = !dotDamage;
    dotFunctionFields.secondsPerTick.hidden = !dotDamage;
    dotFunctionFields.maxStacks.hidden = !dotDamage;
    dotFunctionFields.stacks.hidden = !dotDamage;
    dotFunctionFields.ap.querySelector("input").required = dotDamage &&
        dotUsesAp;
    dotFunctionFields.sp.querySelector("input").required = dotDamage &&
        dotUsesSp;
    dotFunctionFields.hp.querySelector("input").required = dotDamage && dotFunction === "hp";
    dotFunctionFields.fixed.querySelector("input").required = fixedDotFunction;
    dotFunctionFields.duration.querySelector("input").required = dotDamage;
    dotFunctionFields.secondsPerTick.querySelector("input").required = dotDamage;
    dotFunctionFields.maxStacks.querySelector("input").required = dotDamage;
    dotFunctionFields.stacks.querySelector("input").max =
        dotFunctionFields.maxStacks.querySelector("input").value || "1";
    standardDamageModifiers.hidden = dotDamage;
    critMultiplierField.querySelector("input").required = !dotDamage;
    dotStaticGroup.hidden = !dotDamage;
    dotDynamicGroup.hidden = !dotDamage;

    damageModifiersFieldset.hidden = false;
    healingModifiersFieldset.hidden = !healing;
    allOutField.hidden = trueDamage;
    weaponBoostField.hidden = dotDamage || (type === "magical" && healing);
    armorBoostField.hidden = dotDamage || (type === "magical" && healing);
    damageOutFields.phys.hidden = type !== "physical";
    damageOutFields.mag.hidden = type !== "magical";

    enemyDefensesFieldset.hidden = trueDamage || healing;
    enemyDefenseFields.phys.hidden = type !== "physical";
    enemyDefenseFields.mag.hidden = type !== "magical" || healing;
    enemyDefenseFields.all.hidden = trueDamage || dotDamage || healing;
    enemyDefenseFields.dot.hidden = !dotDamage || healing;
    enemyDefenseFields.dotAll.hidden = !dotDamage || healing;

    damageTypeNote.textContent = trueDamage
        ? "True damage includes Weapon and Armor Gear Boosts, but ignores other boosts and resistances."
        : type === "dot"
          ? healing
            ? "HoT snapshots All Out and DoT Out when applied; dynamic All Out and Mag Out, plus Heal Out and Heal In, affect each tick."
            : "DoT snapshots All Out and DoT Out when applied. Dynamic All Out, Mag Out, DoT In, and All In affect each tick."
          : healing
            ? type === "magical"
                ? "Magical healing uses All Out, Mag Out, Heal Out, and Heal In."
                : "Physical healing uses its damage modifiers plus Heal Out and Heal In."
          : "";
    healingSignNote.hidden = trueDamage;
    healingSignNote.textContent = dotDamage
        ? "A negative base amount (coefficient × function, or the Fixed Number) or a negative product of the static and dynamic output modifiers indicates healing."
        : "Healing is indicated by negative coefficients.";
    damageModifierHelp.textContent = dotDamage
        ? `${fixedDotFunction
            ? "Fixed Number replaces coefficient × function."
            : "AP1/AP2/SP1/SP2 use the selected weapon DPS and AP/SP input; HP% uses coefficient × Max HP. Base tick = (coefficient × function ÷ aura duration ÷ aura max stacks) × seconds per tick × current stacks."}`
        : "Enter modifiers as multipliers (for example, 1.25 means 25% more damage). Gear boosts from both armour and weapons are multiplicative.";

    damageResult.hidden = true;
    dotFormulaNote.hidden = true;
}

function calculateBaseFormula(formula, weaponDps, attackPower, spellPower) {
    const ap1 = weaponDps + 0.1 * attackPower;
    const sp1 = weaponDps + 0.1 * spellPower;
    const apsp1 = weaponDps + 0.1 * attackPower + 0.1 * spellPower;
    const weaponRange = 1;

    const formulas = {
        AP1: ap1,
        AP2: 2 * ap1 * weaponRange,
        SP1: sp1,
        SP2: 2 * sp1 * weaponRange,
        APSP1: apsp1,
        APSP2: 2 * apsp1 * weaponRange,
    };

    return formulas[formula];
}

function calculateDamage() {
    const type = damageType.value;
    const healing = isHealingInput();
    if (type === "dot") {
        const baseAuraAmount = getDotBaseAuraAmount();
        const duration = readNumber("dot-duration");
        const secondsPerTick = readNumber("dot-seconds-per-tick");
        const maxStacks = readNumber("dot-max-stacks", 1);
        const currentStacks = readNumber("dot-current-stacks", 1);
            const incomingModifier = healing
                ? readModifier("heal-in")
            : Math.max(0.2, readModifier("dot-in") * readModifier("dot-all-in"));
        const damagePerTick =
            (baseAuraAmount / duration / maxStacks) *
            secondsPerTick *
            currentStacks *
            readModifier("dot-static-all-out") *
            readModifier("dot-out") *
            readModifier("dot-dynamic-all-out") *
            readModifier("dot-mag-out") *
            (healing ? readModifier("heal-out") : 1) *
            incomingModifier;
        const isHealingTick = damagePerTick < 0;

        damageResultLabel.textContent = `${isHealingTick ? "Healing over Time" : "Damage over Time"} · ${currentStacks} stack${currentStacks === 1 ? "" : "s"}`;
        damageResultNonCritLabel.textContent = `${isHealingTick ? "Healing" : "Damage"} per Tick`;
        setDamageResultState(isHealingTick);
        damageResultCritItem.hidden = true;
        damageResultNonCrit.textContent = Math.round(Math.abs(damagePerTick)).toLocaleString();
        damageResult.hidden = false;
        dotFormulaNote.hidden = true;
        return;
    }

    const weaponDps = readNumber("weapon-dps", 85);
    const attackPower = readNumber("attack-power");
    const spellPower = readNumber("spell-power");
    const coefficient = readNumber("coefficient");
    const critMultiplier = readNumber("crit-multiplier");
    const skillFormula = document.getElementById("damage-formula").value;
    const baseFormula = calculateBaseFormula(
        skillFormula,
        weaponDps,
        attackPower,
        spellPower,
    );

    let nonCritDamage = coefficient * baseFormula;

    if (type === "true") {
        nonCritDamage *=
            readModifier("weapon-boost") *
            readModifier("armor-boost");
    } else if (type === "physical") {
        const allOut = Math.max(0.1, readModifier("all-out"));
        const incomingResistance = Math.max(
            0.2,
            readModifier("phys-in") * (healing ? 1 : readModifier("all-in")),
        );
        nonCritDamage *=
            readModifier("weapon-boost") *
            readModifier("armor-boost") *
            allOut *
            readModifier("phys-out") *
            incomingResistance;
    } else if (type === "magical") {
        const incomingResistance = Math.max(
            0.2,
            readModifier("mag-in") * readModifier("all-in"),
        );
        if (healing) {
            nonCritDamage *=
                readModifier("all-out") *
                readModifier("mag-out") *
                readModifier("heal-out") *
                readModifier("heal-in");
        } else {
            nonCritDamage *=
                readModifier("weapon-boost") *
                readModifier("armor-boost") *
                readModifier("all-out") *
                readModifier("mag-out") *
                incomingResistance;
        }
    }

    if (type === "physical" && healing) {
        nonCritDamage *= readModifier("heal-out") * readModifier("heal-in");
    }

    const isHealingHit = type !== "true" && nonCritDamage < 0;
    setDamageResultState(isHealingHit);
    damageResultLabel.textContent = `${damageType.selectedOptions[0].text} ${isHealingHit ? "healing" : "damage"} · ${skillFormula}`;
    damageResultNonCritLabel.textContent = isHealingHit ? "Healing (Non-Crit)" : "Non-Crit";
    damageResultCritItem.hidden = false;
    damageResultCritItem.querySelector(".damage-result-kind").textContent =
        isHealingHit ? "Healing (Crit)" : "Crit";
    damageResultNonCrit.textContent = Math.round(Math.abs(nonCritDamage)).toLocaleString();
    damageResultCrit.textContent = Math.round(Math.abs(nonCritDamage * critMultiplier)).toLocaleString();
    damageResult.hidden = false;
    dotFormulaNote.hidden = true;
}

damageType.addEventListener("change", updateDamageFields);
damageFormula.addEventListener("change", updateDamageFields);
dotFunctionType.addEventListener("change", updateDamageFields);
[
    "coefficient",
    "dot-fixed-number",
    "weapon-dps",
    "dot-attack-power",
    "dot-spell-power",
    "dot-max-hp",
].forEach((id) => {
    document.getElementById(id).addEventListener("input", updateDamageFields);
});
dotFunctionFields.maxStacks.querySelector("input").addEventListener(
    "input",
    updateDamageFields,
);
["dot-static-all-out", "dot-out", "dot-dynamic-all-out", "dot-mag-out"].forEach((id) => {
    document.getElementById(id).addEventListener("input", updateDamageFields);
});
damageForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!damageForm.reportValidity()) {
        return;
    }
    calculateDamage();
});

updateDamageFields();
