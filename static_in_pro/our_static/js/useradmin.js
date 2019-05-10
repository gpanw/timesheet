model ={
    hostURL: myURL,
	  getUserInfo: function(userid){
              parms = {"from": "getUserInfo"};
              parms["userid"] = userid
              $.getJSON(model.hostURL,parms).done(function(response){
                 control.handle_getUserInfo(response)
               }); 
	  },	  
	  
	  addUserInfo: function(sendObj) {
	       var csrftoken = model.getCookie('csrftoken');
	       parms = sendObj
	       parms["from"] = "addUserInfo";
	       $.ajaxSetup({
	             beforeSend: function(xhr, settings) {
	                if (!model.csrfSafeMethod(settings.type) && !this.crossDomain) {
	                   xhr.setRequestHeader("X-CSRFToken", csrftoken);
	                }
	             }
	       });
	       $.ajax({
	            "type": "POST",
	            "dataType": "json",
	            "url": model.hostURL,
	            "data": parms,
	            "success": function(response) {
	                control.handle_addUserInfo(response);
	            },
	            "error": function(response){alert('server Error!!timesheet not saved.')},
	       });
	  },
	  
	  getCookie: function(name){
	    	   var cookieValue = null;
	    	   if (document.cookie && document.cookie != '') {
	    	     var cookies = document.cookie.split(';');
	             for (var i = 0; i < cookies.length; i++) {
	                var cookie = jQuery.trim(cookies[i]);
	                // Does this cookie string begin with the name we want?
	                if (cookie.substring(0, name.length + 1) == (name + '=')) {
	                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
	                    break;
	                };
	             };
	           };
	          return cookieValue;
	        },
	        
	  csrfSafeMethod: function(method){
	         // these HTTP methods do not require CSRF protection
	         return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
         },

};

control = {
  	init: function(){
  	     viewUserAdmin.init();
  	},
  	
  	getUserInfo: function(userid){
  	     model.getUserInfo(userid);
  	},
  	
  	handle_getUserInfo: function(response){
  	     viewUserAdmin.handle_getUserInfo(response);
  	},
  	
  	addUserInfo: function(sendObj){
  	     model.addUserInfo(sendObj);
  	},
  	
  	handle_addUserInfo: function(response){
  	     viewUserAdmin.handle_addUserInfo(response)
  	},
};

viewUserAdmin = {
    fetchdate: [],
    dynamic_url: "",
  	init: function(){
         viewUserAdmin.dynamic_url = $(".header-team-name").attr('id');
         model.hostURL = myURL + "reports/" + viewUserAdmin.dynamic_url + "/useradmin/";
         $("#reports-list").toggleClass("child-list");
         $("#reports-glyph").toggleClass("icon-flipped");
  	     $("#id-nav-reports").addClass("active");
  	     $("#teaminfo").addClass("active");
         $("#menu-toggle").click(function(e){
            e.preventDefault();
            $("#wrapper").toggleClass("menuDisplayed");
            $("#menu-toggle").toggleClass("menu-toggle-shift")
          });
          $(".reports").click(function(){
            $("#reports-list").toggleClass("child-list");
            $("#reports-glyph").toggleClass("icon-flipped");
          })
          $(".graphs").click(function(){
            $("#graphs-list").toggleClass("child-list");
            $("#graphs-glyph").toggleClass("icon-flipped");
          })
          $(".approval").click(function(){
            $("#approval-list").toggleClass("child-list");
            $("#approval-glyph").toggleClass("icon-flipped");
          })  	     
  	     $('#user-id').change(function(){
            $('.save-status').html("")
  	        if (this.value == 0){
  	           $("#location").val("");
  	           $("#lastname").val("");
  	           $("#firstname").val("");
  	           $("#email").val("");
  	           $("#mobile").val("");
  	           $("#role").val("");
  	           $("#manager_id").val("");
  	           $("#project").val("");
  	           $("#joined").val("");
  	           $("#casual").html("");
  	           $("#earned").html("");}
  	        else {
  	          control.getUserInfo(this.value)
  	        }
  	     });
  	     
  	     $('.edit').click(function(){
  	        $("input").removeAttr('readonly')
  	        $("select").prop('disabled',false);
  	        var appendVal = "<button class='btn btn-success btn-sm pull-right' id='save-user' type='submit'>Save</button>"
  	        $("#team-head").append(appendVal);
  	        $('.edit').unbind();
  	        $("#save-user").click(function(){
  	             viewUserAdmin.get_screenInfo();
  	        })
  	     });
  	},
  	
  	handle_getUserInfo(response){
  	     $("#location").val(response["location"]);
  	     $("#lastname").val(response["lastname"]);
  	     $("#firstname").val(response["firstname"]);
  	     $("#email").val(response["email"]);
  	     $("#mobile").val(response["mobile"]);
  	     $("#role").val(response["role"]);
         $("#skill").val(response["skill"]);
  	     $("#manager_id").val(response["manager_id"]);
  	     $("#project").val(response["project"]);
  	     $("#joined").val(response["joined"]);
  	     $("#casual").html(response["casual"]);
  	     $("#earned").html(response["earned"]);
  	},
  	
  	get_screenInfo: function(){
  	      var user_id = $("#user-id").val()
  	      if (user_id == "0"){
  	          alert ("Error!! no user was selected")
  	      }
  	      else {
  	         sendObj = {'user_id':user_id}
  	         sendObj["location"] = $("#location").val()
  	         sendObj["lastname"] = $("#lastname").val();
  	         sendObj["firstname"] = $("#firstname").val();
  	         sendObj["email"] = $("#email").val();
  	         sendObj["mobile"] = $("#mobile").val();
  	         sendObj["role"] = $("#role").val();
             sendObj["skill"] = $("#skill").val();
  	         sendObj["manager_id"] = $("#manager_id").val();
  	         sendObj["project"] = $("#project").val();
  	         sendObj["joined"] = $("#joined").val();
  	         control.addUserInfo(sendObj);
  	      }
  	},
  	
  	handle_addUserInfo: function(response){
  	      if (response){
  	        if (response["rc"] ==1) {
  	            $('.save-status').html("User information is saved")
  	        }
  	        else{
  	            $('.save-status').html(response["rc"]);
  	        }
  	      }
  	      else{
  	        $('.save-status').html("server error")
  	      }
  	
  	},
	  
};


$(document).ready(function(){
  control.init();
}) 