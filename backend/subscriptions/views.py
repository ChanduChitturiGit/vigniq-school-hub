"""subscriptions views"""

from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated

from rest_framework.response import Response
from rest_framework import status

from subscriptions.services.packages_service import PackagesService
from core.permissions import IsSuperAdmin

class PackagesView(APIView):
    """packages view"""
    permission_classes = [IsAuthenticated, IsSuperAdmin]

    def get(self, request, action=None):
        if action == 'getPackages':
            return PackagesService(request).get_packages()
        elif action == 'getPackageVersions':
            return PackagesService(request).get_package_versions()
        return Response({"error": "Invalid GET action"}, status=status.HTTP_400_BAD_REQUEST)