model ={
    hostURL: myURL,
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
};

viewUserAdmin = {
    fetchdate: [],
    dynamic_url: "",
  	init: function(){
         viewUserAdmin.dynamic_url = $(".header-team-name").attr('id');
         model.hostURL = myURL + "profile/";
         $("#nav-user").addClass("active");

         $(".profile-pic-glyph").click(function(){
          $("#myModal").modal("show");
         });
  	},	  
};


$(document).ready(function(){
  control.init();
}) 