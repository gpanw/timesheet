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

      get_data_projectpie: function(value, show){
        var parms = {"from": "projectpie"};
        parms['groupby'] = value
        $.getJSON(model.hostURL,parms).done(function(response){
          control.handle_get_data_projectpie(response);
        }); 
      },  

      getSkillData: function(year, month, date){
        var parms = {"from": "skillgraph"};
        parms['year'] = year
        parms['month'] = month
        parms['date'] = date
        $.getJSON(model.hostURL,parms).done(function(response){
          control.handle_getSkillData(response);
        });
      },

      getRoleData: function(year, month, date){
        var parms = {"from": "rolegraph"};
        parms['year'] = year
        parms['month'] = month
        parms['date'] = date
        $.getJSON(model.hostURL,parms).done(function(response){
          control.handle_getRoleData(response);
        });
      },    

      getBillableData: function(year, user){
        var parms = {"from": "billablegraph"};
        parms['year'] = year
        parms['user'] = user
        $.getJSON(model.hostURL,parms).done(function(response){
          control.handle_getBillableData(response);
        });
      },  
};

control = {
  	init: function(){
  	    viewGraph.init();
  	},

    get_data_projectpie: function(value){
      model.get_data_projectpie(value)
    },

    handle_get_data_projectpie: function(response){
      viewGraph.handle_get_data_projectpie(response)
    },

    getSkillData: function(year, month, date){
      model.getSkillData(year, month, date);
    },

    handle_getSkillData: function(response){
      viewGraph.handle_getSkillData(response)
    },

    getRoleData: function(year, month, date){
      model.getRoleData(year, month, date);
    },

    handle_getRoleData: function(response){
      viewGraph.handle_getRoleData(response);
    },

    getBillableData: function(year, user){
      model.getBillableData(year, user);
    },

    handle_getBillableData: function(response){
      viewGraph.handle_getBillableData(response);
    },
  	
};

viewGraph = {
    fetchdate: [],
    dynamic_url: "",
    piegraph: "",
    skillgraph: "",
    rolegraph: "",
    billablegraph: "",
        
    init: function() {
    	viewGraph.dynamic_url = $(".header-team-name").attr('id');
      model.hostURL = myURL + "reports/" + viewGraph.dynamic_url + "/graphs/";
      $("#id-nav-reports").addClass("active");
      $("#graphs-list").toggleClass("child-list");
      $("#graphs-glyph").toggleClass("icon-flipped");
      var curr = new Date()
      var curr_month = curr.toDateString().split(' ')[1];
      var month = curr.getMonth() +1
      start = new Date(curr.getFullYear()+"-"+month+"-"+1)
      var friday_date = viewGraph.get_friday(curr);
      var month = friday_date.getMonth() + 1;
      $('.month option[value='+month+']').attr('selected','selected');
      viewGraph.append_week(start, 'skill-week');
      viewGraph.append_week(start, 'role-week');
      $('.week option[value='+friday_date.getDate()+']').attr('selected','selected');
      $("#menu-toggle").click(function(e){
        e.preventDefault();
        $("#wrapper").toggleClass("menuDisplayed");
        $("#menu-toggle").toggleClass("menu-toggle-shift");
      });
      $(".reports").click(function(){
        $("#reports-list").toggleClass("child-list");
        $("#reports-glyph").toggleClass("icon-flipped");
      });
      $(".approval").click(function(){
        $("#approval-list").toggleClass("child-list");
        $("#approval-glyph").toggleClass("icon-flipped");
      }); 
      $("#employee-report").click(function(){
        $("#modalteamchart").modal("show");
        var groupby = $('#groupby').find(":selected").val();
        if (viewGraph.piegraph == "") {
          viewGraph.get_data_projectpie(groupby);
        }
      });
      $("#skill-report").click(function(){
        $("#modalskillchart").modal("show");
        var month = $("#skill-month").val();
        var year = $("#skill-year option:selected").text();
        var date = $("#skill-week").val();
        if (viewGraph.skillgraph == ""){
          control.getSkillData(year, month, date);
        };
      });
      $("#role-report").click(function(){
        $("#modalrolechart").modal("show");
        var month = $("#role-month").val();
        var year = $("#role-year option:selected").text();
        var date = $("#role-week").val();
        if (viewGraph.rolegraph == ""){
          control.getRoleData(year, month, date);
        };
      });
      $("#billable-report").click(function(){
        $("#modalbillablechart").modal("show");
        var billable_year = $("#billable-year").val();
        var billable_user = $("#billable-user").val();
        if (viewGraph.billablegraph == ""){
          control.getBillableData(billable_year, billable_user);
        };
      });
      $("#groupby").change(function(){
        if (this.value == 'project'){
          $("#show-all").text('show less')
        }
        else {
         $("#show-all").text('') 
        }
        viewGraph.get_data_projectpie(this.value);
      });
      $("#show-all").click(function(){
        value = $(this).text();
        if (value=='show all'){
          $(this).text('show less')
          viewGraph.get_data_projectpie('project')
        }
        else{
          $(this).text('show all')
          viewGraph.get_data_projectpie('lessproject')
        }
      });
      $("#skill-year").change(function(){
        $('#skill-month option[value=month]').prop('disabled',false);
        $('#skill-month option[value=month]').prop('selected','selected');
        $('#skill-week option[value=week]').prop('disabled',false);
        $('#skill-week option[value=week]').prop('selected','selected');
        $("skill-week .week-day").remove();
      });
      $("#skill-month").change(function(){
        var month = this.value
        var year = $("#skill-year option:selected").text()
        if (month == 'all'){
          $('#skill-week option[value=week]').prop('disabled',false);
          $('#skill-week option[value=week]').prop('selected','selected');
          $("#skill-week .week-day").remove();
          control.getSkillData(year, month, 'all');
        }
        else {
          start = new Date(year+"-"+month+"-"+1);
          viewGraph.append_week(start, 'skill-week');
          $('#skill-week option[value=week]').prop('disabled',false);
          $('#skill-week option[value=week]').prop('selected','selected');
        };
      });
      $("#skill-week").change(function(){
        var month = $("#skill-month").val();
        var year = $("#skill-year option:selected").text();
        date = this.value;
        control.getSkillData(year, month, date)
      });
      $("#role-year").change(function(){
        $('#role-month option[value=month]').prop('disabled',false);
        $('#role-month option[value=month]').prop('selected','selected');
        $('#role-week option[value=week]').prop('disabled',false);
        $('#role-week option[value=week]').prop('selected','selected');
        $("role-week .week-day").remove();
      });
      $("#role-month").change(function(){
        var month = this.value
        var year = $("#role-year option:selected").text()
        if (month == 'all'){
          $('#role-week option[value=week]').prop('disabled',false);
          $('#role-week option[value=week]').prop('selected','selected');
          $("#role-week .week-day").remove();
          control.getRoleData(year, month, 'all');
        }
        else {
          start = new Date(year+"-"+month+"-"+1);
          viewGraph.append_week(start, 'role-week');
          $('#role-week option[value=week]').prop('disabled',false);
          $('#role-week option[value=week]').prop('selected','selected');
        };
      });
      $("#role-week").change(function(){
        var month = $("#role-month").val();
        var year = $("#role-year option:selected").text();
        date = this.value;
        control.getRoleData(year, month, date)
      });
      $("#billable-year").change(function(){
        var billable_user = $("#billable-user").val();
        control.getBillableData(this.value, billable_user);
      });
      $("#billable-user").change(function(){
        var billable_year = $("#billable-year").val();
        control.getBillableData(billable_year, this.value);
      });
    }, 

    get_data_projectpie: function(value){
      $("#graph-table .graph-header-head").text(value)
      control.get_data_projectpie(value)
    },

    handle_get_data_projectpie: function(response){
      viewGraph.prepare_projectpie(response)
    },

    getSkillData: function(year, month, date){
      control.getSkillData(year, month, date);
    },

    handle_getSkillData: function(response){
      viewGraph.prepare_skillGraph(response);
    },

    handle_getRoleData: function(response){
      viewGraph.prepare_roleGraph(response);
    },

    handle_getBillableData: function(response){
      viewGraph.prepare_billableGraph(response);
    },

    prepare_projectpie: function(response){
      $("#modalpiechart").remove();
      $(".graph-table-body").remove();
      var appendVal = "<canvas id='modalpiechart'></canvas>";
      $("#modal-piechart-graph").append(appendVal);
      data = response.project_data
      var chart_labels = [];
      var chart_data = [];
      var total_employee = 0
      for (var i=0; i<data.length; i++){
        var sno = i + 1;
        total_employee += data[i].total;
        var appendVal = "<tbody class='graph-table-body'><tr class='graph-table-row'>";
        appendVal += "<td class='graph-table-sno'>" + sno + "</td> ";
        appendVal += "<td class='graph-table-group'>" + data[i].project + "</td>";
        appendVal += "<td class='graph-table-value'>" + data[i].total + "</td></tr></tbody>";
        $("#graph-table").append(appendVal);
        chart_data.push(data[i].total);
        chart_labels.push(data[i].project);
      }
      var appendVal = "<tbody class='graph-table-body'><tr class='graph-table-row'>"
      appendVal += "<td class='graph-table-sno'>" +  "</td> "
      appendVal += "<td class='graph-table-group'>Total</td>"
      appendVal += "<td class='graph-table-value'>" + total_employee + "</td>"
      $("#graph-table").append(appendVal);
      id = "modalpiechart"
      chart_type = 'bar';
      viewGraph.build_teamgraph(chart_type, chart_labels, chart_data, id);
      var h = $('#page-content-wrapper').height();
      if (h>$('#sidebar-wrapper').height()){
        $('#sidebar-wrapper').height(h+100);
      }
    },

    build_teamgraph:function(chart_type,chart_labels,chart_data,id){
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
            chart_border.push('white');
            var chart_borderWidth = 1;
          }
        }
        var ctx = document.getElementById(id);
        viewGraph.piegraph = new Chart(ctx, {
          type: chart_type,
          data: {
                labels: chart_labels,
                datasets: [{
                  label: 'No. of Employees',
                  data: chart_data,
                  backgroundColor: chart_color,
                  borderColor: chart_border,
                  borderWidth: chart_borderWidth
                }]
          },
          options: {
            scales: {
              xAxes: [{
                ticks: {
                autoSkip: false,
                }
              }],
              yAxes: [{
                ticks: {
                beginAtZero:true,
                }
              }]
            }
          }
        });
      },

    prepare_skillGraph: function(data){
      skill = Object.keys(data[0]);
      $("#skillchart").remove();
      $(".skill-graph-table-body").remove();
      var appendVal = "<canvas id='skillchart'></canvas>";
      $("#modal-skillchart-graph").append(appendVal);
      var chart_labels = [];
      var chart_data_billable = [];
      var chart_data_nonbillable = [];
      var total_billable = 0
      var total_nonbillable = 0
      for (var i=0; i<skill.length; i++){
        var sno = i + 1;
        total_billable += data[0][skill[i]];
        total_nonbillable += data[1][skill[i]];
        var appendVal = "<tbody class='skill-graph-table-body'><tr class='graph-table-row'>"
        appendVal += "<td class='graph-table-sno'>" + sno + "</td> "
        appendVal += "<td class='graph-table-group'>" + skill[i] + "</td>"
        appendVal += "<td class='graph-table-value'>" + data[0][skill[i]] + "</td>"
        appendVal += "<td class='graph-table-value'>" + data[1][skill[i]] + "</td></tr></tbody>"
        $("#skill-graph-table").append(appendVal);
        chart_data_billable.push(data[0][skill[i]]);
        chart_data_nonbillable.push(data[1][skill[i]]);
        chart_labels.push(skill[i])
      }
      var appendVal = "<tbody class='skill-graph-table-body'><tr class='graph-table-row'>"
      appendVal += "<td class='graph-table-sno'>" +  "</td> "
      appendVal += "<td class='graph-table-group'>Total</td>"
      appendVal += "<td class='graph-table-value'>" + total_billable + "</td>"
      appendVal += "<td class='graph-table-value'>" + total_nonbillable + "</td></tr></tbody>"
      $("#skill-graph-table").append(appendVal);
      var chart_data = [chart_data_billable, chart_data_nonbillable]
      var id = "skillchart";
      var chart_type = 'bar'
      viewGraph.build_skillgraph(chart_type, chart_labels, chart_data, id);
      var h = $('#page-content-wrapper').height();
      if (h>$('#sidebar-wrapper').height()){
        $('#sidebar-wrapper').height(h+100);
      }
    },

    build_skillgraph:function(chart_type,chart_labels,chart_data,id){
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
            chart_border.push('white');
            var chart_borderWidth = 1;
          }
        }
        var ctxSkill = document.getElementById(id);
        viewGraph.skillgraph = new Chart(ctxSkill, {
          type: chart_type,
          data: {
                labels: chart_labels,
                datasets: [{
                  label: 'Billable',
                  data: chart_data[0],
                  backgroundColor: "rgb(25,40,177)",
                  borderColor: chart_border,
                  borderWidth: chart_borderWidth
                }, {
                  label: 'Non-Billable',
                  data: chart_data[1],
                  backgroundColor: "rgb(177,40,25)",
                  borderColor: chart_border,
                  borderWidth: chart_borderWidth
                }]
          },
          options: {
            scales: {
              xAxes: [{
                stacked: true
              }],
              yAxes: [{
                stacked: true,
                gridLines: {
                
                },
                ticks: {
                beginAtZero:true, 
                }
              }]
            }
          }
        });
    },

    prepare_roleGraph: function(data){
      skill = Object.keys(data[0]);
      $("#rolechart").remove();
      $(".role-graph-table-body").remove();
      var appendVal = "<canvas id='rolechart'></canvas>";
      $("#modal-rolechart-graph").append(appendVal);
      var chart_labels = [];
      var chart_data_billable = [];
      var chart_data_nonbillable = [];
      var total_billable = 0
      var total_nonbillable = 0
      for (var i=0; i<skill.length; i++){
        var sno = i + 1;
        total_billable += data[0][skill[i]]
        total_nonbillable += data[1][skill[i]]
        var appendVal = "<tbody class='role-graph-table-body'><tr class='graph-table-row'>"
        appendVal += "<td class='graph-table-sno'>" + sno + "</td> "
        appendVal += "<td class='graph-table-group'>" + skill[i] + "</td>"
        appendVal += "<td class='graph-table-value'>" + data[0][skill[i]] + "</td>"
        appendVal += "<td class='graph-table-value'>" + data[1][skill[i]] + "</td></tr></tbody>"
        $("#role-graph-table").append(appendVal);
        chart_data_billable.push(data[0][skill[i]]);
        chart_data_nonbillable.push(data[1][skill[i]]);
        chart_labels.push(skill[i])
      }
      var appendVal = "<tbody class='role-graph-table-body'><tr class='graph-table-row'>"
      appendVal += "<td class='graph-table-sno'>" +  "</td> "
      appendVal += "<td class='graph-table-group'>Total</td>"
      appendVal += "<td class='graph-table-value'>" + total_billable + "</td>"
      appendVal += "<td class='graph-table-value'>" + total_nonbillable + "</td></tr></tbody>"
      $("#role-graph-table").append(appendVal);
      var chart_data = [chart_data_billable, chart_data_nonbillable]
      var id = "rolechart";
      var chart_type = 'bar'
      viewGraph.build_rolegraph(chart_type, chart_labels, chart_data, id);
      var h = $('#page-content-wrapper').height();
      if (h>$('#sidebar-wrapper').height()){
        $('#sidebar-wrapper').height(h+100);
      }
    },

    build_rolegraph:function(chart_type,chart_labels,chart_data,id){
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
            chart_border.push('white');
            var chart_borderWidth = 1;
          }
        }
        var ctxRole = document.getElementById(id);
        viewGraph.rolegraph = new Chart(ctxRole, {
          type: chart_type,
          data: {
                labels: chart_labels,
                datasets: [{
                  label: 'Billable',
                  data: chart_data[0],
                  backgroundColor: "rgb(25,40,177)",
                  borderColor: chart_border,
                  borderWidth: chart_borderWidth
                }, {
                  label: 'Non-Billable',
                  data: chart_data[1],
                  backgroundColor: "rgb(177,40,25)",
                  borderColor: chart_border,
                  borderWidth: chart_borderWidth
                }]
          },
          options: {
            scales: {
              xAxes: [{
                stacked: true
              }],
              yAxes: [{
                stacked: true,
                gridLines: {
                
                },
                ticks: {
                beginAtZero:true, 
                }
              }]
            }
          }
        });
    },

    prepare_billableGraph: function(data){
      months = Object.keys(data);
      month_array = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
      $("#billablechart").remove();
      $(".billable-graph-table-body").remove();
      var appendVal = "<canvas id='billablechart'></canvas>";
      $("#modal-billablechart-graph").append(appendVal);
      var chart_labels = [];
      var chart_data_billable = [];
      var chart_data_nonbillable = [];
      var total_billable = 0
      var total_nonbillable = 0
      for (var i=0; i<months.length; i++){
        var sno = i + 1;
        total_billable += data[sno][0]
        total_nonbillable += data[sno][1]
        var appendVal = "<tbody class='billable-graph-table-body'><tr class='graph-table-row'>"
        appendVal += "<td class='graph-table-sno'>" + sno + "</td> "
        appendVal += "<td class='graph-table-group'>" + month_array[i] + "</td>"
        appendVal += "<td class='graph-table-value'>" + data[sno][0] + "</td>"
        appendVal += "<td class='graph-table-value'>" + data[sno][1] + "</td></tr></tbody>"
        $("#billable-graph-table").append(appendVal);
        chart_data_billable.push(data[sno][0]);
        chart_data_nonbillable.push(data[sno][1]);
        chart_labels.push(month_array[i])
      }
      var appendVal = "<tbody class='billable-graph-table-body'><tr class='graph-table-row'>"
      appendVal += "<td class='graph-table-sno'>" +  "</td> "
      appendVal += "<td class='graph-table-group'>Total</td>"
      appendVal += "<td class='graph-table-value'>" + total_billable + "</td>"
      appendVal += "<td class='graph-table-value'>" + total_nonbillable + "</td></tr></tbody>"
      $("#billable-graph-table").append(appendVal);
      var chart_data = [chart_data_billable, chart_data_nonbillable]
      var id = "billablechart";
      var chart_type = 'line'
      viewGraph.build_billablegraph(chart_type, chart_labels, chart_data, id);
      var h = $('#page-content-wrapper').height();
      if (h>$('#sidebar-wrapper').height()){
        $('#sidebar-wrapper').height(h+100);
      }
    },

    build_billablegraph:function(chart_type,chart_labels,chart_data,id){
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
            chart_border.push('white');
            var chart_borderWidth = 1;
          }
        }
        var ctxBill = document.getElementById(id);
        viewGraph.billablegraph = new Chart(ctxBill, {
          type: chart_type,
          data: {
                labels: chart_labels,
                datasets: [{
                  label: 'Billable',
                  data: chart_data[0],
                  backgroundColor: "rgb(25,40,177)",
                  borderColor: "rgb(25,40,177)",
                  fill: false,
                  borderWidth: chart_borderWidth
                }, {
                  label: 'Non-Billable',
                  data: chart_data[1],
                  backgroundColor: "rgb(177,40,25)",
                  borderColor: "rgb(177,40,25)",
                  fill: false,
                  borderWidth: chart_borderWidth
                }]
          },
          options: {
            scales: {
              yAxes: [{
                ticks: {
                beginAtZero:true, 
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

    append_week: function(start, id){
        $("#" + id + " .week-day").remove();
        var friday_date = viewGraph.get_friday(start);
        var appendVal = "<option class='week-day' value='" + friday_date.getDate() + "'>" + friday_date.toDateString() + "</option>"
        $("#" + id).append(appendVal);
        while (start.getMonth() == friday_date.getMonth()){
          var x = friday_date.getDate() + 7
          friday_date = new Date(friday_date.setDate(x))
          if (start.getMonth() == friday_date.getMonth()){
            var appendVal = "<option class='week-day' value='" + friday_date.getDate() + "'>" + friday_date.toDateString() + "</option>"
            $("#" + id).append(appendVal)
          }
        }
        var appendVal = "<option class='week-day' value='all'>All</option>"
        $("#" + id).append(appendVal)
    },

};

$(document).ready(function(){
  control.init();
})  