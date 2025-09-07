"""packages service"""

import logging

from django.http import JsonResponse
from subscriptions.models import Package, PackageVersion

logger = logging.getLogger(__name__)

class PackagesService:
    """packages service"""
    def __init__(self, request):
        self.request = request

    def get_packages(self):
        """get packages"""
        try:
            packages = Package.objects.filter(is_active=True)
            package_data = []
            for package in packages:
                package_data.append({
                    'package_id': package.id,
                    'package_name': package.name,
                    'package_description': package.description,
                    'is_active': package.is_active,
                    'created_at': package.created_at,
                    'updated_at': package.updated_at,
                })
            return JsonResponse({"data": package_data}, status=200)
        except Exception as e:
            logger.error(f"Error getting packages: {e}")
            return JsonResponse({"error": "An error occurred while getting packages."},
                                status=500)
    
    def get_package_versions(self):
        """get package versions"""
        try:
            package_id = self.request.GET.get("package_id")
            if not package_id:
                return JsonResponse({"error": "Package ID is required"}, status=400)
            package_versions = PackageVersion.objects.filter(is_active=True, package_id=package_id)
            package_version_data = []
            for package_version in package_versions:
                package_version_data.append({
                    'package_version_id': package_version.id,
                    'name': package_version.version_name,
                    'price': package_version.price,
                    'currency': package_version.currency.code,
                    'duration_months': package_version.duration_months,
                    'is_active': package_version.is_active,
                    'created_at': package_version.created_at,
                    'updated_at': package_version.updated_at,
                })
            return JsonResponse({"data": package_version_data}, status=200)
        except Exception as e:
            logger.error("Error getting package versions: %s", e)
            return JsonResponse({"error": "An error occurred while getting package versions."},
                                status=500)