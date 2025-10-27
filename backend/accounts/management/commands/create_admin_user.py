from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.contrib.auth.models import Permission
from django.db import transaction

User = get_user_model()


class Command(BaseCommand):
    help = 'Create an admin user with all permissions'

    def add_arguments(self, parser):
        parser.add_argument(
            '--username',
            type=str,
            default='admin',
            help='Username for the admin user'
        )
        parser.add_argument(
            '--email',
            type=str,
            default='admin@condominio.com',
            help='Email for the admin user'
        )
        parser.add_argument(
            '--password',
            type=str,
            default='admin123',
            help='Password for the admin user'
        )
        parser.add_argument(
            '--first-name',
            type=str,
            default='Administrador',
            help='First name for the admin user'
        )
        parser.add_argument(
            '--last-name',
            type=str,
            default='Sistema',
            help='Last name for the admin user'
        )

    def handle(self, *args, **options):
        username = options['username']
        email = options['email']
        password = options['password']
        first_name = options['first_name']
        last_name = options['last_name']

        with transaction.atomic():
            # Check if user already exists
            if User.objects.filter(username=username).exists():
                self.stdout.write(
                    self.style.WARNING(f'User "{username}" already exists. Updating permissions...')
                )
                user = User.objects.get(username=username)
                user.set_password(password)
                user.email = email
                user.first_name = first_name
                user.last_name = last_name
                user.is_staff = True
                user.is_superuser = True
                user.is_active = True
                user.save()
            else:
                # Create new admin user
                user = User.objects.create_user(
                    username=username,
                    email=email,
                    password=password,
                    first_name=first_name,
                    last_name=last_name,
                    is_staff=True,
                    is_superuser=True,
                    is_active=True
                )
                self.stdout.write(
                    self.style.SUCCESS(f'Created admin user "{username}"')
                )

            # Get all permissions
            all_permissions = Permission.objects.all()
            
            # Assign all permissions to the user
            user.user_permissions.set(all_permissions)
            
            # Also add to all groups if they exist
            from django.contrib.auth.models import Group
            admin_group, created = Group.objects.get_or_create(name='Administradores')
            if created:
                admin_group.permissions.set(all_permissions)
                self.stdout.write(
                    self.style.SUCCESS('Created "Administradores" group with all permissions')
                )
            else:
                # Update existing group with all permissions
                admin_group.permissions.set(all_permissions)
                self.stdout.write(
                    self.style.SUCCESS('Updated "Administradores" group with all permissions')
                )
            
            user.groups.add(admin_group)
            
            # Ensure user has all permissions from groups
            user.user_permissions.set(all_permissions)

            self.stdout.write(
                self.style.SUCCESS(
                    f'Successfully assigned {all_permissions.count()} permissions to user "{username}"'
                )
            )
            
            # Display user info
            self.stdout.write('\n' + '='*50)
            self.stdout.write(self.style.SUCCESS('ADMIN USER CREATED SUCCESSFULLY'))
            self.stdout.write('='*50)
            self.stdout.write(f'Username: {username}')
            self.stdout.write(f'Email: {email}')
            self.stdout.write(f'Password: {password}')
            self.stdout.write(f'Full Name: {first_name} {last_name}')
            self.stdout.write(f'Is Staff: {user.is_staff}')
            self.stdout.write(f'Is Superuser: {user.is_superuser}')
            self.stdout.write(f'Is Active: {user.is_active}')
            self.stdout.write(f'Total Permissions: {user.user_permissions.count()}')
            self.stdout.write(f'Groups: {", ".join([g.name for g in user.groups.all()])}')
            self.stdout.write('='*50)
