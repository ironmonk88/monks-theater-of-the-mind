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

    static get scenes() {
        return [
            { id: 'alley', name: 'Alley', foreground: './modules/monks-theater-of-the-mind/img/alley-foreground.png', background: './modules/monks-theater-of-the-mind/img/alley.png' },
            { id: 'autumn', name: 'Autumn', foreground: './modules/monks-theater-of-the-mind/img/autumn-foreground.png', background: './modules/monks-theater-of-the-mind/img/autumn.png' },
            { id: 'cavern', name: 'Cavern', foreground: './modules/monks-theater-of-the-mind/img/cavern-foreground.png', background: './modules/monks-theater-of-the-mind/img/cavern.png' },
            { id: 'desert', name: 'Desert', foreground: './modules/monks-theater-of-the-mind/img/desert-foreground.png', background: './modules/monks-theater-of-the-mind/img/desert.png' },
            { id: 'forest', name: 'Forest', foreground: './modules/monks-theater-of-the-mind/img/forest-foreground.png', background: './modules/monks-theater-of-the-mind/img/forest.png' },
            { id: 'meadow', name: 'Meadow', foreground: './modules/monks-theater-of-the-mind/img/meadow-foreground.png', background: './modules/monks-theater-of-the-mind/img/meadow.png', 'default': true },
            { id: 'snow', name: 'Snow', foreground: './modules/monks-theater-of-the-mind/img/snow-foreground.png', background: './modules/monks-theater-of-the-mind/img/snow.png' },
            { id: 'town', name: 'Town', foreground: './modules/monks-theater-of-the-mind/img/town-foreground.png', background: './modules/monks-theater-of-the-mind/img/town.png' },
            { id: 'yard', name: 'Yard', foreground: './modules/monks-theater-of-the-mind/img/yard-foreground.png', background: './modules/monks-theater-of-the-mind/img/yard.png' }
        ]
    };
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
                let selected = app.viewed.getFlag("monks-theater-of-the-mind", "use-theater");
                app.viewed.setFlag("monks-theater-of-the-mind", "use-theater", !selected);
                //$('#theater-controls').toggleClass('selected', !selected);
            });
        let settings = $('<a>')
            .addClass("theater-settings")
            .html('<i class="fas fa-cog"></i>')
            .on("click", () => {
                new BackgroundPicker(app.viewed).render(true);
            })
        $('<nav>')
            .toggleClass('selected', !!app?.viewed?.getFlag("monks-theater-of-the-mind", "use-theater"))
            .toggle(!!data.combat)
            .attr("id", "theater-controls")
            .append(link)
            .append(settings)
            .insertAfter($('#combat-round', html));
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