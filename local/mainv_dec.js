!function (window) {
    var AZ_TOOLS = {
            base_css: ""
        };
    var AZ_COMMON = {};// 啊佐插件公共方法
    // 自定义匹配域名
    // 作用域配置
    AZ_TOOLS.adaptationArr = {
        // 域名拼接合成
        // ['w'+'w'+'w'+'.'+'h'+'u'+'o'+'b'+'i'+'.']: [
        //     {
        //         path: /\/exchange\//,
        //         name: 'az_huobi_tools',
        //         // 黑名单 （名单不全待续补上）
        //         blackDomain: [  
        //         ]
        //     }
        // ],
        ['w'+'w'+'w'+'.'+'o'+'k'+'x'+'.']: [
            {
                path: /\/spot-list/,
                // path: /\/trade-spot\//,
                name: 'az_okex_tools',
                // 黑名单 （名单不全待续补上）
                blackDomain: [  
                ]
            }
        ]
    };
    // 插件功能配置
    AZ_TOOLS.crx_cffect = {
        // az_huobi_tools: new az_huobi_tools(),
        az_okex_tools: new az_okex_tools()
    };// 插件功能对象
    AZ_TOOLS.action_name = '';// 启动插件功能名
    AZ_TOOLS.adaptationOk = 0;// 用于判断域名匹配是否通过
    AZ_TOOLS.loc_host = location.host;// 当前完整pash
    AZ_TOOLS.loc_pathname = location.pathname;// 当前path路径
    AZ_TOOLS.action_domain = '';// 最终匹配的域名

    // 域名+路由匹配
    AZ_TOOLS.domainFilter = function () {
        AZ_TOOLS.adaptationOk = 0;
        $.each(AZ_TOOLS.adaptationArr, function (v) {
            // 域名匹配
            if (AZ_TOOLS.loc_host.indexOf(v) !== -1) {
                var url_ = window.location.href;
                for (var key in AZ_TOOLS.adaptationArr[v]) {
                    // 路由匹配
                    let petend = new RegExp(AZ_TOOLS.adaptationArr[v][key]['path']);
                    if (petend.test(url_)) {
                        let black = false;
                        // 黑名单校验
                        for(let item of AZ_TOOLS.adaptationArr[v][key].blackDomain){
                            if(AZ_TOOLS.loc_host.indexOf(item)!==-1){
                                black = true;
                                break;
                            }
                        }
                        if(!black){
                            AZ_TOOLS.action_domain = v;
                            AZ_TOOLS.styleRendering(v);
                            AZ_TOOLS.adaptationOk = 1;
                            AZ_TOOLS.action_name = AZ_TOOLS.adaptationArr[v][key]['name'];
                        }
                        break;
                    }
                }
            }
        });
        // 不是指定路由清除节点
        if (!AZ_TOOLS.adaptationOk) {
        } else {
            // 是指定路由清除节点 并从新执行插件新功能
            AZ_TOOLS.crx_cffect[AZ_TOOLS.action_name].init();
        }
        return;
    }

    // 插入指定插件功能样式
    AZ_TOOLS.styleRendering = function (name) {
        // 样式插件添加
        var oHead = document.getElementsByTagName('head').item(0);
        var oStyle = document.createElement("style");
        // 获取存储样式并渲染
        chrome.storage.local.get('common_css_v', function (e) {
            AZ_TOOLS.base_css += $.isEmptyObject(e) ? '' : e.common_css_v;
            chrome.storage.local.get('main_css_v', function (e) {
                AZ_TOOLS.base_css += $.isEmptyObject(e) ? '' : e.main_css_v;
                oStyle.appendChild(document.createTextNode(AZ_TOOLS.base_css));
            })
        })
        oHead.appendChild(oStyle);
    }

    // 页面加载完执行
    // window.onload = function () {
        AZ_TOOLS.domainFilter();
    // }

    //配置DataTables默认参数
    /**
        用来描述表格主要信息的字符串
        \_START\_ 当前页第一条数据的索引
        \_END\_ 当前页最后一条数据的索引
        \_TOTAL\_ 过滤后表格中总记录数
        \_MAX\_ 没有过滤的表格总记录数
        \_PAGE\_ 当前页数
        \_PAGES\_ 表格中总页数
    */
    $.extend(true, $.fn.dataTable.defaults, {
        "language": {
            "paginate": {
                'first': '首页',
                'last': '尾页',
                'next': '>',
                'previous': '<'
            },
            "search": "检索：",
            "lengthMenu": "每页显示_MENU_",
            "emptyTable": "暂无数据！",
            "zeroRecords": "没有找到记录",
            "info": "显示第 _START_ 至 _END_ 页结果，共 _TOTAL_项",
            "infoEmpty": "无记录",
            "infoFiltered": "(从 _MAX_ 条记录过滤)",
            "loadingRecords": "请等待，数据正在加载中......"
        },
        // "dom": "l<'#toolbar'>frtip"
    });

    function renderDomModule() {

        // 渲染买卖家著列表数据
        this.renderTableData = function(){
            this.renderInitTable();
            // if($(".AZTOOLSFORMULA .table-list.other .table").length!=this.coins.length){
            //     // 修改选择分析币种
            //     this.renderInitTable();
            //     return;
            // }
            // if(!$(".AZTOOLSFORMULA .table-list.other .table tbody>tr").length){
            //     // 首次渲染表格节点
            //     this.renderInitTable();
            // }else{
                // 后续只修改节点内容
                for(let item of this.coins){
                    if (!item.active) continue;
                    let Otable = $(".AZTOOLSFORMULA .table-list.other .table[data-coin='"+item.name+"']");
                    Otable.find(".bz_U_sell").text(item.bz_U_sell);
                    Otable.find(".bz_U_buy").text(item.bz_U_buy);
                    Otable.find(".pk").text(item.pk);
                    Otable.find(".final_price_sell").text(item.final_price_sell);
                    Otable.find(".final_price_buy").text(item.final_price_buy);
                    // 颜色变更
                    let ch_u = ((item.sell[item.sell.length-1].U*100)-(item.bz_U_sell*100))/100;
                    let bg_color1 = "";
                    if(ch_u>=0.035){
                        if(ch_u<0.055){
                            bg_color1 = 'color-green'
                        }else{
                            bg_color1 = 'color-red'
                        }
                    }
                    Otable.find(".bz_U_sell").closest('tr').removeClass('color-green color-red').addClass(bg_color1);
                    // 颜色变更
                    let ch_u2 = ((item.buy[item.buy.length-1].U*100)-(item.bz_U_buy*100))/100;
                    let bg_color2 = "";
                    if(ch_u2>=0.035){
                        if(ch_u2<0.055){
                            bg_color2 = 'color-green'
                        }else{
                            bg_color2 = 'color-red'
                        }
                    }
                    Otable.find(".bz_U_buy").closest('tr').removeClass('color-green color-red').addClass(bg_color2);

                    for(let i in item.sell){
                        let val = item.sell[i];
                        let cha_u = ((val.U*100)-(item.bz_U_sell*100))/100;
                        let color = "";
                        if(cha_u>=0.035){
                            if(cha_u<0.055){
                                color = 'color-green'
                            }else{
                                color = 'color-red'
                            }
                        }

                        let Otd =  `<td class="${color}">${val.compare}</td>
                                    <td class="left name" data-name='${val.userName}'>${val.userName} (${val.tradeMonthTimes} | ${val.orderCompleteRate}%)</td>
                                    <td>${val.U}</td>
                                    <td>${val.tradeCount}</td>
                                    <td>${val.price}</td>`;
                        // 打标颜色
                        let classname = "";
                        if(this.biaojiList.indexOf(val.userName) > -1){
                            classname = "biaoji";
                        }
                        console.log(classname)
                        if(classname){
                            Otable.find('.sell>tbody>tr').eq(i).removeClass('biaoji').addClass(classname).html(Otd);
                        }else{
                            let bs = Math.round(val.tradeCount/this.coins_benchmark[item.name]*100);
                            console.log(bs)
                            bs = bs>100?100:bs;
                            bs = bs<=0?1:bs;
                            // 基准背景色渲染
                            Otable.find('.sell>tbody>tr').eq(i).removeClass('biaoji').css({
                                'background-size': bs+'% 100%'
                            }).html(Otd)
                        }
                    }
                    for(let i in item.buy){
                        let val = item.buy[i];
                        let cha_u = ((item.bz_U_sell*100)-(val.U*100))/100;
                        let color = "";
                        if(cha_u>=0.035){
                            if(cha_u<0.055){
                                color = 'color-green'
                            }else{
                                color = 'color-red'
                            }
                        }
                        let Otd =  `<td class="left">${val.price}</td>
                                    <td class="left">${val.tradeCount}</td>
                                    <td class="left">${val.U}</td>
                                    <td class="name" data-name='${val.userName}'>${val.userName} (${val.tradeMonthTimes} | ${val.orderCompleteRate}%)</td>
                                    <td class="${color}">${val.compare}</td>`;
                        // 打标颜色
                        let classname = "";
                        if(this.biaojiList.indexOf(val.userName) > -1){
                            classname = "biaoji";
                        }
                        if(classname){
                            Otable.find('.buy>tbody>tr').eq(i).removeClass('biaoji').addClass(classname).html(Otd);
                        }else{
                            let bs = Math.round(val.tradeCount/this.coins_benchmark[item.name]*100);
                            bs = bs>100?100:bs;
                            bs = bs<=0?1:bs;
                            // 基准背景色渲染
                            Otable.find('.buy>tbody>tr').eq(i).removeClass('biaoji').css({
                                'background-size': bs+'% 100%'
                            }).html(Otd)
                        }
                    }
                }
            // }
            
        }

        // 初始化表格列表
        this.renderInitTable = function(){
            let Otable = ``;
            for(let item of this.coins){
                if (!item.active) continue;
                Otable += `<div class="table" data-coin="${item.name}">
                                <div class="table-title">
                                    <span class="title">${item.name}市场挂单</span>
                                    ${
                                        (() => {
                                            if (!item.support) {
                                                return `<span style="color: red">该交易对不支持OTC交易</span>`
                                            } else {
                                                return ''
                                            }
                                        })()
                                    }
                                </div>
                                <div class="chunk flex space-between">
                                    <table class="sell">
                                    <!-- <colgroup>
                                            <col width="30px"></col>
                                            <col width="200px"></col>
                                            <col width="60px"></col>
                                            <col width="80px"></col>
                                            <col width="70px"></col>
                                        </colgroup> -->
                                        <thead>
                                            <tr>
                                                <td></td>
                                                <td></td>
                                                <td class="bz_U_sell">${item.bz_U_sell}</td>
                                                <td class="pk">${item.pk}</td>
                                                <td class="final_price_sell">${item.final_price_sell}</td>
                                            </tr>
                                            <tr>
                                                <th>-</th>
                                                <th class="left">商(30日成单 | 30日完成率)</th>
                                                <th>U</th>
                                                <th>量</th>
                                                <th>卖价</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            ${
                                                function(){
                                                    let Otr = ``;
                                                    for(let val of item.sell){
                                                        Otr += `<tr>
                                                                    <td>${val.compare}</td>
                                                                    <td class="left name" data-name="${val.userName}">${val.userName} (${val.tradeMonthTimes} | ${val.orderCompleteRate}%)</td>
                                                                    <td>${val.U}</td>
                                                                    <td>${val.tradeCount}</td>
                                                                    <td>${val.price}</td>
                                                                </tr>`;
                                                    }
                                                    return Otr;
                                                }()
                                            }
                                        </tbody>
                                    </table>
                                    <table class="buy">
                                    <!-- <colgroup>
                                            <col width="70px"></col>
                                            <col width="80px"></col>
                                            <col width="60px"></col>
                                            <col width="200px"></col>
                                            <col width="30px"></col>
                                        </colgroup> -->
                                        <thead>
                                            <tr>
                                                <td class="left final_price_buy">${item.final_price_buy}</td>
                                                <td class="pk">${item.pk}</td>
                                                <td class="bz_U_buy">${item.bz_U_buy}</td>
                                                <td></td>
                                                <td></td>
                                            </tr>
                                            <tr>
                                                <th class="left">买价</th>
                                                <th class="left">量</th>
                                                <th class="left">U</th>
                                                <th class="right">商(30日成单 | 30日完成率)</th>
                                                <th>-</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                        ${
                                            function(){
                                                let Otr = ``;
                                                for(let val of item.buy){
                                                    Otr += `<tr>
                                                                <td class="left">${val.price}</td>
                                                                <td class="left">${val.tradeCount}</td>
                                                                <td class="left">${val.U}</td>
                                                                <td class="name" data-name="${val.userName}">${val.userName} (${val.tradeMonthTimes} | ${val.orderCompleteRate}%)</td>
                                                                <td>${val.compare}</td>
                                                            </tr>`;
                                                }
                                                return Otr;
                                            }()
                                        }
                                        </tbody>
                                    </table>
                                </div>
                            </div>`;
            }
            $(".AZTOOLSFORMULA .table-list.other").html(Otable);
        }

        // 渲染usdt数据表格
        this.renderUsdtData = function(){
            let self = this;
            if(!$(".AZTOOLSFORMULA .table-list.usdt .table tbody>tr").length){
                let Otable = ``;
                    Otable += `<div class="table" data-coin="${this.usdt.name}">
                                    <div class="table-title">
                                        <span class="title">${this.usdt.name}市场挂单</span>
                                    </div>
                                    <div class="chunk flex space-between">
                                        <table class="sell">
                                        <!-- <colgroup>
                                                <col width="200px"></col>
                                                <col width="80px"></col>
                                                <col width="60px"></col>
                                            </colgroup> -->
                                            <thead>
                                                <tr>
                                                    <th class="left">商(30日成单 | 30日完成率)</th>
                                                    <th>量</th>
                                                    <th>卖U</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                ${
                                                    function(){
                                                        let Otr = ``;
                                                        for(let val of self.usdt.sell){
                                                            Otr += `<tr>
                                                                        <td class="left name" data-name="${val.userName}">${val.userName} (${val.tradeMonthTimes} | ${val.orderCompleteRate}%)</td>
                                                                        <td>${val.tradeCount}</td>
                                                                        <td>${val.price}</td>
                                                                    </tr>`;
                                                        }
                                                        return Otr;
                                                    }()
                                                }
                                            </tbody>
                                        </table>
                                        <table class="buy">
                                        <!-- <colgroup>
                                                <col width="60px"></col>
                                                <col width="80px"></col>
                                                <col width="200px"></col>
                                            </colgroup> -->
                                            <thead>
                                                <tr>
                                                    <th class="left">买U</th>
                                                    <th>量</th>
                                                    <th class="right">商(30日成单 | 30日完成率)</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                            ${
                                                function(){
                                                    let Otr = ``;
                                                    for(let val of self.usdt.buy){
                                                        Otr += `<tr>
                                                                    <td class="left">${val.price}</td>
                                                                    <td>${val.tradeCount}</td>
                                                                    <td class="name" data-name="${val.userName}">${val.userName} (${val.tradeMonthTimes} | ${val.orderCompleteRate}%)</td>
                                                                </tr>`;
                                                    }
                                                    return Otr;
                                                }()
                                            }
                                            </tbody>
                                        </table>
                                    </div>
                                </div>`;
                $(".AZTOOLSFORMULA .table-list.usdt").html(Otable);
            }else{
                let Otable = $(".AZTOOLSFORMULA .table-list.usdt .table[data-coin='"+self.usdt.name+"']");
                    for(let i in self.usdt.sell){
                        let val = self.usdt.sell[i];
                        let Otd =  `<td class="left">${val.userName} (${val.tradeMonthTimes} | ${val.orderCompleteRate}%)</td>
                                    <td>${val.tradeCount}</td>
                                    <td>${val.price}</td>`;
                        Otable.find('.sell>tbody>tr').eq(i).html(Otd);
                        // 打标颜色
                        let classname = "";
                        if(this.biaojiList.indexOf(val.userName) > -1){
                            classname = "biaoji";
                        }
                        if(classname){
                            Otable.find('.sell>tbody>tr').eq(i).removeClass('biaoji').addClass(classname).html(Otd);
                        }else{
                            let bs = Math.round(val.tradeCount/this.coins_benchmark['USDT']*100);
                            bs = bs>100?100:bs;
                            bs = bs<=0?1:bs;
                            Otable.find('.sell>tbody>tr').eq(i).removeClass('biaoji').css({
                                'background-size': bs+'% 100%'
                            }).html(Otd);
                        }
                    }
                    for(let i in self.usdt.buy){
                        let val = self.usdt.buy[i];
                        let Otd =  `<td class="left">${val.price}</td>
                                    <td>${val.tradeCount}</td>
                                    <td>${val.userName} (${val.tradeMonthTimes} | ${val.orderCompleteRate}%)</td>`;
                        // 打标颜色
                        let classname = "";
                        if(this.biaojiList.indexOf(val.userName) > -1){
                            classname = "biaoji";
                        }
                        if(classname){
                            Otable.find('.buy>tbody>tr').eq(i).removeClass('biaoji').addClass(classname).html(Otd);
                        }else{
                            let bs = Math.round(val.tradeCount/this.coins_benchmark['USDT']*100);
                            bs = bs>100?100:bs;
                            bs = bs<=0?1:bs;
                            Otable.find('.buy>tbody>tr').eq(i).removeClass('biaoji').css({
                                'background-size': bs+'% 100%'
                            }).html(Otd);
                        }
                    }
            }
        }

        /**
         *  数据分析绑定事件处
         */
        this.dataAnalysisBindFn = function(){
            let self = this;
            // 选择分析币种
            $('body').on('click','.AZTOOLSFORMULA .tab-list-select>li',function(){
                let pand = $(this).hasClass('active');
                let tabId = $(this).data('tabid')
                let index = self.coins.findIndex((item) => item.name == tabId )
                let tabItem = self.coins[index]
                if(pand){
                    $(this).removeClass('active');
                    tabItem.active = false
                }else{
                    // 控制只监听两个币的数据
                    if($('.tab-list-select li.active').length>=2){
                        layer.msg(
                            "只允许同时监听两个币的数据！",
                            {icon: 0, offset: '50px', time: 10000}// icon=0:info, 1:success, 2:error  
                        );
                        return
                    }
                    $(this).addClass('active');
                    tabItem.active = true
                }
                self.distribution();
            });
            // 打标志
            $('body').on('mousedown','.AZTOOLSFORMULA .chunk tbody tr',function(e){
                let name = $(this).find('.name').attr('data-name');
                let is_bj = false;
                for(let key in self.biaojiList){
                    if(name == self.biaojiList[key]){
                        self.biaojiList.splice(key,1);
                        is_bj = true;
                        break;
                    }
                }
                if(!is_bj){
                    self.biaojiList.push(name);
                    $(this).addClass('biaoji');
                }
            });
        }
        // 调用绑定方法
        this.dataAnalysisBindFn();
    }

    /** 
     * 
     * 啊佐工具箱
     * 
    */
    // 插件1 啊佐工具箱
    function az_ToolsFormula() {
        this.timer = {};// 定时器
        // 销毁
        this.del = function () {
            // 清除监听
            clearInterval(this.timer);
        }

        // 初始化
        this.init = function () {
            // let iframe = `<iframe id="az_eth_usdt" src="https://www.huobi.co/zh-cn/exchange/eth_usdt/"></iframe>`;
            // $('body').append(iframe);
            // // 清除节点
            this.del();
            let self = this;
            // 获取token
            chrome.storage.local.get('AZ_TOOLS_CONFIG', (e) => {
                if (!$.isEmptyObject(e)) {
                    this.AZ_TOOLS_CONFIG = JSON.parse(e.AZ_TOOLS_CONFIG);
                }
            });
            // 渲染工具箱
            this.renderDom();
            // 启动所有事件监听
            this.bindFn();
        }

        // 加载啊佐工具箱节点
        this.renderDom = function(){
            let Odom = `<div id="AZTOOLSFORMULA" class="AZTOOLSFORMULA az-drag">
                            <div class="normal">
                                <div class="drag">
                                    <img class="logo" src="data:image/png;base64,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" />
                                </div>
                                <div class="tip">啊佐工具箱</div>
                                <ul class="information information-list">
                                    欢迎使用啊佐工具箱！
                                </ul>
                                <ul class="menu">
                                    <li class="tools-list" tools title="工具列表">
                                        <p>
                                            <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAFKklEQVRoQ+2ZZ6hdVRSEvxG7WDBq7GKNJgSDGuxdLEEwdoX8UEGjKFijWNCIGCFWRJFYQfSHorGQ2LBgVCwEBFskqFGU2BvYRUcG95Wbm/fe3ee+G6Pi/Hxn7Vlnzt5v7Vnrin859C9/f/4XkB20vTZwEHAwsBWwLjAC+BL4FHgbeBSYJemLfu76sHbA9jrAJcBJwLIVL/YbcGvWSIqwYaNnAbaPBm4DVunhLX4ETpR0dw9rF1nSkwDbU4DpHcnnAE8AzwMLgE+AkcDmwM7AgcAeHWsulDRtOCIaC7B9JnBNW9Kc75MlPdvtRWzvCtwCbNMWe66kK7utHex5IwG29waeBJYphLOAoyTlSFTB9krAXcBhZcHvwARJj1cRdARVC7C9MvA+kIoTPCVpv16Slsp1H3B4Wf8VsLGk75vyNRFwKXBxSfAZMGY4JdH2CsDLwLaFc5qkC5eIgLLtn7dVnMmSbm6arDPe9qHAzPL3HMMRTY5j1lXtgO2JwAMlUSrMlpJS04cF28n/FrB1ITpSUo5WNWoF3AEcV1inSzqvOkOXQNsXAJeXsLslTWrCXSvgRWCnQryvpKebJBkq1vb2wNwSM1fS+CbctQI+SJUoxJtKSjXqC2yvBywsZAslbdCEuFZAylvKaLCqpO+aJOmyA6lGP5WYXyUt34S7VsDHxWGGeyNJHzVJ0kXAhsCHJeZrSWs24a4V8ArQOps7S3qpSZIuAnYH4qOC+ZJGNeGuFXBT/E4hniopl1pfYDtm7vxCdo+kY5oQ1wo4BHiwEL+TpkWSmyQaKLbcA/OBLcrzWOz0C9WoFZB/rNiH1QvzEZLur84ySKDt44Hby+MUhpGSfmjCWyUghLYvAi4r5G8AO0j6uUmy9ljbaTnfLD1DHl0r6aymfE0EpIzm2t+kJMkO5Orv6SjZzmUYex7k64+W1KpG1TqqBZRd6OwHYsQmNTFgA/QDoZ4o6aHqt24LbCSgiIgnijdqoUlHtieQitbekfVko1vJGwsoIk4o04X29c8BjwEvtPXEGa9sNkRPfC1wjqR0ZT2hJwFFxATgzjL/aZo886KUzJZFb7r+r/jhCIgJuy49cQ/ZHwau6MeN3liA7YxKUlInA8v18PLtS14Lz3CEVAuwvWLpic8AMlloR8rfvcDsMg9K+/kNsAawFrB+mQsdC8S8tSNleEb5X1gyTb3tTN8y24zxaiGJU/qulpRhVhVshyMfIW1qazyTtbkcD5DU6g2q+LrugO3VgFw66ZxayBk+W1J8UU+wHf+T6V4a+xZiV/aRlBu6CkMKsB0P9AywS2H7BZgi6foq9oog26fERgBpbIL3gO0kfVuxfPCpRHGKuWmz1UHO516SWv1rDX9VTOmLM5psDYoz/du/xqYMugO2c07zZYKMUELYt2a+U5ntTPkeaats2emrun2BAQXYzkQ5/1SpPEFfBlndXqbDXue4jpM0b6h1gwlI85ImJpgjKR7mb4Ht2JEDSrLZkvKrz6BYTIDtMcDrZWqXrzCqn2OUbl/Bdu6JdGmtu2aspJyGATGQgPYp3AxJrV64W+6+Pbd9A3BqIRxyWreIgFJ5coOm9ge7SYq7/Fthe0egNflIOc3Qd8BZbKeA9hHHAkmxwksFtt8tVjz5c7nlPloMnQKmll8dE3ijpNOWytv/2YPH6Z5e8g/a9HQKuKfNHjcecfRTrO32zm+mpNavOYuk6RQQezu2RIxfErdurUjb44BXS/w8SaO7HqFa8n9SXFc3+k962f/kDvwBLXmvQAoTLTsAAAAASUVORK5CYII=" />
                                            <span>工具列表</span>
                                        </p>
                                    </li>
                                    <li class="data-analysis" info title="数据分析">
                                        <p>
                                            <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAACdklEQVRoQ+2YTYhPYRTGfw8h31nNgpIVFhYkoXyFUsrS0sYUshKJhbJQNsgCMyYLCxtZyA6RZiGkLISdsvRRTIaNcHTqznTnnf91753XffX/d9/l7Zz3nOd5zrnn3Cu6/KjL86cF8L8VbBVoFYhkoC2hSAKj3TsqYGb+vB/YDTwCLkn6lY9mZjOBk8AWYFp0Jn+/4CVwWtLn0KwIwAngbM74oqQjAYBzwNGGE89fPyxpa1UAz4B1OeN3kpYFAJyVVQkBeKhZkn7kYxYpcAfYkzN8KmlDAOAmsDchgBFJi6oqsBK4DywBPjoYSa7K+DGzxcCNrAeafpt5//VLul4JgBuZ2fSsRN6EsiVkvTRU08yVJhBr0AKIZTDWv1UglsFY/95VwMx2AsuBW5I+dGLKzDYB2xLtQrclWaU5YGaDwIHMeARYK+ltMMj2A9diS6CG/6CkQ6UAzGwO8D0wPC/pWADguQOrkUCsqU9j34UmbMWTesDM5gLfgmgXJE3YPM1sGNgcm1UNf1/iZkv6nfcpWuYGgIMlJbQRuAfMq5FEjOlVSWM5jd9T+BbKmnhF1sTvC5rYk1+ToIl/Ao8rN3EMTal9e3cOpGZyqvFaBabK3L/y610FzGw+sFTSqyK2zCzVa/S1pE+d8igaZPuAIR/dwBNgl6SvwSrhg+wu4ECbPtU/6s1sBjCaJT+W2ClJZwIAD4DtTWeeu39U0oIqy1wfEE7eK5IOBwBeAKsTAvBQlX9sedmszyW3Q9LDAEDqdbrWr8WFwHHAd6EhSb60TToJP2h8F7os6UtpCSUuiehwvTsHoqlJdEGrQCKiC8O0CrQKRDLQ9SX0B3hYuzH6duIOAAAAAElFTkSuQmCC" />
                                            <span>数据分析</span>
                                        </p>
                                    </li>
                                    <li class="information" my title="工具配置">
                                        <p>
                                            <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAEgUlEQVRoQ+2ZaahVVRTHf/9GopE+BE1Uamll0CBERWWgzV+M5qJoMBosCG3+UEGRVkZgA0JFEVFZ9CEQi5JEP1sUJaiVJTQTVjbS8I91WedyuO/ee+71nWv3xdtfHmffc/b+//Zaa++11xNjvGmM62cc4L+24LgF/rcWsD0NuA84GdgW+AB4SNLLdUIPxIVsnwq8DuzYItbAFEnr6oKoHcD2OUCs8nYdRN4o6bFuALbPA1ZL+rQKtFYA27OBxdDcnr8EZgLnA3enmHsl3dNJmO2rgKeAzcC0KmvVBmD7rvT5QtsGYLqkjbZDcK8AzwOX5iCfAEdK+rkTcC0AthcBc0qTrAFOkfRt9PUJMBV4r+SCy4CzJEX8jGijArC9DfAMcHlp5NXADEk/FH1VALYnlP3d9gnAO8D2OcZsSeFW9QHYjsFfA84ujboKOEPSL+WZugHYvhl4BHhJ0kUl6HCjcKdo3wEHSvq1lWCLLGB7J2BpuElpwDD1LEl/tE5SAfANsFd+M1dSwDSa7ZjjzHxcIOn2SgDb+wGvAsd2Cpw2/a8AF0v6q903FQCxa12T3/2T7hfuEwCTgYincNU/gYMlfV6eY4QFbM+LE7MP8REDV3cKshTSdRey/UIsQM75NRAx8Vt+G+Nfkb8tlBT6mq0dQHmyKo5HJYUPd209BHHE0/vAoTnQLZIeToCj41DL/g2SJvQDMOLQsd3cziT1FENVACk0Tt8lKe4rSfsUQm1/ARTPkYqsLX6rssDWBAgtIXTvFBencGPlbT8JXNtqnXgeGoAUGjnSDSn0AUl3Zv+VwNPZv0TSBUNngRQ6PQ+weFwuaUb2R3b7ZopeKSlS9EYbNgvsAWxKbWskHZ4AhwEfZf86SbG9DiXADkBxEG6StGcC7Ab8mJp/krT7sALsDBSZ52ZJITyCeJdMr+Ox2T+MLjQR+DhXd72kQxJgErA++9dKmjKsFpiVCWLoWyXppAQ4EViZoldIauZgwxbETwDXpdBFkm5KgLjRFcWAFyUVacfQ7ULhPuFG0WZKejsB5gO3ZX8zzRiqGLB9GvBGioxEbldJfyfARmD//O0gSZ/1GgPPAc8WL+ffRqqbrW2O3vJ+5ZXSdpRfYvUjlY8W9aNbU/xRwLvtAriTBeLDBa0iujzXkU5HEhfJXLS4fU2UFFWJgI9FvKwVrJsFjgDidrVvHxCjudBE2jw354oLzemS3krx5RM43GlS2X3aWqAX0QO8Us6TtLDQYHtFliaja7GkIiNtyuwpn28HVeOlvrgBtl7qrwcez7l/Bw4oyjRlPVsMkCauq6wSPh9FrEazHdnm8iwKR9d8SXe0W8hRAZQmrLOwFRlo7DqR2EWLItfxksIKI1otALlqgygtxgV/qqTvO8VmbQAJ0a64G5eUS/qojRbF3chKj5P0YbeNpVaAhLgwK2qdyutzJBXB2Vab7XPDjbZ6eb0UE93+wTFZUpEa97Jrd32ndguUII4B7m/5F9ODkorSyajFxwADA6hFXQ+DjAP0sEgDfWXcAgNd3h4GH/MW+BfpvK1PmB20swAAAABJRU5ErkJggg==" />
                                            <span>工具配置</span>
                                        </p>
                                    </li>
                                </ul>
                            </div>
                        </div>`;
            $('body').append(Odom);
        }

        // 绑定事件
        this.bindFn = function (ele) {
            let self = this;
            // 拖拽节点创建
            $('.az-drag').each(function(index){
                $(this).myDrag({
                    parent: '.hb-loaded',
                    handler:'.drag',
                    randomPosition: false,
                });
            });

            // 切换工具大小状态
            $('body').on('dblclick','#AZTOOLSFORMULA .drag',function(){
                let parent = $(this).closest('.normal');
                if(parent.hasClass('min')){
                    parent.removeClass('min');
                }else{
                    parent.addClass('min');
                }
            });

            // 监听弹层关闭
            $('body').on('click', '#AZTOOLSFORMULA .az-pop .close', (eve) => {
                clearInterval(this.lisentTimer);// 停止监听登录状态
                clearInterval(this.order_status_timer);// 停止监听支付状态
                // 关闭动效
                $(eve.target).closest('.az-pop').addClass('remove');
                setTimeout(()=>{
                    $(eve.target).closest('.az-pop').remove();
                },300);
            });

            // 工具列表
            $('body').on('click',"#AZTOOLSFORMULA .menu .tools-list",()=>{
                this.toolsDom();
            });

            // 数据分析
            $('body').on('click','#AZTOOLSFORMULA .menu .data-analysis',()=>{
                this.dataAnalysisPop();
            });
        }

        // 工具弹层
        this.toolsDom = function(){
            $('#AZTOOLSFORMULA .az-pop').remove();
            let Odom = `<div class="az-pop tools-pop tools">
                            <div class="head">
                                工具列表
                                <i class="close">×</i>
                            </div>
                            <div class="content-pop">
                                <div class="list-prop">
                                    <h4 class="title">数据分析</h4>
                                    <ul class="clearfix">
                                        <li data-id="3">
                                            <i class="az-icon az-icon-zhexian"></i>
                                            <span>数据分析</span>
                                        </li>
                                    </ul>
                                </div>
                                <div class="list-prop">
                                    <h4 class="title">榜单透视</h4>
                                    <ul class="clearfix">
                                        <li data-id="4" class="blur">
                                            <i class="az-icon az-icon-huizhang"></i>
                                            <span>榜单透视</span>
                                        </li>
                                        <p style="color: #7D7D7D;line-height: 50px;font-size: 14px;padding-left: 10px;float: left;">即将上线，小哥哥努力研发中……</p>
                                    </ul>
                                </div>
                                <div class="list-prop">
                                    <h4 class="title">主图分析</h4>
                                    <ul class="clearfix">
                                        <li data-id="4" class="blur">
                                            <i class="az-icon az-icon-huizhang"></i>
                                            <span>主图分析</span>
                                        </li>
                                        <p style="color: #7D7D7D;line-height: 50px;font-size: 14px;padding-left: 10px;float: left;">即将上线，小哥哥努力研发中……</p>
                                    </ul>
                                </div>
                                <div class="list-prop">
                                    <h4 class="title">指数转换</h4>
                                    <ul class="clearfix">
                                        <li data-id="4" class="blur">
                                            <i class="az-icon az-icon-huizhang"></i>
                                            <span>指数转换</span>
                                        </li>
                                        <p style="color: #7D7D7D;line-height: 50px;font-size: 14px;padding-left: 10px;float: left;">即将上线，小哥哥努力研发中……</p>
                                    </ul>
                                </div>
                            </div>
                        </div>`;
            $('#AZTOOLSFORMULA .normal').append(Odom);
        }
    }


    // ****************Okex平台
    function az_okex_tools (){
        this.AZ_TOOLS_CONFIG = {
            pk_timer: 1000,// 币币市场刷新数据间隔时长
            timer: 8000,// 法币交易刷新数据间隔时长
            Utimer: 10000,// USDT数据获取频率
            pointCardDiscount: 0.4,// 点卡折扣
        };
        az_ToolsFormula.call(this);
        this.ana_timer = {};// 买卖家定时器
        this.U_timer = {};// usdt获取数据定时器
        // usdt单独买卖家数据
        this.usdt = {
            name: 'USDT',
            buy: [],
            sell: [],
        };
        // 币种基准数（用于计算币数量占比）
        this.coins_benchmark = {
            BTC: 10,
            ETH: 200,
            USDT: 200000
        }
        // 标记列表
        this.biaojiList = [];
        // 6中币数据  默认显示项
        this.coins = [
            {
                id: '',
                name: "BTC",// 币名
                buy: [],// 买家数据
                sell: [],// 卖家数据
                pk: "",// 盘口u
                compare: "",// 比对值
                bz_U: "",// 标准U
                final_price: "",// 最终价
                active: true, // 是否开启分析
                support: true // 是否支持柜台交易
            }
        ];

        // 展示节点模块
        renderDomModule.call(this);

        // 买卖家数据
        this.getsellData = function(data,resolve,reject){
            var self = this;
            var otcApi = [
                "https://www.okex.com",
            ];
            //https://www.okex.com/v3/c2c/tradingOrders/books?t=1641442780842&quoteCurrency=CNY&baseCurrency=USDT&side=buy&paymentMethod=all&userType=all&showTrade=false&receivingAds=false&noShowSafetyLimit=false&showFollow=false&showAlreadyTraded=false&isAbleFilter=false&urlId=7
            // Math.random()*10 > 5 ? DDtools_mainAPI = "https://otc-api-hk.eiijo.cn" : DDtools_mainAPI = "https://otc-api-sz.eiijo.cn"
            DDtools_mainAPI = otcApi[Math.floor(Math.random()*10) % otcApi.length]
            chrome.extension.sendMessage({
                name: "universal", 
                url: DDtools_mainAPI+"/v3/c2c/tradingOrders/books",
                data: data,
                type: "GET", 
                dataType: "json",
            }, function (e) {
                // 交易对不支持OTC交易
                if (e.result.error_code === "17007") {
                    self.coins[self.coins.findIndex( item => item.name == data.baseCurrency)].support = false
                    $(`.AZTOOLSFORMULA_LAYER .table-list.other .table[data-coin="${data.baseCurrency}"] .table-title`).append('<span style="color: red">该币种不支持OTC交易 </span>')
                    reject();
                } else{
                    if (e && e.result && e.state) {
                        e.result.side = data.side;
                        e.result.name = data.baseCurrency;
                        if(data.baseCurrency=="USDT"){
                            e.result.data[data.side] = e.result.data[data.side].slice(0,20);
                        }else {
                            e.result.data[data.side] = e.result.data[data.side].slice(0,16);
                        }
                        resolve(e.result);
                    }else{
                        reject();
                    }
                }
            });
        }
        // 测试环境获取本地数据
        // this.getCionsData = function(data,resolve,reject){
        //     chrome.extension.sendMessage({
        //         name: "universal", 
        //         url: "/local/coins.json",
        //         data: data,
        //         type: "GET", 
        //         dataType: "json"
        //     }, function (e) {
        //         if (e && e.result && e.state) {
        //             resolve(e.result);
        //         }else{
        //             reject();
        //         }
        //     });
        // }
        // 测试环境获取本地数据
        // this.getUsdtData = function(data,resolve,reject){
        //     chrome.extension.sendMessage({
        //         name: "universal", 
        //         url: "/local/usdt.json",
        //         data: data,
        //         type: "GET", 
        //         dataType: "json"
        //     }, function (e) {
        //         if (e && e.result && e.state) {
        //             resolve(e.result);
        //         }else{
        //             reject();
        //         }
        //     });
        // }
        // 数据分析弹层 初始化弹窗
        this.dataAnalysisPop = function(){
            let self = this;
            // 获取收藏交易对
            let Oli = $(".market-table-container .watch-scroll-box .index_checked__gKVQB");
            this.coins = [];
            for(let i = 0; i < Oli.length; i++) {
                let val = Oli[i]
                let PDomLi = $(val).parents("tr")
                let name = $.trim( PDomLi.find(".coin-info .coin-name>.short").text().split('/')[0] ); // 交易对 名称
                this.coins.push({
                    id: '',
                    name: name,// 币名
                    buy: [],// 买家数据
                    sell: [],// 卖家数据
                    pk: "",// 盘口u
                    compare: "",// 比对值
                    bz_U: "",// 标准U
                    final_price: "",// 最终价
                    active: i <= 1 ? true : false, // 是否开启分析
                    support: true // 是否支持柜台交易
                },)
            }
            let Odom = `<div class="AZTOOLSFORMULA sjfx_pop">
                            <ul class="tab-list-select clearfix">
                                ${
                                    (() => {
                                        let Oli = ``
                                        this.coins.forEach(item => {
                                            Oli += `<li class="${item.active ? 'active' : ''}" data-tabid="${item.name}" data-coinid="${item.name}" >${item.name}</li>`
                                        })
                                        return Oli
                                    })()
                                }
                                
                            </ul>
                            <div class="table-list other pull-left"></div>
                            <div class="table-list usdt pull-left"></div>
                        </div>`;
            layer.open({
                type: 1,
                title: "数据分析",
                scrollbar: false,
                fixed: false,
                resize: false,
                move: true,
                zIndex: 9999999999,
                skin: 'AZTOOLSFORMULA_LAYER',
                area: ["100%","100%"],
                content: Odom, //注意，如果str是object，那么需要字符拼接。
                end: function(){
                    clearInterval(self.ana_timer);
                    clearInterval(self.U_timer);
                    clearInterval(self.pk_timer);
                },
                cancel: function(){
                    clearInterval(self.ana_timer);
                    clearInterval(self.U_timer);
                    clearInterval(self.pk_timer);
                }
            });
            this.coins.length && this.distribution();
        }

        // 分配任务器
        this.distribution = function(){
            let self = this;
            clearInterval(this.ana_timer);
            clearInterval(this.U_timer);
            clearInterval(this.pk_timer);

            this.pk_timer = setInterval(()=>{
                self.getPKData();
            },this.AZ_TOOLS_CONFIG.pk_timer);
            // 分配USDT数据请求
            this.getUSDTData(function(){
                // 分配买卖家数据请求
                self.getBuySellData();
                self.ana_timer = setInterval(()=>{
                    self.getBuySellData();
                },self.AZ_TOOLS_CONFIG.timer);

                self.U_timer = setInterval(()=>{
                    self.getUSDTData();
                },self.AZ_TOOLS_CONFIG.Utimer);
            });
        }

        // 获取OTC买+卖数据
        this.getBuySellData = function(){
            let base_data = {
                t: (new Date()).getTime(),
                quoteCurrency: "CNY",
                baseCurrency: "",
                side: "buy",
                paymentMethod: "all",
                userType: "all",
                showTrade: "false",
                receivingAds: "false",
                noShowSafetyLimit: "false",
                showFollow: "false",
                showAlreadyTraded: "false",
                isAbleFilter: "false"
            };
            let my_promise_arr = [];
            // 异步获取数据
            for(let item of this.coins){
                if (!item.active || !item.support) continue;
                // 添加买家
                let data = Object.assign({},base_data);
                data.baseCurrency = item.name;
                data.side = "buy";
                my_promise_arr.push(new Promise((resolve,reject)=>{
                    this.getsellData(data,resolve,reject);
                }));
                // 添加卖家
                let data2 = Object.assign({},base_data);
                data2.baseCurrency = item.name;
                data2.side = "sell";
                my_promise_arr.push(new Promise((resolve,reject)=>{
                    this.getsellData(data2,resolve,reject);
                }));
            }
            Promise.all(my_promise_arr).then(res=>{
                for(let item of res){
                    for(let val of this.coins){
                        if(item.name==val.name){
                            val[item.side] = item.data[item.side];
                            break;
                        }
                    }
                }
                this.formulaFormat();
            },err=>{
                layer.msg(
                    "注意：数据获取更新失败！",
                    {icon: 2, offset: '50px', time: 10000}// icon=0:info, 1:success, 2:error  
                ); 
            });
        }

        // 单独获取OTC usdt数据
        this.getUSDTData = function(fn){
            let base_data = {
                t: (new Date()).getTime(),
                quoteCurrency: "CNY",
                baseCurrency: "USDT",
                side: "buy",
                paymentMethod: "all",
                userType: "all",
                showTrade: "false",
                receivingAds: "false",
                noShowSafetyLimit: "false",
                showFollow: "false",
                showAlreadyTraded: "false",
                isAbleFilter: "false",
                urlId: 7
            };
            let my_promise_arr = [];
            // 异步获取数据
            // 添加买家
            let data = Object.assign({},base_data);
            data.side = "buy";
            my_promise_arr.push(new Promise((resolve,reject)=>{
                this.getsellData(data,resolve,reject);
            }));
            // 添加卖家
            let data3 = Object.assign({},base_data);
            data3.side = "sell";
            my_promise_arr.push(new Promise((resolve,reject)=>{
                this.getsellData(data3,resolve,reject);
            }));
            Promise.all(my_promise_arr).then(res=>{
                this.usdt.buy = [];
                this.usdt.sell = [];
                for(let item of res){
                    this.usdt[item.side] = this.usdt[item.side].concat(item.data[item.side]);
                    for(val of this.usdt[item.side]){
                        val.userName= val.nickName;
                        val.tradeMonthTimes= val.completedOrderQuantity;
                        val.orderCompleteRate= val.completedRate;
                        val.tradeCount= val.availableAmount * 1;
                    }
                }
                if(fn) fn();
            },err=>{
                layer.msg(
                    "注意：数据获取更新失败！",
                    {icon: 2, offset: '50px', time: 5000}// icon=0:info, 1:success, 2:error  
                ); 
            })
        }

        // 获取盘口标准值 实时币价
        this.getPKData = function(){
            
            let Oli = $(".market-table-container .watch-scroll-box .index_checked__gKVQB");
            for(let val of Oli){
                let PDomLi = $(val).parents("tr")
                let name = $.trim( PDomLi.find(".coin-info .coin-name>.short").text().split('/')[0] ); // 交易对 名称
                let U = $.trim( PDomLi.find(".last-price .price-and-fiat span").eq(0).text().replace(',',"") );// 交易对 币价
                for(let item of this.coins){
                    if(item.name==name){
                        item.pk = U*1;
                        break;
                    }
                }
            }
            this.formulaFormat();
        }

        // 数据公式计算
        this.formulaFormat = function(){
            if(!this.usdt.sell.length){
                return;
            }
            for(let item of this.coins){
                if (!item.active) continue;
                item.bz_U_sell = this.usdt.sell[3].price;
                item.bz_U_buy = this.usdt.buy[3].price;
                // 
                if(item.name=="BTC"||item.name=="ETH"){
                    item.final_price_buy = (0.99895*item.bz_U_buy*item.pk).toFixed(2);
                    item.final_price_sell = (1.00105*item.bz_U_sell*item.pk).toFixed(2);
                }else{
                    item.final_price_buy = (0.9986*item.bz_U_buy*item.pk).toFixed(2);
                    item.final_price_sell = (1.0014*item.bz_U_sell*item.pk).toFixed(2);
                }

                for(let val of item.buy){
                    val.compare = (((item.final_price_buy*1000) - (val.price*1000))/1000).toFixed(2);// 
                    val.U = (val.price/item.pk).toFixed(4);

                    val.userName = val.nickName; // 商家名称
                    val.tradeMonthTimes = val.completedOrderQuantity; // 完成订单数
                    val.orderCompleteRate = val.completedRate; // 完成交易占比
                    val.tradeCount = val.availableAmount; // 总订单收量
                }
                for(let val of item.sell){
                    val.compare = (((val.price*1000) - (item.final_price_sell*1000))/1000).toFixed(2);// 
                    val.U = (val.price/item.pk).toFixed(4);

                    val.userName = val.nickName;
                    val.tradeMonthTimes = val.completedOrderQuantity;
                    val.orderCompleteRate = val.completedRate;
                    val.tradeCount = val.availableAmount;
                }
            }
            this.renderTableData();
            this.renderUsdtData();
        }
    }
}(window)