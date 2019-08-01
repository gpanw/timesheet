from django.apps import AppConfig


class CurrentConfig(AppConfig):
    name = 'current'
    verbose_name = 'timesheet'

    def ready(self):
        import current.signals
