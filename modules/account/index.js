mui.init();

document.getElementById("login").addEventListener('tap', function() {
	var account = document.getElementById("account").value;
	var password = document.getElementById("password").value;

	mui.ajax();
	// TODO	登录完并返回
	mui.back();
}, false);