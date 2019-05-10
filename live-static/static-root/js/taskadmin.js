model ={
    hostURL: myURL + "managerpage/taskadmin/",	  

    getSuggestions: function(searchStr){
			parms = {"from": "getSuggestions"};
      parms["searchStr"] = searchStr;
      $.getJSON(model.hostURL,parms).done(function(response){
      	control.handle_getSuggestions(response);
      });
    },

    get_teams: function(){
      parms = {"from": "getTeams"};
      $.getJSON(model.hostURL,parms).done(function(response){
        control.handle_get_teams(response)
      });

    },

    get_subtask: function(taskid){
      parms = {"from": "getSubTask"};
      parms["taskid"] = taskid;
      $.getJSON(model.hostURL,parms).done(function(response){
        control.handle_getsubtask(response)
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
  	  viewTaskAdmin.init();
  	},

  	getSuggestions: function(searchStr){
  		model.getSuggestions(searchStr);
  	},

  	handle_getSuggestions: function(response){
  		viewTaskAdmin.handle_getSuggestions(response);
  	},

    get_teams: function(){
      model.get_teams();
    },

    handle_get_teams: function(response){
      viewTaskAdmin.handle_get_teams(response);
    },

    get_subtask: function(taskid){
      model.get_subtask(taskid);
    },

    handle_getsubtask: function(response){
      alert(response);
    },
  	
};

viewTaskAdmin = {
  	init: function(){  
  		var executeSearch = null;
  		$('#taskadmin-search').on('input',function(){
        clearTimeout(executeSearch);
        var searchStr = $(this).find('input').val();
        executeSearch = setTimeout(function(){ control.getSuggestions(searchStr);}, 500);
      });

      $('.taskadmin-edit').click(function(){
        var row = $(this).closest("tr").index();
        var taskid = $('#taskadmin-tasktable tr:eq(' + row + ') td:first-child').find('a').html();
        control.get_subtask(taskid);
        $("#checksubtaskModal").modal();
      });

  	},

  	handle_getSuggestions: function(response){
  		$('.taskadmin-tasklist').remove();
  		for(i=0;i<response.length;i++){
            appendVal  = "<tr class='taskadmin-tasklist'>"
            appendVal += "<td class='taskadmin-tasname'><a>" + response[i].taskName + "</a></td>"
            appendVal += "<td class='taskadmin-taskdescription'><a>" + response[i].taskDescription + "</a></td>"
            appendVal += "<td class='taskadmin-taskstatus'><a>" + response[i].taskStatus + "</a></td>"
            appendVal += "<td class='taskadmin-function text-right'>"
            appendVal += "<button class='btn btn-xs btn-info taskadmin-edit' id='taskadmin-edit' type='submit'>"
            appendVal += "<a data-toggle='tooltip' title='Click to check detais of the tasks'>"
            appendVal += "<span class='glyphicon glyphicon-th-large' aria-hidden='true'></span></span></a></button></td></tr>"
            $('#taskadmin-tasktable').append(appendVal);
          };
  	},

    handle_get_teams: function(response){
      for(i=0;i<response.length;i++){
            var appendVal = "<option value='"+ response[i] +"'>" + response[i] + "</option>";
            $('#taskadmin-addtaskteam').append(appendVal);
      };
    },
	  
};


$(document).ready(function(){
  control.init();
}) 