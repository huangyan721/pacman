var wxChannel = null; // 微信支付 
var aliChannel = null; // 支付宝支付 
var yuChannel = null; // 余额支付
var channel = null;

mui.init();

function plusReady() {
	// 获取支付通道 
	plus.payment.getChannels(function(channels) {
		for(var i = 0; i < channels.length; i++) {
			if(channels[i].id == "wxpay") {
				wxChannel = channels[i];
			}
			if(channels[i].id == "alipay") {
				aliChannel = channels[i];
			}
			if(channels[i].id == "yupay") {
				yuChannel = channels[i];
			}
		}
	}, function(e) {
		alert("获取支付通道失败："); //+e.message
	});
}
document.addEventListener('plusready', plusReady, false);
mui.ready(function() {
	mui('.mui-scroll-wrapper').scroll();

	window.addEventListener('resize', function() {
		mui(".mui-scroll-wrapper").scroll().refresh();
	});

	window.addEventListener('receiver', function(result) {
		document.getElementById("name").value = result.detail.name;
		document.getElementById("tel").value = result.detail.phone;
	});

});


document.getElementById("payment").addEventListener('tap', function(e) {
	if(e.target == this) {
		document.getElementById("payment").style.display = 'none';
	}
});

document.getElementById("receiver-list").addEventListener('tap', function(e) {
	mui.open('order', 'receiver');
});

// 图片
mui.each([1, 2, 3], function(index, picIndex) {

	document.getElementById("pic-" + picIndex).addEventListener('tap', function() {
		var buttons;
		if(params['pic' + picIndex]) {
			buttons = {
				cancel: "取消",
				buttons: [{
					title: "从手机相册选择"
				}, {
					title: '拍照'
				}, {
					title: '清除图片'
				}]
			};
		} else {
			buttons = {
				cancel: "取消",
				buttons: [{
					title: "从手机相册选择"
				}, {
					title: '拍照'
				}]
			}
		}
		// 弹出系统选择按钮框
		plus.nativeUI.actionSheet(buttons,
			function(e) {
				if(e.index == 1) { //点击从相册选择
					getPics(false, picIndex);
				} else if(e.index == 2) {
					getPics(true, picIndex);
				} else if(e.index == 3) {
					document.getElementById("pic-1").src = 'data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQImWNgYGBgAAAABQABh6FO1AAAAABJRU5ErkJggg=='
					params['pic' + picIndex] = null;
				}
			}
		);
	}, false);
});

function getPics(isCamera, index) {
	if(!isCamera) {
		plus.gallery.pick(function(path) {
			showImg(path, index);
		}, function(e) {
			mui.toast("取消选择图片");
		}, {
			filter: "image",
			multiple: false
		});
	} else {
		var cmr = plus.camera.getCamera();
		cmr.captureImage(function(p) {
			plus.io.resolveLocalFileSystemURL(p, function(entry) {
				var path = entry.toLocalURL(); //把拍照的目录路径，变成本地url路径，例如file:///........之类的。
				showImg(path, index);
			});
		}, function(e) {
			//			mui.toast("很抱歉，获取失败 " + e);
		});
	}
}

function showImg(path, index) {
	document.getElementById("pic-" + index).src = path;
	var canvas = document.createElement("canvas");
	var img = new Image();
	img.onload = function() {
		var scale = 600 / Math.max(img.width, img.height);
		scale = scale > 1 ? 1 : scale;
		var destWidth = parseInt(scale * img.width);
		var destHeight = parseInt(scale * img.height);
		canvas.width = destWidth;
		canvas.height = destHeight;
		var context = canvas.getContext('2d');
		context.drawImage(img, 0, 0, destWidth, destHeight);

		params['pic' + index] = canvas.toDataURL('image/jpeg');
	}
	img.src = path;
}


document.getElementById("appoint-date").addEventListener('tap', function(e) {
	var beginDate = new Date();

	var options = {
		beginDate: beginDate,
		endDate: new Date(beginDate.getTime() + 7 * 24 * 60 * 60 * 1000)
	};

	var id = this.getAttribute('id');
	var picker = new mui.DtPicker(options);
	picker.show(function(rs) {
		document.getElementById("appoint-date").value = rs.text;
		picker.dispose();
	});
});

document.getElementById("select-payment").addEventListener('tap', function(e) {
	validate(false);
	document.getElementById('price-2').innerHTML = params.orderPrice
});
document.getElementById("pay").addEventListener('tap', function() {
	validate(true);
});
var flag = true;
var count=0;
function validate(commit) {
	var p = {};

	p.receiver = document.getElementById("name").value;
	p.receiverPhone = document.getElementById("tel").value;
	// p.deliveryTime = document.getElementById("arrive-date").value;
	p.vehicleType = document.getElementById("car-type").value;
	p.vehicleNo = document.getElementById("car-num").value;
	p.remark = document.getElementById("remark").value;
	p.appointTime = document.getElementById("appoint-date").value;
	p.goodsType = document.getElementById("goods-type").value;
	if(p.appointTime) {
		params.orderType = '2';
	} else {
		params.orderType = '1';
		delete p.appointTime;
	}

	var routes = [];

	for(var i = 0; i < params.routes.length; i++) {
		routes.push({
			lat: params.routes[i].lat,
			lng: params.routes[i].lng,
			addr: params.routes[i].prov+params.routes[i].city+params.routes[i].district+params.routes[i].name,
			type: 1
		})
	}

	routes[0].type = 0;
	routes[routes.length - 1].type = 2;
	
//	console.log(JSON.stringify(routes))
	
	p.routes = JSON.stringify(routes);

	p.orderPrice = 0.01;//测试
//	p.orderPrice = params.orderPrice;//正式
	p.kilometer = params.kilometer;
	p.orderType = params.orderType;

	p.busiId = params.busiId;

	p.pic1 = params.pic1 || "";
	p.pic2 = params.pic2 || "";
	p.pic3 = params.pic3 || "";

	if(/^\s*$/.test(p.receiver)) {
		mui.toast('请输入收货人姓名');
		return;
	}

	if(!/^[0-9]+$/.test(p.receiverPhone)) {
		mui.toast('请输入联系方式');
		return;
	}
	if(!(/^0?(13[0-9]|15[0-9]|18[0-9]|14[57]|17[0-9])[0-9]{8}$/.test(p.receiverPhone))){
            mui.toast("请输入正确的手机号码！");
            return;
        		}
	if(!params.now) {
		if(!p.appointTime || /^\s*$/.test(p.appointTime)) {
			mui.toast('请选择预约时间');
			return;
		}
	}

	if(p.pic1 == "" && p.pic2 == "" && p.pic3 == "") {
		mui.toast('请至少添加一张照片');
		return;
	}
	
	if(!commit) {
		document.getElementById("payment").style.display = '';
		return;
	}

	mui.each(document.getElementsByName('radio'), function(index, item) {
		if(item.checked) {
			p.payType = index + 1;
		}
	});

	if(!p.payType) {
		mui.toast('请选择支付方式');
		return;
	}
//	console.log(flag);
	if(flag == true) {
		flag = false;
		
		Request.post('/order/addOrder.do', p, function(json) {
//			console.log(JSON.stringify(json));
			if(json.success) {
				//			mui.toast('提交成功');
				if(json.data.newReceiver) {
					Request.post('/common/add.do', {
						name: p.receiver,
						phone: p.receiverPhone,
					}, function() {});
				}

				if(p.payType == 1) {
					pay('alipay', json.data.orderNo);
				} else if(p.payType == 2) {
					pay('wxpay', json.data.orderNo);
				} else if(p.payType == 3){
					console.log("调用");
					pay('yupay', json.data.orderNo)
				}else {
					mui.open('order', 'detail', {
						orderNo: json.data.orderNo
					});
				}

			} else {
				console.log("请求失败flag=true")
				flag = true;
			}
		});
	}

}

//var ALIPAYSERVER='http://youxi.xicp.cn/orderpay/goAlipayPay.do?orderNo='; 
//var WXPAYSERVER='http://youxi.xicp.cn/orderpay/goPay.do?orderNo=';
//var YUPAYSERVER='http://youxi.xicp.cn/order/payMoney.do?orderNo=';

//var ALIPAYSERVER='http://119.23.53.246:8081/orderpay/goAlipayPay.do?orderNo='; 
//var WXPAYSERVER='http://119.23.53.246:8081/orderpay/goPay.do?orderNo=';
//var YUPAYSERVER='http://119.23.53.246:8081/order/payMoney.do?orderNo=';

var ALIPAYSERVER='http://17788h3z50.51mypc.cn:31100/orderpay/goAlipayPay.do?orderNo='; 
var WXPAYSERVER='http://17788h3z50.51mypc.cn:31100/orderpay/goPay.do?orderNo=';
var YUPAYSERVER='http://17788h3z50.51mypc.cn:31100/order/payMoney.do?orderNo=';

//var ALIPAYSERVER='http://192.168.31.246:8080/orderpay/goAlipayPay.do?orderNo='; 
//var WXPAYSERVER='http://192.168.31.246:8080/orderpay/goPay.do?orderNo=';
//var YUPAYSERVER='http://192.168.31.246:8080/order/payMoney.do?orderNo=';

//var ALIPAYSERVER = 'http://www.suyunxia.com/orderpay/goAlipayPay.do?orderNo=';
//var WXPAYSERVER = 'http://www.suyunxia.com/orderpay/goPay.do?orderNo=';
//var YUPAYSERVER='http://www.suyunxia.com/order/payMoney.do?orderNo=';
// 2. 发起支付请求 

function pay(id, orderNo) {
	
	var PAYSERVER = '';
	if(id == 'alipay') {
		PAYSERVER = ALIPAYSERVER + orderNo;
		channel = aliChannel;
	} else if(id == 'wxpay') {
		PAYSERVER = WXPAYSERVER + orderNo;
		channel = wxChannel;
	} else if(id == 'yupay') {
//		PAYSERVER = YUPAYSERVER + orderNo;
//		channel = yuChannel;

		//修改
		Request.post("/order/payMoney.do",{"orderNo":orderNo},function(rs){
			console.log("返回信息"+JSON.stringify(rs));
			if(rs.success){
				plus.nativeUI.alert("支付成功！", function() {				
					mui.open('order', 'detail', {
						orderNo: orderNo
					});
				});
			}else{
				flag = true;
				plus.nativeUI.alert(rs.message, function() {
					console.log("支付失败");
				});
			}
		});
		return;
	}
	else {
		plus.nativeUI.alert("不支持此支付通道！", null, "捐赠");
		//console.log("不支持此支付通道flag=true")
		flag = true;
		return;
	}
	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function() {
		if(xhr.readyState==4 && xhr.status == 200){
//			console.log(xhr.readyState)
			if(id == 'alipay' || id == 'wxpay'){
				plus.payment.request(channel, xhr.responseText, 
					function(result) {
//						console.log(JSON.stringify(result))
						plus.nativeUI.alert("支付成功！", function() {
							
							mui.open('order', 'detail', {
								orderNo: orderNo
								});
						});
					}, 
					function(error) {
						console.log("错误"+JSON.stringify(error))
						var errorMsg = JSON.stringify(error);
						flag = true;
						if(errorMsg.indexOf("微信:-2") != -1 || errorMsg.indexOf("支付宝:62001") != -1 || errorMsg.indexOf("余额:-3") != -1) {
							plus.nativeUI.alert("支付失败"); 
						} else {
							plus.nativeUI.alert("支付失败"); // + error.code
						}
						//console.log("支付失败flag=true")
						
					}
				);
			}else{
				plus.nativeUI.alert("支付成功！", function(data) {
					console.log(JSON.stringify(data))
					mui.open('order', 'detail', {
						orderNo: orderNo
						});
				});
			}
		}
	}
	
	xhr.open('GET', PAYSERVER);
	xhr.send();
}


mui.plusReady(function() {
	var web = plus.webview.currentWebview();
	window.params = web.params;
	console.log(JSON.stringify(params));
	var now = params.now;
	//修改顺运跟货运隐藏红色提醒字体
	if(params.busiId == 5 ||params.busiId == 1 ||params.busiId == 2){
		document.getElementById("prompttext").style.display="none";
	}
	
	document.getElementById("busi-id").classList.add('busi-id-' + params.busiId);

	document.getElementById("price").innerHTML = params.orderPrice;

	// document.getElementById("arrive-date").value = new Date(new Date().getTime() + 8 * 60 * 60 * 1000).format('yyyy-MM-dd hh:mm');

	if(now) {
		document.getElementById("appoint-container").style.display = 'none';
	} else {
		document.getElementById("appoint-date").value = params.appointTime;
	}
});