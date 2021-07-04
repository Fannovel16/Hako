const cheerio = require("cheerio")
const Note = require("./note")
const myobj_to_upload_form = require("./myobj_to_upload_form")
const fs = require("fs")
class Chapter {
    notes = []
    #hako_action = null
    #parent = null
    info = {}
    #set_endpoint() {
        this.GET_INFO_ACTION = `chapter/${this.chapter_id}/edit?navbar=0`
        this.UPDATE_INFO_ACTION = "chapter/update"
        this.CREATE_NOTE_ACTION = "note/store"
    }
    get parent(){
        //Làm kiểu này để có thể lưu ra file
        return this.#parent
    }
    constructor(parent, chapter_id, hako_action) {
        this.#parent = parent
        this.chapter_id = chapter_id
        this.chapter_url = `${this.parent.parent.series_url}/c${this.chapter_id}`
        this.#set_endpoint()
        this.#hako_action = hako_action
    }
    async get_info() {
        const $ = cheerio.load(await this.#hako_action(this.GET_INFO_ACTION, { cache: undefined }))
        this.info = {
            title: $("input[name='title']").val(),
            complete: {
                text: $("input[name='complete']:checked").text(),
                value: $("input[name='complete']:checked").val(),
            },
            content: $("textarea#LN_Chapter_Content").text(),
            image: '',
            reason: ''
        }
        this.info.complete
        for (const note_el of $("div.note-input").get()){
            const note_id = $("input.note_id", note_el).val()
            if (note_id.length) {
                const content = $("textarea.note_content", note_el).text()
                this.notes.push(new Note(this, note_id, content, this.#hako_action))
            }
            //Hako thiết kế kiểu hơi khó chịu tí
        }
    }
    async create_note(content) {
        const { note_id } = await this.#hako_action.post(this.CREATE_NOTE_ACTION, {
            form: {
                note_id: '',
                chapter_id: this.chapter_id,
                content
            },
            responseType: "json"
        })
        const note = new Note(this, note_id, content, this.#hako_action)
        this.notes.push(note)
        return note
    }
    async destroy_all_notes() {
        await this.get_info()
        for (const note of this.notes) await note.destroy()
        return true
    }
    async update_info(info_obj) {
        await this.get_info()
        Object.assign(this.info, info_obj)
        const form = Object.assign({chapter_id: this.chapter_id}, this.info) 
        await this.#hako_action.post(this.UPDATE_INFO_ACTION, {
            form: myobj_to_upload_form(form)
        })
        return this.info
    }
}
module.exports = Chapter