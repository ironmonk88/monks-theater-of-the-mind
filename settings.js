import { MonksTheaterOfTheMind, i18n } from "./monks-theater-of-the-mind.js";
import { ImageList } from "./app/image-list.js"

export const registerSettings = function () {
    // Register any custom module settings here
	let modulename = "monks-theater-of-the-mind";

	const debouncedReload = foundry.utils.debounce(function () { window.location.reload(); }, 100);

	game.settings.registerMenu(modulename, 'image-list', {
		label: i18n("MonksTheaterOfTheMind.editbackground.name"),
		hint: i18n("MonksTheaterOfTheMind.editbackground.hint"),
		icon: 'fas fa-image',
		restricted: true,
		type: ImageList
	});
	
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

	game.settings.register(modulename, "show-list", {
		name: i18n("MonksTheaterOfTheMind.show-list.name"),
		hint: i18n("MonksTheaterOfTheMind.show-list.hint"),
		scope: "world",
		config: true,
		default: true,
		type: Boolean,
		onChange: (value) => {
			$('#theater-of-the-mind').toggleClass('show-list', value);
		}
	});

	game.settings.register(modulename, "images", {
		scope: "world",
		config: false,
		default: [
			{ id: 'alley', name: 'Alley', foreground: './modules/monks-theater-of-the-mind/img/alley-foreground.png', background: './modules/monks-theater-of-the-mind/img/alley.png' },
			{ id: 'autumn', name: 'Autumn', foreground: './modules/monks-theater-of-the-mind/img/autumn-foreground.png', background: './modules/monks-theater-of-the-mind/img/autumn.png' },
			{ id: 'cavern', name: 'Cavern', foreground: './modules/monks-theater-of-the-mind/img/cavern-foreground.png', background: './modules/monks-theater-of-the-mind/img/cavern.png' },
			{ id: 'desert', name: 'Desert', foreground: './modules/monks-theater-of-the-mind/img/desert-foreground.png', background: './modules/monks-theater-of-the-mind/img/desert.png' },
			{ id: 'forest', name: 'Forest', foreground: './modules/monks-theater-of-the-mind/img/forest-foreground.png', background: './modules/monks-theater-of-the-mind/img/forest.png' },
			{ id: 'meadow', name: 'Meadow', foreground: './modules/monks-theater-of-the-mind/img/meadow-foreground.png', background: './modules/monks-theater-of-the-mind/img/meadow.png', default: true },
			{ id: 'snow', name: 'Snow', foreground: './modules/monks-theater-of-the-mind/img/snow-foreground.png', background: './modules/monks-theater-of-the-mind/img/snow.png' },
			{ id: 'town', name: 'Town', foreground: './modules/monks-theater-of-the-mind/img/town-foreground.png', background: './modules/monks-theater-of-the-mind/img/town.png' },
			{ id: 'yard', name: 'Yard', foreground: './modules/monks-theater-of-the-mind/img/yard-foreground.png', background: './modules/monks-theater-of-the-mind/img/yard.png' }
		],
		type: Array,
	});
};
