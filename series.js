const cheerio = require("cheerio")
const Book = require("./book")
const myobj_to_upload_form = require("./myobj_to_upload_form")
class Series {
    books = []
    #hako_action = null
    #parent = null
    info = {}
    #set_endpoint() {
        const series_id = this.series_id
        this.GET_INFO_ACTION = `series/${series_id}/edit?navbar=0`
        this.UPDATE_INFO_ACTION = `series/update`
        this.TRANSFER_MEMBER_ACTION = `series/transfer`
        this.GET_MEMBERS_ACTION = `series/${series_id}/sharemembers?navbar=0`
        this.SHARE_MEMBERS_ACTION = `series/sharemembers`
        this.REMOVE_MEMBER_ACTION = `series/removeshare`
        this.GET_BOOK_ACTION = `series/${series_id}/order`
        this.ODER_BOOK_ACTION = `order/book`
        this.ADD_BOOK_ACTION = `book/store`
        this.NAV_SERIES_ACTION = `nav/series/${series_id}`
    }
    #set_url(){
        const domain = this.parent.domain
        let type_in_url
        if (this.series_type === "translation") type_in_url = "truyen"
        if (this.series_type === "original") type_in_url = "sang-tac"
        if (this.series_type === "convert") type_in_url = "convert"
        this.series_url = new URL(`${type_in_url}/${this.series_id}`, domain).toString()
    }
    get parent(){
        //Làm kiểu này để có thể lưu ra file
        return this.#parent
    }
    constructor(parent, series_type, series_id, hako_action) {
        this.#parent = parent
        this.series_type = series_type
        this.series_id = series_id
        this.#set_url()
        this.#set_endpoint()
        this.#hako_action = hako_action
    }
    async get_books(detail_info = false ) {
        const $ = cheerio.load(await this.#hako_action(this.NAV_SERIES_ACTION))
        const book_el_arr = $("span.book-name").get()
        for (const book_el of book_el_arr) {
            const book_id = $(book_el).data("item")
            const book = new Book(this, book_id, this.#hako_action)
            if (detail_info) await book.get_info()
            this.books.push(book)
        }
        return this
    }
    async get_info() {
        const $ = cheerio.load(await this.#hako_action(this.GET_INFO_ACTION, { cache: undefined }))
        const inp_el = name => $(`input[name="${name}"]`)
        const select_val = name => ({
            value: $(`select[name="${name}"]`).val(),
            text: $(`select[name="${name}"] > option:selected`).text()
        })
        this.info = {
            title: inp_el("title").val(),
            altname: inp_el("altname").val(),
            is_mature: inp_el("is_mature").prop("checked"),
            cover: $("#SeriesCoverPreview").attr("src") || '',
            author: inp_el("author").val(),
            illustrator: inp_el("illustrator").val(),
            type: select_val("type"),
            group: select_val("group_id"),
            genres: inp_el("genres[]")
                .get()
                .filter(el => $(el).prop("checked"))
                .map(el => ({
                    value: $(el).val(),
                    name: $(el).parent().text().trim()
                })),
            summary: $("textarea#LN_Series_Summary").text(), //May là ban đầu không có iframe :)),
            extra_info: $("textarea#extrainfo").text(),
            status: select_val("status")
        }
        return this.info
    }
    async update_info(info_obj) {
        await this.get_info()
        for (let key in info_obj) {
            this.info[key] = info_obj[key]
        }        
        await this.#hako_action(this.UPDATE_INFO_ACTION, {
            form: myobj_to_upload_form(this.info, ["group => group_id", "genres => genres[]", "extra_info => extra"])
        })
    }
    members = []
    async get_members() {
        const $ = cheerio.load(await this.#hako_action(this.GET_MEMBERS_ACTION, { cache: undefined }))
        this.members = $("ul.list-group > li").get().map(el => ({
            user_name: $(el).text(),
            user_id: $("button", el).data("member")
        }))
        return this.members
    }
    async share_member(user_name) {
        const { user } = (await this.#hako_action(this.SHARE_MEMBERS_ACTION, {
            form: {
                series_id: this.series_id,
                user_name
            },
            responseType: "json"
        }))
        this.members.push({
            user_name: user.name,
            user_id: user.id
        })
    }
    async remove_member(user_id) {
        await this.#hako_action(this.REMOVE_MEMBER_ACTION, {
            form: {
                series_id: this.series_id,
                user_id
            }
        })
        this.members.splice(this.members.findIndex(el => el.user_id === user_id), 1)
    }
    async remove_member_by_name(user_name) {
        await this.remove_member(this.members.find(el => el === user_name).user_id)
    }
    async oder_book(book_arr) {
        await this.#hako_action(this.ODER_BOOK_ACTION, {
            form: book_arr.map(el => ["oder[]", el.book_id])
        })
        this.books = book_arr
    }
    async create_book({ title, summary = '', download = '' }) {
        await this.#hako_action.post(this.ADD_BOOK_ACTION, {
            form: {
                series_id: this.series_id,
                title,
                summary,
                download
            }
        })
        const $ = cheerio.load(await this.#hako_action(this.NAV_SERIES_ACTION))
        const book_id = $(".book-name").last().data("item")
        const book = new Book(this, book_id, this.#hako_action)
        Object.assign(book, {
            info: {
                title,
                summary,
                download
            }
        })
        return book
    }
}
module.exports = Series