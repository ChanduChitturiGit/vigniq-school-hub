"""School views.py"""

from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from core.permissions import IsSuperAdminOrAdmin,IsSuperAdmin

from school.services.school_service import SchoolService


class SchoolActionView(APIView):
    """View to handle school-related actions like create, update, and list schools.
    Only accessible by users with the super admin role (role.id == 1).

    Paths Available:
    - GET /school/school_list/ - List all schools (super admin only)
    - GET /school/board_list/ - List all school boards (super admin only)

    - POST /school/create/ - Create a new school (super admin only)
    
    - PUT /school/edit/ - Edit an existing school (super admin only)  
    """
    
    def get_permissions(self):
        if self.kwargs.get('action') in ['create', 'reactivateSchoolById', 'deactivateSchoolById']:
            return [IsSuperAdmin()]
        elif self.kwargs.get('action') in ['updateSchoolById']:
            return [IsSuperAdminOrAdmin()]
        return [IsAuthenticated()]

    def get(self, request, action=None):

        if action == "school_list":
            return SchoolService().get_schools(request)
        elif action == 'board_list':
            return SchoolService().get_boards(request)
        elif action == 'getBoardsBySchoolId':
            return SchoolService().get_boards_by_school_id(request)
        elif action == 'getSchoolById':
            return SchoolService().get_school(request)
        return Response({"error": "Invalid GET action"}, status=status.HTTP_400_BAD_REQUEST)

    def post(self, request, action=None):
        user = request.user
        if user.role.id != 1:
            return Response({"error": "You do not have permission to create a school."},
                            status=status.HTTP_403_FORBIDDEN)

        if action == "create":
            return SchoolService().create_school(request)
        return Response({"error": "Invalid POST action"}, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request, action=None):

        if action == "updateSchoolById":
            return SchoolService().edit_school(request)
        return Response({"error": "Invalid PUT action"}, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request, action=None):
        if action == "reactivateSchoolById":
            return SchoolService().reactivate_school(request)
        return Response({"error": "Invalid PATCH action"}, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, action=None):

        if action == "deactivateSchoolById":
            school_id = request.GET.get('school_id')
            if not school_id:
                return Response({"error": "school_id is required."},
                                status=status.HTTP_400_BAD_REQUEST)
            return SchoolService().deactivate_school(request)
        return Response({"error": "Invalid DELETE action"}, status=status.HTTP_400_BAD_REQUEST)
