model = {
  hostURL: myURL,
  getCookie: function (name) {
    var cookieValue = null
	  	if (document.cookie && document.cookie != '') {
	   	    var cookies = document.cookie.split(';')
	        for (var i = 0; i < cookies.length; i++) {
	            var cookie = jQuery.trim(cookies[i])
	            // Does this cookie string begin with the name we want?
	            if (cookie.substring(0, name.length + 1) == (name + '=')) {
	                cookieValue = decodeURIComponent(cookie.substring(name.length + 1))
	                break
	            };
	        };
	    };
    return cookieValue
  },

  getUserReport: function (user) {
    var apiURL = '/api/reports/' + user
    parms = { from: 'getTaskOtherTeam' }
    $.getJSON(apiURL, parms).done(function (response) {
    	control.handle_getUserReport(response)
    	})
  	},

  csrfSafeMethod: function (method) {
    // these HTTP methods do not require CSRF protection
    return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method))
  }

}

control = {
  	init: function () {
  	     viewUserAdmin.init()
  	},

  	getUserReport: function (user) {
  		model.getUserReport(user)
  	},

  	handle_getUserReport: function (response) {
  		viewUserAdmin.handle_getUserReport(response)
  	}
}

viewUserAdmin = {
  fetchdate: [],
  dynamic_url: '',
  userGraph: '',
  init: function () {
    viewUserAdmin.dynamic_url = $('.header-team-name').attr('id')
    model.hostURL = myURL + 'profile/'
    $('#nav-user').addClass('active')

    $('.profile-pic-glyph').click(function () {
      $('#myModal').modal('show')
    })
    control.getUserReport('')
  },

  handle_getUserReport: function (response) {
  	viewUserAdmin.prepare_userGraph(response)
  },

  prepare_userGraph: function (data) {
    $('#leavegraph').remove()
    var appendVal = "<canvas id='leavegraph'></canvas>"
    id = 'leavegraph'
    $('#leave-graph').append(appendVal)
    var chart_labels = ['Q1', 'Q2', 'Q3', 'Q4', 'Total']
    var chart_billable_data = [0, 0, 0, 0, 0]
    var chart_nonbillable_data = [0, 0, 0, 0, 0]
    for (var i = 0; i < data.length; i++) {
    	if (data[i].is_billable) {
    		chart_billable_data[4] += data[i].total
    		if (['1', '2', '3'].indexOf(data[i].date__month) != -1) {
    			chart_billable_data[0] += data[i].total
    		}
    		if (['4', '5', '6'].indexOf(data[i].date__month) != -1) {
    			chart_billable_data[1] += data[i].total
    		}
    		if (['7', '8', '9'].indexOf(data[i].date__month) != -1) {
    			chart_billable_data[2] += data[i].total
    		}
    		if (['10', '11', '12'].indexOf(data[i].date__month) != -1) {
    			chart_billable_data[3] += data[i].total
    		}
    	} else {
    		if (['1', '2', '3'].indexOf(data[i].date__month) != -1) {
    			chart_nonbillable_data[0] += data[i].total
    		}
    		if (['4', '5', '6'].indexOf(data[i].date__month) != -1) {
    			chart_nonbillable_data[1] += data[i].total
    		}
    		if (['7', '8', '9'].indexOf(data[i].date__month) != -1) {
    			chart_nonbillable_data[2] += data[i].total
    		}
    		if (['10', '11', '12'].indexOf(data[i].date__month) != -1) {
    			chart_nonbillable_data[3] += data[i].total
    		}
    		chart_nonbillable_data[4] += data[i].total
    	}
    }
    chart_data = [chart_billable_data, chart_nonbillable_data]
    chart_type = 'bar'
    viewUserAdmin.build_userGraph(chart_type, chart_labels, chart_data, id)
    var h = $('#page-content-wrapper').height()
    if (h > $('#sidebar-wrapper').height()) {
      $('#sidebar-wrapper').height(h + 100)
    }
  },

  build_userGraph: function (chart_type, chart_labels, chart_data, id) {
    if (chart_type == 'line') {
      var chart_color = 'transparent'
      var chart_border = 'green'
      var chart_borderWidth = 2
    } else {
      var chart_color = []
      var chart_border = []
      for (var i = 0; i < chart_data.length; i++) {
        var r = Math.floor(Math.random() * 255)
        var g = Math.floor(Math.random() * 255)
        var b = Math.floor(Math.random() * 255)
        dynamic_color = 'rgb(' + r + ',' + g + ',' + b + ')'
        chart_color = ['rgb(25,40,177)', 'rgb(177,40,25)']
        chart_border.push('white')
        var chart_borderWidth = 1
      }
    }
    chart_color = ['rgb(25,40,177)', 'rgb(177,40,25)']
    var ctx = document.getElementById(id)
    viewUserAdmin.userGraph = new Chart(ctx, {
      type: chart_type,
      data: {
        // labels: chart_labels,
        labels: chart_labels,
        datasets: [{
          label: 'Billable',
          data: chart_data[0],
          backgroundColor: 'rgb(25,40,177)',
          borderColor: chart_border,
          borderWidth: chart_borderWidth
        }, {
          label: 'Non-Billable',
          data: chart_data[1],
          backgroundColor: 'rgb(177,40,25)',
          borderColor: chart_border,
          borderWidth: chart_borderWidth
        }]
      },
      options: {
        scales: {
          yAxes: [{
            ticks: {
              beginAtZero: true
            }
          }]
        }
      }
    })
  }
}

$(document).ready(function () {
  control.init()
})
