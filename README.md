# Club Deportivo Nogoyá — Plataforma Integral de Gestión

Sistema web moderno y centralizado para la administración integral y presencia digital del **Club Deportivo Nogoyá** (Barrio Lourdes, fundado en 1944).

La plataforma combina un portal público institucional con un centro de control operativo (panel de administración) con roles granulares para la gestión de socios, inscripciones, disciplinas deportivas, cantina y tienda oficial.

---

## Arquitectura y Tecnologías

El proyecto está diseñado bajo una arquitectura desacoplada cliente-servidor:

* **Frontend:** [React](https://react.dev/) + [Vite](https://vitejs.dev/) + [Bootstrap 5](https://getbootstrap.com/)
  * Desplegado en **Vercel**.
  * Totalmente responsivo para dispositivos móviles (menú colapsable, tablas adaptables y grilla optimizada).
  * Enrutamiento protegido por roles con `react-router-dom`.
* **Backend:** [Node.js](https://nodejs.org/) + [Express](https://expressjs.com/)
  * Desplegado en **Render**.
  * Autenticación segura mediante JSON Web Tokens (**JWT**).
  * Control de acceso basado en roles (RBAC) y validación de esquemas con **Zod**.
  * Gestión de políticas de CORS para comunicación en la nube.
* **Base de Datos:** [MySQL](https://www.mysql.com/)
  * Instancia administrada en alta disponibilidad en **Aiven Cloud**.
  * Modelo relacional con soporte para variantes de productos, comandas y registros históricos.

---

## Módulos del Sistema

### 1. Portal Público
* **Portada y Hero:** Presentación institucional con diseño responsivo albinegro.
* **Historia del Club:** Raíces y fotos históricas desde 1944.
* **Disciplinas Deportivas:** Fútbol, Tenis, Pádel, Pelota Paleta, Natación, Colonia y Fútbol 5.
* **Tienda Oficial de Indumentaria:** Catálogo en tiempo real de casacas, chombas, shorts y accesorios con precios para socios y no socios.
* **Solicitud de Asociación:** Formulario directo para nuevos socios.
* **Preguntas Frecuentes:** Información sobre reservas, horarios y secretaría.

### 2. Panel de Administración
* **Centro de Control (Dashboard):** Métricas clave en tiempo real: relación de cobranza de socios, cupos de colonia, facturación de cantina del día y variantes con stock crítico.
* **Padrón de Socios:** Control de estados (al día, deudores, inactivos), altas y datos de contacto.
* **Colonia de Vacaciones y Pileta:** Preinscripciones, fichas médicas entregadas y distribución de cupos (mañana/tarde).
* **Gestión de Canchas y Reservas:** Módulos independientes para Tenis, Pádel, Pelota Paleta y Salón de Eventos / Quinchos.
* **Cantina del Club:** TPV de mostrador, apertura y cierre de caja, comandas por turnos y cobro por Efectivo, Transferencia o Débito.
* **Tienda y Stock:** Gestión de catálogo, variantes por talle y alerta de inventario bajo.
* **Fútbol Infantil / Juveniles:** Padrón de jugadores y categorías formativas.

---

## Roles y Permisos

| Rol | Identificador | Ámbito de Acceso |
| :--- | :---: | :--- |
| **Administración General** | `admin` | Acceso irrestricto a todas las métricas, configuraciones y módulos del club. |
| **Secretaría** | `secretaria` | Supervisión general del club, padrón de socios, colonia y turnos. |
| **Cantina** | `cantina` | Panel de ventas, comandas y caja diaria. |
| **Tienda** | `tienda` | Gestión de indumentaria, talles y stock. |
| **Disciplinas** | `tenis`, `padel`, `pelota_paleta`, `salon` | Control de canchas, turnos y reservas de la disciplina específica. |

---

## Instalación y Entorno Local

### Requisitos previos
* Node.js v18+ instalado.
* MySQL Server (local o remoto).

### 1. Clonar el repositorio
```bash
git clone [https://github.com/Martin-Birchenz/depor.git](https://github.com/Martin-Birchenz/depor.git)
cd depor
