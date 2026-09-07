from django.db import models


DEFAULT_WEEKLY = [
    {'text': 'Study 4 sessions', 'done': True},
    {'text': 'Read 100 pages', 'done': True},
    {'text': 'Exercise 3 times', 'done': False},
]
DEFAULT_DAILY = [
    {'text': 'Review notes', 'done': True},
    {'text': 'Read 20 pages', 'done': True},
    {'text': 'Finish problem set', 'done': False},
    {'text': 'Write a recap', 'done': False},
]


class OverlayState(models.Model):
    study_minutes = models.PositiveIntegerField(default=25)
    total_sessions = models.PositiveIntegerField(default=4)
    weekly_goals = models.JSONField(default=list)
    daily_goals = models.JSONField(default=list)
    visibility = models.JSONField(default=dict)
    brb = models.BooleanField(default=False)
    exercise_sessions = models.PositiveIntegerField(default=0)
    updated_at = models.DateTimeField(auto_now=True)

    @classmethod
    def current(cls):
        state, created = cls.objects.get_or_create(pk=1)
        if created:
            state.weekly_goals = DEFAULT_WEEKLY
            state.daily_goals = DEFAULT_DAILY
            state.visibility = {'study': True, 'weekly': True, 'daily': True, 'exercise': True}
            state.save(update_fields=['weekly_goals', 'daily_goals', 'visibility', 'updated_at'])
        return state
