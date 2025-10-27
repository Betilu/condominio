# Smart Condominium - Backoffice Administrativo

Sistema web de gestión administrativa para condominios con reconocimiento facial, gestión financiera, áreas comunes y mantenimiento.

## Arquitectura

- **Frontend**: React 18 (sin TypeScript) + Vite + react-router-dom + axios
- **Backend**: Django 5 + Django REST Framework + PostgreSQL + JWT
- **Almacenamiento**: Local (MEDIA_ROOT/MEDIA_URL)

## Estructura del Proyecto

```
smart-condominium/
├── backend/           # Django REST API
├── frontend/          # React SPA
├── Makefile          # Comandos de desarrollo
└── README.md         # Este archivo
```

## Configuración Inicial

### 1. Base de Datos PostgreSQL

```bash
# Crear usuario y base de datos
psql -U postgres -c "CREATE USER condo_user WITH PASSWORD 'condo_pass';"
psql -U postgres -c "CREATE DATABASE condo_db OWNER condo_user;"
```

### 2. Backend (Django)

```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Linux/Mac
# .venv\Scripts\activate   # Windows
pip install -r requirements.txt
cp .env.example .env

python manage.py loaddata seeds/fixtures/groups.json
python manage.py loaddata seeds/fixtures/fee_configs.json
python manage.py seed_initial_data
python manage.py createsuperuser
python manage.py runserver
```

### 3. Frontend (React)

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

## Comandos Makefile

```bash
make migrate   # Ejecutar migraciones
make seed      # Cargar datos iniciales
make backend   # Ejecutar servidor Django
make frontend  # Ejecutar servidor React
```

## Módulos del Sistema

1. **Gestión Administrativa**: Usuarios, roles, torres, bloques, unidades, avisos
2. **Finanzas**: Configuración de cuotas, cargos, pagos, reportes de morosidad
3. **Seguridad**: Enrolamiento facial de residentes, logs de acceso
4. **Áreas Comunes**: Amenidades y sistema de reservas
5. **Mantenimiento**: Órdenes de trabajo, proveedores, costos
6. **Reportes**: Analítica financiera, de acceso y uso de amenidades

## API Documentation

La documentación OpenAPI está disponible en: `http://localhost:8000/api/schema/swagger-ui/`

## Acceso por Defecto

- **Admin**: admin / admin123
- **API Base URL**: http://localhost:8000/api
- **Frontend URL**: http://localhost:5173