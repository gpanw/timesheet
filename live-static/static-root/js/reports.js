model = {
    hostURL: myURL + "reports/",
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

    getTimeSheetData: function(year, month, date){
              parms = {"from": "getTimeSheetData"};
              parms["year"] = year
              parms["month"] = month
              parms["date"] = date
              $.getJSON(model.hostURL,parms).done(function(response){
                 control.handle_getTimeSheetData(response);
               }); 
    },
};

control ={
    init: function(){
         viewReports.init();
    },

    getTimeSheetData: function(year, month, date) {
      model.getTimeSheetData(year, month, date)
    },

    handle_getTimeSheetData: function(response) {
      viewReports.handle_getTimeSheetData(response)
    },
    
};

viewReports= {
      init: function() {
          data = [{'billable': 'Billable',
                   'hours': $("#billable").text()},
                  {'billable': 'Non-Billable',
                   'hours': $("#nonbillable").text()}];
          viewReports.prepare_taskgraph(data);
          var curr = new Date()
          var curr_month = curr.toDateString().split(' ')[1];
          month = curr.getMonth() +1
          start = new Date(curr.getFullYear()+"-"+month+"-"+1)
          var friday_date = viewReports.get_friday(start);
          $("#id-nav-reports").addClass("active");
          $("#menu-toggle").click(function(e){
            e.preventDefault();
            $("#wrapper").toggleClass("menuDisplayed");
            $("#menu-toggle").toggleClass("menu-toggle-shift");
          });
          $(".reports").click(function(e){
            e.preventDefault();
            $("#reports-list").toggleClass("child-list");
            $("#reports-glyph").toggleClass("icon-flipped");
          });
          $(".approval").click(function(e){
            e.preventDefault();
            $("#approval-list").toggleClass("child-list");
            $("#approval-glyph").toggleClass("icon-flipped");
          });
          $("#change-team").change(function(){
            var value = this.value
            window.location.replace(model.hostURL+value);
          });
      },

      prepare_taskgraph: function(data) {
        $("#taskvsdateChart").remove();
        var appendVal = "<canvas id='taskgraph'></canvas>";
        id = "taskgraph"
        $("#task-graph").append(appendVal);
        var chart_labels = [];
        var chart_data = [];
        for (var i=0; i<data.length; i++){
          chart_labels.push(data[i].billable);
          chart_data.push(data[i].hours);
        }
        chart_type = 'pie';
        viewReports.build_taskgraph(chart_type,chart_labels,chart_data,id);
        var h = $('#page-content-wrapper').height();
        if (h>$('#sidebar-wrapper').height()){
          $('#sidebar-wrapper').height(h+100);
        }
      },

      build_taskgraph:function(chart_type,chart_labels,chart_data,id){
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
            chart_color = ["rgb(25,40,177)", "rgb(177,40,25)"];
            chart_border.push('white');
            var chart_borderWidth = 1;
          }
        }
        chart_color = ["rgb(25,40,177)", "rgb(177,40,25)"];
        var ctx = document.getElementById(id);
        viewReports.taskgraph = new Chart(ctx, {
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

     get_friday: function(start) {
        if (start.getDay() < 6) {
             var x = start.getDate() - start.getDay() + 5;
            }
            else {
             var x = start.getDate() + 1 + 5;
            }
            var friday_date = new Date(start.setDate(x))
            return friday_date;
      },

      handle_getTimeSheetData: function(response){
        alert(response)
      },
};


$(document).ready(function(){
  control.init();
})