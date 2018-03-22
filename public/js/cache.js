/**
 * 已经登录的用户信息
 */
var Cache={
	TOKEN_UUID:"TOKEN_UUID",
	LOGIN_TOKEN:"LOGIN_TOKEN",
	LOGIN_USER:"LOGIN_USER_KEY",
	getUUID:function(){
		var uuid = window.plus ? plus.device.uuid : window.localStorage[this.TOKEN_UUID];
		if(!uuid){
			uuid = Math.random(); 
			Cache.setData(this.TOKEN_UUID, uuid+"");
		}
		return uuid;
	},
	getToken:function(){
		return window.localStorage[this.LOGIN_TOKEN];
	},
	setToken:function(val){
		if(val)
			window.localStorage[this.LOGIN_TOKEN] = val;
		else
			window.localStorage.removeItem(this.LOGIN_TOKEN);
	},
	getUser:function(){
		var val = window.localStorage[this.LOGIN_USER];
		return val ? JSON.parse(val) : null;
	},
	setUser:function(val){
		if(val)
			window.localStorage[this.LOGIN_USER] = JSON.stringify(val);
		else
			window.localStorage.removeItem(this.LOGIN_USER);
	},
	setData:function(key, val){
		if(val){
			if(typeof val === "string")
				window.localStorage[key] = "0"+val;
			else
				window.localStorage[key] = "1"+JSON.stringify(val);
		}else
			window.localStorage.removeItem(key);			
	},
	getData:function(key){
		var val = window.localStorage[key];
		if(val){
			return (val.charAt(0) == 1) ? JSON.parse(val.substring(1)) : val.substring(1);
		}
	},
	loginOut:function(){
		this.setToken(); this.setUser();
		window.localStorage.removeItem(this.TOKEN_UUID);
	},
//	clear:function(){
//		window.localStorage.removeItem(this.TOKEN_UUID);
//	}

};
