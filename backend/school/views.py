"""School views.py"""

from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

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
    permission_classes = [IsAuthenticated]

    def get(self, request, action=None):
        user = request.user
        if user.role.id not in (1,2):
            return Response({"error": "You do not have permission to view schools."},
                            status=status.HTTP_403_FORBIDDEN)

        if action == "school_list":
            return SchoolService().get_schools(request)
        elif action == 'board_list':
            return SchoolService().get_boards(request)
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
        user = request.user
        if user.role.id not in (1,2):
            return Response({"error": "You do not have permission to edit a school."},
                            status=status.HTTP_403_FORBIDDEN)

        if action == "updateSchoolById":
            school_id = request.data.get('school_id')
            if not school_id:
                return Response({"error": "school_id is required."},
                                status=status.HTTP_400_BAD_REQUEST)
            return SchoolService().edit_school(request)
        return Response({"error": "Invalid PUT action"}, status=status.HTTP_400_BAD_REQUEST)


# class ClassActionView(APIView):
#     """View to handle class-related actions like create, update, and list classes.
#     Only accessible by users with the admin role (role.id == 1).

#     Paths Available:
#     - GET /school/class_list/ - List all classes (admin only)
#     - POST /school/create_class/ - Create a new class (admin only)
#     - PUT /school/edit_class/ - Update an existing class (admin only)
#     """
    
#     permission_classes = [IsAuthenticated]

#     def get(self, request, action=None):
#         user = request.user
#         if user.role.id not in (1,2):
#             return Response({"error": "You do not have permission to view classes."},
#                             status=status.HTTP_403_FORBIDDEN)

#         if action == "class_list":
#             return SchoolService().get_classes(request)
#         return Response({"error": "Invalid GET action"}, status=status.HTTP_400_BAD_REQUEST)

#     def post(self, request, action=None):
#         user = request.user
#         if user.role.id not in (1,2):
#             return Response({"error": "You do not have permission to create a class."},
#                             status=status.HTTP_403_FORBIDDEN)

#         if action == "create_class":
#             return SchoolService().create_class(request)
#         return Response({"error": "Invalid POST action"}, status=status.HTTP_400_BAD_REQUEST)

#     def put(self, request, action=None):
#         user = request.user
#         if user.role.id not in (1,2):
#             return Response({"error": "You do not have permission to edit a class."},
#                             status=status.HTTP_403_FORBIDDEN)

#         if action == "edit_class":
#             class_id = request.data.get('class_id')
#             if not class_id:
#                 return Response({"error": "class_id is required."},
#                                 status=status.HTTP_400_BAD_REQUEST)
#             return SchoolService().edit_class(request, class_id)
#         return Response({"error": "Invalid PUT action"}, status=status.HTTP_400_BAD_REQUEST)