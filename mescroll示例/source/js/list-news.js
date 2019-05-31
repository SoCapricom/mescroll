//创建MeScroll对象
var mescroll ;
mescroll = new MeScroll("mescroll", {
	down: {
		auto: false, //是否在初始化完毕之后自动执行下拉回调callback; 默认true
		htmlNodata:'<p class="upwarp-nodata">--END--</p>',
		isBoth:false,
		callback: function ( mescroll ) { //下拉刷新的回调
			console.log("down");
			mescroll.resetUpScroll(); //默认重置上拉加载列表为第一页
			mescroll.hideUpScroll();//隐藏上拉加载的布局，默认false通过visibility:hidden的方式隐藏
		}
	},
	up: {
		auto: true, //是否在初始化时以上拉加载的方式自动加载第一页数据; 默认false
		isBounce: false, //此处禁止ios回弹,解析(务必认真阅读,特别是最后一点): http://www.mescroll.com/qa.html#q10
		callback: function(page){//上拉回调,此处可简写; 相当于 callback: function (page) { upCallback(page); }
			console.log("up")
			loadData(page);//加载数据
		}, 
		toTop:{ //配置回到顶部按钮
			src : "../source/images/icons/mescroll-totop.png", //默认滚动到1000px显示,可配置offset修改
			offset : 500 ,//列表滚动****px的高度显示回到顶部按钮  
		},
		autoShowLoading:true,
		htmlLoading: '<p class="upwarp-progress mescroll-rotate"></p><p class="upwarp-tip">加载中..</p>', //上拉加载中的布局
		htmlNodata: '<p class="upwarp-nodata">-- END --</p>', //无数据的布局
		inited: function(mescroll, upwarp) {},
		showLoading: function(mescroll, upwarp) {
			upwarp.innerHTML = mescroll.optUp.htmlLoading;
		},
		showNoMore: function(mescroll, upwarp) {
			upwarp.innerHTML = mescroll.optUp.htmlNodata;
		}
	},
});
//加载数据 ,page为对象，格式为{num:1,size:10}  ,type = 1是上拉回调，type=2是下拉回调
function loadData(page){
	var size = page.size;
	var index = page.num;
	
	var objdata = {
		index:index,
		size:size,
		region:'',
		type:''		
	};
	var param = JSON.stringify(objdata);
	console.log(page);
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
						$("#newsList").html('');//清空列表中的数据
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
	var listDom = document.getElementById("newsList");
	
	if(data.length>0){
		data.forEach(function(newObj){
			var str='<p>'+newObj.Title+'</p>';
			str+='<p class="new-content">'+newObj.strCreateTime+'</p>';
			var liDom=document.createElement("li");
			liDom.innerHTML=str;
			
			listDom.appendChild(liDom);//加在列表的后面,上拉加载
		});
	}
}