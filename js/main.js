chrome.storage.local.get("mainv", (data)=> {
    if(!$.isEmptyObject(data)){
        new Function(data.mainv)();
    }
});