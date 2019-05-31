//var apiUrl = 'http://test.zhenghe.cn:6085/api/H5Api/';//接口地址
var apiUrl = 'http://asd.zhenghe.cn/api/H5Api/';//接口地址
jQuery.support.cors = true;
var getData = ""; //get方式获取的数据
var PostData = "";//post方式获取的数据
var data = ""; //ajax返回的数据
/**
 * Post方式获取接口数据
 * @param {*} methodsName 接口的名称
 * @param {*} obj 接口的参数
 * @param {*} pageNum 当前页面数
 * @param {*} pageSize 每页显示条数
 * @param {*} successCallback 数据返回成功时回调函数
 */
function getListDataFromNetByPost(methodsName,obj,pageNum,pageSize,successCallback) {
    $.ajax({
        async: true,
        type: "post",
        url: apiUrl + methodsName,
        data: obj,
        dataType: "json",
        contentType: "application/json",
        success: function (data) {
            if (data.IsSuccess) {
                /* var listData=[];
				data.Content.forEach(function(obj){
					listData.push(obj);
				}); */
                successCallback(data);
            }
        },
        error: function (data) {}
    });
} 
/**
 * Get方式获取接口数据
 * @param {*} methodsName 接口的名称
 * @param {*} pageNum 当前页面数
 * @param {*} pageSize 每页显示条数
 * @param {*} successCallback 数据返回成功时回调函数
 */
function getListDataFromNetByGet(methodsName,pageNum,pageSize,successCallback) {
    $.ajax({
        async: true,
        type: "get",
        url: apiUrl + methodsName,
        dataType: "json",
        success: function (data) {
            if (data.IsSuccess) {
                var listData=[];
                data.Content.forEach(function(obj){
                	listData.push(obj);
                });
                successCallback(listData);
            }
        },
        error: function (data) {}
    });
}
 