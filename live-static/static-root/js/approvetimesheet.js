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
         
        getUserSheet: function(user,curr){
                parms = {"from": "getUserSheet"};
                parms["requestedUser"] = user;
                parms["requestedDate"] = curr;
                $.getJSON(model.hostURL,parms).done(function(response){
		        	control.handle_getUserSheet(response);
                }); 
        },
         
        rejectTimeSheet: function(userid,sendDate){
                var csrftoken = model.getCookie('csrftoken');
                $.ajaxSetup({
			beforeSend: function(xhr, settings) {
			     if (!model.csrfSafeMethod(settings.type) && !this.crossDomain) {
			            xhr.setRequestHeader("X-CSRFToken", csrftoken);
                             }
	               }
	       });
	       parms = {"from": "rejectSheet"};
	       parms["userid"] = userid;
	       parms["sendDate"] = sendDate;
	       $.ajax({
	            "type": "POST",
	            "dataType": "json",
	            "url": model.hostURL,
	            "data": parms,
	            "success": function(response) {
	                control.handle_rejectTimeSheet(response)
	            },
	            "error": function(response){alert('server Error!!timesheet not saved.')},
	       });
         },

};

control = {
  	init: function(){
  	     viewTimesheet.init();
  	},
  	
  	getUserSheet: function(user,curr){
  	     model.getUserSheet(user,curr);
  	},
  	
  	handle_getUserSheet: function(response){
  	     viewTimesheet.handle_getUserSheet(response);
  	},
  	
  	rejectTimeSheet: function(userid,sendDate){
  	     model.rejectTimeSheet(userid,sendDate);
  	},
  	
  	handle_rejectTimeSheet: function(response) {
  	     viewTimesheet.handle_rejectTimeSheet(response)  	
  	},
  	
};

viewTimesheet = {
    fetchdate: [],
    dynamic_url: "",
        
    init: function() {
    	viewTimesheet.dynamic_url = $(".header-team-name").attr('id');
    	$("#id-nav-reports").addClass("active");
        model.hostURL = myURL + "reports/" + viewTimesheet.dynamic_url + "/approve-timesheet/";
        $("#approval-list").toggleClass("child-list");
        $("#approval-glyph").toggleClass("icon-flipped");
  	    $("#id-nav-reports").addClass("active");
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
  	    $("#approvetimesheet").addClass("active");
  	    var curr = new Date;
	    viewTimesheet.getWeekDate(curr);
            $(".table-responsive").hide();
            $(".hide-div").hide();
            $(".save-status").html("")
  	    $('#user-id').change(function(){
  	        viewTimesheet.fetchdate=[];
  	        $(".save-status").html("")
  	        if (this.value == 0){
  	           $(".table-responsive").hide();
  	           $(".hide-div").hide();
                }
  	        else {
  	          $('.task-value').remove();
  	          $('.prior-weeks').remove();
  	          var userid = this.value;
  	          var curr = new Date;
  	          control.getUserSheet(userid,viewTimesheet.decrementDate(curr,5)[1]);
  	          $('.total-hours').html('0.0')
  	          $(".table-responsive").show();
  	          $(".hide-div").show();
  	        }
  	    });
  	    $("#approve-sheet").click(function(){
  	        var userid = $("#user-id").val();
  	        var curr = new Date;
  	        control.rejectTimeSheet(userid,viewTimesheet.decrementDate(curr,5)[1]);
  	    });
  	     
    },
        
    handle_getUserSheet: function(response){
	      for(i=0;i<response.length;i++) {
	             viewTimesheet.appendTimeSheet(response[i])
	      }
    },

	appendTimeSheet: function(res) {
		projectid = res.taskid;
	  	billable = res.is_billable;
	    var appendVal =  "<tr class='task-value'><td><span class='task'>" + projectid + "</span>"
	    if (billable == true) {
	        appendVal += "<td><input class='checkbill' type='checkbox' checked readonly disabled></td>"
	    }
	    else {
	        appendVal += "<td><input class='checkbill' type='checkbox' readonly disabled></td>"
	    }
	    appendVal += "</td><td>" + res.hours[0] + "</td>";
	    appendVal += "<td>" + res.hours[1] + "</td>";
	    appendVal += "<td>" + res.hours[2] + "</td>";
	    appendVal += "<td>" + res.hours[3] + "</td>";
	    appendVal += "<td>" + res.hours[4] + "</td>";
	    appendVal += "<td>" + res.hours[5] + "</td>";
	    appendVal += "<td>" + res.hours[6] + "</td>";
	    var sum = res.hours.reduce(function(x,y) {return parseFloat(parseFloat(x) + parseFloat(y)).toFixed(1)}, 0);
	    appendVal += "<td class='total-task'>" + sum + "</td></tr>";
	    $("#timesheet-table").prepend(appendVal);
	    var sum=0;
	    for(j=2;j<=res.hours.length+1;j++){
	        var a= $("#task-table tr:last-child td:eq("+j+")").html();
	        $("#task-table tr:last-child td:eq("+j+")").html(parseFloat(parseFloat(a) + parseFloat(res.hours[j-2])).toFixed(1));
	        sum = parseFloat(sum) + parseFloat(res.hours[j-2])
	    }
	    var lcell = $('#task-table tr:last-child td:last-child');
	    var cellVal = parseFloat(lcell.html()) + parseFloat(sum);
	    lcell.html(parseFloat(cellVal).toFixed(1));
	    return 0;
	},
	
	handle_rejectTimeSheet: function(response){
	      if (response) {
	         if (response["rc"] == 1){
	            $(".save-status").html("timesheet has been rejected")
	         }
	         else {
	            alert ('Timesheet not saved \n' + response["rc"])
	            $(".save-status").html('Timesheet not saved \n' + response["rc"])
	         }
	      }
	},
	
	decrementDate: function(curr,n){
	       if (curr.getDay() < 6) {
	           var x = curr.getDate() - curr.getDay() + n;
	       }
	       else {
	           var x = curr.getDate() + 1 + n;
	       };
	       var firstdate = new Date(curr.setDate(x)).toDateString();
	       var splitdate = firstdate.split(' ');
	       var returndate = splitdate[0] + ' ' + splitdate[2] + '-' + splitdate[1];
	       return [returndate, firstdate];  
	},
	
	getWeekDate: function(curr){
	 	$('#head-sat').html(viewTimesheet.decrementDate(curr,-1)[0]);
		$('#head-sun').html(viewTimesheet.decrementDate(curr,0)[0]);
		$('#head-mon').html(viewTimesheet.decrementDate(curr,1)[0]);
		$('#head-tue').html(viewTimesheet.decrementDate(curr,2)[0]);
		$('#head-wed').html(viewTimesheet.decrementDate(curr,3)[0]);
		$('#head-thu').html(viewTimesheet.decrementDate(curr,4)[0]);
		$('#head-fri').html(viewTimesheet.decrementDate(curr,5)[0]);
	  },

};

$(document).ready(function(){
  control.init();
})