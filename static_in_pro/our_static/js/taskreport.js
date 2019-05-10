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

      getTaskInfo: function(task_id){
        var parms = {"from": "getTaskInfo"};
        parms["task_id"] = task_id;
        $.getJSON(model.hostURL,parms).done(function(response){
          control.handle_getTaskInfo(response);
        }); 

      },        
};

control = {
  	init: function(){
  	    viewTaskReport.init();
  	},

    getTaskInfo: function(task_id){
      model.getTaskInfo(task_id);
    },

    handle_getTaskInfo: function(response){
      viewTaskReport.handle_getTaskInfo(response)
    },
  	
};

viewTaskReport = {
    fetchdate: [],
    dynamic_url: "",
    TaskvsDateChart: "",
        
    init: function() {
        viewTaskReport.dynamic_url = $(".header-team-name").attr('id');
        $("#id-nav-reports").addClass("active");
        model.hostURL = myURL + "reports/" + viewTaskReport.dynamic_url + "/taskreports/";
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
        $("#box-glyph-taskvsdate-graph").click(function(){
          $("#box-glyph-taskvsdate-graph").toggleClass("glyphicon-chevron-up");
          $("#box-glyph-taskvsdate-graph").toggleClass("glyphicon-chevron-down");
          $("#taskvsdate-graph-content").toggleClass("hide-element");
        });
        $("#box-glyph-taskvssub-graph").click(function(){
          $("#box-glyph-taskvssub-graph").toggleClass("glyphicon-chevron-up");
          $("#box-glyph-taskvssub-graph").toggleClass("glyphicon-chevron-down");
          $("#taskvssub-graph-content").toggleClass("hide-element");
        });
        $("#box-glyph-taskvsuser-graph").click(function(){
          $("#box-glyph-taskvsuser-graph").toggleClass("glyphicon-chevron-up");
          $("#box-glyph-taskvsuser-graph").toggleClass("glyphicon-chevron-down");
          $("#taskvsuser-graph-content").toggleClass("hide-element");
        });
        $("#box-task-list").change(function(){
          if (this.value==0){
            $("#taskvsdateChart").remove();
            $("#taskvssubChart").remove();
            $("#taskvsuserChart").remove();
            $(".chartjs-size-monitor").remove();
            $(".taskcharts").addClass("hide-element")
          }
          else{
            $(".taskcharts").removeClass("hide-element")
            var task_id = this.value;
            if (viewTaskReport.TaskvsDateChart){
                viewTaskReport.TaskvsDateChart.destroy();
              };
            control.getTaskInfo(task_id)
          }            
        });

        $(".date-filter").change(function(){
          var from_date = $("#from-filter").val()
          var to_date = $("#to-filter").val()
          if (!from_date || !to_date) {
            alert('no date')
          }
          else {
            from_obj = new Date(from_date)
            to_obj = new Date(to_date)
            alert(to_obj - from_obj)
          }
        })

        $("#date-box-chart-type").change(function(){
          var chart_type = this.value;
          var chart_labels = viewTaskReport.TaskvsDateChart.config.data.labels;
          var chart_data = viewTaskReport.TaskvsDateChart.config.data.datasets[0].data;
          viewTaskReport.build_taskvsdatechart(chart_type,chart_labels,chart_data);            
        });
    },

    handle_getTaskInfo: function(response){
      viewTaskReport.prepare_taskvsdate(response['date_data']);
      viewTaskReport.prepare_taskvssubtask(response['subtask_data']);
      viewTaskReport.prepare_taskvsuser(response['user_data']);
    },

    prepare_taskvsdate: function(data) {
      $("#taskvsdateChart").remove();
      var appendVal = "<canvas id='taskvsdateChart'></canvas>";
      $("#taskvsdate-graph-content").append(appendVal);
      var chart_labels = [];
      var chart_data = [];
      for (var i=0; i<data.length; i++){
        chart_labels.push(data[i].week_date);
        chart_data.push(data[i].week_sum);
      }
      chart_type = $("#date-box-chart-type option:selected").val();
      viewTaskReport.build_taskvsdatechart(chart_type,chart_labels,chart_data);
      
      var h = $('#page-content-wrapper').height();
      if (h>$('#sidebar-wrapper').height()){
          $('#sidebar-wrapper').height(h+100);
      }
    },

    build_taskvsdatechart:function(chart_type,chart_labels,chart_data){
      if (viewTaskReport.TaskvsDateChart){
        viewTaskReport.TaskvsDateChart.destroy();
      };
      if (chart_type=='line') {
        var chart_color = 'transparent';
        var chart_border = 'green';
        var chart_borderWidth = 2;
      }
      else {
        var chart_color = [];
        var chart_border = [];
        for (var i=0; i<chart_data.length; i++){
          var r = Math.floor(Math.random() * 255);
          var g = Math.floor(Math.random() * 255);
          var b = Math.floor(Math.random() * 255);
          dynamic_color = "rgb(" + r + "," + g + "," + b + ")";
          chart_color.push(dynamic_color);
          chart_border.push('black');
          var chart_borderWidth = 1;
        }
      }
      var ctx = document.getElementById("taskvsdateChart");
      viewTaskReport.TaskvsDateChart = new Chart(ctx, {
          type: chart_type,
          data: {
                labels: chart_labels,
                datasets: [{
                  label: 'hours',
                  data: chart_data,
                  backgroundColor: chart_color,
                  borderColor: chart_border,
                  borderWidth: chart_borderWidth
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

   prepare_taskvssubtask: function(data) {
      $("#taskvssubChart").remove();
      var appendVal = "<canvas id='taskvssubChart'></canvas>";
      $("#taskvssub-graph-content").append(appendVal);
      var chart_labels = [];
      var chart_data = [];
      var chart_color = [];
      var chart_border = [];
      for (var i=0; i<data.length; i++){
        chart_labels.push(data[i].sub_task);
        chart_data.push(data[i].week_sum);
        var r = Math.floor(Math.random() * 255);
        var g = Math.floor(Math.random() * 255);
        var b = Math.floor(Math.random() * 255);
        dynamic_color = "rgb(" + r + "," + g + "," + b + ")";
        chart_color.push(dynamic_color);
        chart_border.push('black');
      }
      chart_type ='doughnut';
      var ctx = document.getElementById("taskvssubChart");
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

   prepare_taskvsuser: function(data) {
      $("#taskvsuserChart").remove();
      var appendVal = "<canvas id='taskvsuserChart'></canvas>";
      $("#taskvsuser-graph-content").append(appendVal);
      var chart_labels = [];
      var chart_data = [];
      var chart_color = [];
      var chart_border = [];
      for (var i=0; i<data.length; i++){
        chart_labels.push(data[i].user);
        chart_data.push(data[i].week_sum);
        var r = Math.floor(Math.random() * 255);
        var g = Math.floor(Math.random() * 255);
        var b = Math.floor(Math.random() * 255);
        dynamic_color = "rgb(" + r + "," + g + "," + b + ")";
        chart_color.push(dynamic_color);
        chart_border.push('black');
      }
      chart_type ='pie';
      var ctx = document.getElementById("taskvsuserChart");
      var TaskvsUserChart = new Chart(ctx, {
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

      var h = $('#page-content-wrapper').height();
      if (h>$('#sidebar-wrapper').height()){
          $('#sidebar-wrapper').height(h+100);
      }
      
    },
        
};

$(document).ready(function(){
  control.init();
})  