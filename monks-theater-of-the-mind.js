import { registerSettings } from "./settings.js";
import { TheaterOfTheMind } from "./app/theater-of-the-mind.js";

export let debugEnabled = 0;

export let debug = (...args) => {
    if (debugEnabled > 1) console.log("DEBUG: monks-theater-of-the-mind | ", ...args);
};
export let log = (...args) => console.log("monks-theater-of-the-mind | ", ...args);
export let warn = (...args) => {
    if (debugEnabled > 0) console.warn("WARN: monks-theater-of-the-mind | ", ...args);
};
export let error = (...args) => console.error("monks-theater-of-the-mind | ", ...args);

export const setDebugLevel = (debugText) => {
    debugEnabled = { none: 0, warn: 1, debug: 2, all: 3 }[debugText] || 0;
    // 0 = none, warnings = 1, debug = 2, all = 3
    if (debugEnabled >= 3)
        CONFIG.debug.hooks = true;
};

export let i18n = key => {
    return game.i18n.localize(key);
};
export let setting = key => {
    return game.settings.get("monks-little-details", key);
};

export class MonksTheaterOfTheMind {
    static init() {
        if (game.MonksTheaterOfTheMind == undefined)
            game.MonksTheaterOfTheMind = MonksTheaterOfTheMind;

        MonksTheaterOfTheMind.SOCKET = "module.monks-theater-of-the-mind";

        MonksTheaterOfTheMind.READY = true;

        registerSettings();
    }

    static ready() {
        
    }

    static emit(action, args = {}) {
        args.action = action;
        args.senderId = game.user.id;
        game.socket.emit(MonksTheaterOfTheMind.SOCKET, args, (resp) => { });
    }

    static onMessage(data) {
        MonksTheaterOfTheMind[data.action].call(MonksTheaterOfTheMind, data);
    }

    static openTheater(combat) {
        this.theater = new TheaterOfTheMind(combat).render(true);
    }
}

Hooks.once('init', MonksTheaterOfTheMind.init);

Hooks.on("ready", MonksTheaterOfTheMind.ready);

Hooks.on('renderCombatTracker', async (app, html, data) => {
    let link = $('<a>')
        .addClass("combat-control center")
        .attr("title", "Open this combat in theater of the mind")
        .html("Theater of the Mind")
        .on("click", () => { game.MonksTheaterOfTheMind.openTheater(app.viewed); });
    $('<nav>')
        .toggle(!!data.combat)
        .attr("id", "theater-controls")
        .append(link)
        .insertAfter($('#combat-round', html));
});

Hooks.on("updateCombat", async function (combat, delta) {
    /*if (combat.id == cmbt.id) {
        const started = (combat?.turns.length > 0) && (combat?.round > 0);
        // open or refresh the app
        game.MonksTheaterOfTheMind.openTheater(combat);
    }*/
    if (combat._theater) {
        //+++ if the combat is ending then close the theater.
        combat._theater.checkCombatantChange();
    }
});

Hooks.on("createCombatant", async function (combatant, delta, userId) {
    // refresh the app
    if (combatant.combat._theater) {
        combatant.combat._theater.checkCombatantChange();
    }
});

Hooks.on("updateCombatant", async function (combatant, data, options, userId) {
    // refresh the app
    if (combatant.combat._theater && (data.defeated != undefined || data.hidden != undefined)) {
        combatant.combat._theater.updateCombatant(combatant, data.defeated != undefined);
    }
});

Hooks.on("deleteCombatant", async function (combatant, delta, userId) {
    // refresh the app
    if (combatant.combat._theater) {
        combatant.combat._theater.checkCombatantChange();
    }
});