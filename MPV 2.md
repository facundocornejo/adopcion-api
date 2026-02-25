# Plataforma de Adopción de Animales - MVP 2.0

## Trabajo Final Integrador - TFI

Tecnicatura Universitaria en Programación

**Universidad Tecnológica Nacional (UTN)**

Paraná, Entre Ríos - Extensión Áulica Hasenkamp

**Estudiantes:** Facundo Cornejo y Guillermo Londero

**Tutores:** Oscar Alberto Londero - Mariano Martinez Princic

**Fecha:** Noviembre 2025 - **Actualizado: Febrero 2026**

---

> **NOTA IMPORTANTE:** Este documento es una actualización del MVP original. Los cambios y funcionalidades agregadas están marcados en **negrita**. Las secciones que incluían imágenes/diagramas en el original se indican como "[IMAGEN - REQUIERE ACTUALIZACIÓN]" ya que no pudieron ser verificadas.

---

## Presentación del Equipo y Proyecto

Somos Facundo Cornejo y Guillermo Londero, estudiantes de la Tecnicatura Universitaria en Programación de la UTN. Desarrollamos una Plataforma Web de Adopción de Animales como nuestro Trabajo Final Integrador. Este proyecto resuelve una problemática social real que afecta directamente a refugios de animales, rescatistas independientes y personas que desean adoptar animales de manera responsable.

**Video Presentación:** https://www.youtube.com/watch?v=fi0_IYgX2B4

---

## El Problema que Identificamos

### Situación actual

Los refugios y rescatistas gestionan adopciones de forma completamente dispersa:
- Publican en Facebook, Instagram, grupos de WhatsApp
- Mantienen planillas de Excel que nadie más puede ver
- Las publicaciones se pierden rápidamente en el flujo de redes sociales

### Consecuencias concretas

- No existe un registro centralizado donde todos los animales estén visibles
- Las solicitudes llegan por todos lados (comentarios, MP, llamadas, emails)
- Actualizar el estado de cada animal es un trabajo monumental
- Información desactualizada genera frustración en adoptantes y rescatistas
- Los animales pierden oportunidades reales de adopción por ineficiencia del proceso

---

## Solución que Proponemos

Crear una plataforma **multi-organizacional** donde los rescatistas o administradores puedan cargar animales en adopción (con foto, descripción y estado), y que cualquier interesado pueda verlos y enviar una solicitud de adopción a través de un formulario.

---

## Alcance MVP 2.0 (Expandido)

### Funcionalidades Públicas

- Listado de animales con foto, nombre, edad, raza y estado
- Página de detalle con información completa
- Formulario de solicitud de adopción (17+ campos)
- **Filtros de búsqueda por especie, tamaño, estado y texto**
- **Paginación configurable (hasta 100 items por página)**
- **Vista de organizaciones públicas por slug**
- **Sección "Casos de Éxito" - Historias de adopciones exitosas**

### Funcionalidades Administrativas

- Login de administrador (email y contraseña)
- CRUD completo de animales (crear, editar, eliminar)
- Cambiar estado de animales con un click
- Ver lista de solicitudes recibidas
- **Dashboard con estadísticas en tiempo real**
- **Gestión de perfil de organización**
- **CRUD de Casos de Éxito**

### **NUEVAS Funcionalidades - Super Administrador**

- **Gestión completa de todas las organizaciones**
- **Crear nuevas organizaciones con su administrador inicial**
- **Activar/desactivar organizaciones**
- **Ver y gestionar solicitudes de contacto de nuevos rescatistas**
- **Acceso a datos de toda la plataforma**

### **NUEVO: Sistema Multi-Tenant (Multi-Organizacional)**

- **Cada organización tiene su propio espacio independiente**
- **Datos completamente segregados por organización**
- **Administradores solo ven datos de su organización**
- **Super Admin tiene vista global de toda la plataforma**

---

## Lo que ERA "Deliberadamente Excluido" en MVP 1.0 - **AHORA IMPLEMENTADO:**

| MVP 1.0 Excluía | MVP 2.0 Estado |
|-----------------|----------------|
| Múltiples rescatistas (multitenancy) | **✅ IMPLEMENTADO - Modelo Organizacion completo** |
| Usuarios con roles/permisos complejos | **✅ IMPLEMENTADO - Super Admin + Admin por org** |
| Filtros avanzados de búsqueda | **✅ IMPLEMENTADO - especie, tamaño, estado, texto** |
| Estadísticas y reportes avanzados | **✅ IMPLEMENTADO - Dashboard con métricas** |
| Sección "Adoptados" | **✅ IMPLEMENTADO - Casos de Éxito** |

---

## Usuarios y Beneficiarios

### Usuarios Directos - Rescatistas/Organizaciones

Rescatistas pequeños y medianos de la zona sin recursos para sistemas caros, así como rescatistas independientes que trabajan desde su casa. **Ahora cada uno puede tener su propio espacio en la plataforma.**

### Usuarios Directos - Adoptantes

Familias, parejas o personas que quieren adoptar responsablemente, con acceso a un lugar confiable donde ver opciones reales sin rastrear múltiples redes.

### **NUEVO: Usuarios Directos - Super Administradores**

**Gestores de la plataforma que administran todas las organizaciones, aprueban nuevos rescatistas y mantienen el sistema funcionando.**

### Beneficiarios Indirectos

Los animales: Mayor visibilidad = más chances de encontrar hogar en menos tiempo.
La comunidad: Menos animales en situación de calle, mejores condiciones de convivencia.

---

## Propuesta de Valor

### Resuelve Problema 1 (Difusión dispersa):
- Único lugar centralizado
- Información actualizada
- Solicitudes organizadas
- Visibilidad permanente
- Acceso 24/7

### Resuelve Problema 2 (Filtrado de adoptantes):
- Formulario completo con 17 campos
- Datos estructurados
- Filtrado básico automático
- Validación de edad
- Ahorro de tiempo en entrevistas iniciales
- **Prevención de solicitudes duplicadas (mismo email en 7 días)**

### **NUEVO - Resuelve Problema 3 (Escalabilidad):**
- **Múltiples organizaciones en una sola plataforma**
- **Cada rescatista mantiene su identidad**
- **Gestión centralizada sin perder independencia**

---

## Métricas de Éxito

- Sistema 100% funcional desplegado en producción
- Diseño responsive (360px-1920px)
- 1+ rescatistas usando activamente durante fase piloto
- Mínimo 5-10 solicitudes durante prueba
- Feedback positivo validando resolución de problemas
- **Dashboard con métricas de uso en tiempo real**
- **Tasa de adopción calculada automáticamente**

---

## Diagrama de Casos de Uso

[IMAGEN - REQUIERE ACTUALIZACIÓN: Los diagramas originales no incluían multi-tenancy ni super admin]

### Vista General del Sistema - **ACTUALIZADA**

**Actores:**
- Visitante/Adoptante (público)
- Administrador de Organización (autenticado)
- **Super Administrador (autenticado, acceso total)**

**Casos de Uso Públicos:**
- Ver catálogo de animales
- **Filtrar animales (especie, tamaño, estado)**
- Ver detalle de animal
- Enviar solicitud de adopción
- **Ver casos de éxito**
- **Ver perfil público de organización**
- **Enviar solicitud de contacto (rescatista quiere unirse)**

**Casos de Uso Admin Organización:**
- Iniciar/cerrar sesión
- Ver dashboard con estadísticas
- CRUD de animales
- Gestionar solicitudes de adopción
- **Gestionar casos de éxito**
- **Editar perfil de organización**

**Casos de Uso Super Admin:**
- **Todo lo de Admin Organización**
- **CRUD de organizaciones**
- **Activar/desactivar organizaciones**
- **Gestionar solicitudes de contacto de rescatistas**
- **Ver estadísticas globales**

---

## HISTORIAS DE USUARIO CON CRITERIOS GWT

### AUTENTICACIÓN

**HU-01: Login de administrador**

**Como** admin **quiero** iniciar sesión con email y contraseña **para** acceder al panel de administración de forma segura

**Escenario I: Login exitoso:**
- **(G) Dado que** estoy en login con credenciales válidas **y mi organización está activa**
- **(W) Cuando** hago clic en "Iniciar sesión"
- **(T) Entonces** soy redirigido al dashboard con sesión activa **y se registra mi último acceso**

**Escenario II: Credenciales incorrectas:**
- **(G) Dado que** estoy en login con credenciales inválidas
- **(W) Cuando** hago clic en "Iniciar sesión"
- **(T) Entonces** veo mensaje "Credenciales inválidas" **y se aplica rate limiting (5 intentos/15min)**

**Escenario III: Organización inactiva** *(NUEVO)*
- **(G) Dado que** mi organización fue desactivada por el Super Admin
- **(W) Cuando** intento iniciar sesión
- **(T) Entonces** veo mensaje "Organización inactiva" y no puedo acceder

---

### GESTIÓN DE ANIMALES

**HU-02: Crear animal**

**Como** admin **quiero** cargar un animal con fotos **para** publicarlo en adopción

**Criterios GWT:**
- **(G) Dado que** completo todos los campos obligatorios y cargo mínimo 1 foto
- **(W) Cuando** hago clic en "Guardar"
- **(T) Entonces** el animal se crea en estado "Disponible", **se asocia a mi organización**, y aparece en catálogo

**HU-03: Editar animal**

**Como** admin **quiero** modificar datos de un animal **para** mantenerlo actualizado

**Criterios GWT:**
- **(G) Dado que** estoy editando un animal **de mi organización**
- **(W) Cuando** cambio campos y guardo
- **(T) Entonces** los cambios se reflejan en catálogo público **y se registra en auditoría**

**HU-04: Cambiar estado**

**Como** admin **quiero** cambiar estado del animal **para** reflejar su situación

**Criterios GWT:**
- **(G) Dado que** tengo un animal en cualquier estado
- **(W) Cuando** selecciono nuevo estado y confirmo
- **(T) Entonces** el estado se actualiza **y se registra el cambio en auditoría**

**HU-04b: Eliminar animal** *(ACTUALIZADO)*

**Como** admin **quiero** eliminar un animal **para** quitarlo del catálogo

**Criterios GWT:**
- **(G) Dado que** tengo un animal **de mi organización**
- **(W) Cuando** elimino el animal
- **(T) Entonces** **se aplica soft delete (deleted_at) y el animal desaparece del catálogo pero se preservan los datos**

---

### CATÁLOGO PÚBLICO

**HU-05: Ver catálogo**

**Como** adoptante **quiero** ver animales disponibles **para** explorar opciones

**Criterios GWT:**
- **(G) Dado que** accedo a la página principal
- **(W) Cuando** el catálogo carga
- **(T) Entonces** veo cards con animales "Disponibles", "En proceso" y "En tránsito" **de todas las organizaciones activas**

**HU-05b: Filtrar catálogo** *(NUEVO)*

**Como** adoptante **quiero** filtrar animales **para** encontrar el ideal para mí

**Criterios GWT:**
- **(G) Dado que** estoy en el catálogo
- **(W) Cuando** aplico filtros de especie, tamaño o busco por nombre
- **(T) Entonces** veo solo los animales que coinciden con mis criterios

**HU-06: Ver detalle de animal**

**Como** adoptante **quiero** ver info completa **para** conocer al animal

**Criterios GWT:**
- **(G) Dado que** estoy en el catálogo
- **(W) Cuando** hago clic en un animal
- **(T) Entonces** veo página con galería, historia, socialización, contacto, **información de la organización** y botón "Quiero adoptarlo"

---

### FORMULARIO Y SOLICITUDES

**HU-07: Enviar solicitud**

**Como** adoptante **quiero** enviar solicitud **para** postularme a adoptar

**Criterios GWT:**
- **(G) Dado que** completo formulario con 17 campos y cumplo condición edad ≥18
- **(W) Cuando** envío la solicitud
- **(T) Entonces** veo confirmación, admin recibe notificación **y se aplica rate limiting (10/hora por IP)**

**HU-07b: Prevención de duplicados** *(NUEVO)*

**Criterios GWT:**
- **(G) Dado que** ya envié una solicitud para este animal hace menos de 7 días
- **(W) Cuando** intento enviar otra solicitud con el mismo email
- **(T) Entonces** la solicitud anterior se reemplaza por la nueva (actualización)

---

### DASHBOARD *(EXPANDIDO)*

**HU-08: Dashboard**

**Como** admin **quiero** ver resumen del sistema **para** conocer mi situación

**Criterios GWT:**
- **(G) Dado que** estoy autenticado como admin
- **(W) Cuando** accedo al dashboard
- **(T) Entonces** veo:
  - **Total de animales (de mi organización)**
  - **Animales por estado (disponible, en proceso, adoptado, en tránsito)**
  - **Total de solicitudes**
  - **Solicitudes por estado (nueva, en revisión, aprobada, rechazada)**
  - **Solicitudes últimos 7 días**
  - **Animales publicados últimos 30 días**
  - **Tasa de adopción calculada**

---

### **NUEVAS HISTORIAS DE USUARIO**

**HU-09: Gestionar casos de éxito**

**Como** admin **quiero** publicar historias de adopción exitosa **para** mostrar el impacto positivo

**Criterios GWT:**
- **(G) Dado que** tengo un animal adoptado
- **(W) Cuando** creo un caso de éxito con título, historia y fotos actuales
- **(T) Entonces** aparece en la sección pública "Casos de Éxito"

**HU-10: Solicitud de contacto (rescatista)**

**Como** rescatista **quiero** solicitar unirme a la plataforma **para** gestionar mis animales

**Criterios GWT:**
- **(G) Dado que** completo el formulario de contacto con datos de mi organización
- **(W) Cuando** envío la solicitud
- **(T) Entonces** el Super Admin recibe la solicitud para evaluación

**HU-11: Gestionar organizaciones (Super Admin)**

**Como** Super Admin **quiero** gestionar organizaciones **para** mantener la plataforma

**Criterios GWT:**
- **(G) Dado que** soy Super Admin autenticado
- **(W) Cuando** accedo al panel de organizaciones
- **(T) Entonces** puedo crear, activar/desactivar y eliminar organizaciones

---

## REQUERIMIENTOS FUNCIONALES (RF)

### RF-1: Autenticación y Seguridad

| ID | Requerimiento |
|----|---------------|
| RF-1.1 | El sistema debe permitir login con email y contraseña |
| RF-1.2 | El sistema debe generar y validar tokens JWT (**expiración 24h**) |
| RF-1.3 | El sistema debe permitir logout cerrando la sesión |
| RF-1.4 | El sistema debe proteger rutas del panel admin (solo accesibles con token válido) |
| RF-1.5 | El sistema debe hashear contraseñas con bcrypt antes de almacenar |
| **RF-1.6** | **El sistema debe verificar que la organización esté activa al hacer login** |
| **RF-1.7** | **El sistema debe registrar último acceso del administrador** |
| **RF-1.8** | **El sistema debe aplicar rate limiting en login (5 intentos/15min)** |

### RF-2: Gestión de Animales

| ID | Requerimiento |
|----|---------------|
| RF-2.1 | El sistema debe permitir crear animales con 19+ campos obligatorios |
| RF-2.2 | El sistema debe permitir cargar 1-5 fotos por animal |
| RF-2.3 | El sistema debe permitir marcar una foto como principal |
| RF-2.4 | El sistema debe permitir editar información de animales existentes |
| RF-2.5 | El sistema debe permitir cambiar estado del animal (Disponible/En proceso/Adoptado/En tránsito) |
| RF-2.6 | El sistema debe permitir eliminar animales **(soft delete)** |
| RF-2.7 | El sistema debe mostrar listado de animales **filtrado por organización del admin** |
| RF-2.8 | El sistema debe validar campos obligatorios antes de guardar |
| RF-2.9 | El sistema debe validar que haya al menos 1 foto por animal |
| **RF-2.10** | **El sistema debe asociar cada animal a una organización** |
| **RF-2.11** | **El sistema debe registrar qué administrador publicó cada animal** |

### RF-3: Catálogo Público

| ID | Requerimiento |
|----|---------------|
| RF-3.1 | El sistema debe mostrar catálogo público con animales en estado "Disponible"/"En proceso"/"En tránsito" |
| RF-3.2 | El sistema debe mostrar cards con foto principal, nombre, edad, especie y estado |
| RF-3.3 | El sistema debe mostrar página de detalle individual con toda la información del animal |
| RF-3.4 | El sistema debe mostrar galería completa de fotos en detalle del animal |
| RF-3.5 | El sistema debe mostrar historia de rescate destacada |
| RF-3.6 | El sistema debe mostrar información de socialización (perros/gatos/niños) |
| RF-3.7 | El sistema debe mostrar necesidades especiales visiblemente |
| RF-3.8 | El sistema debe mostrar contacto del rescatista (Instagram/WhatsApp) |
| **RF-3.9** | **El sistema debe permitir filtrar por especie (Perro/Gato)** |
| **RF-3.10** | **El sistema debe permitir filtrar por tamaño (Pequeño/Mediano/Grande)** |
| **RF-3.11** | **El sistema debe permitir filtrar por estado** |
| **RF-3.12** | **El sistema debe permitir búsqueda por nombre** |
| **RF-3.13** | **El sistema debe soportar paginación (default 20, max 100 items)** |
| **RF-3.14** | **El sistema debe mostrar animales de todas las organizaciones activas** |

### RF-4: Formulario de Adopción

| ID | Requerimiento |
|----|---------------|
| RF-4.1 | El sistema debe presentar formulario de adopción con 17 campos |
| RF-4.2 | El sistema debe validar edad ≥18 años |
| RF-4.3 | El sistema debe validar formato de email y teléfono |
| RF-4.4 | El sistema debe validar campos obligatorios antes de enviar |
| RF-4.5 | El sistema debe guardar solicitud vinculada al animal consultado |
| RF-4.6 | El sistema debe mostrar mensaje de confirmación después de enviar |
| RF-4.7 | El sistema debe requerir aceptación del compromiso de castración |
| **RF-4.8** | **El sistema debe aplicar rate limiting (10 solicitudes/hora por IP)** |
| **RF-4.9** | **El sistema debe prevenir duplicados (mismo email+animal en 7 días = actualización)** |

### RF-5: Gestión de Solicitudes

| ID | Requerimiento |
|----|---------------|
| RF-5.1 | El sistema debe mostrar bandeja con todas las solicitudes recibidas |
| RF-5.2 | El sistema debe **filtrar solicitudes por organización del admin** |
| RF-5.3 | El sistema debe permitir ver detalle completo de cada solicitud |
| RF-5.4 | El sistema debe mostrar todos los 17 campos |
| RF-5.5 | El sistema debe destacar datos de contacto del adoptante |
| RF-5.6 | El sistema debe permitir **cambiar estado de solicitud (Nueva/En revisión/Aprobada/Rechazada)** |
| **RF-5.7** | **El sistema debe permitir filtrar solicitudes por estado y por animal** |

### RF-6: Notificaciones

| ID | Requerimiento |
|----|---------------|
| RF-6.1 | El sistema debe enviar email al admin cuando llega nueva solicitud |
| RF-6.2 | El email al admin debe incluir datos clave del adoptante |
| RF-6.3 | Los emails deben enviarse en menos de 10 minutos |
| **RF-6.4** | **El email debe enviarse a la organización correspondiente (no global)** |

### RF-7: Almacenamiento de Imágenes

| ID | Requerimiento |
|----|---------------|
| RF-7.1 | El sistema debe permitir carga múltiple de imágenes (hasta 5 por animal) |
| RF-7.2 | El sistema debe validar tamaño máximo por imagen **(5MB)** |
| RF-7.3 | El sistema debe validar formatos JPG, JPEG, PNG, WEBP |
| RF-7.4 | El sistema debe permitir eliminar imágenes desde el admin |
| **RF-7.5** | **El sistema debe almacenar imágenes en Cloudinary** |
| **RF-7.6** | **El sistema debe aplicar transformaciones automáticas (resize, auto quality)** |

### **RF-8: Dashboard y Estadísticas** *(NUEVO)*

| ID | Requerimiento |
|----|---------------|
| **RF-8.1** | **El sistema debe mostrar total de animales por organización** |
| **RF-8.2** | **El sistema debe mostrar animales agrupados por estado** |
| **RF-8.3** | **El sistema debe mostrar total de solicitudes** |
| **RF-8.4** | **El sistema debe mostrar solicitudes agrupadas por estado** |
| **RF-8.5** | **El sistema debe calcular tasa de adopción** |
| **RF-8.6** | **El sistema debe mostrar métricas temporales (últimos 7/30 días)** |

### **RF-9: Gestión de Organizaciones** *(NUEVO)*

| ID | Requerimiento |
|----|---------------|
| **RF-9.1** | **El sistema debe permitir crear organizaciones (Super Admin)** |
| **RF-9.2** | **El sistema debe permitir activar/desactivar organizaciones** |
| **RF-9.3** | **El sistema debe permitir editar perfil de organización (admin propio)** |
| **RF-9.4** | **El sistema debe mostrar perfil público de organización por slug** |
| **RF-9.5** | **Cada organización debe tener: nombre, slug, email, teléfono, WhatsApp, dirección, logo, descripción, redes sociales, datos de donación** |

### **RF-10: Casos de Éxito** *(NUEVO)*

| ID | Requerimiento |
|----|---------------|
| **RF-10.1** | **El sistema debe permitir crear casos de éxito vinculados a animales adoptados** |
| **RF-10.2** | **El sistema debe permitir subir fotos actuales del animal** |
| **RF-10.3** | **El sistema debe mostrar casos de éxito públicamente** |
| **RF-10.4** | **El sistema debe agrupar casos de éxito por organización** |

### **RF-11: Solicitudes de Contacto** *(NUEVO)*

| ID | Requerimiento |
|----|---------------|
| **RF-11.1** | **El sistema debe permitir a rescatistas enviar solicitud para unirse** |
| **RF-11.2** | **El sistema debe capturar: nombre refugio, contacto, email, teléfono, ciudad, descripción, redes, cantidad de animales** |
| **RF-11.3** | **El Super Admin debe poder gestionar estas solicitudes (aprobar/rechazar)** |
| **RF-11.4** | **El sistema debe aplicar rate limiting (5 solicitudes/día por IP)** |

### **RF-12: Auditoría** *(NUEVO)*

| ID | Requerimiento |
|----|---------------|
| **RF-12.1** | **El sistema debe registrar todas las acciones importantes (CREATE, UPDATE, DELETE, LOGIN, STATUS_CHANGE)** |
| **RF-12.2** | **El sistema debe guardar valores anteriores y nuevos en cada cambio** |
| **RF-12.3** | **El sistema debe registrar IP y User-Agent** |
| **RF-12.4** | **El sistema debe sanitizar datos sensibles (no guardar contraseñas)** |

---

## REQUERIMIENTOS NO FUNCIONALES (RNF)

### RNF-1: Rendimiento

| ID | Requerimiento | Métrica |
|----|---------------|---------|
| RNF-1.1 | El catálogo debe cargar imágenes con lazy loading | Solo cargar imágenes visibles |
| RNF-1.2 | Las consultas a BD deben ejecutarse en menos de 500ms | <500ms promedio |
| RNF-1.3 | El sistema debe soportar al menos 50 usuarios concurrentes | 50 conexiones simultáneas sin degradación |
| **RNF-1.4** | **El sistema debe aplicar paginación para evitar sobrecarga** | **Max 100 items por request** |

### RNF-2: Usabilidad

| ID | Requerimiento | Métrica |
|----|---------------|---------|
| RNF-2.1 | El diseño debe ser mobile-first y completamente responsive | Funcional en 360px-1920px |
| RNF-2.2 | El formulario de adopción debe organizarse en secciones lógicas | Máximo 5-6 campos visibles por sección |
| RNF-2.3 | Los mensajes de error deben ser claros y específicos | Indicar qué está mal y cómo corregirlo |
| RNF-2.4 | La interfaz debe ser intuitiva sin necesidad de manual | Usuario logra objetivo en máximo 3 clics |
| RNF-2.5 | El sistema debe funcionar correctamente en Chrome, Firefox, Edge | Últimas versiones de cada navegador |

### RNF-3: Seguridad

| ID | Requerimiento | Métrica |
|----|---------------|---------|
| RNF-3.1 | Las contraseñas deben almacenarse hasheadas con bcrypt | Factor de costo ≥10 |
| RNF-3.2 | Los tokens JWT deben expirar | Expiración a las 24 horas |
| RNF-3.3 | Las rutas protegidas deben validar token en cada petición | Validación en middleware |
| RNF-3.4 | Los inputs deben sanitizarse para prevenir inyección SQL y XSS | Validación y sanitización en backend |
| RNF-3.5 | Las conexiones deben usar HTTPS en producción | Certificado SSL válido |
| **RNF-3.6** | **El sistema debe aplicar rate limiting en endpoints sensibles** | **Login: 5/15min, Solicitudes: 10/hora** |
| **RNF-3.7** | **El sistema debe usar headers de seguridad (Helmet)** | **HSTS, X-Frame-Options, etc.** |

### **RNF-4: Disponibilidad** *(NUEVO)*

| ID | Requerimiento | Métrica |
|----|---------------|---------|
| **RNF-4.1** | **El sistema debe estar disponible 24/7** | **Deploy en Render (auto-scaling)** |
| **RNF-4.2** | **El sistema debe tener endpoint de health check** | **/api/health responde OK** |

---

## REGLAS DE NEGOCIO (Actualizadas)

| ID | Regla Original | **Regla Actualizada** |
|----|----------------|----------------------|
| RN-01 | Solo existe 1 usuario administrador | **Múltiples administradores por organización** |
| RN-02 | Un animal debe tener mínimo 1 foto y máximo 5 | Sin cambios |
| RN-03 | Una foto debe estar marcada como "principal" | Sin cambios |
| RN-04 | Las fotos no pueden exceder 2MB | **Las fotos no pueden exceder 5MB** |
| RN-05 | Un animal solo puede estar en un estado a la vez | Sin cambios |
| RN-06 | Estados válidos: Disponible, En proceso, Adoptado, En tránsito | Sin cambios |
| RN-07 | Estado "Adoptado" es final | Sin cambios (se puede crear Caso de Éxito) |
| RN-08 | Solo animales visibles se muestran en catálogo | **Solo de organizaciones activas** |
| RN-09 | Edad del adoptante debe ser ≥18 años | Sin cambios |
| RN-10 | Email y teléfono deben tener formato válido | Sin cambios |
| RN-11 | Compromiso de castración obligatorio si no está castrado | Sin cambios |
| RN-12 | Solicitud siempre vinculada a un animal específico | Sin cambios |
| RN-13 | Solicitudes nuevas disparan email automático | **Al email de la organización** |
| RN-14 | Solicitudes ordenadas por fecha (recientes primero) | Sin cambios |
| RN-15 | No eliminar animales con solicitudes asociadas | **Soft delete preserva datos** |
| RN-16 | Sesión expira después de 24 horas | Sin cambios |
| RN-17 | Contraseñas hasheadas con bcrypt | Sin cambios |
| RN-18 | Campos obligatorios completos antes de guardar | Sin cambios |
| RN-19 | No eliminar admin con animales asociados | Sin cambios |
| **RN-20** | **Cada animal pertenece a una única organización** | *NUEVO* |
| **RN-21** | **Admins solo acceden a datos de su organización** | *NUEVO* |
| **RN-22** | **Super Admin accede a todos los datos** | *NUEVO* |
| **RN-23** | **Organizaciones inactivas no pueden operar** | *NUEVO* |
| **RN-24** | **Solicitud duplicada (mismo email+animal en 7 días) se actualiza** | *NUEVO* |

---

## DIAGRAMA DE ARQUITECTURA

[IMAGEN - REQUIERE ACTUALIZACIÓN: El diagrama original no incluía multi-tenancy]

### Arquitectura Actualizada (Descripción):

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND                                  │
│  ┌─────────────────┐  ┌─────────────────┐                       │
│  │   Sitio Público │  │  Panel Admin    │   Deploy: VERCEL      │
│  │   (Next.js)     │  │  (Next.js)      │                       │
│  └────────┬────────┘  └────────┬────────┘                       │
└───────────┼────────────────────┼────────────────────────────────┘
            │                    │
            ▼                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                     API BACKEND (Express.js)                     │
│                     Deploy: RENDER                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │
│  │ Auth (JWT)   │  │ Rate Limiter │  │ Validators   │           │
│  └──────────────┘  └──────────────┘  └──────────────┘           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │
│  │ Controllers  │  │ Services     │  │ Audit Logger │           │
│  └──────────────┘  └──────────────┘  └──────────────┘           │
└─────────────────────────────┬───────────────────────────────────┘
                              │
            ┌─────────────────┼─────────────────┐
            ▼                 ▼                 ▼
┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
│   SUPABASE       │ │   CLOUDINARY     │ │   SMTP/EMAIL     │
│   (PostgreSQL)   │ │   (Imágenes)     │ │   (Nodemailer)   │
└──────────────────┘ └──────────────────┘ └──────────────────┘
```

---

## DIAGRAMA ENTIDAD-RELACIÓN

[IMAGEN - REQUIERE ACTUALIZACIÓN: El diagrama original no incluía Organizacion, CasoExito, SolicitudContacto ni AuditLog]

### Entidades del Sistema (Actualizado):

#### **ENTIDAD: ORGANIZACION** *(NUEVA)*

Representa cada refugio/rescatista que opera en la plataforma.

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| **id** | INTEGER | PRIMARY KEY, AUTO_INCREMENT | Identificador único |
| **nombre** | VARCHAR(200) | NOT NULL | Nombre de la organización |
| **slug** | VARCHAR(100) | UNIQUE, NOT NULL | URL amigable (ej: "huellas-parana") |
| **email** | VARCHAR(150) | UNIQUE, NOT NULL | Email de contacto |
| **telefono** | VARCHAR(50) | NULL | Teléfono de contacto |
| **whatsapp** | VARCHAR(50) | NULL | WhatsApp de contacto |
| **direccion** | VARCHAR(255) | NULL | Dirección física |
| **logo_url** | VARCHAR(500) | NULL | URL del logo |
| **descripcion** | TEXT | NULL | Descripción de la organización |
| **instagram** | VARCHAR(100) | NULL | Usuario de Instagram |
| **facebook** | VARCHAR(200) | NULL | URL de Facebook |
| **donacion_alias** | VARCHAR(100) | NULL | Alias para donaciones |
| **donacion_cbu** | VARCHAR(50) | NULL | CBU para transferencias |
| **donacion_info** | TEXT | NULL | Información adicional de donaciones |
| **activa** | BOOLEAN | DEFAULT TRUE | Si la organización está activa |
| **fecha_creacion** | TIMESTAMP | DEFAULT NOW() | Fecha de creación |

---

#### ENTIDAD: ADMINISTRADOR (Actualizado)

Representa usuarios que gestionan la plataforma.

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| id | INTEGER | PRIMARY KEY, AUTO_INCREMENT | Identificador único |
| **organizacion_id** | **INTEGER** | **FK → ORGANIZACION(id), NOT NULL** | **Organización a la que pertenece** |
| username | VARCHAR(50) | UNIQUE, NOT NULL | Nombre de usuario |
| password_hash | VARCHAR(255) | NOT NULL | Contraseña hasheada |
| email | VARCHAR(100) | UNIQUE, NOT NULL | Email del administrador |
| **es_super_admin** | **BOOLEAN** | **DEFAULT FALSE** | **Si es super administrador** |
| fecha_creacion | TIMESTAMP | DEFAULT NOW() | Fecha de creación |
| ultimo_acceso | TIMESTAMP | NULL | Último login |

---

#### ENTIDAD: ANIMAL (Actualizado)

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| id | INTEGER | PRIMARY KEY | Identificador único |
| **organizacion_id** | **INTEGER** | **FK → ORGANIZACION(id), NOT NULL** | **Organización propietaria** |
| administrador_id | INTEGER | FK → ADMINISTRADOR(id), NOT NULL | Quién cargó el animal |
| nombre | VARCHAR(100) | NOT NULL | Nombre del animal |
| especie | VARCHAR(20) | NOT NULL, CHECK IN ('Perro', 'Gato') | Especie |
| sexo | VARCHAR(10) | NOT NULL, CHECK IN ('Macho', 'Hembra') | Sexo |
| edad_aproximada | VARCHAR(50) | NOT NULL | Edad estimada |
| tamanio | VARCHAR(20) | NOT NULL, CHECK IN ('Pequeño', 'Mediano', 'Grande') | Tamaño |
| raza_mezcla | VARCHAR(100) | NULL | Raza específica o "Mestizo" |
| descripcion_historia | TEXT | NOT NULL | Historia completa del rescate |
| estado_castracion | BOOLEAN | DEFAULT FALSE | Si está castrado |
| estado_vacunacion | VARCHAR(200) | NULL | Estado de vacunación |
| estado_desparasitacion | BOOLEAN | DEFAULT FALSE | Si está desparasitado |
| socializa_perros | BOOLEAN | DEFAULT FALSE | Se lleva bien con perros |
| socializa_gatos | BOOLEAN | DEFAULT FALSE | Se lleva bien con gatos |
| socializa_ninos | BOOLEAN | DEFAULT FALSE | Se lleva bien con niños |
| necesidades_especiales | TEXT | NULL | Cuidados especiales |
| tipo_hogar_ideal | VARCHAR(200) | NULL | Tipo de hogar recomendado |
| estado | VARCHAR(20) | DEFAULT 'Disponible' | Estado de adopción |
| publicado_por | VARCHAR(100) | NOT NULL | Nombre del rescatista |
| contacto_rescatista | VARCHAR(200) | NOT NULL | Instagram/WhatsApp |
| foto_principal | VARCHAR(255) | NOT NULL | URL foto principal |
| foto_2 a foto_5 | VARCHAR(255) | NULL | URLs fotos adicionales |
| fecha_publicacion | TIMESTAMP | DEFAULT NOW() | Fecha de publicación |
| fecha_actualizacion | TIMESTAMP | ON UPDATE NOW() | Última modificación |
| **deleted_at** | **TIMESTAMP** | **NULL** | **Fecha de soft delete** |

---

#### ENTIDAD: SOLICITUD_ADOPCION (Sin cambios estructurales mayores)

Se mantiene igual que en MVP 1.0, con la adición del índice único:
- **UNIQUE INDEX: [animal_id, email]** - Previene duplicados

---

#### **ENTIDAD: CASO_EXITO** *(NUEVA)*

Historias de adopciones exitosas.

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| **id** | INTEGER | PRIMARY KEY | Identificador único |
| **animal_id** | INTEGER | FK → ANIMAL(id), UNIQUE | Animal adoptado |
| **organizacion_id** | INTEGER | FK → ORGANIZACION(id) | Organización |
| **titulo** | VARCHAR(200) | NOT NULL | Título de la historia |
| **historia** | TEXT | NOT NULL | Relato de la adopción |
| **foto_actual_1** | VARCHAR(500) | NULL | Foto actual del animal |
| **foto_actual_2** | VARCHAR(500) | NULL | Foto adicional |
| **foto_actual_3** | VARCHAR(500) | NULL | Foto adicional |
| **fecha_adopcion** | DATE | NULL | Fecha de la adopción |
| **fecha_publicacion** | TIMESTAMP | DEFAULT NOW() | Fecha de publicación |

---

#### **ENTIDAD: SOLICITUD_CONTACTO** *(NUEVA)*

Solicitudes de rescatistas para unirse a la plataforma.

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| **id** | INTEGER | PRIMARY KEY | Identificador único |
| **nombre_refugio** | VARCHAR(200) | NOT NULL | Nombre del refugio |
| **nombre_contacto** | VARCHAR(100) | NOT NULL | Persona de contacto |
| **email** | VARCHAR(150) | NOT NULL | Email de contacto |
| **telefono** | VARCHAR(50) | NOT NULL | Teléfono |
| **ciudad** | VARCHAR(100) | NOT NULL | Ciudad donde opera |
| **descripcion** | TEXT | NULL | Descripción del refugio |
| **instagram** | VARCHAR(100) | NULL | Instagram |
| **facebook** | VARCHAR(200) | NULL | Facebook |
| **cantidad_animales** | INTEGER | NULL | Cantidad aproximada de animales |
| **estado** | VARCHAR(20) | DEFAULT 'Pendiente' | Estado (Pendiente/Aprobada/Rechazada) |
| **notas_admin** | TEXT | NULL | Notas del Super Admin |
| **fecha_solicitud** | TIMESTAMP | DEFAULT NOW() | Fecha de envío |
| **fecha_respuesta** | TIMESTAMP | NULL | Fecha de respuesta |

---

#### **ENTIDAD: AUDIT_LOG** *(NUEVA)*

Registro de auditoría del sistema.

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| **id** | INTEGER | PRIMARY KEY | Identificador único |
| **action** | VARCHAR(50) | NOT NULL | Tipo de acción (CREATE, UPDATE, DELETE, LOGIN, STATUS_CHANGE) |
| **entity_type** | VARCHAR(50) | NOT NULL | Tipo de entidad afectada |
| **entity_id** | INTEGER | NULL | ID de la entidad |
| **admin_id** | INTEGER | FK → ADMINISTRADOR(id) | Quién realizó la acción |
| **admin_username** | VARCHAR(50) | NULL | Username del admin |
| **organizacion_id** | INTEGER | NULL | Organización |
| **old_values** | JSON | NULL | Valores anteriores |
| **new_values** | JSON | NULL | Valores nuevos |
| **ip_address** | VARCHAR(50) | NULL | IP del cliente |
| **user_agent** | VARCHAR(500) | NULL | User-Agent del navegador |
| **timestamp** | TIMESTAMP | DEFAULT NOW() | Fecha y hora |

---

## RELACIONES ENTRE ENTIDADES (Actualizado)

### 1. ORGANIZACION → ADMINISTRADOR (1:N)
- Una organización tiene muchos administradores
- Cada administrador pertenece a una organización
- ON DELETE: RESTRICT

### 2. ORGANIZACION → ANIMAL (1:N)
- Una organización tiene muchos animales
- Cada animal pertenece a una organización
- ON DELETE: RESTRICT

### 3. ADMINISTRADOR → ANIMAL (1:N)
- Un administrador puede cargar múltiples animales
- Cada animal fue cargado por un administrador
- ON DELETE: RESTRICT

### 4. ANIMAL → SOLICITUD_ADOPCION (1:N)
- Un animal puede recibir múltiples solicitudes
- Cada solicitud corresponde a un animal
- ON DELETE: CASCADE

### **5. ANIMAL → CASO_EXITO (1:1)** *(NUEVO)*
- Un animal adoptado puede tener un caso de éxito
- Cada caso de éxito corresponde a un animal
- ON DELETE: CASCADE

### **6. ORGANIZACION → CASO_EXITO (1:N)** *(NUEVO)*
- Una organización tiene muchos casos de éxito
- Cada caso pertenece a una organización
- ON DELETE: CASCADE

---

## STACK TECNOLÓGICO

### **Backend** *(Actualizado)*

| Componente | Tecnología Original | **Tecnología Implementada** |
|------------|---------------------|----------------------------|
| Runtime | Node.js | Node.js |
| Framework | Express.js | Express.js |
| ORM | - | **Prisma** |
| Base de datos | PostgreSQL | **PostgreSQL (Supabase)** |
| Autenticación | JWT | JWT |
| Hash contraseñas | bcrypt | bcrypt |
| **Rate Limiting** | - | **express-rate-limit** |
| **Seguridad** | - | **Helmet** |
| **Validación** | - | **express-validator** |
| **Imágenes** | Cloudinary | Cloudinary |
| **Email** | - | **Nodemailer** |

### **Frontend** *(Referencia)*

| Componente | Tecnología |
|------------|------------|
| Framework | Next.js |
| Styling | Tailwind CSS |
| **Deploy** | **Vercel** |

### **Infraestructura** *(NUEVO)*

| Componente | Servicio |
|------------|----------|
| **Backend hosting** | **Render** |
| **Frontend hosting** | **Vercel** |
| **Base de datos** | **Supabase (PostgreSQL)** |
| **Imágenes** | **Cloudinary** |
| **Email** | **SMTP (configurable)** |

---

## ENDPOINTS API (Resumen)

### Públicos (sin autenticación)
- `GET /api/animals` - Listar animales con filtros
- `GET /api/animals/:id` - Detalle de animal
- `POST /api/adoption-requests` - Enviar solicitud adopción
- `GET /api/organization/:slug` - Perfil público organización
- `GET /api/casos-exito` - Listar casos de éxito
- `POST /api/contact-requests` - Solicitud de rescatista
- `GET /api/health` - Health check

### Protegidos (requieren JWT)
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Datos del admin actual
- `POST /api/animals` - Crear animal
- `PUT /api/animals/:id` - Editar animal
- `PATCH /api/animals/:id/status` - Cambiar estado
- `DELETE /api/animals/:id` - Eliminar (soft delete)
- `GET /api/adoption-requests` - Listar solicitudes
- `PATCH /api/adoption-requests/:id` - Actualizar estado
- `GET /api/dashboard/stats` - Estadísticas
- `GET /api/organization` - Mi organización
- `PUT /api/organization` - Editar mi organización
- `POST /api/casos-exito` - Crear caso de éxito
- `PUT /api/casos-exito/:id` - Editar caso
- `DELETE /api/casos-exito/:id` - Eliminar caso
- `POST /api/upload` - Subir imagen
- `DELETE /api/upload/:publicId` - Eliminar imagen

### **Super Admin** *(NUEVO)*
- `GET /api/super-admin/organizations` - Listar todas
- `POST /api/super-admin/organizations` - Crear organización
- `PUT /api/super-admin/organizations/:id/toggle` - Activar/desactivar
- `DELETE /api/super-admin/organizations/:id` - Eliminar
- `GET /api/super-admin/contact-requests` - Solicitudes de contacto
- `PUT /api/super-admin/contact-requests/:id` - Gestionar solicitud

---

## VARIABLES DE ENTORNO

```env
# Base de datos
DATABASE_URL="postgresql://..."

# JWT
JWT_SECRET="..."
JWT_EXPIRES_IN="24h"

# Cloudinary
CLOUDINARY_CLOUD_NAME="..."
CLOUDINARY_API_KEY="..."
CLOUDINARY_API_SECRET="..."

# Email
SMTP_HOST="..."
SMTP_PORT="..."
SMTP_USER="..."
SMTP_PASS="..."
ADMIN_EMAIL="..."

# Frontend
FRONTEND_URL="https://..."

# Entorno
NODE_ENV="production"
```

---

## CRITERIOS DE ACEPTACIÓN (Actualizados)

- [x] Aplicación web desplegada y accesible
- [x] Rescatista pueda cargar animales con galería de fotos
- [x] Adoptantes naveguen catálogo con detalles completos
- [x] Formulario capture 17 campos identificados
- [x] Solicitudes lleguen correctamente al administrador
- [x] Diseño completamente responsive
- [x] Feedback positivo del rescatista piloto
- [x] TFI aprobado
- **[x] Multi-tenancy funcionando correctamente**
- **[x] Super Admin puede gestionar organizaciones**
- **[x] Dashboard con estadísticas en tiempo real**
- **[x] Filtros de búsqueda operativos**
- **[x] Casos de éxito publicables**
- **[x] Sistema de auditoría registrando acciones**
- **[x] Rate limiting protegiendo endpoints**
- **[x] Deploy exitoso en Render/Vercel/Supabase**

---

## CONCLUSIÓN

Este documento **MVP 2.0** refleja la implementación real del backend de la Plataforma de Adopción de Animales. Se expandió significativamente el alcance original para incluir:

1. **Arquitectura multi-tenant** que permite a múltiples organizaciones operar independientemente
2. **Sistema de roles** con Super Admin para gestión de la plataforma
3. **Dashboard con métricas** para toma de decisiones
4. **Filtros avanzados** para mejor experiencia de usuario
5. **Casos de éxito** para mostrar impacto social
6. **Sistema de auditoría** para trazabilidad
7. **Medidas de seguridad** adicionales (rate limiting, soft delete)
8. **Infraestructura cloud** moderna (Render + Vercel + Supabase)

La plataforma está lista para producción y escalable para incorporar nuevas organizaciones según la demanda.

---

*Documento generado comparando el MVP original con el código implementado*
*Cambios y agregados marcados en **negrita***
