import { MonksTheaterOfTheMind, i18n } from "./monks-theater-of-the-mind.js";

export const registerSettings = function () {
    // Register any custom module settings here
	let modulename = "monks-theater-of-the-mind";

	const debouncedReload = foundry.utils.debounce(function () { window.location.reload(); }, 100);
	
	game.settings.register(modulename, "blur-hidden", {
		name: i18n("MonksTheaterOfTheMind.blur-hidden.name"),
		hint: i18n("MonksTheaterOfTheMind.blur-hidden.hint"),
		scope: "world",
		config: true,
		default: true,
		type: Boolean,
		onChange: (value) => {
			$('#theater-of-the-mind').toggleClass('hide-hidden', !value);
        }
	});

	game.settings.register(modulename, "show-names", {
		name: i18n("MonksTheaterOfTheMind.show-names.name"),
		hint: i18n("MonksTheaterOfTheMind.show-names.hint"),
		scope: "world",
		config: true,
		default: false,
		type: Boolean,
		onChange: (value) => {
			$('#theater-of-the-mind').toggleClass('show-names', value);
		}
	});
};
