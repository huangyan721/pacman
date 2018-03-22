function evaluateShowFlag() {
	if(btnSpanEvaluate.disabled) return;
	if(divEvaluateBox.style.display == "block") {
		divEvaluateBox.style.display = "none";
		divCoveringLayer.style.display = "none";
	} else {
		divEvaluateBox.style.display = "block";
		divCoveringLayer.style.display = "block";
	}
}

function shareShowFlag() {
	if(divShareBox.style.display == "block") {
		divShareBox.style.display = "none";
		divCoveringLayer.style.display = "none";
	} else {
		divShareBox.style.display = "block";
		divCoveringLayer.style.display = "block";
	}
}
/**
 *订单完成给司机评分
 */
function finishedScore(data) {
	data.evaluate = parseFloat(data.evaluate || 0);
	if(data.evaluate > 0) { //已经评分
		btnSpanEvaluate.style.color = "#b2b2b2";
		var iArr = spanEvaluate.querySelectorAll("i");
		(data.evaluate > 5) && (data.evaluate = 5);
		for(var i = 0; i < data.evaluate; i++) {
			iArr[i].innerText = "★";
		}
		return;
	}
	var iArr = divEvaluateBox.querySelectorAll("div>i");
	mui.each(iArr, function(index, item) {
		item.dataset.index = index;
		this.addEventListener("tap", function() {
			var index = item.dataset.index;
			for(var i = index; i < iArr.length; i++) {
				if(i != index) iArr[i].innerText = "☆";
			}
			for(var i = 0; i < index; i++)
				iArr[i].innerText = "★";
			iArr[index].innerText = (iArr[index].innerText == "☆" ? "★" : "☆");
			return;
		});
	});
	var liArr = divEvaluateBox.querySelectorAll("li");
	mui.each(liArr, function(index, item) {
		item.addEventListener("tap", function() {
			(this.className == "checked") ? (this.className = "") : (this.className = "checked");
		});
	});
	divEvaluateBox.querySelector("button").addEventListener('tap', function() {
		var params = {
			socreVal: 0,
			orderNo: "",
			socreText: ""
		};
		params.orderNo = plus.webview.currentWebview().orderNo;
		mui.each(iArr, function() {
			if(this.innerText == "★")
				params.socreVal += 1;
		});
		mui.each(liArr, function() {
			if(this.className == "checked")
				params.socreText += this.innerText.replace("√", "") + "  ";
		});
		if(params.socreVal == 0) {
			mui.toast("请先评星级");
			return;
		}

		Request.ajax({
			attr: Request.ATTR_LOAD_MODEL,
			data: params,
			url: "/order/finishedScore.do",
			callback: function(rs) {
				if(rs.success) {
					var iArr = spanEvaluate.querySelectorAll("i");
					for(var i = 0; i < params.socreVal; i++)
						iArr[i].innerText = "★";
					evaluateShowFlag();
					btnSpanEvaluate.disabled = true;
					document.getElementById("evaluateRemark").innerHTML = params.socreText;
					btnSpanEvaluate.style.color = "#b2b2b2";
					mui.toast("感谢你的评价！");
					document.getElementById("order-evaluate").style.display = '';
				}
			}
		});
	});
	btnSpanEvaluate.addEventListener("tap", evaluateShowFlag);
}

function finishedShare() {
	plus.share.getServices(function(shares) {

	}, function(e) {
		mui.toast("获取分享服务列表失败：" + e.message);
	});
	mui("#divShareBox li").each(function() {
		this.style.display = "inline-block";
		this.addEventListener("tap", function() {
			mui.toast("分享成功(" + this.innerText + ")");
			shareShowFlag();
		});
	});
	//	btnSpanShare.addEventListener("tap", shareShowFlag);
}

mui.init({
	swipeBack: true
});
mui.previewImage();

mui.plusReady(function() {

	var webview = plus.webview.currentWebview().opener();

	if(webview.id == 'order/confirm') {
		webview.close(false);
	}

	mui.on('reload', function() {
		window.location.reload();
	});
	divCoveringLayer.addEventListener("tap", function() {
		divEvaluateBox.style.display = this.style.display = "none";
		divShareBox.style.display = this.style.display;
	});

	var self = plus.webview.currentWebview();
	Request.post('/order/getOrderDetail.do', {
		orderNo: self.orderNo
	}, function(json) {
		if(!json.success) return;
		window.params = json.data;
		//		console.log(JSON.stringify(json));
		if(json.data.orderStatus == 6) { //已取消
			document.getElementById("cancel-div").style.display = 'block';
			document.getElementById('time-line').style.display = 'none'
			if(json.data.driverName == null) {
				dirveInformation.style.display = 'none';
			}
		} else if(json.data.orderStatus == 1) { //已接单
			dirveInformation.style.display = 'none';
			document.getElementById('order-status-1').style.display = 'block';
			document.getElementById('time-line').style.display = 'none'
		} else if(json.data.orderStatus == 0) { //为付款
			dirveInformation.style.display = 'none';
			document.getElementById('pay-div').style.display = 'block';
			document.getElementById('time-line').style.display = 'none'
		} else if(json.data.orderStatus == 2) { //已接单
			ReceiveName.classList.remove('unchooseColor');
			ReceiveName.classList.add('chooseNameColor');
			ReceiveImg.src = '../../public/images/Detail-NodeGreen.png';
			ReceiveTime.classList.remove('unchooseColor');
			ReceiveTime.classList.add('chooseTimeColor');
		} else if(json.data.orderStatus == 3 || json.data.orderStatus == 4) { //装货中，运输中
			LoadingName.classList.remove('unchooseColor');
			LoadingName.classList.add('chooseNameColor');
			LoadingImg.src = '../../public/images/Detail-NodeGreen.png';
			LoadingTime.classList.remove('unchooseColor');
			LoadingTime.classList.add('chooseTimeColor');
			document.getElementById('track-1').style.display = 'block'
		} else if(json.data.orderStatus == 5 || json.data.orderStatus == 8) { //已完成，已结算
			SureName.classList.remove('unchooseColor');
			SureName.classList.add('chooseNameColor');
			SureImg.src = '../../public/images/Detail-NodeGreen.png';
			SureTime.classList.remove('unchooseColor');
			SureTime.classList.add('chooseTimeColor');
			document.getElementById('time-line').style.display = 'none';
			document.getElementById('finish-div').style.display = 'block'
			document.getElementById('track-1').style.display = 'block'
			document.getElementById('track-2').style.display = 'block'
			if(json.data.evaluateRemark == null) {
				btnSpanEvaluate.style.display = "block";
			}
		} else if(json.data.orderStatus == 9) { //已送达（已到货）
			SureName.classList.remove('unchooseColor');
			SureName.classList.add('chooseNameColor');
			SureImg.src = '../../public/images/Detail-NodeGreen.png';
			SureTime.classList.remove('unchooseColor');
			SureTime.classList.add('chooseTimeColor');
			packaged.style.display = 'block';
			document.getElementById('track-1').style.display = 'block'
			document.getElementById('track-2').style.display = 'block'
		}
		

		var score = 5;
		if(json.data.driverScoreNum && json.data.driverScoreNum > 0) {
			score = json.data.driverScoreVal / json.data.driverScoreNum;
		}

		var iArr = spanEvaluateTotal.querySelectorAll("i");
		(score > 5) && (score = 5);
		//		console.log(score);
		//		console.log(123);
		for(var i = 0; i < score; i++) {
			iArr[i].innerText = "★";
		}

		if(parseInt(params.orderStatus) < 4) {
			document.getElementById("cancel").style.display = '';
		}

		document.getElementById("progress").style.display = 'none';
		document.getElementById("content").style.display = 'block';
		if(params.busiId == 1 || params.busiId == 2) {
			document.getElementById("busi-id-1").style.display = 'block';
			document.getElementById("busi-id-other").style.display = 'none';
		} else {
			document.getElementById("busi-id-1").style.display = 'none';
			document.getElementById("busi-id-other").style.display = 'block';
		}

		document.querySelector('header h1').innerHTML = json.data.busiName;

		document.getElementById("header").classList.add('order-status-' + json.data.orderStatus);
		if(json.data.orderStatus == 5 || json.data.orderStatus == 8) {
			finishedScore(json.data); //zsh 评分显示
			//			finishedShare();//zsh进行分享
		}

		if(json.data.evaluate == 0) {
			document.getElementById("order-evaluate").style.display = 'none';
		}

		mui('span').each(function() {
			var name = this.getAttribute('name');
			if(name) {
				if(name.endsWith('Time') && json.data[name]) {
					this.innerHTML = json.data[name].substring(0, 16);
				} else if(name == 'receiver') {
					this.innerHTML = json.data.receiver + '<font class="color-href">' + json.data.receiverPhone + '</font>';
					this.querySelector('font').addEventListener('tap', function() {
						dial(json.data.receiverPhone);
					});
				} else {
					this.innerHTML = json.data[name] || '';
				}
			}
		});
		
		//获取详细地址
			var allAddr = document.getElementById('all-addr')
			var span = document.createElement("span");
			allAddr.appendChild(span)
			var addressStr="从<span class='color-href'>"+json.data.startAddr+"</span>";
			if(json.data.centreAddr){
				for (i=0;i<json.data.centreAddr.length;i++) {
					addressStr+="经<span class='color-href'>"+json.data.centreAddr[i]+"</span>";
				}
			}
			addressStr+="到<span class='color-href'>"+json.data.endAddr+"</span>";
			span.innerHTML = addressStr
			return span;

		//获取时间
		if(json.data.orderStatus > 1) {
			mui('div').each(function() {
				var name = this.getAttribute('name');
				if(name) {
					if(name == 'updateTime') {
						var time = json.data.updateTime;
						time = time.substring(5, time.length - 5);
						time = time.replace("-", "/");
						this.innerHTML = time;
					} else if(name == 'loadedTime') {
						var time = json.data.loadedTime;
						time = time.substring(5, time.length - 5);
						time = time.replace("-", "/");
						this.innerHTML = time;
					} else if(name == 'sendTime') {
						var time = json.data.sendTime;
						time = time.substring(5, time.length - 5);
						time = time.replace("-", "/");
						this.innerHTML = time;
					} else if(name == 'receiveTime') {
						var time = json.data.receiveTime;
						time = time.substring(5, time.length - 5);
						time = time.replace("-", "/");
						this.innerHTML = time;
					} else {
						this.innerHTML = json.data[name] || '';
					}
				}
			})
		}
		
		

	});

	loadImg();

	function loadImg() {
		Request.post('/order/queryOrderTrack.do', {
			orderNo: self.orderNo
		}, function(json) {
			json.data.reverse();
			json.data.tracks = json.data;
						console.log("data1:"+JSON.stringify(json.data.tracks[2]));
			mui('#track-0 span')[0].hidden = 'true'; 
			mui('#track-0 img').each(function() {
				if(json.data.tracks.length == 0) {
					return;
				}
				if(json.data.tracks[0][this.name] && json.data.tracks[0][this.name] !== '') {
					this.src = json.data.tracks[0][this.name];
					this.setAttribute("data-preview-src", "");
					this.setAttribute("data-preview-group", "1");
					this.style.display = 'inline-block';
				}
			});
			
			mui('#track-1 span')[0].hidden = 'true';
			mui('#track-1 img').each(function() {
				if(json.data.tracks.length == 0) {
					return;
				}
				if(json.data.tracks[2][this.name] && json.data.tracks[2][this.name] !== '') {
					this.src = json.data.tracks[2][this.name];
					this.setAttribute("data-preview-src", "");
					this.setAttribute("data-preview-group", "1");
					this.style.display = 'inline-block';
				}
			});
			
			mui('#track-2 span')[0].hidden = 'true';
			mui('#track-2 img').each(function() {
				if(json.data.tracks.length == 0) {
					return;
				}
				if(json.data.tracks[3][this.name] && json.data.tracks[3][this.name] !== '') {
					this.src = json.data.tracks[3][this.name];
					this.setAttribute("data-preview-src", "");
					this.setAttribute("data-preview-group", "1");
					this.style.display = 'inline-block';
				}
			});
		});
	};

	function dial(phoneNo) {
		if(phoneNo) {
			var btnArray = ['取消', '呼叫'];
			mui.confirm(phoneNo, '', btnArray, function(e) {
				if(e.index == 1) {
					plus.device.dial(phoneNo, true);
				} else {}
			})
		}
	};

	document.getElementById("contact").addEventListener('tap', function() {
		dial(params.driverPhoneNo);
	}, false);

	document.getElementById("cancel").addEventListener('tap', function() {
		mui.open('order', 'cancel', {
			orderNo: params.orderNo
		});
	}, false);

	var flag = true;
	document.getElementById("packaged").addEventListener('tap', function() {
		//params.orderStatus == 4
		if(params.orderStatus == 9) {
			var btnArray = ['取消', '确认'];
			mui.confirm('确认收货?', '提醒', btnArray, function(e) {
				if(e.index == 1) {
					if(flag == true) {
						flag = false;
						Request.post('/order/changeOrderStatus.do', {
							orderNo: self.orderNo,
							status: 5,
						}, function(result) {
							if(result.success) {
								//返回上一页并刷新
								var wobj = plus.webview.getWebviewById("order/index");
								wobj.reload(true);
	//							params.orderStatus = 5; 
	//							params.orderStatusStr = '已完成';
	//							finishedScore({evaluate: 0});
	//							btnSpanEvaluate.addEventListener("tap", evaluateShowFlag); 
	//							btnSpanShare.addEventListener("tap", shareShowFlag);
	//							document.getElementById("header").className = 'mui-card header order-status-5';
	//							document.getElementsByName('orderStatusStr')[0].innerHTML = '已完成';
							} else {
								flag = true;
							}
						});
					}

				}
			});
		}

	});
	document.getElementById("position").addEventListener('tap', function() {
		mui.open('order', 'position', {
			params: params
		});
	});

	document.getElementById('driverName').addEventListener('tap', function() {
		mui.open('order', 'evaluate-his', {
			driverId: params.driverId
		});
	});

});