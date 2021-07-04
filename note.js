class Note {
    #hako_action = null
    UPDATE_NOTE_ACTION = "note/update"
    DESTROY_NOTE_ACTION = "note/destroy"
    #parent = null
    get parent(){
        //Làm kiểu này để có thể lưu ra file
        return this.#parent
    }
    constructor(parent, note_id, content, hako_action) {
        this.#parent = parent
        this.note_id = note_id
        this.content = content
        this.#hako_action = hako_action
    }
    async update_info(content) {
        await this.#hako_action.post(this.UPDATE_NOTE_ACTION, {
            form: {
                note_id: this.note_id,
                content
            },
            responseType: "json"
        })
        this.content = content
    }
    async destroy() {
        await this.#hako_action.post(this.DESTROY_NOTE_ACTION, {
            form: {
                note_id: this.note_id
            },
            responseType: "json"
        })
        const i = this.parent.notes.findIndex(el => el.note_id === this.note_id)
        this.parent.notes.splice(i, 1)
        for (const key in this) {
            delete this[key]
        }
    }
}
module.exports = Note