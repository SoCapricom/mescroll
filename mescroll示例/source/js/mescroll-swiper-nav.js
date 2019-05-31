
//导航菜单
var mescrollArr=new Array(3);//每个菜单对应一个mescroll对象
//当前菜单下标
var curNavIndex=0;
//初始化"推荐"页面数据
mescrollArr[curNavIndex]=initMescroll(curNavIndex);

/*初始化轮播*/
var swiper=new Swiper('#swiper', {
	observer: true,
	onTransitionEnd: function(swiper){
		var i=swiper.activeIndex;//轮播切换完毕的事件
		changePage(i);
	}
});
var pdType=0;//推荐tab页为0; 济南tab页为1; 中央tab页为2;
/*菜单点击事件*/
$("#nav li").click(function(){
	var i=Number($(this).attr("i"));
	pdType=i;
	swiper.slideTo(i);//以轮播的方式切换列表
});
/*切换列表*/
function changePage(i) {
	if(curNavIndex!=i) {
		//更改列表条件
		var curNavDom;//当前菜单项
		$("#nav li").each(function(n,dom){
			if (dom.getAttribute("i")==i) {
				dom.classList.add("active");
				curNavDom=dom;
			} else{
				dom.classList.remove("active");
			}
		});
		//菜单项居中动画
		var scrollxContent=document.getElementById("scrollxContent");
		var star = scrollxContent.scrollLeft;//当前位置
		var end = curNavDom.offsetLeft + curNavDom.clientWidth/2 - document.body.clientWidth/2; //居中
		mescrollArr[curNavIndex].getStep(star, end, function(step,timer){
			scrollxContent.scrollLeft=step; //从当前位置逐渐移动到中间位置,默认时长300ms
		});
		//隐藏当前回到顶部按钮
		mescrollArr[curNavIndex].hideTopBtn();
		//取出菜单所对应的mescroll对象,如果未初始化则初始化
		if(mescrollArr[i]==null){
			mescrollArr[i]=initMescroll(i);
		}else{
			//检查是否需要显示回到到顶按钮
			var curMescroll=mescrollArr[i];
			var curScrollTop=curMescroll.getScrollTop();
			if(curScrollTop>=curMescroll.optUp.toTop.offset){
				curMescroll.showTopBtn();
			}else{
				curMescroll.hideTopBtn();
			}
		}
		//更新标记
		curNavIndex=i;
	}
}
/*创建MeScroll对象*/
function initMescroll(index){
	//创建MeScroll对象,内部已默认开启下拉刷新,自动执行up.callback,刷新列表数据;
	var mescroll = new MeScroll("mescroll"+index, {
		down: {
			auto: false, //是否在初始化完毕之后自动执行下拉回调callback; 默认true
			htmlNodata:'<p class="upwarp-nodata">--END--</p>',
			isBoth:false,
			callback: function ( mescroll ) { //下拉刷新的回调
				mescroll.resetUpScroll(); //默认重置上拉加载列表为第一页
				mescroll.hideUpScroll();//隐藏上拉加载的布局，默认false通过visibility:hidden的方式隐藏
			},
			scrollbar:{
				use:true,
			},
			htmlNodata: '<p class="upwarp-nodata">-- EN22D --</p>', //无数据的布局
		},
		up: {
			auto: true, //是否在初始化时以上拉加载的方式自动加载第一页数据; 默认false
			isBounce: false, //此处禁止ios回弹,解析(务必认真阅读,特别是最后一点): http://www.mescroll.com/qa.html#q10
			callback: function(page){//上拉回调,此处可简写; 相当于 callback: function (page) { upCallback(page); }
				loadData(page);//加载数据
			}, 
			scrollbar:{
				use:true,
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
			clearEmptyId: "dataList"+index, //相当于同时设置了clearId和empty.warpId; 简化写法;默认null; 注意vue中不能配置此项
		},
	});
	
	return mescroll;
}


//加载数据 ,page为对象，格式为{num:1,size:10}  ,type = 1是上拉回调，type=2是下拉回调
function loadData(page){
	var size = page.size;
	var index = page.num;
	var dataIndex=curNavIndex; //记录当前联网的nav下标,防止快速切换时,联网回来curNavIndex已经改变的情况;
	
	if(pdType == 0 || pdType == 3|| pdType == 6){//推荐
		var objdata = {"index":index,"size":size,"region":"","type":""};//显示全部数据
	}
	if(pdType == 1||pdType == 4|| pdType == 7){//济南市
		var objdata = {"index":index,"size":size,"region":"40B92236-6830-48A7-8FA1-FBE835AD872E","type":""};//显示济南市数据
	}
	if(pdType == 2 || pdType == 5|| pdType == 8){//济南市
		var objdata = {"index":index,"size":size,"region":"中央","type":""};//显示中央数据
	}
	 
	var param = JSON.stringify(objdata);
	console.log("page.num="+page.num+", page.size="+page.size);
	console.log("curNavIndex=="+curNavIndex);
	//加载数据
	getListDataFromNetByPost('GetReadListDataXjdn',param,index, size,function(curPageData){
		if(curPageData.IsSuccess){
			if(curPageData.Content.length > 0){//返回数据的长度大于0（有数据）
				if(index <= curPageData.totalPage){
					mescrollArr[dataIndex].endByPage(curPageData.Content.length, curPageData.totalPage); //必传参数(当前页的数据个数, 总页数)
					mescrollArr[dataIndex].endBySize(curPageData.Content.length, curPageData.totalNum); //必传参数(当前页的数据个数, 总数据量)
					mescrollArr[dataIndex].endSuccess(curPageData.Content.length);
					if(index == 1){
						$("#dataList"+dataIndex).html('');//清空列表中的数据
					}
					setListData(curPageData,dataIndex);
				}
			}else{//没有数据
				mescrollArr[dataIndex].endErr();//隐藏下拉刷新和上拉加载的状态;
				if(index == 1){//当前是第一页
					mescrollArr[dataIndex].showEmpty();//显示“没有符合条件的数据”
				}else{//当前不是第一页
					mescrollArr[dataIndex].showNoMore();//显示“没有更多数据”
				}
			}
		}else{
			mescrollArr[dataIndex].endErr();//隐藏下拉刷新和上拉加载的状态;
		}
		//提示:curPageData.Content.length必传的原因:
		// 1.判断是否有下一页的首要依据: 当传的值小于page.size时,则一定会认为无更多数据.
		// 2.比传入的totalPage, totalSize, hasNext具有更高的判断优先级
		// 3.使配置的noMoreSize生效
	}, function(){
		//隐藏下拉刷新和上拉加载的状态;
		mescrollArr[dataIndex].endErr();
	});
}

/*设置列表数据
 * pageData 当前页的数据
 * dataIndex 数据属于哪个nav */
function setListData(curPageData,dataIndex){
	var data = curPageData.Content;
	var listDom=document.getElementById("dataList"+dataIndex);
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
