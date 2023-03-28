/**
 * Az代码
 * 插件热更新模块逻辑
 * 热更新模块：
 * commonv
 * mainv
 * optionsv
 * popupv
 * utilsv
 * common_css_v
 * main_css_v
 * 
 * 服务器版本文件夹名称：ddtools_hot_upload
 * 
 */
var azAPI = "http://localhost:8520";// 测试热更新地址
// var azAPI = "";// 线上热更新地址

var _t = new Date();
    _t = _t.getTime();
// 获取文件版本号接口
var verstion_url = azAPI+"/az-tools-box-hot-files/version.json?_t=" + _t;
// 文件版本号
var az_version = '';

if(!debug){
    initVersion();
}

// 初始化文件版本
function initVersion(){
    chrome.storage.local.get('az_version',function(e){
        az_version = $.isEmptyObject(e) ? '' : e.az_version;
        // 判断是否有版本记录
        if(!az_version){
            // 无版本记录
            az_version = {
                commonv: '1.0.0.1',
                mainv: '1.0.0.1',
                optionsv: '1.0.0.1',
                popupv: '1.0.0.1',
                utilsv: '1.0.0.1',
                common_css_v: '1.0.0.1',
                main_css_v: '1.0.0.1',
            }
            // 首次加载插件  加载本地文件
            for(let key in az_version){
                let lurl = '';
                if(key.indexOf('_css_v')>-1){
                    let f_name = key.replace(/\_css\_v/g,'');
                    lurl = 'local/'+f_name+'.css';
                }else{
                    lurl = 'local/'+key+'.js';
                }
                r(lurl,function(data){
                    chrome.storage.local.set({[key]: data},function(){})
                })
            }
            // 首次加载插件  存储初始文件版本
            chrome.storage.local.set({az_version: az_version},function(){
                getConfig(verstion_url,function(in_version){
                    in_version = JSON.parse(in_version);
                    compare(az_version,in_version)
                });
            })
        }else{
            getConfig(verstion_url,function(in_version){
                in_version = JSON.parse(in_version);
                compare(az_version,in_version)
            });
        }
    });
}

// 发送请求
function r(e, t) {
    var xmlhttp = new XMLHttpRequest;
    xmlhttp.onreadystatechange=function()
	{
		if (xmlhttp.readyState==4)
		{
            if(xmlhttp.status==200){
                t(xmlhttp.responseText);
            }else{
                t('');
            }
		}
	}
    xmlhttp.open("GET", e, !0), 
    xmlhttp.send()
}

// 获取配置
function getConfig(_config_server,f) {
    r(_config_server, function(t) {
        try {
            f(t);
        } catch(r) {}
    })
}


// 比对线上文件版本
function compare(un_vs,in_vs){
    for(let key in un_vs){
        let un_ = un_vs[key];
            un_ = un_.replace(/\./g,'');
        let in_ = in_vs[key];
            in_ = in_.replace(/\./g,'');
        if(un_*1<in_*1){
            // 当前版本不是最新版本
            let url = '';
            if(key.indexOf('_css_v')>-1){
                let f_name = key.replace(/\_css\_v/g,'');
                url = azAPI+"/ddtools_hot_upload/version"+in_vs[key]+"/"+f_name+".css";
            }else{
                url = azAPI+"/ddtools_hot_upload/version"+in_vs[key]+"/"+key+".js";
            }
            // 清除本地存储的当前版本
            chrome.storage.local.remove(key, function () {
                r(url,function(data){
                    if(data){
                        uploadStorage(key,in_vs[key],data);
                    }
                })
            });
        }else{
            // 判断本地存储是否有值   无值则请求最新对应版本存储
            chrome.storage.local.get(key, function (data) {
                if($.isEmptyObject(data)){
                    let url = azAPI+"/ddtools_hot_upload/version/"+key+".js";
                    r(url,function(data){
                        uploadStorage(key,in_vs[key],data);
                    })
                }
            });
        }
    }
}

// 执行background代码  不论background代码是否有更新都需要执行一次
function start() {
    chrome.storage.local.get("backgroundv", function (data) {
        new Function(data.backgroundv)();
    });
}

// 更新storage
function uploadStorage(key,vs,data){
    // 更新文件内容
    chrome.storage.local.set({[key]: data},function(){
        // 更新版本号
        az_version[key] = vs;
        chrome.storage.local.set({az_version: az_version},function(){})
    })
}





// 通讯
// 绑定监听事件,background.js接受从popup.js插件弹出框或者main.js淘宝商品详情页发过来的数据,做出相应的处理返回数据,request为接受的信息,sendResponse为返回信息方法
browserObj().extension.onMessage.addListener(function (request, sender, sendResponse) {
    switch(request.name)
    {
        // 常规的ajax请求
        case "universal":
        $.ajax({
            timeout: 10000,
            type: request.type,
            url: request.url,
            dataType: request.dataType,
            data: request.data,
            headers: request.headers?request.headers:{},
            success: function (e) {
                sendResponse({result: e,state: 1});
            }, error: function (r) {
                sendResponse({result: r,state: 0});
            }
        });
        break;
        // 常规的ajax请求--token
        case "universal_token":
            chrome.storage.local.get('az_token', (e) => {
                if (!$.isEmptyObject(e)) {
                    this.az_token = JSON.parse(e.az_token);
                } else {
                    this.az_token = '';
                }
                let data = request.data;
                data = Object.assign(data,{token: az_token});
                $.ajax({
                    type: request.type,
                    url: request.url,
                    dataType: request.dataType,
                    data: data,
                    success: function (e) {
                        sendResponse({result: e,state: 1});
                    }, error: function (r) {
                        sendResponse({result: r,state: 0});
                    }
                });
            });
        break;
        // 
        case "testMessage":
            sendResponse('与插件后台通讯成功！');
        break;
        default: 
        break;
    }
    return true;
});



