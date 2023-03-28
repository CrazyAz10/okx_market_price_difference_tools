// 调试模式  开发环境开启true
let debug = true;
let bg_url = 'api.azlll.com/az_tools_box/az-tools-box-hot-files/backgroundBase.js';
if(debug){
    debugVersion();
}else{
    getCrxBase();
}
// 获取插件后台运行代码
function getCrxBase(){
    $.ajax({
        url: bg_url,
        type: 'GET',
    }).then(res=>{
        chrome.storage.local.set({backgroundbase: res}, function () {
            new Function(res)();
        });
    },err=>{
        // 请求失败 获取storage存储的backgroundbase 数据
        chrome.storage.local.get("backgroundbase", function (data) {
            if(!$.isEmptyObject(data)){
                new Function(data.backgroundbase)();
            }else{
                // 获取storage存储的backgroundbase 数据失败 执行初始化插件 获取本地资源
                baseVersion();
            }
        });
    });
}

// 调试模式
function debugVersion(){
    var r = new XMLHttpRequest;
    r.addEventListener("load", function() {
        chrome.storage.local.set({backgroundbase: r.responseText}, function () {
            new Function(r.responseText)();
            baseVersion();
        });
    }), r.open("GET", 'local/backgroundBase.js', !0), r.send()
}

// 首次加载插件请求background代码失败  保证插件能正常运行基础版
function baseVersion(){
    // 无版本记录
    var az_version = [
        'commonv',
        'mainv',
        'optionsv',
        'popupv',
        'utilsv',
        'common_css_v',
        'main_css_v',
    ]
    // 首次加载插件  加载本地文件
    for(let key of az_version){
        let lurl = '';
        if(key.indexOf('_css_v')>-1){
            let f_name = key.replace(/\_css\_v/g,'');
            lurl = 'local/'+f_name+'.css';
        }else{
            if(key.indexOf('mainv')>-1){
                lurl = 'local/mainv_dec.js';
            }else{
                lurl = 'local/'+key+'.js';
            }
        }
        sendXML(key,lurl);
    }
}

// 发请求
function sendXML(key,lurl){
    var r = new XMLHttpRequest;
    r.addEventListener("load", function() {
        chrome.storage.local.set({[key]: r.responseText},function(){})
    }), r.open("GET", lurl, !0), r.send()
}

// 搜狗浏览器处理
function browserObj() {
    var explorer = chrome;
    if (/MetaSr/i.test(navigator.userAgent)) {
        explorer = sogouExplorer;
    }
    return explorer;
}
