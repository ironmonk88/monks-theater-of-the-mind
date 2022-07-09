import { MonksTheaterOfTheMind, log, setting, i18n } from '../monks-theater-of-the-mind.js';
import { BackgroundPicker } from './background-picker.js';

export class TheaterOfTheMind extends Application {
    constructor(object, options = {}) {
        super(object, options);

        this.combat = object;
        this.combat._theater = this;
    }

    /** @override */
    static get defaultOptions() {
        let classes = [
            setting("blur-hidden") ? null : "hide-hidden",
            game.user.isGM ? 'gm' : null,
            setting("show-names") ? "show-names" : null,
            setting("show-list") ? "show-list" : null,
        ];
        return mergeObject(super.defaultOptions, {
            id: "theater-of-the-mind",
            title: i18n("MonksTheaterOfTheMind.TheaterOfTheMind"),
            template: "modules/monks-theater-of-the-mind/templates/theater.html",
            classes: classes.filter(c => !!c),
            popOut: true,
            width: 1025,
            height: 700,
            resizable: true,
            editable: true,
            closeOnSubmit: false,
            submitOnClose: false,
            submitOnChange: false
        });
    }

    getData(options) {
        let data = super.getData(options);

        data.isGM = game.user.isGM;

        let sceneId = this.combat.getFlag("monks-theater-of-the-mind", "scene");
        data.scene = MonksTheaterOfTheMind.scenes.find(s => s.id == sceneId || (sceneId == undefined && s.default));

        if (!data.scene) {
            data.scene = MonksTheaterOfTheMind.scenes.find(s => s.default) || MonksTheaterOfTheMind.scenes[0];
        }

        this.prev = this.getPrevCombatant(this.combat);
        data.prev = this.getCombatantData(this.prev);
        this.current = this.combat.combatants.get(this.combat.current.combatantId);
        data.current = this.getCombatantData(this.current);
        this.next = this.getNextCombatant(this.combat);
        data.next = this.getCombatantData(this.next);

        data.combatants = this.combatants();

        return data;
    }

    async close(options = {}) {
        delete this.combat._theater;
        return super.close(options);
    }

    getCombatantData(combatant) {
        return {
            id: combatant?.id,
            name: combatant?.name,
            img: combatant?.token.actor.img,
            hidden: combatant?.data.hidden,
            defeated: this.combatant?.isDefeated,
            owner: combatant?.isOwner
        };
    }

    combatants() {
        return this.combat.turns.map((c, index) => {
            let css = [
                index === this.combat.turn ? "active" : "",
                c.hidden ? "hidden" : "",
                c.data.defeated ? "defeated" : ""
            ].join(" ").trim();
            return {
                id: c.id,
                name: c.name,
                img: c.img,
                active: index === this.combat.turn,
                owner: c.isOwner,
                defeated: c.data.defeated,
                hidden: c.hidden,
                css: css
            }
        })
    }

    activateListeners(html) {
        super.activateListeners(html);

        $('.prev', this.element).on('dblclick', this.openActor.bind(this, this.prev));
        $('.current', this.element).on('dblclick', this.openActor.bind(this, this.current));
        $('.next', this.element).on('dblclick', this.openActor.bind(this, this.next));

        $('[data-control]', this.element).on('click', this._onCombatControl.bind(this));

        $('.settings', this.element).on('click', this.openSettings.bind(this));
    }

    getPrevCombatant(combat) {
        let findPrev = function (from) {
            let prev = null;
            if (skip) {
                for (let i = from - 1; i > -1; i--) {
                    let t = combat.turns[i];
                    if (t.data.defeated)
                        continue;
                    prev = i;
                    break;
                }
            }
            else
                prev = from + 1;

            return prev;
        }

        // Determine the next turn number
        let skip = combat.settings.skipDefeated;
        let prev = findPrev(combat.turn);
        //if there wasn't one next after the current player, then start back at the beginning and try to find the next one
        if (prev == undefined || prev < 0)
            prev = findPrev(combat.turns.length);

        return (prev != null ? combat.turns[prev] : null);
    }

    getNextCombatant(combat) {
        let findNext = function (from) {
            let next = null;
            if (skip) {
                for (let [i, t] of combat.turns.entries()) {
                    if (i <= from || t.data.defeated)
                        continue;
                    next = i;
                    break;
                }
            }
            else next = from + 1;

            return next;
        }

        // Determine the next turn number
        let skip = combat.settings.skipDefeated;
        let next = findNext(combat.turn);
        //if there wasn't one next after the current player, then start back at the beginning and try to find the next one
        if (next == undefined || next >= combat.turns.length)
            next = findNext(-1);

        return (next != null ? combat.turns[next] : null);
    }

    checkCombatantChange() {
        let prev = this.getPrevCombatant(this.combat);
        let current = this.combat.combatants.get(this.combat.current.combatantId);
        let next = this.getNextCombatant(this.combat);

        if (prev?.id != this.prev?.id || current?.id != this.current?.id || next?.id != this.next?.id) {
            this.changeCombatants(prev, current, next);

            this.prev = prev;
            this.current = current;
            this.next = next;

            if (game.user.isGM)
                this.current.token?._object?.control({ releaseOthers: true });
        }

        $('.combatant-container.active', this.element).removeClass("active");
        $(`.combatant-container[data-id="${current.id}"]`, this.element).addClass("active");

        $('.end-turn', this.element).toggle(current.isOwner);
    }

    changeCombatants(prev, current, next) {
        // Do any of these differ from the current set up

        let prevElem = $('.prev', this.element);
        let currentElem = $('.current', this.element);
        let nextElem = $('.next', this.element);

        if (this.prev?.id == current?.id) {
            // Prev is going back to the current position
            prevElem.removeClass('prev').addClass('current');
        } else if (this.prev?.id != prev?.id) {
            // The old prev is being removed
            prevElem.addClass('out').on('transitionend webkitTransitionEnd oTransitionEnd', function () {
                $(this).remove();
            });
        }
        if (this.current?.id != prev?.id && this.prev?.id != prev?.id && prev) {
            // new previous
            this.addCombatant.call(this, prev, "prev");
        }

        if (this.next?.id == current?.id) {
            // Next is going into the current position
            nextElem.removeClass('next').addClass('current');
        } else if (this.next?.id != next?.id) {
            // The old next is being removed
            nextElem.addClass('out').on('transitionend webkitTransitionEnd oTransitionEnd', function () {
                $(this).remove();
            });
        }
        if (this.current?.id != next?.id && this.next?.id != next?.id && next) {
            // new next
            this.addCombatant.call(this, next, "next");
        }

        if (this.current?.id == prev?.id) {
            // Next is going into the prev
            currentElem.removeClass('current').addClass('prev');
        } else if (this.current?.id == next?.id) {
            // Next is going into the next
            currentElem.removeClass('current').addClass('next');
        }else if (this.current?.id != current?.id) {
            // The old prev is being removed
            currentElem.addClass('out').on('transitionend webkitTransitionEnd oTransitionEnd', function () {
                $(this).remove();
            });
        }

        if (current?.id !== this.prev?.id && current?.id !== this.next?.id && this.current?.id !== current?.id && current) {
            this.addCombatant.call(this, current, "current");
        }

        if (this.current?.id !== current?.id && current) {
            $('.combat-name .actor-name', this.element).addClass('out').on('transitionend webkitTransitionEnd oTransitionEnd', function () {
                $(this).remove();
            });

            let newName = $("<div>").addClass('actor-name in').toggleClass('hidden', current.data.hidden).toggleClass('owner', current.isOwner).html(current.name).appendTo($('.combat-name', this.element));
            window.setTimeout(() => { newName.removeClass('in') }, 100);
        }
    }

    addCombatant(combatant, cls) {
        let newCombatant = $('<div>')
            .addClass(`player ${cls} out`)
            .toggleClass('defeated', combatant.data.defeated)
            .toggleClass('hidden', combatant.data.hidden)
            .toggleClass('owner', combatant.isOwner)
            .attr('data-actor-id', combatant.id)
            .attr('actor-name', combatant.name)
            .css('background-image', `url(${combatant.token.actor.img})`)
            .on('dblclick', this.openActor.bind(combatant))
            .appendTo($('#theater-container'));

        window.setTimeout(() => { newCombatant.removeClass('out') }, 100);
    }

    updateCombatant(combatant, defeated) {
        if (this.prev?.id == combatant.id) {
            $('.prev', this.element).toggleClass('defeated', combatant.data.defeated).toggleClass('hidden', combatant.data.hidden);
        }
        if (this.current?.id == combatant.id) {
            $('.current', this.element).toggleClass('defeated', combatant.data.defeated).toggleClass('hidden', combatant.data.hidden);
        }
        if (this.next?.id == combatant.id) {
            $('.next', this.element).toggleClass('defeated', combatant.data.defeated).toggleClass('hidden', combatant.data.hidden);
        }

        if (defeated && this.combat.settings.skipDefeated) {
            this.checkCombatantChange();
        }
    }

    async _onCombatControl(event) {
        event.preventDefault();
        const ctrl = event.currentTarget;
        if (ctrl.getAttribute("disabled")) return;
        else ctrl.setAttribute("disabled", true);
        const fn = this.combat[ctrl.dataset.control];
        if (fn) await fn.bind(this.combat)();
        ctrl.removeAttribute("disabled");
    }

    openActor(combatant) {
        combatant?.token.actor.sheet.render(true);
    }

    openSettings() {
        new BackgroundPicker(this.combat).render(true);
    }
}