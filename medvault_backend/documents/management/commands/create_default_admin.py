import os
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

class Command(BaseCommand):
    help = 'Create default admin user if not exists'

    def handle(self, *args, **options):
        User = get_user_model()
        username = os.environ.get('DJANGO_SUPERUSER_USERNAME')
        email = os.environ.get('DJANGO_SUPERUSER_EMAIL')
        password = os.environ.get('DJANGO_SUPERUSER_PASSWORD')
        if username and email and password:
            if not User.objects.filter(username=username).exists():
                User.objects.create_superuser(username=username, email=email, password=password)
                self.stdout.write(self.style.SUCCESS(f"Superuser {username} created"))
            else:
                self.stdout.write(self.style.WARNING(f"Superuser {username} already exists"))
        else:
            self.stdout.write(self.style.ERROR("Missing DJANGO_SUPERUSER_USERNAME, EMAIL, or PASSWORD env vars")) 