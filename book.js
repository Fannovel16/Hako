const cheerio = require("cheerio")
const Chapter = require("./chapter")
const myobj_to_upload_form = require("./myobj_to_upload_form")
class Book {
    chapters = []
    #hako_action = null
    #parent = null
    info = {}
    #set_endpoint() {
        const book_id = this.book_id
        this.GET_INFO_ACTION = `book/${book_id}/edit?navbar=0`
        this.UPDATE_INFO_ACTION = `book/update`
        this.CREATE_CHAPTER_ACTION = "chapter/store"
        this.ODER_CHAPTER_ACTION = `oder/chapter`
        this.NAV_SERIES_ACTION = this.parent.NAV_SERIES_ACTION
    }
    get parent(){
        //Làm kiểu này để có thể lưu ra file
        return this.#parent
    }
    constructor(parent, book_id, hako_action) {
        this.#parent = parent
        this.book_id = book_id
        this.book_url = `${this.parent.series_url}/t${this.book_id}`
        this.#set_endpoint()
        this.#hako_action = hako_action
    }
    async get_chapters(detail_info = false) {
        const $ = cheerio.load(await this.#hako_action(this.NAV_SERIES_ACTION))
        const book_name_el = $(`span.book-name[id="book_${this.book_id}"]`)
        const chap_el_arr = $("span.chapter-name", book_name_el.next()).get()
        this.chapters = []
        for (const chap_el of chap_el_arr) {
            const chapter_id = $(chap_el).data("item")
            const chapter = new Chapter(this, chapter_id, this.#hako_action)
            if (detail_info) await chapter.get_info()
            this.chapters.push(chapter)
        }
    }
    async create_chapter({ title, content, complete = true }) {
        let form = {
            book_id: this.book_id,
            title,
            image: '',
            content
        }
        if (complete) form.complete = 1
        await this.#hako_action.post(this.CREATE_CHAPTER_ACTION, { form })
        const $ = cheerio.load(await this.#hako_action(this.NAV_SERIES_ACTION))
        const book_el = $(`span#book_${this.book_id}`)
        const chapter_id = $("span.chapter-name", book_el.next()).data("item")
        const chapter = new Chapter(this, chapter_id, this.#hako_action)
        this.chapters.push(chapter)
        return chapter
    }
    async get_info() {
        const $ = cheerio.load(await this.#hako_action(this.GET_INFO_ACTION, { cache: undefined }))
        const inp_el = name => $(`input[name="${name}"]`)
        this.info = {
            title: inp_el("title").val(),
            cover_url: $("img#BookCoverPreview").attr("src") || '',
            summary: $("textarea#LN_Book_Summary").text(),
            download_url: inp_el("download").text()
        }
        return this.info
    }
    async update_info(info_obj) {
        await this.get_info()
        for (let key in info_obj) {
            this.info[key] = info_obj[key]
        }        
        await this.#hako_action.post(this.UPDATE_INFO_ACTION, {
            form: myobj_to_upload_form(this.info, ["download_url => download", "cover_url => cover"])
        })
        return this.info
    }
    async oder_chapter(chapter_arr) {
        await this.#hako_action.post(this.ODER_BOOK_URL, {
            form: chapter_arr.map(el => ["oder[]", el.chapter_id])
        })
        this.chapters = chapter_arr
    }
}
module.exports = Book