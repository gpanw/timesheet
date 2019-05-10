model ={
    hostURL: "/",
    getLeave: function(Ldate){
	       parms = {"from": "getleave"};
	       parms["Ldate"] = Ldate;
               $.getJSON(model.hostURL,parms).done(function(response){
                 control.handlegetLeave(response);
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
  	     viewHome.init();
  	},
  	
};

viewHome = {
        init: function() {
          $(".message-header").click(function(){
            $(".message-body").toggleClass("message-body-display");
            $(".message-glyph").toggleClass("icon-flipped-180");
          })
        },

};

$(document).ready(function(){
  control.init();
})