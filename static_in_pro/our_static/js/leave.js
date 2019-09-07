model ={
    hostURL: myURL + "manageleave/",
    getLeave: function(Ldate){
	      parms = {"from": "getleave"};
	      parms["Ldate"] = Ldate;
        var apiURL = "/api/leave/user/all/date/" + Ldate;
        $.getJSON(apiURL,parms).done(function(response){
          control.handlegetLeave(response);
        }); 
    },
         

	  addLeave: function(leaveid, Ldate, Lfor, Lrepeat, Lcomment) {
      var csrftoken = model.getCookie('csrftoken');
	    parms = {"from": "addleave"};
	    parms["leaveid"] = leaveid;
	    parms["Ldate"] = Ldate;
	    parms["Lfor"] = Lfor;
	    parms["Lrepeat"] = Lrepeat;
	    parms["Lcomment"] = Lcomment;
      var apiURL = "/api/leave/create/";
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
	        control.handle_addLeave(response)
	      },
	      "error": function(response){alert(response)},
	    });
	  },
	  
	  delLeave: function(del_id){
	       var csrftoken = model.getCookie('csrftoken');
	       parms = {"from": "deleteleave"};
	       parms["del_id"] = del_id;
         var apiURL = "/api/leave/delete/" + del_id + '/';
	       $.ajaxSetup({
	             beforeSend: function(xhr, settings) {
	                if (!model.csrfSafeMethod(settings.type) && !this.crossDomain) {
	                   xhr.setRequestHeader("X-CSRFToken", csrftoken);
	                }
	             }
	       });
	       $.ajax({
	            "type": "DELETE",
	            "dataType": "json",
	            "url": apiURL,
	            "data": parms,
	            "success": function(response) {
                del_id = parms["del_id"];
                control.handle_delLeave(del_id);
	            },
	            "error": function(response){
                control.handle_delLeave(result);
              },
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
  	     viewLeave.init();
  	},
  	
  	addLeave: function(leaveid, Ldate, Lfor, Lrepeat, Lcomment){
  	     model.addLeave(leaveid, Ldate, Lfor, Lrepeat, Lcomment);
  	},
  	
  	handle_addLeave: function(response){
  	     viewLeave.handle_addLeave(response)  	
  	},
  	
  	getLeave: function(Ldate){
  	     model.getLeave(Ldate);  	
  	},

    handlegetLeave: function(response){
          viewLeave.handlegetLeave(response);        
    },
       
    delLeave: function(del_id){
          model.delLeave(del_id);
    },
  	
    handle_delLeave: function(del_id){
  	     viewLeave.handle_delLeave(del_id)  	
  	},
};

viewLeave = {
        init: function() {
             $("#nav-leave").addClass("active");
             $('.calen').css('cursor','pointer');
             a = $('.today').text();
             b=$('.month').text();
             c = a + ' ' + b.split("\n")[1];
             gg = new Date(c)
             var date_YYYY_MM_DD = gg.getFullYear() + '-' + (gg.getMonth()+1) + '-' + gg.getDate();
             control.getLeave(date_YYYY_MM_DD);
             if (a) {
                $('#id_date').val(c);
             }
             else {
                $('#id_date').val("Select date from calendar");
             }
             $('.calen').click(function(){
                $('td').removeClass('selected');
                $(this).addClass('selected');
                a = $(this).text();
                b=$('.month').text();
                c = a + ' ' + b.split("\n")[1];
                $('#id_date').val(c);
                gg = new Date(c)
                var date_YYYY_MM_DD = gg.getFullYear() + '-' + (gg.getMonth()+1) + '-' + gg.getDate();
                control.getLeave(date_YYYY_MM_DD);
             });
             
             $('.add-leave-btn').click(function(){
                leaveid = $("#id_leaveid").val();
                Ldate = $('#id_date').val();
                Lfor = $('#id_users').val();
                Lrepeat = $('#id_repeat').val();
                Lcomment = $('#id_comment').val();
                $('.error').remove();
                if (leaveid==0) {
                    a = "<div class='error col-xs-12 leaveerr'> Leave Id is required </div>"
                    $('.leave-form').append(a);
                }
                else {
                    control.addLeave(leaveid, Ldate, Lfor, Lrepeat, Lcomment);
                }
              });
        },

        handlegetLeave: function(response){
             $('.leaves').remove();
             for(i=0;i<response.length;i++) {
                 viewLeave.appendtodayLeave(response[i].id,response[i].leaveid,response[i].date,response[i].comment,response[i].user)
             }
             
         },
         
        appendtodayLeave: function(id,leaveid,leavedate,leavecomment,leaveuser){
             var appendVal = "<tr class='leaves'><td><a class='leavedelete'  id='"+id+"'>Delete</a></td>";
                appendVal += "<td class='leavedate'>" + leavedate + "</td>";
                appendVal += "<td class='leaveid'>" + leaveid + "</td>";
                appendVal += "<td class='leaveuser'>" + leaveuser + "</td>";
                appendVal += "<td class='leavecomment'>" + leavecomment + "</td></tr>";
             $("#leave-table-body").append(appendVal);
             $("#"+id).click(function(){
                del_id = $(this).attr('id');
                control.delLeave(del_id);                
             })
        },
        
        handle_addLeave: function(response){
          $('.error').remove();
          if (response.id){
            viewLeave.appendtodayLeave(response.id,response.leaveid,response.date,response.comment,response.user);
          }
          else{
            a = "<div class='error col-xs-12 leaveerr'>" + response.rc + "</div>"
            $('.leave-form').append(a);
          }
        },

        handle_delLeave: function(del_id){
          $('.error').remove();
          if (del_id){
            delObj = $("#"+del_id)
            elem = $(delObj).parent().closest('tr');
            elem.remove();
          }else {
            appendErr = "<div class='error delerror'>OOPS Unable to delete.Server Error!!!</div>";
            $(".leave-table-div").append(appendErr);
          };
        },

};

$(document).ready(function(){
  control.init();
})