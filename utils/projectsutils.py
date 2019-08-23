from django.utils import timezone
from datetime import datetime, timedelta


def get_friday(date):
    day = date.weekday()
    n = 4 - day
    if n >= 0:
        fridate = date + timedelta(n)
    else:
        fridate = date + timedelta(n) + timedelta(7)
    return fridate