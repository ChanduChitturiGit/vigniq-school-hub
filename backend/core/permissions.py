"""This file contains permission classes for the VIGYS AI School Hub backend."""

from rest_framework.permissions import BasePermission

class IsSuperAdmin(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role_id == 1
    
class IsSuperAdminOrAdmin(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role_id in [1, 2]

class IsSuperAdminOrAdminOrTeacher(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role_id in [1, 2, 3]

