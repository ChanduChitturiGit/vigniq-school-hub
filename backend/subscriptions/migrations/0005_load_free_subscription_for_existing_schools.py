from django.db import migrations
from datetime import date
from dateutil.relativedelta import relativedelta


def load_subscriptions_for_existing_schools(apps, schema_editor):
    Subscription = apps.get_model("subscriptions", "Subscription")
    Transaction = apps.get_model("subscriptions", "Transaction")
    School = apps.get_model("school", "School")
    PackageVersion = apps.get_model("subscriptions", "PackageVersion")
    Package = apps.get_model("subscriptions", "Package")

    try:
        package = Package.objects.get(id=3)
        package_version = PackageVersion.objects.get(package=package, is_active=True)
    except (Package.DoesNotExist, PackageVersion.DoesNotExist):
        return

    today = date.today()
    default_expiry = today + relativedelta(months=package_version.duration_months)

    for school in School.objects.all():
        if not Subscription.objects.filter(school=school).exists():
            subscription = Subscription.objects.create(
                school=school,
                version=package_version,
                plan_type="trial",
                start_date=today,
                expiry_date=default_expiry,
                is_active=True,
            )
            Transaction.objects.create(
                subscription=subscription,
                amount=0.00,
                status="success",
                payment_method="trial",
            )


class Migration(migrations.Migration):

    dependencies = [
        ("subscriptions", "0004_transaction_updated_at"),
    ]

    operations = [
        migrations.RunPython(load_subscriptions_for_existing_schools),
    ]
