//创建MeScroll对象
var mescroll ;
mescroll = new MeScroll("mescroll", {
	down: {
		auto: false, //是否在初始化完毕之后自动执行下拉回调callback; 默认true
		htmlNodata:'<p class="upwarp-nodata">--END--</p>',
		isBoth:false,
		callback: function ( mescroll ) { //下拉刷新的回调
			mescroll.resetUpScroll(); //默认重置上拉加载列表为第一页
			mescroll.hideUpScroll();//隐藏上拉加载的布局，默认false通过visibility:hidden的方式隐藏
		},
		htmlNodata: '<p class="upwarp-nodata">-- EN22D --</p>', //无数据的布局
	},
	up: {
		auto: true, //是否在初始化时以上拉加载的方式自动加载第一页数据; 默认false
		isBounce: false, //此处禁止ios回弹,解析(务必认真阅读,特别是最后一点): http://www.mescroll.com/qa.html#q10
		callback: function(page){//上拉回调,此处可简写; 相当于 callback: function (page) { upCallback(page); }
			loadData(page);//加载数据
		}, 
		toTop:{ //配置回到顶部按钮
			src : "../source/images/icons/mescroll-totop.png", //默认滚动到1000px显示,可配置offset修改
			offset : 500 ,//列表滚动****px的高度显示回到顶部按钮  
		},
		autoShowLoading:true,
		htmlLoading: '<p class="upwarp-progress mescroll-rotate"></p><p class="upwarp-tip">加载中..</p>', //上拉加载中的布局
		htmlNodata: '<p class="upwarp-nodata">-- END --</p>', //无数据的布局
		showLoading: function(mescroll, upwarp) {
			upwarp.innerHTML = mescroll.optUp.htmlLoading;
		},
		showNoMore: function(mescroll, upwarp) {
			upwarp.innerHTML = mescroll.optUp.htmlNodata;
		},
		lazyLoad: {
			use: true // 是否开启懒加载,默认false
		},
		empty: {
			icon: "../source/images/icons/mescroll-empty.png", //图标,默认null
			tip: "暂无相关数据~", //提示
		},
		clearEmptyId: "dataList", //相当于同时设置了clearId和empty.warpId; 简化写法;默认null; 注意vue中不能配置此项
	},
});
//当前关键词
var curWord = '';
var keyword = '';

//热门搜索
$(".hot-words li").click(function() {
	$("#keyword").val('');//清空搜索文本框中的内容
	keyword = '';
	
	$(this).addClass("cur").siblings().removeClass("cur");
	curWord = $(this).attr("labi");//更新关键词
	mescroll.resetUpScroll(); //重新搜索,重置列表数据
});
//搜索按钮
$("#search").click(function(){
	var word = $("#keyword").val();
	if(word){
		$(".hot-words li").each(function(){
			$(this).removeClass("cur");
		});
		curWord = word; //更新关键词
		keyword = word;
		mescroll.resetUpScroll(); //重新搜索,重置列表数据
	}
});

//加载数据 ,page为对象，格式为{num:1,size:10}  ,type = 1是上拉回调，type=2是下拉回调
function loadData(page){
	var size = page.size;
	var index = page.num;
	
	if(keyword != ''){//存在搜索关键字时，模拟“中央”的数据
		var objdata = {"index":index,"size":size,"region":"中央","type":""};//显示中央数据
	}else{
		if(curWord == 0){//推荐
			var objdata = {"index":index,"size":size,"region":"","type":""};//显示全部数据
		}
		if(curWord == 1){//济南市
			var objdata = {"index":index,"size":size,"region":"40B92236-6830-48A7-8FA1-FBE835AD872E","type":""};//显示济南市数据
		}
		if(curWord == 2){//济南市
			var objdata = {"index":index,"size":size,"region":"中央","type":""};//显示中央数据
		}
	}
	 
	var param = JSON.stringify(objdata);
	console.log("page.num="+page.num+", page.size="+page.size);
	//加载数据
	getListDataFromNetByPost('GetReadListDataXjdn',param,index, size,function(curPageData){
		if(curPageData.IsSuccess){
			if(curPageData.Content.length > 0){//返回数据的长度大于0（有数据）
				if(index <= curPageData.totalPage){
					mescroll.endByPage(curPageData.Content.length, curPageData.totalPage); //必传参数(当前页的数据个数, 总页数)
					mescroll.endBySize(curPageData.Content.length, curPageData.totalNum); //必传参数(当前页的数据个数, 总数据量)
					mescroll.endSuccess(curPageData.Content.length);
					if(index == 1){
						$("#dataList").html('');//清空列表中的数据
					}
					setListData(curPageData);
				}
			}else{//没有数据
				mescroll.endErr();//隐藏下拉刷新和上拉加载的状态;
				if(index == 1){//当前是第一页
					mescroll.showEmpty();//显示“没有符合条件的数据”
				}else{//当前不是第一页
					mescroll.showNoMore();//显示“没有更多数据”
				}
			}
		}else{
			mescroll.endErr();//隐藏下拉刷新和上拉加载的状态;
		}
		//提示:curPageData.Content.length必传的原因:
		// 1.判断是否有下一页的首要依据: 当传的值小于page.size时,则一定会认为无更多数据.
		// 2.比传入的totalPage, totalSize, hasNext具有更高的判断优先级
		// 3.使配置的noMoreSize生效
	}, function(){
		//隐藏下拉刷新和上拉加载的状态;
		mescroll.endErr();
	});
}
/*设置列表数据*/
function setListData(curPageData) {
	var data = curPageData.Content;
	var listDom = document.getElementById("dataList");
	
	if(data.length>0){
		data.forEach(function(obj){
			var str='<img class="pd-img" style="height: 55px;" src="../source/images/icons/loading2.gif" imgurl="'+obj.PicUrl+'"/>';
			str+='<p class="pd-name">'+obj.Title+'</p>';
			str+='<p class="pd-sold">已售'+obj.strCreateTime+'</p>';
			var liDom=document.createElement("li");
			liDom.innerHTML=str;
			
			listDom.appendChild(liDom);//加在列表的后面,上拉加载
		});
	}
}