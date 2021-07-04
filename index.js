const got = require("got")
const { CookieJar } = require("tough-cookie")
const cheerio = require("cheerio")
const Series = require("./series")
    //const FormData = require('form-data');
class my_error {
    constructor(type, message, info) {
        this.type = type
        this.message = message
        this.info = info
    }
}
class Hako {
    static LOGIN_ERROR = "login_error"
    static UNEXPECTED_ERROR = -1
    domain = "https://docln.net"
    #name = ''
    #password = ''
    info = {}
    constructor(name, password) {
        this.#name = name
        this.#password = password
    }
    #cookieJar = new CookieJar()
    #cache_map = new Map()
    #hako_req = got.extend({
        prefixUrl: this.domain,
        cookieJar: this.#cookieJar,
        resolveBodyOnly: true,
        headers: {
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_6) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.2 Safari/605.1.15"
        },
        cache: this.#cache_map
    })
    #get_token(page) {
        const $ = cheerio.load(page)
        return $("input[name='_token']").val()
    }
    clear_cache() {
        this.#cache_map.clear()
    }
    async login() {
        try {
            await this.#hako_req()
            await this.#hako_req.post("login", {
                form: {
                    _token: this.#get_token(await this.#hako_req("login")),
                    name: this.#name,
                    password: this.#password
                }
            })
        } catch (e) {
            const { message } = e
            if (message.match("Redirect")) throw new my_error(Hako.LOGIN_ERROR, "Username or password wrong", {
                name: this.#name,
                password: this.#password
            })
            if (message.match("405")) return true
            throw new my_error(Hako.LOGIN_ERROR, "Unexpected login error", {
                response: message
            })
        }
    }
    #hako_action = this.#hako_req.extend({
        prefixUrl: `${this.domain}/action`,
        token: null,
        handlers: [
            async(options, next) => {
                const cookie_obj = this.#cookieJar.getCookiesSync(options.prefixUrl)[0]
                if (new Date().getTime() >= cookie_obj.expires.getTime()) {
                    await this.login()
                    options.token = null
                }
                if (!options.token) options.token = this.#get_token(await this.#hako_req("action/series/index"))
                if (options.form) {
                    if(Array.isArray(options.form)) options.form.push(["_token", options.token])  
                    else Object.assign(options.form, { _token: options.token })
                }
                if (options.body) options.body.append("_token", options.token)
                await new Promise(re => setTimeout(re, 1500))
                try {
                    return await next(options)
                } catch (error) {
                    if (error.message.match("405")) {
                        console.warn("405 redirect detected!")
                        return true
                    }
                    if (error.message.match("429")) {
                        console.warn("Exceed rate limiting! I will retry after 1 minute")
                        await new Promise(re => setTimeout(re, 60 * 1000))
                        return await next(options)
                    }
                    throw new my_error(Hako.UNEXPECTED_ERROR, "An unexpected error when sending action request", {
                        request: {
                            url: options.url.toString(),
                            data: JSON.stringify(options.body || options.form, null, 4)
                        },
                        response: error.message
                    })
                }
            }
        ]
    })
    series_types = ["translation", "original", "convert"]
    series = []
    async get_series(detail_info = true) {
        for (const series_type of this.series_types) {
            const $ = cheerio.load(await this.#hako_action(`series/index?type=${series_type}`))
            const series_tr_arr = $("table tr").get().filter(el => $(el).attr("id"))
            for (const series_tr of series_tr_arr) {
                const series_id = $(series_tr).attr("id").replace("series_", '')
                const series = new Series(this, series_type, series_id, this.#hako_action)
                if (detail_info) await series.get_info()
                this.series.push(series)
            }
        }
        return this.series
    }
    get_chapter_by_id(){

    }






    /* async upload_image({ chapter_id, image_buffer }) {
        const file_form = new FormData()
        file_form.append("chapter_id", chapter_id)
        file_form.append("filename", "vol4cover.jpg")
        file_form.append("image", image_buffer, { filename: "vol4cover.jpg" }) //The form will not vaild if you don't add file name
        return await this._hako_action.post("upload/image", { body: file_form })
    } 
    //Dính 422
    */
}
module.exports = Hako