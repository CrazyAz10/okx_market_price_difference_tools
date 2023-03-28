chrome.storage.local.get("commonv", (data)=> {
    if(!$.isEmptyObject(data)){
        new Function(data.commonv)();
    }
});