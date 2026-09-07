from django.contrib.admin.views.decorators import staff_member_required
import json

from django.http import JsonResponse
from django.shortcuts import render
from django.views.decorators.http import require_GET, require_POST

from .models import OverlayState


def serialize(state):
    return {
        'studyMinutes': state.study_minutes,
        'totalSessions': state.total_sessions,
        'weeklyGoals': state.weekly_goals,
        'dailyGoals': state.daily_goals,
        'visibility': state.visibility,
        'brb': state.brb,
        'exerciseSessions': state.exercise_sessions,
        'updatedAt': state.updated_at.isoformat(),
    }


def overlay(request):
    return render(request, 'index.html')


@staff_member_required
def control(request):
    return render(request, 'control.html')


@require_GET
def state(request):
    return JsonResponse(serialize(OverlayState.current()))


@staff_member_required
@require_POST
def update_state(request):
    state = OverlayState.current()
    payload = json.loads(request.body or '{}')
    if 'studyMinutes' in payload:
        state.study_minutes = max(1, min(180, int(payload['studyMinutes'])))
    if 'totalSessions' in payload:
        state.total_sessions = max(1, min(24, int(payload['totalSessions'])))
    for field, model_field in (
        ('weeklyGoals', 'weekly_goals'), ('dailyGoals', 'daily_goals'),
        ('visibility', 'visibility'), ('brb', 'brb'), ('exerciseSessions', 'exercise_sessions')
    ):
        if field in payload:
            setattr(state, model_field, payload[field])
    state.save()
    return JsonResponse(serialize(state))
