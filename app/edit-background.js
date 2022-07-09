import { MonksTheaterOfTheMind, log, error, i18n, setting, makeid } from "../monks-theater-of-the-mind.js";

export class EditBackground extends FormApplication {
    constructor(object, options) {
        super(object, options);

        this.object = object;
        this.parent = options.parent;
    }

    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            id: "theater-edit-image",
            title: i18n("MonksTheaterOfTheMind.EditImages"),
            template: "./modules/monks-theater-of-the-mind/templates/edit-background.html",
            width: 500,
            height: "auto",
            closeOnSubmit: true,
            popOut: true,
        });
    }

    getData(options) {
        let data = super.getData(options);
        return data;
    }

    activateListeners(html) {
        super.activateListeners(html);

        $('button[name="cancel"]', html).click(this.close());
    };

    async _updateObject(event, formData) {
        if (formData.imagename == "" || formData.foreground == "" || formData.background == "") {
            ui.notifications.error("All fields are required to be filled in");
            return false;
        }

        let images = MonksTheaterOfTheMind.scenes;
        let image = { id: makeid() };
        if (this.object?.id) {
            image = images.find(i => i.id == this.object?.id);
            image = mergeObject(image, formData);
        } else {
            image = mergeObject(image, formData);
            images.push(image);
        }

        if (formData.default) {
            images = images.map(i => {
                i.default = (i.id == image.id);
                return i;
            })
        }

        await game.settings.set("monks-theater-of-the-mind", "images", images);
        this.parent.render(true);
    }
}