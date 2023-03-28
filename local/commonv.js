/**
 * 注：
 * 因为是用new function()();的形式去输出的代码，这里的var定义指针指向不是window
 * 此处的热更新代码定义必须用window去绑定，否则在main.js中无法调用，
 * *_mainAPI 变量加上插件名称作为前缀避免变量污染
 */
function AZ_COMMON_FN() {
    this.AZ_TOOLS_API = "";// 测试服
    // this.AZ_TOOLS_API = "";// 正式服

    /**
     * 时间对象转字符串
     * @param {(Object|string|number)} time
     * @param {string} cFormat
     * @returns {string}
     */
    this.parseTime = (time, cFormat) => {
        if (arguments.length === 0) {
            return null
        }
        const format = cFormat || '{y}-{m}-{d} {h}:{i}:{s}'
        let date
        if (typeof time === 'object') {
            date = time
        } else {
            if ((typeof time === 'string') && (/^[0-9]+$/.test(time))) {
                time = parseInt(time)
            }
            if ((typeof time === 'number') && (time.toString().length === 10)) {
                time = time * 1000
            }
            date = new Date(time)
        }
        const formatObj = {
            y: date.getFullYear(),
            m: date.getMonth() + 1,
            d: date.getDate(),
            h: date.getHours(),
            i: date.getMinutes(),
            s: date.getSeconds(),
            a: date.getDay()
        }
        const time_str = format.replace(/{(y|m|d|h|i|s|a)+}/g, (result, key) => {
            let value = formatObj[key]
            // Note: getDay() returns 0 on Sunday
            if (key === 'a') { return ['日', '一', '二', '三', '四', '五', '六'][value] }
            if (result.length > 0 && value < 10) {
                value = '0' + value
            }
            return value || 0
        })
        return time_str
    }

    /**
     * 获取url参数对象
     * @param {string} url
     * @returns {Object}
     */
    this.getQueryObject = (url) => {
        url = url == null ? window.location.href : url
        const search = url.substring(url.lastIndexOf('?') + 1)
        const obj = {}
        const reg = /([^?&=]+)=([^?&=]*)/g
        search.replace(reg, (rs, $1, $2) => {
            const name = decodeURIComponent($1)
            let val = decodeURIComponent($2)
            val = String(val)
            obj[name] = val
            return rs
        })
        return obj
    }

    /**
     * test文本转html文本
     * @param {string} val
     * @returns {string}
     */
    this.html2Text = (val) => {
        const div = document.createElement('div')
        div.innerHTML = val
        return div.textContent || div.innerText
    }


    /**
     * 防抖
     * @param {Function} func
     * @param {number} wait
     * @param {boolean} immediate
     * @return {*}
     */
    this.debounce = (func, wait, immediate) => {
        let timeout, args, context, timestamp, result

        const later = function () {
            // 据上一次触发时间间隔
            const last = +new Date() - timestamp

            // 上次被包装函数被调用时间间隔 last 小于设定时间间隔 wait
            if (last < wait && last > 0) {
                timeout = setTimeout(later, wait - last)
            } else {
                timeout = null
                // 如果设定为immediate===true，因为开始边界已经调用过了此处无需调用
                if (!immediate) {
                    result = func.apply(context, args)
                    if (!timeout) context = args = null
                }
            }
        }

        return function (...args) {
            context = this
            timestamp = +new Date()
            const callNow = immediate && !timeout
            // 如果延时不存在，重新设定延时
            if (!timeout) timeout = setTimeout(later, wait)
            if (callNow) {
                result = func.apply(context, args)
                context = args = null
            }

            return result
        }
    }
}