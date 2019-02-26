// Below function Executes on click of login button.
function validate(){
var username = document.getElementById("username").value;
var password = document.getElementById("password").value;
if ( username == "TestUser" && password == "user123"){
alert ("Login successfully");
window.location.replace("http://localhost:3000/success");

/*exports.success = function(req, res){
	  res.render('success', { title: 'Express' });
	};*/

//window.location.href = './success.jade';

//window.location = "../jade/success";
//a(href='../jade/success');

//require('./jade/success')(success);
//exports.success = function(req, res){
//	  res.render('success', { title: 'Express' });
//	  
//	};
	/*exports.list = function(req, res){
		  res.send("respond with a resource");
		};
*/
/*exports.success = function(req, res){
	  res.render('success', { title: 'Express' });
	};*/
//window.location = "/views/success.jade"; // Redirecting to other page.
//res.redirect("/views/success");
//router.get('/success', function (req, res) {
//      res.render('success');
//});
//return res.redirect('/success');
//app.get('/success', function(req, res){
	//  res.render('success.jade', { title: 'about' });
//	});
//app.post('/', function(req, res) {
//	  // Your logic and then redirect
//	  res.redirect('/success');
//	});
return false;
}
else{

alert("Incorrect Login. Please Try again");

}
}