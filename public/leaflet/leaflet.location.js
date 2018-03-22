(function() {
	if(!window.L) {
		window.L = {};
	}

	L.Location = {
		position: function(callback) {
			
				plus.geolocation.getCurrentPosition(function(position) {
					var lng = position.coords.longitude;
					var lat = position.coords.latitude;
					var latlng = L.Coordinate.gps2mars(lat, lng);
					L.Location.address(latlng.lat, latlng.lng, function(result) {
						result.lat = latlng.lat;
						result.lng = latlng.lng;
						callback(result);
					});
				}, function(e) {
					mui.alert("定位失败：请将设置中的定位权限打开");
				}, {
					geocode: false,
					provider: 'system'
				});
		},

		address: function(lat, lng, callback) {
			lat = lat.toFixed(6);
			lng = lng.toFixed(6);
			var url = 'http://restapi.amap.com/v3/geocode/regeo?';
			var params = [
				'key=3e8c80ba41135292f6abf81c23c5c59c',
				'location=' + lng + ',' + lat,
				'poitype=',
				'radius=1000',
				'extensions=all',
				//'batch=false',
				'roadlevel=0'
			];
			mui.ajax(url + params.join('&'), {
				success: function(data) {
					console.log(JSON.stringify(data));
					if(data && data.status == '1') {
						if(data.regeocode.aois.length == 0 && data.regeocode.pois.length == 0) {
							callback({success: false});
						} else {
							callback({
								success: true,
								prov: data.regeocode.addressComponent.province,
								city: data.regeocode.addressComponent.city,
								district: data.regeocode.addressComponent.district,
								name: data.regeocode.aois.length > 0 ? data.regeocode.aois[0].name : data.regeocode.pois[0].name
							});
						}
					} else {
						callback({
							success: false
						});
					}
				},

				error: function() {
					callback({
						success: false
					});
				}

			});

		},
		
		complete: function(id, city, callback) {
			function request(query) {
				if(!query) {
					this.results = [];
					this.render();
					return;
				}
			
				query = query.replace(/^\s*|\s*$/, '');
				var url = 'http://restapi.amap.com/v3/assistant/inputtips?';
				var params = [
					'key=3e8c80ba41135292f6abf81c23c5c59c',
					'keywords=' + query,
					'types=',
					'location=',
					'city=' + city.innerHTML,
					'datatype=all'
				];
			
				var self = this;
			
				mui.ajax(url + params.join('&'), {
					success: function(data) {
						var list = [];
						if(data && data.tips) {
							mui.each(data.tips, function(index, item) {
								if(typeof(item.address) == 'string') {
									list.push(item);
								}
							});
							self.results = list.splice(0, 5);
						}
						self.render();
					}
				});
			}
			var input = document.getElementById(id);
			var ac = new AC(input, null, request, null, null, callback);
			ac.primaryTextKey = 'name';
			ac.secondaryTextKey = 'district';
		}

	};

	function GPSConverter() {
		var me = {
			"casm_rr": 0,
			"casm_t1": 0,
			"casm_t2": 0,
			"casm_x1": 0,
			"casm_y1": 0,
			"casm_x2": 0,
			"casm_y2": 0,
			"casm_f": 0
		};

		function yj_sin2(x) {
			var tt, ss, ff = 0,
				s2, cc;
			x < 0 && (x = -x) && (ff = 1);
			cc = Math.floor(x / 6.28318530717959);
			tt = x - cc * 6.28318530717959;
			if(tt > 3.1415926535897932) {
				tt = tt - 3.1415926535897932;
				if(ff == 1) {
					ff = 0;
				} else if(ff == 0) {
					ff = 1;
				}
			}
			x = tt;
			ss = x;
			s2 = x;
			tt = tt * tt;
			s2 = s2 * tt;
			ss = ss - s2 * 0.166666666666667;
			s2 = s2 * tt;
			ss = ss + s2 * 8.33333333333333E-03;
			s2 = s2 * tt;
			ss = ss - s2 * 1.98412698412698E-04;
			s2 = s2 * tt;
			ss = ss + s2 * 2.75573192239859E-06;
			s2 = s2 * tt;
			ss = ss - s2 * 2.50521083854417E-08;
			if(ff == 1) {
				ss = -ss;
			}
			return ss;
		}

		function Transform_yj5(x, y) {
			var tt = 300 + 1 * x + 2 * y + 0.1 * x * x + 0.1 * x * y + 0.1 * Math.sqrt(Math.sqrt(x * x));
			tt += (20 * yj_sin2(18.849555921538764 * x) + 20 * yj_sin2(6.283185307179588 * x)) * 0.6667;
			tt += (20 * yj_sin2(3.141592653589794 * x) + 40 * yj_sin2(1.047197551196598 * x)) * 0.6667;
			tt += (150 * yj_sin2(0.2617993877991495 * x) + 300 * yj_sin2(0.1047197551196598 * x)) * 0.6667;
			return tt;
		}

		function Transform_yjy5(x, y) {
			var tt = -100 + 2 * x + 3 * y + 0.2 * y * y + 0.1 * x * y + 0.2 * Math.sqrt(Math.sqrt(x * x));
			tt += (20 * yj_sin2(18.849555921538764 * x) + 20 * yj_sin2(6.283185307179588 * x)) * 0.6667;
			tt += (20 * yj_sin2(3.141592653589794 * y) + 40 * yj_sin2(1.047197551196598 * y)) * 0.6667;
			tt += (160 * yj_sin2(0.2617993877991495 * y) + 320 * yj_sin2(0.1047197551196598 * y)) * 0.6667;
			return tt;
		}

		function Transform_jy5(x, xx) {
			var a = 6378245,
				e = 0.00669342,
				n = Math.sqrt(1 - e * yj_sin2(x * 0.0174532925199433) * yj_sin2(x * 0.0174532925199433));
			n = (xx * 180) / (a / n * Math.cos(x * 0.0174532925199433) * 3.1415926);
			return n;
		}

		function Transform_jyj5(x, yy) {
			var a = 6378245,
				e = 0.00669342,
				mm = 1 - e * yj_sin2(x * 0.0174532925199433) * yj_sin2(x * 0.0174532925199433),
				m = (a * (1 - e)) / (mm * Math.sqrt(mm));
			return(yy * 180) / (m * 3.1415926);
		}

		function random_yj() {
			var t, casm_a = 314159269,
				casm_c = 453806245;
			me.casm_rr = casm_a * me.casm_rr + casm_c;
			t = parseInt(me.casm_rr / 2);
			me.casm_rr = me.casm_rr - t * 2;
			me.casm_rr = me.casm_rr / 2;
			return(me.casm_rr);
		}

		function IniCasm(w_time, w_lng, w_lat) {
			me.casm_t1 = w_time;
			me.casm_t2 = w_time;
			var tt = parseInt(w_time / 0.357);
			me.casm_rr = w_time - tt * 0.357;
			w_time == 0 && (me.casm_rr = 0.3);
			me.casm_x1 = w_lng;
			me.casm_y1 = w_lat;
			me.casm_x2 = w_lng;
			me.casm_y2 = w_lat;
			me.casm_f = 3;
		}

		function wgtochina_lb(wg_lng, wg_lat, wg_heit, wg_week, wg_time) {
			var x_add, y_add, h_add, x_l, y_l, casm_v, t1_t2, x1_x2, y1_y2, point = null;
			if(wg_heit > 5000) {
				return point;
			}
			x_l = wg_lng;
			x_l = x_l / 3686400.0;
			y_l = wg_lat;
			y_l = y_l / 3686400.0;
			if(x_l < 72.004) {
				return point;
			}
			if(x_l > 137.8347) {
				return point;
			}
			if(y_l < 0.8293) {
				return point;
			}
			if(y_l > 55.8271) {
				return point;
			}
			me.casm_t2 = wg_time;
			t1_t2 = (me.casm_t2 - me.casm_t1) / 1000.0;
			if(t1_t2 <= 0) {
				me.casm_t1 = me.casm_t2;
				me.casm_f = me.casm_f + 1;
				me.casm_x1 = me.casm_x2;
				me.casm_f = me.casm_f + 1;
				me.casm_y1 = me.casm_y2;
				me.casm_f = me.casm_f + 1;
			} else {
				if(t1_t2 > 120) {
					if(me.casm_f == 3) {
						me.casm_f = 0;
						me.casm_x2 = wg_lng;
						me.casm_y2 = wg_lat;
						x1_x2 = me.casm_x2 - me.casm_x1;
						y1_y2 = me.casm_y2 - me.casm_y1;
						casm_v = Math.sqrt(x1_x2 * x1_x2 + y1_y2 * y1_y2) / t1_t2;
						if(casm_v > 3185) {
							return(point);
						}
					}
					me.casm_t1 = me.casm_t2;
					me.casm_f = me.casm_f + 1;
					me.casm_x1 = me.casm_x2;
					me.casm_f = me.casm_f + 1;
					me.casm_y1 = me.casm_y2;
					me.casm_f = me.casm_f + 1;
				}
			}
			x_add = Transform_yj5(x_l - 105, y_l - 35);
			y_add = Transform_yjy5(x_l - 105, y_l - 35);
			h_add = wg_heit;
			x_add = x_add + h_add * 0.001 +
				yj_sin2(wg_time * 0.0174532925199433) + random_yj();
			y_add = y_add + h_add * 0.001 +
				yj_sin2(wg_time * 0.0174532925199433) + random_yj();
			point = [];
			point[0] = (x_l + Transform_jy5(y_l, x_add)) * 3686400;
			point[1] = (y_l + Transform_jyj5(y_l, y_add)) * 3686400;
			return point;
		}

		this.getEncryPoint = function(lng, lat) {
			var x1 = lng * 3686400.0;
			var y1 = lat * 3686400.0;
			var point = wgtochina_lb(parseInt(x1), parseInt(y1), 0, 0, 0);
			point || (point = [x1, y1]);
			point[0] /= 3686400.0;
			point[1] /= 3686400.0;
			return point;
		}
	}

	var GPSConverter = new GPSConverter();

	L.Coordinate = {
		gps2mars: function(lat, lng) {
			var point = GPSConverter.getEncryPoint(lng, lat);
			return {
				lat: point[1],
				lng: point[0]
			};
		}
	}
	
})();