import os
import django
from xlrd import open_workbook
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "timesheet.settings")
django.setup()
from datetime import datetime
from datetime import timedelta
from django.contrib.auth.models import User, Group
from project.models import teams
from current.countries import Countries
from userprofile.models import userprofile
from current.models import timesheet
import random


def main():
    #add_user()
    #add_team()
    add_userprofile()
    #add_timesheet()


def add_user():
    book = open_workbook('./empdetails/Mocked_Up_Data.xlsx')
    sheet_name = 'EmpDtls'
    sheet = book.sheet_by_name(sheet_name)
    g = Group.objects.all()[0]
    for row_num in range(1, sheet.nrows):
        values = sheet.row_values(row_num)
        empid = values[1].lower()
        fname = values[1]
        lname = values[2]
        doj = datetime.strptime('2018-01-01', '%Y-%m-%d')
        email = fname.lower()+lname.lower() + '@timesheet.com'
        if values[9] == 'y':
            is_manager = True
        else:
            is_manager = False
        user = User.objects.create_user(empid, password='timesheet')
        user.first_name = fname
        user.last_name = lname
        user.lname = lname
        user.date_joined = doj
        user.email = email
        if is_manager:
            user.is_staff = True
            user.groups.add(g)
        try:
            user.save()
        except:
            print('error ', fname)
        else:
            print(fname, ' added')


def add_team():
    book = open_workbook('./empdetails/Mocked_Up_Data.xlsx')
    sheet_name = 'Client'
    sheet = book.sheet_by_name(sheet_name)
    countries_list = Countries.countries_list
    for row_num in range(1, sheet.nrows):
        values = sheet.row_values(row_num)
        client = values[1]
        for c in countries_list:
            if values[4] == c[1]:
                client_location = c[0]
        if values[5] == 'Y':
            revenue_gen = True
        else:
            revenue_gen = False
        team_lead = values[6].lower()
        t = teams(team_name=client, team_description=client,
                  team_lead=team_lead, team_location=client_location,
                  revenue_gen=revenue_gen)
        try:
            t.save()
        except:
            print('error ', client)
        else:
            print(client, ' added')


def add_userprofile():
    book = open_workbook('./empdetails/Mocked_Up_Data.xlsx')
    sheet_name = 'EmpDtls'
    sheet = book.sheet_by_name(sheet_name)
    for row_num in range(1, sheet.nrows):
        values = sheet.row_values(row_num)
        user = values[1]
        skill = values[3]
        role = values[4]
        project = values[7]
        project_obj = teams.objects.get(team_name=project)
        user_obj = User.objects.get(username=user.lower())
        if user_obj.is_staff:
            manager = ''
        else:
            manager = project_obj.team_lead
        user_profile = userprofile(user_id=user_obj, earned_leave=270.0, casual_leave=63.0, manager_id=manager,
                                   user_skill=skill, user_role=role, project=project)
        try:
            user_profile.save()
        except:
            print(user, 'error')
        else:
            print(user, ' added')


def add_timesheet():
    users = User.objects.filter(username__startswith='f').order_by('username')
    for u in users:
        team_obj = teams.objects.get(team_name=u.userprofile.project)
        print(u.username)
        team_name = team_obj.team_name
        manager = team_obj.team_lead
        fill_date = '2017-12-29'
        dateobj = datetime.strptime(fill_date, '%Y-%m-%d')
        for d in range(1, 52):
            dateobj = dateobj + timedelta(7)
            i = random.choice([1, 2, 3, 4])
            if i == 1:
                hours = '["0.0", "0.0", "9.0", "9.0", "9.0", "9.0", "9.0"]'
                add_user_timesheet(team_name, dateobj.date(), hours, u.username, manager, True)
            if i == 2:
                hours = '["0.0", "0.0", "9.0", "9.0", "9.0", "9.0", "0.0"]'
                add_user_timesheet(team_name, dateobj.date(), hours, u.username, manager, True)
                hours = '["0.0", "0.0", "0.0", "0.0", "0.0", "0.0", "9.0"]'
                add_user_timesheet(team_name, dateobj.date(), hours, u.username, manager, False)
            if i == 3:
                hours = '["0.0", "0.0", "9.0", "9.0", "9.0", "9.0", "0.0"]'
                add_user_timesheet(team_name, dateobj.date(), hours, u.username, manager, True)
                hours = '["0.0", "0.0", "0.0", "0.0", "0.0", "0.0", "9.0"]'
                task_id = 'EL - Earned Leave'
                add_user_timesheet(task_id, dateobj.date(), hours, u.username, manager, False)
            if i == 4:
                hours = '["0.0", "0.0", "9.0", "9.0", "9.0", "0.0", "0.0"]'
                add_user_timesheet(team_name, dateobj.date(), hours, u.username, manager, True)
                hours = '["0.0", "0.0", "0.0", "0.0", "0.0", "0.0", "9.0"]'
                add_user_timesheet(team_name, dateobj.date(), hours, u.username, manager, False)
                hours = '["0.0", "0.0", "0.0", "0.0", "0.0", "9.0", "0.0"]'
                task_id = 'CL - Casual Leave'
                add_user_timesheet(task_id, dateobj.date(), hours, u.username, manager, False)


def add_user_timesheet(team_name, dateobj, hours, user, manager, is_billable):
    t = timesheet(taskid=team_name, date=dateobj,
                  hours=hours, user=user, approved_by=manager,
                  is_billable=is_billable)
    try:
        t.save()
    except Exception as e:
        print('error ', user, e)
        exit(0)


if __name__ == '__main__':
    main()
