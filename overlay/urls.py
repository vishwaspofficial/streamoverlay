from django.urls import path
from . import views

urlpatterns = [
    path('', views.overlay, name='overlay'),
    path('control/', views.control, name='control'),
    path('api/state/', views.state, name='state'),
    path('api/state/update/', views.update_state, name='update-state'),
]