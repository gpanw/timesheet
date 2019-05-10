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

      getUserInfo: function(user_id){
        var parms = {"from": "getUserInfo"};
        parms["user_id"] = user_id;
        $.getJSON(model.hostURL,parms).done(function(response){
          control.handle_getUserInfo(response);
        }); 

      },        
};

control = {
  	init: function(){
  	    viewUserReport.init();
  	},

    getUserInfo: function(user_id){
      model.getUserInfo(user_id);
    },

    handle_getUserInfo: function(response){
      viewUserReport.handle_getUserInfo(response)
    },
  	
};

viewUserReport = {
    fetchdate: [],
    dynamic_url: "",
    TaskvsDateChart: "",
        
    init: function() {
    	viewUserReport.dynamic_url = $(".header-team-name").attr('id');
      model.hostURL = myURL + "reports/" + viewUserReport.dynamic_url + "/usergraph/";
      $("#id-nav-reports").addClass("active");
      $("#graphs-list").toggleClass("child-list");
      $("#graphs-glyph").toggleClass("icon-flipped");
      $("#menu-toggle").click(function(e){
        e.preventDefault();
        $("#wrapper").toggleClass("menuDisplayed");
        $("#menu-toggle").toggleClass("menu-toggle-shift");
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
      $("#box-glyph-uservstask-graph").click(function(){
        $("#box-glyph-uservstask-graph").toggleClass("glyphicon-chevron-up");
        $("#box-glyph-uservstask-graph").toggleClass("glyphicon-chevron-down");
        $("#uservstask-graph-content").toggleClass("hide-element");
      });
      $("#box-glyph-uservssubtask-graph").click(function(){
        $("#box-glyph-uservssubtask-graph").toggleClass("glyphicon-chevron-up");
        $("#box-glyph-uservssubtask-graph").toggleClass("glyphicon-chevron-down");
        $("#uservssubtask-graph-content").toggleClass("hide-element");
      });
      $("#box-user-list").change(function(){
        if (this.value==0){
          $("#uservstaskChart").remove();
          $("#uservssubtaskChart").remove();
          $(".chartjs-size-monitor").remove();
          $("#usercharts").addClass("hide-element")
        }
        else{
          $("#usercharts").removeClass("hide-element")
          var user_id = this.value;
          if (viewUserReport.TaskvsDateChart){
            viewUserReport.TaskvsDateChart.destroy();
          };
        control.getUserInfo(user_id)
        }            
      });
    }, 

    handle_getUserInfo: function(response){
      viewUserReport.prepare_uservstask(response['task_data']);
      viewUserReport.prepare_uservssubtask(response['subtask_data']);
    },   

    prepare_uservstask: function(data){
      $("#uservstaskChart").remove();
      var appendVal = "<canvas id='uservstaskChart'></canvas>";
      $("#uservstask-graph-content").append(appendVal);
      var chart_labels = [];
      var chart_data = [];
      var chart_color = [];
      var chart_border = [];
      for (var i=0; i<data.length; i++){
        chart_labels.push(data[i].task);
        chart_data.push(data[i].week_sum);
        var r = Math.floor(Math.random() * 255);
        var g = Math.floor(Math.random() * 255);
        var b = Math.floor(Math.random() * 255);
        dynamic_color = "rgb(" + r + "," + g + "," + b + ")";
        chart_color.push(dynamic_color);
        chart_border.push('black');
      }
      chart_type ='doughnut';
      var ctx = document.getElementById("uservstaskChart");
      var TaskvsSubChart = new Chart(ctx, {
          type: chart_type,
          data: {
                labels: chart_labels,
                datasets: [{
                  label: 'hours',
                  data: chart_data,
                  backgroundColor: chart_color,
                  borderColor: chart_border,
                  borderWidth: 1
                }]
          },
          options: {
            scales: {
              yAxes: [{
                ticks: {
                beginAtZero:true
                }
              }]
            }
          }
      });
    },    

prepare_uservssubtask: function(data){
      $("#uservssubtaskChart").remove();
      var appendVal = "<canvas id='uservssubtaskChart'></canvas>";
      $("#uservssubtask-graph-content").append(appendVal);
      var chart_labels = [];
      var chart_data = [];
      var chart_color = [];
      var chart_border = [];
      for (var i=0; i<data.length; i++){
        if (data[i].subtask){
          chart_labels.push(data[i].subtask);
        }
        else {
          chart_labels.push('absence');
        };
        chart_data.push(data[i].week_sum);
        var r = Math.floor(Math.random() * 255);
        var g = Math.floor(Math.random() * 255);
        var b = Math.floor(Math.random() * 255);
        dynamic_color = "rgb(" + r + "," + g + "," + b + ")";
        chart_color.push(dynamic_color);
        chart_border.push('black');
      }
      chart_type ='doughnut';
      var ctx = document.getElementById("uservssubtaskChart");
      var TaskvsSubChart = new Chart(ctx, {
          type: chart_type,
          data: {
                labels: chart_labels,
                datasets: [{
                  label: 'hours',
                  data: chart_data,
                  backgroundColor: chart_color,
                  borderColor: chart_border,
                  borderWidth: 1
                }]
          },
          options: {
            scales: {
              yAxes: [{
                ticks: {
                beginAtZero:true
                }
              }]
            }
          }
      });
    },    
};

$(document).ready(function(){
  control.init();
})  