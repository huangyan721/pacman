mui.init();

mui.ready(function() {
	

});

document.getElementById('problem').addEventListener('tap',function(){
	mui.open('service','problem')
})
//document.getElementById('complain').addEventListener('tap',function(){
//	mui.open('service','complain')
//})
document.getElementById('feedback').addEventListener('tap',function(){
	mui.open('service','feedback')
})
//document.getElementById('record').addEventListener('tap',function(){
//	mui.open('service','record')
//})