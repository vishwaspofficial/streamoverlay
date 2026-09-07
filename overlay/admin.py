from django.contrib import admin
from .models import OverlayState


@admin.register(OverlayState)
class OverlayStateAdmin(admin.ModelAdmin):
    list_display = ('id', 'study_minutes', 'total_sessions', 'brb', 'exercise_sessions', 'updated_at')
    readonly_fields = ('updated_at',)

    def has_add_permission(self, request):
        return not OverlayState.objects.exists()
