from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from dataclasses import asdict
from modules.bonita.api.serializers import StartCaseRequestSerializer, ExecuteTaskRequestSerializer
from modules.bonita.services.process_service import BonitaProcessService

class ProcessListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        service = BonitaProcessService()
        processes = service.get_available_processes()
        return Response({"success": True, "data": [asdict(p) for p in processes]})

class StartCaseView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = StartCaseRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        service = BonitaProcessService()
        case = service.start_process_instance(
            process_id=serializer.validated_data['process_id'],
            contract_data=serializer.validated_data.get('contract_variables')
        )
        return Response({"success": True, "data": asdict(case)}, status=status.HTTP_201_CREATED)

class TaskListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user_id = request.query_params.get('user_id')
        service = BonitaProcessService()
        tasks = service.get_user_tasks(user_id=user_id)
        return Response({"success": True, "data": [asdict(t) for t in tasks]})

class ExecuteTaskView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ExecuteTaskRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        service = BonitaProcessService()
        success = service.complete_user_task(
            task_id=serializer.validated_data['task_id'],
            payload=serializer.validated_data.get('task_variables')
        )
        return Response({"success": success})

class ProcessContractView(APIView):
    """Entradas del contrato de instanciación del proceso, para construir el formulario en el cliente."""
    permission_classes = [IsAuthenticated]

    def get(self, request, process_id):
        service = BonitaProcessService()
        inputs = service.get_process_contract(process_id)
        return Response({"success": True, "data": [asdict(i) for i in inputs]})

class TaskContractView(APIView):
    """Entradas del contrato de una tarea humana."""
    permission_classes = [IsAuthenticated]

    def get(self, request, task_id):
        service = BonitaProcessService()
        inputs = service.get_task_contract(task_id)
        return Response({"success": True, "data": [asdict(i) for i in inputs]})
