from django.contrib import admin
from .models import timesheet
from project.models import task, leave, teams, role, skill
from leave.models import applyleave
from priortime.models import priorsheet
from userprofile.models import userprofile
from django import forms
from django.contrib.auth.models import Group, User
from django.contrib.auth.admin import UserAdmin

admin.site.empty_value_display = '-'


class MyUserAdmin(UserAdmin):
    def get_form(self, request, obj, **kwargs):
        form = super(MyUserAdmin, self).get_form(request, obj, **kwargs)
        try:
            form.base_fields['is_staff'].label = 'Manager'
        except KeyError:
            pass
        return form


class TaskAdmin(admin.ModelAdmin):
    list_display = ['task_name', 'is_billable', 'task_status', 'task_group']
    search_fields = ['^task_name']
    fields = ['task_name', 'task_group', 'task_status', 'is_billable']
    list_filter = ('task_group',)

    def get_queryset(self, request):
        qs = super(TaskAdmin, self).get_queryset(request)
        if request.user.is_superuser:
            return qs
        else:
            user_data = userprofile.objects.get(user_id__username=request.user.username)
            fs = qs.filter(task_group=user_data.project)
            return fs

    def formfield_for_foreignkey(self, db_field, request, **kwargs):
        if request.user.is_superuser:
            kwargs["queryset"] = task.objects.filter(task_type='TS', task_status='OP')
        else:
            if db_field.name == "parent_task":
                user_data = userprofile.objects.get(user_id__username=request.user.username)
                kwargs["queryset"] = task.objects.filter(task_type='TS',
                                                         task_status='OP',
                                                         task_group=user_data.project)
        return super().formfield_for_foreignkey(db_field, request, **kwargs)

    def save_model(self, request, obj, form, change):
        user_data = userprofile.objects.get(user_id__username=request.user.username)
        obj.task_group = user_data.project
        super().save_model(request, obj, form, change)

    class Meta:
        model = task


class LeaveAdmin(admin.ModelAdmin):
    list_display = ['leave_id', 'leave_description']
    search_fields = ['^leave_id']


class TimeSheetAdmin(admin.ModelAdmin):
    list_display = ['user', 'taskid', 'date', 'hours', 'is_billable']
    search_fields = ['^taskid', '^user']


class ApplyLeaveAdmin(admin.ModelAdmin):
    list_display = ['leaveid', 'date', 'comment', 'user']
    search_fields = ['^user']


class PriorSheetAdmin(admin.ModelAdmin):
    list_display = ['user', 'taskid', 'date', 'hours', 'is_billable', 'approved']
    search_fields = ['^taskid', '^user']


class RolesAdmin(admin.ModelAdmin):
    list_display = ['role', 'role_description']
    search_fields = ['role']


class SkillsAdmin(admin.ModelAdmin):
    list_display = ['skill', 'skill_description']
    search_fields = ['skill']


class TeamsForm(forms.ModelForm):
    team_lead_choices = (('', 'Select Team lead'),)
    team_lead = forms.ChoiceField(choices=team_lead_choices)

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        users = User.objects.values_list('username', flat=True).filter(is_staff=True, is_superuser=False) \
            .order_by('username')
        team_lead_choices = (('', 'Select Team lead'),)
        for u in users:
            team_lead_choices += ((u, u),)
        self.fields['team_lead'].choices = team_lead_choices

    class Meta:
        model = teams
        fields = ('team_name', 'team_description', 'team_lead', 'revenue_gen')


class TeamsAdmin(admin.ModelAdmin):
    list_display = ['team_name', 'team_description', 'team_lead', 'team_location', 'revenue_gen']
    fields = ['team_name', 'team_description', 'team_lead', 'team_location', 'revenue_gen']
    search_fields = ['^team_name', '^team_lead']
    form = TeamsForm


class UserProfileForm(forms.ModelForm):
    project_choices = ()
    project = forms.ChoiceField(choices=list())
    manager_id = forms.ChoiceField(choices=list())
    user_role = forms.ChoiceField(choices=list())
    user_skill = forms.ChoiceField(choices=list())

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        team_list = teams.objects.values_list('team_name', flat=True).order_by('team_name')
        project_choices = ((' ', 'Select Teams'),)
        manager_choices = ((' ', 'Select Manager'),)
        role_choices = ((' ', 'Select Role'),)
        skill_choices = ((' ', 'Select Skill'),)
        manager_list = User.objects.values_list('username', flat=True).filter(is_staff=True).order_by('username')
        for t in team_list:
            project_choices += ((t, t),)
        for m in manager_list:
            manager_choices += ((m, m),)
        roles = role.objects.values_list('role', flat=True)
        for r in roles:
            role_choices += ((r, r),)
        skills = skill.objects.values_list('skill', flat=True)
        for s in skills:
            skill_choices += ((s, s),)
        self.fields['project'].choices = project_choices
        self.fields['manager_id'].choices = manager_choices
        self.fields['user_role'].choices = role_choices
        self.fields['user_skill'].choices = skill_choices

    class Meta:
        model = userprofile
        fields = ['user_id', 'user_role', 'user_skill', 'project', 'manager_id', 'user_mobile',
                  'user_location', 'earned_leave', 'casual_leave', 'profile_photo']


class UserProfileAdmin(admin.ModelAdmin):
    list_display = ['user_id', 'user_role', 'user_skill', 'project', 'manager_id']
    search_fields = ['user_id__username']
    form = UserProfileForm

    def get_queryset(self, request):
        qs = super(UserProfileAdmin, self).get_queryset(request)
        if request.user.is_superuser:
            return qs
        else:
            user_data = userprofile.objects.get(user_id__username=request.user.username)
            fs = qs.filter(project=user_data.project)
            return fs


admin.site.register(task, TaskAdmin)
admin.site.register(timesheet, TimeSheetAdmin)
admin.site.register(priorsheet, PriorSheetAdmin)
admin.site.register(applyleave, ApplyLeaveAdmin)
admin.site.register(role, RolesAdmin)
admin.site.register(skill, SkillsAdmin)
admin.site.register(leave, LeaveAdmin)
admin.site.register(teams, TeamsAdmin)
admin.site.register(userprofile, UserProfileAdmin)
admin.site.unregister(User)
admin.site.register(User, MyUserAdmin)
