from django.urls import path
from modules.bonita.api.views import (
    ProcessListView, StartCaseView, TaskListView, ExecuteTaskView, ProcessContractView, TaskContractView,
)

urlpatterns = [
    path('processes/', ProcessListView.as_view(), name='bonita-processes'),
    path('processes/<str:process_id>/contract/', ProcessContractView.as_view(), name='bonita-process-contract'),
    path('cases/start/', StartCaseView.as_view(), name='bonita-cases-start'),
    path('tasks/', TaskListView.as_view(), name='bonita-tasks'),
    path('tasks/<str:task_id>/contract/', TaskContractView.as_view(), name='bonita-task-contract'),
    path('tasks/execute/', ExecuteTaskView.as_view(), name='bonita-tasks-execute'),
]
