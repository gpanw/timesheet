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
         
    getUserSheet: function(value){
                 parms = {"from": "getUserSheet"};
                 parms["requesteduser"] = value
                 $.getJSON(model.hostURL,parms).done(function(response){
		           control.handle_getUserSheet(response);
                 }); 
    },
         
    approveSheet: function(userid,sendDate,status){
                var csrftoken = model.getCookie('csrftoken');
                $.ajaxSetup({
			beforeSend: function(xhr, settings) {
			     if (!model.csrfSafeMethod(settings.type) && !this.crossDomain) {
			            xhr.setRequestHeader("X-CSRFToken", csrftoken);
                             }
	               }
	       });
	       parms = {"from": "approveSheet"};
	       parms["status"] = status;
	       parms["userid"] = userid;
	       parms["sendDate"] = sendDate;
	       $.ajax({
	            "type": "POST",
	            "dataType": "json",
	            "url": model.hostURL,
	            "data": parms,
	            "success": function(response) {
	                control.handle_addTimeSheet(response)
	            },
	            "error": function(response){alert('server Error!!timesheet not saved.')},
	       });
    },

};

control = {
  	init: function(){
  	     viewPrior.init();
  	},
  	
  	getUserSheet: function(value){
  	     model.getUserSheet(value);
  	},
  	
  	handle_getUserSheet: function(response){
  	     viewPrior.handle_getUserSheet(response);
  	},
  	
  	approveSheet: function(userid,sendDate,status){
  	     model.approveSheet(userid,sendDate,status);
  	},
  	
  	handle_addTimeSheet: function(response) {
  	     viewPrior.handle_addTimeSheet(response)  	
  	},
  	
};

viewPrior = {
        fetchdate: [],
        dynamic_url: "", 
        
        init: function() { 
          viewPrior.dynamic_url = $(".header-team-name").attr('id');
          $("#id-nav-reports").addClass("active");
          model.hostURL = myURL + "reports/" + viewPrior.dynamic_url + "/approve-priortimesheet/";
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
          });
          $(".graphs").click(function(){
            $("#graphs-list").toggleClass("child-list");
            $("#graphs-glyph").toggleClass("icon-flipped");
          });
          $(".approval").click(function(){
            $("#approval-list").toggleClass("child-list");
            $("#approval-glyph").toggleClass("icon-flipped");
          });
  	    $('.save-status').html("");
  	    $("#approveprior").addClass("active");
            $(".table-responsive").hide();
            $(".hide-div").hide();
  	    $('#user-id').change(function(){
  	        viewPrior.fetchdate=[];
  	        $('.save-status').html("");
  	        if (this.value == 0){
  	           $(".table-responsive").hide();
  	           $(".hide-div").hide();
                }
  	        else {
  	          $('.task-value').remove();
  	          $('.prior-weeks').remove();
  	          $('.total-hours').html('0.0') 
  	          control.getUserSheet(this.value)
  	          $(".table-responsive").show();
  	          $(".hide-div").show();
  	        }
  	    });
  	    $("#approve-sheet").click(function(){
  	        var status = $(".radio input[type='radio']:checked").val();
  	        var sendDate = $(".selected").html();
  	        var userid = $("#user-id").val();
  	        if (sendDate.indexOf('approve') > -1  | sendDate.indexOf('reject') > -1 ) {
  	           alert ("Sheet has already been approved or rejected!!!")
  	        }
  	        else {
  	           if (status){
  	               control.approveSheet(userid,sendDate,status);
  	           }
  	           else{
  	               alert("Check button for approve or reject!!!")
  	           }
  	        }
  	    });
  	     
        },
        
        handle_getUserSheet: function(response){
	      for(i=0;i<response.length;i++) {
	             if (viewPrior.fetchdate.includes(response[i].sheetdate)) {
	                continue;
	             }
	             else {
	                viewPrior.fetchdate.push(response[i].sheetdate);
	                var date = response[i].sheetdate.split('-');
	                var curr = new Date(date[0], date[1]-1, date[2]);
	                if (i==0) {
	                   var append_week = "<p class='prior-weeks selected'>" + curr.toDateString() + "</p>"
	                }
	                else {
	                   var append_week = "<p class='prior-weeks'>" + curr.toDateString() + "</p>"
	                }
	                $(".week-list").append(append_week)
	             }
	      }
	      $(".prior-weeks").click(function(){
	         $('p').removeClass('selected');
	         $('.save-status').html("");
	         $(this).addClass('selected');
	         $('.task-value').remove();
	         $('.total-hours').html('0.0');
	         for(i=0;i<response.length;i++) {
	         	  var date = response[i].sheetdate.split('-');
	         	  curr = new Date(date[0], date[1]-1, date[2]);
	              if (curr.toDateString() == $(this).html()) {
	                 viewPrior.appendTimeSheet(response[i]);	 
	                 viewPrior.getWeekDate(curr);                 
	              }
	         }
	      })
	      for(i=0;i<response.length;i++) {
	            if (response[i].sheetdate == response[0].sheetdate) {
	               var date = response[i].sheetdate.split('-');	
	               curr = new Date(date[0], date[1]-1, date[2]);
	               viewPrior.getWeekDate(curr)                 
	               viewPrior.appendTimeSheet(response[i])	                  
	            }
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
	
	handle_addTimeSheet: function(response){
	      if (response) {
	         if (response["rc"] == 1){
	         	var curr = new Date(response["forDate"])
	         	var resDate = viewPrior.decrementDate(curr,5)[1]
	            $(".prior-weeks").each(function(){
	               var x = $(this).html();
	               if (resDate == x){
	               	  $('.save-status').html("Time sheet has been " + response["status"] + "ed");
	                  $(this).html(x + ' ' + response["status"])
	               }
	            })
	         }
	         else {
	            alert (response["rc"])
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
	 	$('#head-sat').html(viewPrior.decrementDate(curr,-1)[0]);
		$('#head-sun').html(viewPrior.decrementDate(curr,0)[0]);
		$('#head-mon').html(viewPrior.decrementDate(curr,1)[0]);
		$('#head-tue').html(viewPrior.decrementDate(curr,2)[0]);
		$('#head-wed').html(viewPrior.decrementDate(curr,3)[0]);
		$('#head-thu').html(viewPrior.decrementDate(curr,4)[0]);
		$('#head-fri').html(viewPrior.decrementDate(curr,5)[0]);
	  },

};

$(document).ready(function(){
  control.init();
})