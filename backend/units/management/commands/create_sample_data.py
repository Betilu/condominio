from django.core.management.base import BaseCommand
from units.models import UnitTower, UnitBlock, Unit
from accounts.models import User

class Command(BaseCommand):
    help = 'Create sample data for testing'

    def handle(self, *args, **options):
        # Create towers
        tower1, created = UnitTower.objects.get_or_create(
            name='Torre A',
            defaults={'description': 'Torre principal del condominio'}
        )
        
        tower2, created = UnitTower.objects.get_or_create(
            name='Torre B',
            defaults={'description': 'Torre secundaria del condominio'}
        )
        
        # Create blocks
        block1, created = UnitBlock.objects.get_or_create(
            tower=tower1,
            name='Bloque 1',
            defaults={'description': 'Primer bloque de la Torre A'}
        )
        
        block2, created = UnitBlock.objects.get_or_create(
            tower=tower1,
            name='Bloque 2',
            defaults={'description': 'Segundo bloque de la Torre A'}
        )
        
        block3, created = UnitBlock.objects.get_or_create(
            tower=tower2,
            name='Bloque 1',
            defaults={'description': 'Primer bloque de la Torre B'}
        )
        
        self.stdout.write(
            self.style.SUCCESS(f'Created towers: {UnitTower.objects.count()}')
        )
        self.stdout.write(
            self.style.SUCCESS(f'Created blocks: {UnitBlock.objects.count()}')
        )
