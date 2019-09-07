model ={
	  hostURL: myURL + "priortime/",
	  getTimeSheet: function(curr){
              parms = {"from": "getTimeSheet"};
              parms["selectedWeek"] = curr
              var apiURL = "/api/priortime/" + curr;
              $.getJSON(apiURL, parms).done(function(response){
                control.handle_getTimeSheet(response);
               }); 
	  },

	  getTaskOtherTeam: function(teamVal){
	  	      $(document.body).css({'cursor' : 'wait'});
	  		  parms = {"from": "getTaskOtherTeam"};
	  		  parms["teamname"] = teamVal;
	  		  var apiURL = "/api/tasks/" + teamVal;
	  		  $.getJSON(apiURL, parms).done(function(response){
                 control.handle_getTaskOtherTeam(response);
               }); 
	  },  
	  
	  addTimeSheet: function(selectedWeek, hoursList, addedtask) {
	       var csrftoken = model.getCookie('csrftoken');
	       parms = {"from": "addtimesheet"};
	       parms["selectedWeek"] = selectedWeek;
	       parms["addedtask[]"] = JSON.stringify(addedtask);
	       parms["hoursList[]"] = hoursList;
	       var apiURL = "/api/priortime/" + selectedWeek + '/create/';
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
	            "url": apiURL,
	            "data": parms,
	            "success": function(response) {
	                control.handle_addTimeSheet(response)
	            },
	            "error": function(response){
	            	alert('server Error!!timesheet not saved.' + response['status'])},
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
  	     viewTimesheet.init();
  	},
  	
  	addTimeSheet: function(selectedWeek, hoursList, addedtask){
  	     model.addTimeSheet(selectedWeek, hoursList, addedtask)
  	},
  	
  	handle_addTimeSheet: function(response){
  	     viewTimesheet.handle_addTimeSheet(response)
  	},
  	
  	getTimeSheet: function(curr){
  	     model.getTimeSheet(curr);
  	},
  	
  	handle_getTimeSheet: function(response){
  	    viewTimesheet.handle_getTimeSheet(response);
  	},

  	getTaskOtherTeam: function(teamVal){
  		model.getTaskOtherTeam(teamVal)
  	},

  	handle_getTaskOtherTeam: function(response){
  		$(document.body).css({'cursor' : 'default'});
  		viewTimesheet.handle_getTaskOtherTeam(response)
  	},
  	

};

viewTimesheet = {
  	addedtask: [],
  	editable: 1,
  
	  init: function(){
	       $("#nav-priortime").addClass("active");
	       viewTimesheet.editable = 1;
	       var curr = new Date;
	       x = curr.getDate() - 7;
	       var newdate = new Date(curr.setDate(x)).toDateString();
	       curr = new Date(newdate);
	       viewTimesheet.getWeekDate(curr);
	       viewTimesheet.getWeekList();
	       control.getTimeSheet(viewTimesheet.decrementDate(curr,5)[2]);
	       
	       $('.task-item').click(function(){
	       	  if (viewTimesheet.editable) {
	          	taskname = $(this).find('span.taskname').text();
	          	billable = $(this).find('span.taskbillable').text();
	          	taskVal = {'taskname': taskname, 
	            	       'billable': billable};
              	$('#selected-leave').val("");
              	if (taskname == "Other - Tasks from other teams") {
		            $("#myModal").modal("show");
              	}
              	else {
	            	if (taskVal) {
	               		if (viewTimesheet.addedtask.includes(taskname + billable)) {
	               			alert('Task already added in your timesheet')
	            		}
	            		else {
	              			viewTimesheet.addedtask.push(taskname + billable);
	              			viewTimesheet.addTask(taskVal);
	            		}
	            	}
	            };
	          }
	       });
	       
	       $('.leave-item').click(function(){
	       	  if (viewTimesheet.editable) {
	          	taskVal = $(this).text();
	          	projectid = $(this).find('span.leave-taskno').text();
	          	project_subtask = $(this).find('span.leave-taskdesc').text();
	          	taskVal = {'taskname': projectid+project_subtask,
	            	       'billable': 'NonBillable'}
	          	$('#selected-task').val("");
	          	if (taskVal) {
	            	if (viewTimesheet.addedtask.includes(projectid+project_subtask)) {
	              		alert('Task already added in your timesheet')
	            	}
	            	else {
	              		viewTimesheet.addedtask.push(projectid+project_subtask);
	              		viewTimesheet.addTask(taskVal);
	            	}
	            };
	          }
	       });
	         
	        $('#submit-sheet').click(function(){
	           if (viewTimesheet.editable){
	              passValue = viewTimesheet.getSheetValue();
	              hoursList = passValue[0];
	              addedtask = passValue[1];
	              selectedWeek =  $('.selected').text().replace("Current","");
	              var gg = new Date(selectedWeek);
	              var date_YYYY_MM_DD = gg.getFullYear() + '-' + (gg.getMonth()+1) + '-' + gg.getDate();
	              if (addedtask.length > 0 ){
	                 control.addTimeSheet(date_YYYY_MM_DD, hoursList, addedtask) };
	            }
	        }); 
	       $("#other-team").change(function(){
	       	  if (this.value == 0){
  	             pass
  	           }
  	          else {
  	             control.getTaskOtherTeam(this.value)
  	        }
	       });
	  },
	  
	  addTask: function(taskVal){
	       if (taskVal){
	         hours = ['0.0','0.0','0.0','0.0','0.0','0.0','0.0']
	         viewTimesheet.appendTimeSheet(taskVal,hours);
	         };
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
	       var gg = new Date(curr.setDate(x));
	       var date_YYYY_MM_DD = gg.getFullYear() + '-' + (gg.getMonth()+1) + '-' + gg.getDate();
	       return [returndate, firstdate, date_YYYY_MM_DD];  
	  },
	  
	  getSheetValue: function(){
	       hoursList = [];
	       taskList = [];
	       $("#task-table tr .hours").each(function (){
	          if (this.readOnly == false) {
	             hoursList.push($(this).val())
	          }
	       })

           var i = 1
	       $("#task-table tr td:first-child").each(function (){
	            taskid = $(this).find('span.task').text();
	            billable = $(this).closest("tr").find('.checkbill').prop('checked');
	            returninfo = {'taskid': taskid,
	            			  'is_billable': billable,
	            			  'hours': hoursList.slice(7*i-7,7*i)
	            			}
	            i += 1
	            taskList.push(returninfo)
	       })
	       taskList.pop();
	       
	       return [hoursList, taskList];
	  },
	  
	  getWeekList: function() {
	       var curr = new Date;
	       x = curr.getDate() - 7;
	       var newdate = new Date(curr.setDate(x)).toDateString();
	       curr = new Date(newdate);
	       var add_week = viewTimesheet.decrementDate(curr,5)[1];
	       var append_week = "<p class='future-week selected'>" + add_week + "</p>"
	       $(".week-list").append(append_week)
	       for (i=0; i<11; i++) {
	         x = curr.getDate() - 7;
	         var newdate = new Date(curr.setDate(x)).toDateString();
	         curr = new Date(newdate);
	         var add_week = viewTimesheet.decrementDate(curr,5)[1];
	         var append_week = "<p class='future-week'>" + add_week + "</p>"
	         $(".week-list").append(append_week)
	       };
	       $('.future-week').click(function(){
	       	   viewTimesheet.editable = 1;
	           var week_date = $(this).text().replace("Current","")
	           var curr = new Date(week_date);
	           $('p').removeClass('selected');
	           $('.task-value').remove();
	           $(this).addClass('selected');
	           viewTimesheet.getWeekDate(curr);
	           $('#total td .hours').val('0.0');
	           $('#selected-task').val("");
	           $('#selected-leave').val("");
	           $('.save-status').html("");
	           if (viewTimesheet.getSheetValue[1]) {
	               viewTimesheet.addedtask = viewTimesheet.getSheetValue[1]
	           } else {
	               viewTimesheet.addedtask = []
	           }
	           control.getTimeSheet(viewTimesheet.decrementDate(curr,5)[2]);
	       })
	  },
	  
	  appendTimeSheet: function(taskVal, hours) {
	  	    projectid = taskVal.taskname;
	  	    billable = taskVal.billable;
	        var appendVal =  "<tr class='task-value'><td><span class='task'>" + projectid + "</span></td>"
	        if (billable == 'Billable') {
	            appendVal += "<td><input class='checkbill' type='checkbox' checked readonly disabled></td>"
	        }
	        else {
	            appendVal += "<td><input class='checkbill' type='checkbox' readonly disabled></td>"
	        }
	        appendVal += "</td><td><input class='hours sheetsat form-control' type='text'  value =" + hours[0] + "></td>"
	        appendVal += "<td><input class='hours sheetsun form-control' type='text' value =" + hours[1] + "></td>"
            appendVal += "<td><input class='hours sheetmon form-control' type='text' value =" + hours[2] + "></td>"
            appendVal += "<td><input class='hours sheettue form-control' type='text' value =" + hours[3] + "></td>"
            appendVal += "<td><input class='hours sheetwed form-control' type='text' value =" + hours[4] + "></td>"
            appendVal += "<td><input class='hours sheetthu form-control' type='text' value =" + hours[5] + "></td>"
            appendVal += "<td><input class='hours sheetfri form-control' type='text' value =" + hours[6] + "></td>"
            var sum = hours.reduce(function(x,y) {return parseFloat(parseFloat(x) + parseFloat(y)).toFixed(1)}, 0)
            appendVal += "<td class='total-task'><input class='hours form-control' type='text' value ='" + sum + "'readonly></td></tr>"
            $("#timesheet-table").prepend(appendVal);
            $('#selected-task').val("");
            $('#selected-leave').val("");
            var prev;
            $('#task-table tr td .hours').unbind();
            $('#task-table tr td .hours').focusin(function(){
	            prev = parseFloat($(this).val()).toFixed(1);
            }).change(function(){
                var current = parseFloat($(this).val()).toFixed(1);
                if (current >= 0 && current <=24){
 	                var change = parseFloat(current) - parseFloat(prev);
	                this.value = parseFloat(this.value).toFixed(1); 
	                var col = $(this).closest("td").index();
	                var row = $(this).closest("tr").index();
	                var lrow = $('#task-table tr:last-child td:eq(' + col + ')');
	                var totRval = parseFloat(lrow.find('.hours').val()) + parseFloat(change);
	                lrow.find('.hours').val(parseFloat(totRval).toFixed(1));
	                row = row+1;
	                var lcol = $('#task-table tr:eq(' + row + ') td:eq(9)');
	                var totCval = parseFloat(lcol.find('.hours').val()) + parseFloat(change);
	                lcol.find('.hours').val(parseFloat(totCval).toFixed(1));
	                var lcell = $('#task-table tr:last-child td:eq(9)');
	                var cellVal = parseFloat(lcell.find('.hours').val()) + parseFloat(change);
	                lcell.find('.hours').val(parseFloat(cellVal).toFixed(1));
	                $('.save-status').html("Timesheet is not saved");
	            }
	            else {
	                alert ('wrong value')
	                $(this).val(prev)
	            };
	        });
	  },
	  
	  handle_getTimeSheet: function(response) {
	      for(i=0;i<response.length;i++) {
	          if (!(viewTimesheet.addedtask.includes(response[i].taskid))){
	          	if (response[i].is_billable){
	          	 	is_billable = 'Billable'
	          	}
	            else {
	          	 	is_billable = 'NonBillable'
	            };
	            taskVal = {'taskname': response[i].taskid,
	                       'billable': is_billable
	                      }
	            viewTimesheet.appendTimeSheet(taskVal,response[i].hours);
	            var sum=0;
	            for(j=2;j<=response[i].hours.length+1;j++){
	                var a= $("#task-table tr:last-child td:eq("+j+")").find('.hours').val();
	                $("#task-table tr:last-child td:eq("+j+")").find('.hours').val(parseFloat(parseFloat(a) + parseFloat(response[i].hours[j-2])).toFixed(1));
	                sum = parseFloat(sum) + parseFloat(response[i].hours[j-2])
	            }
	            var lcell = $('#task-table tr:last-child td:last-child');
	            var cellVal = parseFloat(lcell.find('.hours').val()) + parseFloat(sum);
	            lcell.find('.hours').val(parseFloat(cellVal).toFixed(1));
	            if (!(viewTimesheet.addedtask.includes(response[i].taskid + is_billable))) {
	               viewTimesheet.addedtask.push(response[i].taskid + is_billable);
	            }
	          }
	      };
	      if (response[0].approved == 'N'){
	         $(".hours").attr('readonly','readonly');
	         viewTimesheet.editable = 0;
	         $('.save-status').html("This week prior adjustment is pending for approval");
	      }
	  },
	  
	  handle_addTimeSheet: function(response) {
	     if (response) {
	        if (response["rc"] ==1) {
	        	$(".hours").attr('readonly','readonly');
	        	alert("Timesheet is saved for week " + selectedWeek)
	            $('.save-status').html("Timesheet is submitted for approval");
	           }
	        else {
	            alert ("Error found in timesheet - \n" + response["rc"])
	            $('.save-status').html("Timesheet is not saved");
	        }
	     }
	     else {
	        $('.save-status').html("No response from server");
	     }
	  },

	  handle_getTaskOtherTeam: function(response){
	  	$('#other-task').children().remove();
	  	$('#other-task').append("<option value='0'>Select tasks</option>");
	  	for(i=0;i<response.length;i++) {
	  		appendText = "<option value=" + i + "><span class='other-taskname'>" + response[i].task_name + "</span>"
	  		if (response[i].is_billable) {
	  			appendText += " | Billable</option>";
	  		}
	  		else {
	  			appendText += " | NonBillable</option>";
	  		}
	  		$("#other-task").append(appendText);
	  	}
	  	$("#add-other-task").click(function(){
	  		projectid  = $("#other-task option:selected").text().split(' | ')[0]
	  		is_billable  = $("#other-task option:selected").text().split(' | ')[1]
	  		taskVal = {'taskname': projectid,
	  		           'billable': is_billable}
	  		//taskVal = $("#other-task option:selected").text() + " - " + $("#other-team option:selected").text();
	  		if (viewTimesheet.addedtask.includes(projectid+is_billable)) {
	              alert('Task already added in your timesheet')
	            }
	        else{
	        	hours = ['0.0','0.0','0.0','0.0','0.0','0.0','0.0']
	            viewTimesheet.appendTimeSheet(taskVal,hours);
	            viewTimesheet.addedtask.push(projectid+is_billable);
	        }
	  	})
	  },
	  
};


$(document).ready(function(){
  control.init();
}) 