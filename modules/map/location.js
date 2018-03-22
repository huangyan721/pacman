var isSelect=0;
var tmpLatlng=null;
var map = L.map('map', {
	closePopupOnClick: false
}).setView([26.074475, 119.296632], 14);

map.centerMarker = L.marker(map.getBounds().getCenter(), {
	icon: new L.DivIcon({
		iconSize: [32, 32],
		iconAnchor: [16, 32],
		popupAnchor: [0, -32],
		className: '',
		html: '<div class="center-marker animated bounce"></div>'	
	})
}).addTo(map);

map.centerMarker._icon.children[0].addEventListener("animationend", function() {
    map.centerMarker._icon.children[0].classList.remove('bounce');
  }, false);

map.centerMarker.bindPopup(new L.Popup({
	autoClose: false,
	closeButton: false
}).setContent('获取位置中...'));

map.centerMarker.openPopup();

function onMoveEnd(e) {
	console.log("select:"+isSelect);
	if(isSelect==0){
		var latlng;
		if (tmpLatlng==null) {
			latlng= map.getBounds().getCenter();
//			console.log("move:"+latlng);
			map.centerMarker.setLatLng(latlng);
			
			map.centerMarker.bindPopup('获取位置中...');
			map.centerMarker._icon.children[0].classList.add('bounce');
			document.getElementById("ensure-position").style.display = 'none';
			
			L.Location.address(latlng.lat, latlng.lng, function(result) {
				if(result.success) {
					document.getElementById("ensure-position").style.display = '';
					result.location=latlng;
//					console.log("other:"+JSON.stringify(result));
					setAddress(result);
					
					document.getElementById("city-spinner").innerText = result.city;
					result.lat = latlng.lat;
					result.lng = latlng.lng;
					window.result = result;
				}else{
					console.log("失败");
				}
			});
		} else{
//			latlng=tmpLatlng;
//			console.log("asdfg");
			isSelect=1;
			
			map.panTo(tmpLatlng);
			
			L.Location.address(tmpLatlng.lat, tmpLatlng.lng, function(result) {
				if(result.success) {
					document.getElementById("ensure-position").style.display = '';
					result.location=tmpLatlng;
//					console.log("other:"+JSON.stringify(result));
					setAddress(result);
					
					document.getElementById("city-spinner").innerText = result.city;
					result.lat = tmpLatlng.lat;
					result.lng = tmpLatlng.lng;
					window.result = result;
				}else{
					console.log("失败");
				}
			});

		}
		tmpLatlng=null;
	}
	isSelect=0;
	console.log(123);
}

function onMove(e) {
	map.centerMarker.setLatLng(map.getBounds().getCenter());
} 

function onFragend(e) {
//	console.log("拖动");
	var latlng= map.getBounds().getCenter();
//	console.log("move:"+latlng);
	map.centerMarker.setLatLng(latlng);
	map.centerMarker.bindPopup('获取位置中...');
	map.centerMarker._icon.children[0].classList.add('bounce');
	document.getElementById("ensure-position").style.display = 'none';
	
	L.Location.address(latlng.lat, latlng.lng, function(result) {
		if(result.success) {
			document.getElementById("ensure-position").style.display = '';
			result.location=latlng;
//			console.log("other:"+JSON.stringify(result));
			setAddress(result);
			
			document.getElementById("city-spinner").innerText = result.city;
			result.lat = latlng.lat;
			result.lng = latlng.lng;
			window.result = result;
		}
	});
}

//map.on('moveend', onMoveEnd);

map.on('move', onMove);

map.on('dragend',onFragend);

function setAddress(data) {
	document.getElementById("ensure-position").style.display = '';
//	console.log("data:"+JSON.stringify(data));
	map.centerMarker.bindPopup(data.name);
	// document.getElementById("address-prov").innerHTML = data.prov + data.city;
	// document.getElementById("address-name").innerHTML = '[当前]' + data.name;
}

L.tileLayer('http://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}', {
	maxZoom: 18,
	continuousWorld: false,
	subdomains: ['1', '2', '3', '4'],
	minZoom: 3
}).addTo(map);

// 初始化地址自动完成
mui.ready(function() {
	var cityPicker = new mui.PopPicker({ layer: 2 });
	cityPicker.setData(cityData);
	document.getElementById("city-spinner").addEventListener('tap', function(event) {
		cityPicker.show(function(items) {
			document.getElementById("city-spinner").innerText = items[1].text;
			var city = items[1].text;
			if(citypos[city]) {
				map.setView(citypos[city], 11);
			}
		});
	}, false);
	
	L.Location.complete('address', document.getElementById("city-spinner"), function(item) {
		isSelect=1;
		console.log("address:"+JSON.stringify(item));
		
		tmpLocation=item.location;
		if(!item.location || item.location.length == 0) {
			if(citypos[item.name]) {
				map.setView(citypos[item.name], 11);
			}
		}
		var latlng = item.location.split(',');
		latlng.reverse();
		var district = item.district;
		
		var province = district.split('省')[0]+'省';
		
		var city = district.split('省')[1].split('市')[0]+'市';
		
		district = district.split('市')[1];
		
		tmpLatlng=latlng;
		window.result = {
			"prov": province,
			"city": city,
			"district": district,
			"name": item.name,
			"lat": latlng[0],
			"lng": latlng[1]
		}
		console.log(result.city)
		console.log("select:"+JSON.stringify(result));
		setAddress(result);
		
//		map.off('moveend', onMoveEnd);
		map.panTo(latlng);
//		map.on('moveend', onMoveEnd);
	});
	
	document.getElementById("center").addEventListener('tap', function() {
		if(map.circleMarker) {
//			console.log("1")
			map.panTo(map.circleMarker.getLatLng());
			document.getElementById("city-spinner").innerHTML = city;
			L.Location.address(map.circleMarker.getLatLng().lat,map.circleMarker.getLatLng().lng, function(result) {
//				console.log("点击定位"+JSON.stringify(result));
					if(result.success) {
						document.getElementById("city-spinner").innerText = result.city;
						result.lat = map.circleMarker.getLatLng().lat;
						result.lng = map.circleMarker.getLatLng().lng;
						window.result = result;
						setAddress(result);
					}
			});
		}
	}, false);

	document.getElementById("ensure-position").addEventListener('tap', function() {
		var web = plus.webview.currentWebview();
		var view = plus.webview.getWebviewById(web.page_id);
		if(localStorage.historyPosition) {
			var his = JSON.parse(localStorage.historyPosition);
			if(his.length > 4) {
				his.shift();	
			}
			his.push(window.result);
			localStorage.historyPosition = JSON.stringify(his);
		} else {
			localStorage.historyPosition = JSON.stringify([window.result]);
		}
//		console.log(JSON.stringify(window.result))
		mui.fire(view, 'address', {
			type: web.type,
			result: window.result
		});

		mui.back();
	});
	
});

mui.plusReady(function() {
	
	var web = plus.webview.currentWebview();
	var params = web.params;
	if(params) {
		params = JSON.parse(params);
		var latlng = L.latLng(params.lat, params.lng);
//		console.log("位置:"+params.lat+","+params.lng);
		// onMoveEnd({latlng: latlng});
		// setAddress(params);
		isSelect=1;
//		console.log("2")
		map.panTo([params.lat, params.lng]);
		setAddress(params);
	}
	
	L.Location.position(function(loc) {
		if(loc.success) {
			L.circleMarker([loc.lat, loc.lng], {
				radius: 20,
				weight: 1
			}).addTo(map);

			map.circleMarker = L.circleMarker([loc.lat, loc.lng], {
				radius: 5,
				fillColor: 'blue',
				fillOpacity: 0.7,
				color: 'white',
				weight: 1
			}).addTo(map);
			window.city = loc.city || loc.prov;
			document.getElementById("city-spinner").innerHTML = city;
			
			if(!params) {
//				console.log("3")
				map.panTo([loc.lat, loc.lng]);
				L.Location.address(loc.lat,loc.lng, function(result) {
//				console.log("点击定位"+JSON.stringify(result));
					if(result.success) {
						document.getElementById("city-spinner").innerText = result.city;
						result.lat = map.circleMarker.getLatLng().lat;
						result.lng = map.circleMarker.getLatLng().lng;
						window.result = result;
						setAddress(result);
					}
			});
				// onMoveEnd({latlng:L.latLng(loc.lat, loc.lng)});
			}

			// setAddress(params);	
		}
	});
	
});
