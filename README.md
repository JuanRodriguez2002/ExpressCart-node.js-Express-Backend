# ExpressCart - Backend API

## ⚙️ Descripción General
ExpressCart Backend es una API RESTful robusta encargada de centralizar la lógica de negocio, el procesamiento de datos, la persistencia de entidades y la autenticación de todo el ecosistema de ExpressCart. Diseñada bajo un enfoque modular, la API expone servicios y endpoints protegidos que abastecen las consultas de la aplicación móvil en tiempo real, garantizando la consistencia relacional y respuestas estructuradas.

---

## 🛠️ Stack Tecnológico
* **Entorno de Ejecución:** Node.js
* **Framework Web:** Express.js
* **Base de Datos:** PostgreSQL (Gestionado de manera escalable mediante Supabase)
* **ORM / Mapeador Relacional:** Sequelize
* **Autenticación:** JSON Web Tokens (JWT) para sesiones sin estado (Stateless)
* **Estrategia de Dependencias:** Estructurada bajo `pnpm` para máxima velocidad y consistencia en el entorno de desarrollo

---

## 📂 Arquitectura del Sistema y Endpoints

El backend procesa las solicitudes implementando una arquitectura limpia por capas bien definidas: **Enrutador → Controlador → Servicio / Modelo de Datos**.

### Endpoints Principales Disponibles

#### 1. Módulo de Autenticación y Usuarios (`/auth`)
* `POST /auth/login` - Autentica las credenciales del usuario y expide un token JWT firmado.
* `POST /auth/register` - Registra nuevas cuentas de usuario aplicando hashing seguro de contraseñas.
* `GET /auth/user` - **Endpoint Protegido**. Retorna el perfil del usuario autenticado `{ id, name, email, role }`. Requiere obligatoriamente la cabecera `Authorization: Bearer <JWT>`.

#### 2. Módulo de Establecimientos (`/supermarkets`)
* `GET /supermarkets` - **Endpoint Protegido**. Recupera la lista completa de supermercados disponibles con sus respectivas direcciones físicas mapeadas en la base de datos.

---

## 📊 Coherencia y Validación Cruzada con la Base de Datos (BD ↔ UI)
El diseño del backend responde estrictamente a las necesidades de la interfaz del cliente móvil:
1. **Integridad Referencial:** Todas las tablas cuentan con restricciones de clave primaria y foránea para modelar relaciones estructurales del DER (Diagrama Entidad-Relación), como la relación 1:N donde un supermercado contiene múltiples productos o visitas asociadas.
2. **Campos Obligatorios:** Los esquemas de la base de datos imponen restricciones `NOT NULL` en columnas de identidad fundamentales (`email`, `password`, `name`). Los controladores interceptan datos incompletos en el frontend devolviendo códigos de estado HTTP `400 Bad Request` antes de interactuar con la base de datos.
3. **Respuestas Estandarizadas:** En caso de fallas de lógica o violaciones de restricciones, el backend captura los eventos y unifica los objetos de error bajo la estructura `{ message: "Detalle del error", error: "Internal Error" }`, permitiendo al frontend renderizarlos directamente en componentes de alerta visuales (`<FormAlerts />`).

---

## 🚀 Instalación y Puesta en Marcha

### Configuración del Entorno
1. Clonar el repositorio correspondiente al backend.
2. Instalar los módulos y dependencias requeridas utilizando el motor de paquetes:
   ```bash
   pnpm install
