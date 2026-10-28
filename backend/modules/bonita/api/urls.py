from django.urls import path
from modules.bonita.api.views import ProcessListView, StartCaseView, TaskListView, ExecuteTaskView

urlpatterns = [
    path('processes/', ProcessListView.as_view(), name='bonita-processes'),
    path('cases/start/', StartCaseView.as_view(), name='bonita-cases-start'),
    path('tasks/', TaskListView.as_view(), name='bonita-tasks'),
    path('tasks/execute/', ExecuteTaskView.as_view(), name='bonita-tasks-execute'),
]
