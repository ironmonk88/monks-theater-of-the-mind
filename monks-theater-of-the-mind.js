import { registerSettings } from "./settings.js";
import { TheaterOfTheMind } from "./app/theater-of-the-mind.js";
import { BackgroundPicker } from './app/background-picker.js';

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
    return game.settings.get("monks-theater-of-the-mind", key);
};

export let makeid = () => {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < 16; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

export class MonksTheaterOfTheMind {
    static init() {
        if (game.MonksTheaterOfTheMind == undefined)
            game.MonksTheaterOfTheMind = MonksTheaterOfTheMind;

        MonksTheaterOfTheMind.SOCKET = "module.monks-theater-of-the-mind";

        MonksTheaterOfTheMind.READY = true;

        registerSettings();

        let oldRenderPopout = CombatTracker.prototype.renderPopout;
        CombatTracker.prototype.renderPopout = function () {
            if (this.viewed.getFlag("monks-theater-of-the-mind", "use-theater")) {
                if (this.viewed._theater)
                    this.viewed._theater.render();
                else
                    new TheaterOfTheMind(this.viewed).render(true);
            }
            else
                return oldRenderPopout.call(this);
        }
    }

    static ready() {
        
    }

    static get scenes() {
        let images = game.settings.get('monks-theater-of-the-mind', 'images') || [];
        images = images instanceof Array ? images : [];
        return images;
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
        if (combat._theater)
            combat._theater.render();
        else
            new TheaterOfTheMind(combat).render(true);
    }
}

Hooks.once('init', MonksTheaterOfTheMind.init);

Hooks.on("ready", MonksTheaterOfTheMind.ready);

Hooks.on('renderCombatTracker', async (app, html, data) => {
    if (game.user.isGM && !app.popOut) {
        let link = $('<a>')
            .addClass("combat-control center")
            .attr("title", "Open this combat in theater of the mind")
            .html("Theater of the Mind")
            .on("click", () => {
                let selected = !app.viewed.getFlag("monks-theater-of-the-mind", "use-theater");
                app.viewed.setFlag("monks-theater-of-the-mind", "use-theater", selected);
                if (selected && !app.viewed.started)
                    app.viewed.startCombat();
                else if (selected && app.viewed.started && !app.viewed._theater)
                    game.MonksTheaterOfTheMind.openTheater(app.viewed);
                else if (!selected && app.viewed._theater)
                    app.viewed._theater.close();
            });
        let settings = $('<a>')
            .addClass("theater-settings theater-button")
            .html('<i class="fas fa-cog"></i>')
            .on("click", () => {
                new BackgroundPicker(app.viewed).render(true);
            });
        let view = $('<a>')
            .addClass("view-theater theater-button")
            .toggle(app.viewed?.started)
            .html('<i class="fas fa-eye"></i>')
            .on("click", () => {
                MonksTheaterOfTheMind.openTheater(app.viewed);
            });
        $('<nav>')
            .toggleClass('selected', !!app?.viewed?.getFlag("monks-theater-of-the-mind", "use-theater"))
            .toggle(!!data.combat)
            .attr("id", "theater-controls")
            .append(view)
            .append(link)
            .append(settings)
            .insertBefore($('#combat-controls', html));
    }
});

Hooks.on("updateCombat", async function (combat, data) {
    /*if (combat.id == cmbt.id) {
        const started = (combat?.turns.length > 0) && (combat?.round > 0);
        // open or refresh the app
        game.MonksTheaterOfTheMind.openTheater(combat);
    }*/
    if (data.round == 1 && combat.getFlag("monks-theater-of-the-mind", "use-theater")) {
        game.MonksTheaterOfTheMind.openTheater(combat);
    }
    if (combat._theater) {
        if (getProperty(data, "flags.monks-theater-of-the-mind.scene") != undefined)
            combat._theater.render();
        else
            combat._theater.checkCombatantChange();
    }
});

Hooks.on("deleteCombat", async function (combat, data) {
    if (combat._theater) {
        combat._theater.close();
    }
});

Hooks.on("createCombatant", async function (combatant, data, userId) {
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