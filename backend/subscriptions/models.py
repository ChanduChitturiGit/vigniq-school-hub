"""Subscription and Payment Models"""
from django.db import models

from school.models import School
from core.models import AvailableModules

class Currency(models.Model):
    code = models.CharField(max_length=10, unique=True)  # e.g., 'USD'
    name = models.CharField(max_length=50)              # e.g., 'US Dollar'
    symbol = models.CharField(max_length=5, blank=True) # e.g., '$'

    class Meta:
        db_table = "currencies"

    def __str__(self):
        return f"{self.code} - {self.name}"

class Package(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        db_table = "packages"

    def __str__(self):
        return self.name


class PackageVersion(models.Model):
    package = models.ForeignKey(Package, on_delete=models.CASCADE, related_name="versions")
    version = models.IntegerField()
    version_name = models.CharField(max_length=100)
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    currency = models.ForeignKey(Currency, on_delete=models.CASCADE)
    duration_months = models.PositiveIntegerField(default=12)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True, null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True, null=True, blank=True)

    class Meta:
        db_table = "package_versions"
        constraints = [
            models.UniqueConstraint(fields=["package", "version"], name="unique_package_version")
        ]

    def __str__(self):
        return f"{self.package.name} - {self.version}"


# class PackageLimit(models.Model):
#     version = models.ForeignKey(PackageVersion, on_delete=models.CASCADE, related_name="limits")
#     teacher_limit = models.PositiveIntegerField(default=0)
#     student_limit = models.PositiveIntegerField(default=0)
#     storage_limit_mb = models.PositiveIntegerField(blank=True, null=True)
#     max_modules = models.PositiveIntegerField(blank=True, null=True)

#     class Meta:
#         db_table = "package_limits"


class FeatureOffered(models.Model):
    version = models.ForeignKey(PackageVersion, on_delete=models.CASCADE, related_name="features")
    module = models.ForeignKey(AvailableModules, on_delete=models.CASCADE)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True, null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True, null=True, blank=True)

    class Meta:
        db_table = "features_offered"
        unique_together = ("version", "module")


class Subscription(models.Model):
    PLAN_TYPES = [
        ("free", "Free"),
        ("trial", "Trial"),
        ("paid", "Paid"),
    ]

    school = models.ForeignKey(School, on_delete=models.CASCADE, related_name="subscriptions")
    version = models.ForeignKey(PackageVersion, on_delete=models.CASCADE, related_name="subscriptions")

    plan_type = models.CharField(max_length=10, choices=PLAN_TYPES, default="free")
    start_date = models.DateField()
    expiry_date = models.DateField()
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "subscriptions"
        indexes = [
            models.Index(fields=["school"]),
            models.Index(fields=["expiry_date"]),
        ]

    def __str__(self):
        return f"{self.school.name} - {self.version} ({self.status})"


class Transaction(models.Model):
    PAYMENT_METHODS = [
        ("cash", "Cash"),
        ("online", "Online"),
        ("bank_transfer", "Bank Transfer"),
        ("free", "Free"),
        ("trial", "Trial"),
        ("other", "Other"),
    ]
    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("success", "Success"),
        ("failed", "Failed"),
        ("refunded", "Refunded"),
    ]

    subscription = models.ForeignKey(Subscription, on_delete=models.CASCADE, related_name="transactions")
    transaction_ref = models.CharField(max_length=100, blank=True, null=True)
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHODS)
    amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    paid_at = models.DateTimeField(blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "transactions"
        indexes = [
            models.Index(fields=["subscription", "status"]),
            models.Index(fields=["paid_at"]),
        ]

    def __str__(self):
        return f"Transaction {self.transaction_ref or self.id} - {self.status}"