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
         
      getUserDate: function(user){
                parms = {"from": "getUserDate"};
                parms["requestedUser"] = user;
                $.getJSON(model.hostURL,parms).done(function(response){
		        	   control.handle_getUserDate(response);
                }); 
      },

      getSheet: function(forDate, forUser){
        parms = {"from": "getSheet"};
        parms["forDate"] = forDate;
        parms["forUser"] = forUser;
        $.getJSON(model.hostURL,parms).done(function(response){
          control.handle_getSheet(response);
        }); 
      },
         
};

control = {
  	init: function(){
  	    viewPreTimesheet.init();
  	},
  	
  	getUserDate: function(user){
  	    model.getUserDate(user);
  	},
  	
  	handle_getUserDate: function(response){
  	    viewPreTimesheet.handle_getUserDate(response);
  	},

    getSheet: function(forDate, forUser){
        model.getSheet(forDate, forUser);
    },

    handle_getSheet: function(response){
        viewPreTimesheet.handle_getSheet(response);
    },
  	
};

viewPreTimesheet = {
    fetchdate: [],
    dynamic_url: "",
        
    init: function() {
        viewPreTimesheet.dynamic_url = $(".header-team-name").attr('id');
        $("#id-nav-reports").addClass("active");
        model.hostURL = myURL + "reports/" + viewPreTimesheet.dynamic_url + "/previoustimesheets/";
        $("#reports-list").toggleClass("child-list");
        $("#reports-glyph").toggleClass("icon-flipped");
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
  	    $('#user-id').change(function(){
            $('.prior-weeks').remove();
            $('.prior-weeks-head').remove();
            $('.append-sheet').remove()
            $('p').removeClass('selected');
  	        if (this.value == 0){
  	           $(".hide-element").hide();
                }
  	        else {
  	          //alert(this.value)
  	           control.getUserDate(this.value)
  	           $(".hide-element").show();
  	        }
  	    }); 
    },

    handle_getUserDate: function(response){
      curr =new Date();
      var append_week = "<p class='prior-weeks-head'>" + 'Select A Week' + "</p>";
      $(".week-list").append(append_week);
      if (response['min_time']['date__min']){
          var x = response['min_time']['date__min'].split('-')
    	    var last = new Date(x[0], x[1]-1, x[2]);
          for(;last<=curr;last.setDate(last.getDate()+7)){
    	      var append_week = "<p class='prior-weeks'>" + last.toDateString() + "</p>";
    	      $(".week-list").append(append_week);
          }
          $('.prior-weeks').click(function(){
            $('p').removeClass('selected');
            $(this).addClass('selected');
            $('.append-sheet').remove()
            forUser = $("#user-id").find(":selected").text();
            forDate = $(this).html();
            control.getSheet(forDate, forUser);
        });
      }
    },

    handle_getSheet: function(response){
      for(i=0;i<response.length;i++){
        var appendVal = "<div class='append-sheet'><div class='table-responsive'><table class='table table-striped' id='task-table" + i + "'>";
        appendVal += "<thead><tr><th class='task'>Task #</th><th class='billable'>Billable</th>"
        appendVal += "<th id='head-sat" + i + "'>Sat</th><th id='head-sun" + i + "'>Sun</th>";
        appendVal += "<th id='head-mon" + i + "'>Mon</th><th id='head-tue" + i + "'>Tue</th><th id='head-wed" + i + "'>Wed</th>";
        appendVal += "<th id='head-thu" + i + "'>Thu</th><th id='head-fri" + i + "'>Fri</th><th>Total</th></tr></thead>";
        appendVal += "<tbody id='timesheet-table" + i + "'><tr id='total" + i + "'><td class='task'>Total</td><td></td>";
        appendVal += "<td class='total-hours'>0.0</td><td class='total-hours'>0.0</td><td class='total-hours'>0.0</td>";
        appendVal += "<td class='total-hours'>0.0</td><td class='total-hours'>0.0</td><td class='total-hours'>0.0</td>";
        appendVal += "<td class='total-hours'>0.0</td><td class='total-hours'>0.0</td></tr></tbody></table></div>";
        appendVal += "<p class='approved-by'><b>Approved By " + response[i][0].approved_by + "</b></p></div>"
        $(".manager-prior-table").prepend(appendVal);
        var weeklyRes = response[i]
        for(k=0;k<weeklyRes.length;k++) { 
                  curr = new Date(weeklyRes[k].sheet_date)
                  viewPreTimesheet.getWeekDate(curr, i)           
                  viewPreTimesheet.appendTimeSheet(weeklyRes[k], i);
        }
      }
      var h = $('#page-content-wrapper').height();
      if (h>$('#sidebar-wrapper').height()){
          $('#sidebar-wrapper').height(h+100);
      }
    },

    getWeekDate: function(curr,i){
      $('#head-sat'+i).html(viewPreTimesheet.decrementDate(curr,-1)[0]);
      $('#head-sun'+i).html(viewPreTimesheet.decrementDate(curr,0)[0]);
      $('#head-mon'+i).html(viewPreTimesheet.decrementDate(curr,1)[0]);
      $('#head-tue'+i).html(viewPreTimesheet.decrementDate(curr,2)[0]);
      $('#head-wed'+i).html(viewPreTimesheet.decrementDate(curr,3)[0]);
      $('#head-thu'+i).html(viewPreTimesheet.decrementDate(curr,4)[0]);
      $('#head-fri'+i).html(viewPreTimesheet.decrementDate(curr,5)[0]);
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

    appendTimeSheet: function(res, i) {
      var taskid = res.taskid;
      var billable = res.is_billable;
      var hours = res.hours;
      
      var appendVal =  "<tr class='task-value'><td><span class='task'>" + taskid + "</span>"
      if (billable) {
              appendVal += "<td><input class='checkbill' type='checkbox' checked readonly disabled></td>"
          }
          else {
              appendVal += "<td><input class='checkbill' type='checkbox' readonly disabled></td>"
          }
      appendVal += "</td><td>" + hours[0] + "</td>";
      appendVal += "<td>" + hours[1] + "</td>";
      appendVal += "<td>" + hours[2] + "</td>";
      appendVal += "<td>" + hours[3] + "</td>";
      appendVal += "<td>" + hours[4] + "</td>";
      appendVal += "<td>" + hours[5] + "</td>";
      appendVal += "<td>" + hours[6] + "</td>";
      var sum = hours.reduce(function(x,y) {return parseFloat(parseFloat(x) + parseFloat(y)).toFixed(1)}, 0);
      appendVal += "<td class='total-task'>" + sum + "</td></tr>";
      $('#timesheet-table'+i).prepend(appendVal);
      var sum=0;
      for(var j=2;j<=res.hours.length+1;j++){
          var a= $("#task-table" + i + " tr:last-child td:eq("+j+")").html();
          $("#task-table" + i + " tr:last-child td:eq("+j+")").html(parseFloat(parseFloat(a) + parseFloat(res.hours[j-2])).toFixed(1));
          sum = parseFloat(sum) + parseFloat(res.hours[j-2])
      }
      var lcell = $("#task-table" + i + " tr:last-child td:last-child");
      var cellVal = parseFloat(lcell.html()) + parseFloat(sum);
      lcell.html(parseFloat(cellVal).toFixed(1));
      return 0;
  },
        
};

$(document).ready(function(){
  control.init();
})  