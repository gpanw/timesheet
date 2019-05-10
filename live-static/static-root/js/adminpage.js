model ={
    hostURL: myURL + "adminpage/",

    addUser: function(userid, email, role, manager, project, location, joined, password, lastname, firstname, mobile) {
         var csrftoken = model.getCookie('csrftoken');
         var parms = {"from": "adduser"};
         parms["userid"] = userid;
         parms["email"] = email;
         parms["role"] = role;
         parms["manager"] = manager;
         parms["project"] = project;
         parms["location"] = location;
         parms["joined"] = joined;
         parms["password"] = password;
         parms["lastname"] = lastname;
         parms["firstname"] = firstname;
         parms["mobile"] = mobile;
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
                  control.handle_addUser(response)
              },
              "error": function(response){alert('server Error!!User not saved.')},
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

    getSuggestions: function(searchStr){
          parms = {"from": "getSuggestions"};
          parms["searchStr"] = searchStr;
          $.getJSON(model.hostURL,parms).done(function(response){
                 control.handle_getSuggestions(response);
               }); 
	  },

    getTeams: function(){
      parms = {"from": "getTeams"}
      $.getJSON(model.hostURL,parms).done(function(response){
                 control.handle_getTeams(response);
               }); 
    },

    getUserInfo: function(userid){
      parms = {"from": "getUserInfo"};
      parms["userid"] = userid;
      $.getJSON(model.hostURL,parms).done(function(response){
                 control.handle_getuserInfo(response);
               }); 
    },

    deleteUser: function(userid){
      var csrftoken = model.getCookie('csrftoken');
      var parms = {"from": "deleteuser"};
      parms["userid"] = userid;
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
          control.handle_deleteUser(response)
        },
        "error": function(response){alert('server Error!!User not deleted.')},
        });
    },

};

control = {
  	init: function(){
  	     viewAdminpage.init();
  	},

    addUser: function(userid, email, role, manager, project, location, joined, password, lastname, firstname, mobile){
      model.addUser(userid, email, role, manager, project, location, joined, password, lastname, firstname, mobile);
    },

    handle_addUser: function(response){
      viewAdminpage.handle_addUser(response);
    },

    getSuggestions: function(searchStr){
      model.getSuggestions(searchStr);
    },

    handle_getSuggestions: function(response){
      viewAdminpage.handle_getSuggestions(response);
    },

    getTeams: function(){
      model.getTeams()
    },

    handle_getTeams: function(response){
      viewAdminpage.handle_getTeams(response);
    },

    deleteUser: function(userid){
      model.deleteUser(userid);
    },

    handle_deleteUser: function(response){
      viewAdminpage.handle_deleteUser(response);
    },
  	
    getUserInfo: function(userid) {
      model.getUserInfo(userid);
    },

    handle_getuserInfo: function(response) {
      viewAdminpage.handle_getuserInfo(response);
    },
};

viewAdminpage = { 

        init: function() {
          var executeSearch = null
          control.getTeams();
          $('.adminpage-edit').click(function(){
            var row = $(this).closest("tr").index();
            var userid = $('#adminpage-usertable tr:eq(' + row + ') td:first-child').find('a').html();
            control.getUserInfo(userid);
            $("#edituserModal").modal();
          });

          $('.adminpage-delete').click(function(){
            var row = $(this).closest("tr").index();
            var userid = $('#adminpage-usertable tr:eq(' + row + ') td:first-child').find('a').html();
            control.deleteUser(userid);
          });

          $('#adminpage-search').on('input',function(){
            clearTimeout(executeSearch);
            var searchStr = $(this).find('input').val();
            executeSearch = setTimeout(function(){control.getSuggestions(searchStr);}, 500);
          });

          $('.adminpage-adduserbtn').click(function(){
            $("#adduserModal").find('input').val('');
            $("#adduserModal").find('select').val('');
            $("#adduserModal").modal();
          });

          $('#adminpage-adduserbtn').click(function(){
            var userid = $('#adminpage-adduserid').val();
            var password = $('#adminpage-addpassword').val();
            var lastname = $('#adminpage-addlastname').val();
            var firstname = $('#adminpage-addfirstname').val();
            var email = $('#adminpage-addemail').val();
            var mobile = $('#adminpage-addmobile').val();
            var role = $('#adminpage-addrole option:selected').val()
            var manager = $('#adminpage-addmanagerid option:selected').val()
            var project = $('#adminpage-addproject').val();
            var location = $('#adminpage-addlocation option:selected').val()
            var joined = $('#adminpage-addjoined').val();
            if (userid && email && role && manager && project && location && joined && password){
              control.addUser(userid, email, role, manager, project, location, joined, password, lastname, firstname, mobile);
            }
            else{
              alert('mandatory fields should not be blank');
            };
          });

          $('#adminpage-edituserbtn').click(function(){
            alert('gaurav')
          });
        
        },

        handle_addUser: function(response){
          if (response=='1'){
            alert('user has been added')
          } else {
            alert(response)
          }
        },

        handle_getTeams: function(response){
          $('#adminpage-addmanagerid').children().remove();
          for(i=0;i<response.length;i++){
            var appendVal = "<option class='adminpage-teamlist' id='"+response[i].team_name+"'value='"+response[i].team_lead+"'>"+response[i].team_lead+"</option>"
            $('#adminpage-addmanagerid').append(appendVal);
          };
          var team_name = $('#adminpage-addmanagerid option:selected').attr('id')
          $('#adminpage-addproject').val(team_name);

          $('#adminpage-addmanagerid').change(function(){
            var team_name = $('#adminpage-addmanagerid option:selected').attr('id')
            $('#adminpage-addproject').val(team_name);
          })
        },

        handle_getSuggestions: function(response){
          $('#adminpage-userList').children().remove();
          for(i=0;i<response.length;i++){
            var appendVal = "<option value='"+ response[i].username +"'>";
            $('#adminpage-userList').append(appendVal);
          };
          $('.adminpage-userlist').remove();
          for(i=0;i<response.length;i++){
            var appendVal = "<tr class='adminpage-userlist'>"
                appendVal += "<td class='adminpage-userid'><a>" + response[i].username + "</a></td>"
                appendVal += "<td class='adminpage-lastname'><a>" + response[i].first_name + ' ' + response[i].last_name + "</a></td>"
                appendVal += "<td class='adminpage-function text-right'>"
                appendVal += "<button class='btn btn-xs btn-info adminpage-edit' id='adminpage-edit' type='submit'>"
                appendVal += "<span class='glyphicon glyphicon-pencil' aria-hidden='true'></span></span></button> "
                appendVal += "<button class='btn btn-xs btn-danger adminpage-delete' id='adminpage-delete' type='submit'>"
                appendVal += "<span class='glyphicon glyphicon-remove' aria-hidden='true'></span></button></td></tr>"
            $('#adminpage-usertable').append(appendVal);
          };
          $('.adminpage-edit').click(function(){
            var row = $(this).closest("tr").index();
            alert(row)
            var userid = $('#adminpage-usertable tr:eq(' + row + ') td:first-child').find('a').html();
          });

          $('.adminpage-delete').click(function(){
            var row = $(this).closest("tr").index();
            var userid = $('#adminpage-usertable tr:eq(' + row + ') td:first-child').find('a').html();
            control.deleteUser(userid);
          });
        },

        handle_deleteUser: function(response){
          if (response=='1'){
            alert('User has been deleted!!!');
          }
          else {
            alert(response);
          }
        },

        handle_getuserInfo: function(response){
          if (response){
            $('#edit-userid').val(response["userid"])
            $('#edit-lastname').val(response["lastname"])
            $('#edit-firstname').val(response["firstname"])
            $('#edit-email').val(response["email"])
            $('#edit-mobile').val(response["mobile"])
            $('#edit-manager').val(response["manager_id"])
            $('#edit-project').val(response["project"])
            $('#edit-location').val(response["location"])
            $('#edit-joined').val(response["joined"])
            $('#casual').html(response["casual"])
            $('#earned').html(response["earned"])
          }
          else{
            alert ("Server Error!!!")
          }
        },
};

$(document).ready(function(){
  control.init();
})