from django.urls import path
from .views import CourtroomAgentView, CaseLogListView, CaseView, TrialPhaseView

urlpatterns = [
    path('agent/', CourtroomAgentView.as_view(), name='courtroom-agent'),
    path('logs/', CaseLogListView.as_view(), name='case-logs'),
    path('cases/', CaseView.as_view(), name='cases'),
    path('phase/', TrialPhaseView.as_view(), name='trial-phase'),
]