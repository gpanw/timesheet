from django.utils import timezone
from datetime import datetime, timedelta
from current.models import timesheet


def get_friday(date):
    day = date.weekday()
    n = 4 - day
    if n >= 0:
        fridate = date + timedelta(n)
    else:
        fridate = date + timedelta(n) + timedelta(7)
    return fridate

def get_user_report(user, fromDate, toDate):
    pass