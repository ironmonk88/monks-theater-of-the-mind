import { MonksTheaterOfTheMind, log, error, i18n, setting, makeid } from "../monks-theater-of-the-mind.js";
import { EditBackground } from "./edit-background.js"

export class ImageList extends FormApplication {
    constructor(object, options) {
        super(object, options);
    }

    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            id: "theater-image-list",
            title: i18n("MonksTheaterOfTheMind.ImageList"),
            template: "./modules/monks-theater-of-the-mind/templates/image-list.html",
            width: 550,
            height: "auto",
            closeOnSubmit: true,
            popOut: true,
        });
    }

    getData(options) {
        let images = MonksTheaterOfTheMind.scenes;
        return mergeObject(super.getData(options), { images : images });
    }

    addImage(event) {
        // Open the background editor
        new EditBackground(null, { parent: this }).render(true);
    }

    editImage(event) {
        // Open the background editor
        let id = event.currentTarget.closest('li.item').dataset.id;
        let images = MonksTheaterOfTheMind.scenes;
        let image = images.find(i => i.id == id);
        new EditBackground(image, { parent: this }).render(true);
    }

    async removeImage() {
        let id = event.currentTarget.closest('li.item').dataset.id;
        let images = MonksTheaterOfTheMind.scenes;

        images.findSplice(s => s.id === id);
        await game.settings.set("monks-theater-of-the-mind", "images", images);
        this.render();
    }

    refresh() {
        this.render(true);
        let that = this;
        window.setTimeout(function () { that.setPosition(); }, 500);
    }

    activateListeners(html) {
        super.activateListeners(html);

        $('.item-delete', html).click(this.removeImage.bind(this));
        $('.item-edit', html).click(this.editImage.bind(this));
        $('.item-add', html).click(this.addImage.bind(this));
    };
}