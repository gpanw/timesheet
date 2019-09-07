from django.utils.html import conditional_escape as esc
from django.utils.safestring import mark_safe
from itertools import groupby
from datetime import date
from calendar import HTMLCalendar, monthrange


class leaveCalendar(HTMLCalendar):

    def __init__(self, LeaveEvents):
        super(leaveCalendar, self).__init__()
        self.leave_events = self.get_leave_info(LeaveEvents)

    def formatday(self, day, weekday):
        if day != 0:
            cssclass = self.cssclasses[weekday]
            cssclass += ' calen'
            if date.today() == date(self.year, self.month, day):
                cssclass += ' today selected'
            if day in self.leave_events:
                cssclass += ' filled'
                body = []
                for contest in self.leave_events[day]:
                    body.append('<span class=%s>' %('leaveevents'))
                    body.append(esc(contest[1][0] + '-' + contest[1][1] + ' ' + str(contest[1][2])))
                    body.append('</span><br>')
                return self.day_cell(cssclass, '<div class="dayNumber">%d</div> %s' % (day, ''.join(body)))
            return self.day_cell(cssclass, '<div class="dayNumber">%d</div>' % day)
        return self.day_cell('noday', '&nbsp;')

    def formatmonth(self, year, month):
        self.year, self.month = year, month
        return super(leaveCalendar, self).formatmonth(year, month)

    def get_leave_info(self, LeaveEvents):
        leavedata = []
        for val in LeaveEvents:
            data = []
            myday = (int(val.date.strftime('%d')))
            data.append(val.user)
            data.append(val.leaveid)
            data.append(val.comment)
            leavedata.append([myday, data])
        key = lambda leavedata:leavedata[0]
        leavedata.sort(key=key)
        return dict(
            [(k, list(group)) for k, group in groupby(leavedata, key)]
            )
        

    def day_cell(self, cssclass, body):
        return '<td class="%s">%s</td>' % (cssclass, body)
