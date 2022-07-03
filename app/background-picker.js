import { MonksTheaterOfTheMind, log, setting, i18n } from '../monks-theater-of-the-mind.js';

export class BackgroundPicker extends FormApplication {
    constructor(object, options = {}) {
        super(object, options);

    }

    /** @override */
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            id: "background-picker",
            title: "Background Picker",
            template: "modules/monks-theater-of-the-mind/templates/background-picker.html",
            popOut: true,
            width: 655,
            height: 415,
            resizable: true,
            editable: true,
            closeOnSubmit: true,
            submitOnClose: false,
            submitOnChange: false
        });
    }

    getData(options) {
        let data = super.getData(options);

        data.sceneid = this.object.getFlag("monks-theater-of-the-mind", "scene");

        data.scenes = MonksTheaterOfTheMind.scenes.map(s => {
            s.selected = s.id == data.sceneid || (data.sceneid == undefined && s.default);
            return s;
        });

        return data;
    }

    activateListeners(html) {
        super.activateListeners(html);

        $('.scene', html).on("click", this.selectPicture.bind(this));
    }

    selectPicture(event) {
        let id = event.currentTarget.dataset["id"];
        this.object.setFlag("monks-theater-of-the-mind", "scene", id);
        this.close();
    }
}