module.exports = (myobj, rename_arr = []) => {
    let re = []
    for (let key in myobj) {
        let myel = myobj[key]
        if (Array.isArray(rename_arr)) {
            const rename_el = rename_arr.find(el => el.match(new RegExp(`${key}\\s*=>`)))
            if (rename_el) {
                delete myobj[key]
                key = rename_el.split("=>")[1].trim()
            }
        }
        (() => {
            if (typeof myel === "boolean") {
                if (myel) re.push([key, 1])
                return
            }
            if (Array.isArray(myel)) {
                myel.forEach(el => re.push([key, el.value]))
                return
            }
            if (typeof myel === "object") {
                re.push([key, myel.value])
                return
            }
            re.push([key, myel])
        })()

        //Làm kiểu thế này là guard clause đúng không? Trông hơi kì nhưng công nhận là gọn hơn if - else thật.
        //Để gửi mảng theo format "tên[]=giá_trị_1,tên[]=giá_trị_2" của Hako thì dùng mảng chứa nhiều mảng [tên, giá_trị]
        //Sốt: https://github.com/sindresorhus/got#searchparams
    }
    return re
}