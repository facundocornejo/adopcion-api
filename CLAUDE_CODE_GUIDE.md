# CLAUDE_CODE_GUIDE.md - Cómo usar Claude Code para este proyecto

## ¿Qué es Claude Code?

Claude Code es una herramienta de terminal que te permite trabajar con Claude directamente en tu código. En vez de copiar y pegar código entre la web y tu editor, Claude Code puede:

- Ver y editar tus archivos directamente
- Ejecutar comandos en tu terminal
- Crear archivos nuevos
- Correr tu proyecto y ver errores

---

## Paso 1: Instalación de Claude Code

### Requisitos previos
1. **Node.js** instalado (v18 o superior)
2. **Una cuenta de Anthropic** con acceso a la API (o cuenta Pro de Claude)

### Verificar Node.js
```bash
node --version
# Debería mostrar v18.x.x o v20.x.x o superior
```

### Instalar Claude Code
```bash
npm install -g @anthropic-ai/claude-code
```

### Verificar instalación
```bash
claude --version
```

### Autenticarte
```bash
claude auth
# Seguí las instrucciones para vincular tu cuenta
```

---

## Paso 2: Preparar tu proyecto

### Crear la carpeta del proyecto
```bash
mkdir adopcion-api
cd adopcion-api
```

### Copiar los documentos de contexto
Copiá los archivos que te generé (REQUIREMENTS.md, CONTEXT.md, API_CONTRACT.md) dentro de la carpeta del proyecto.

Tu estructura inicial debería ser:
```
adopcion-api/
├── REQUIREMENTS.md
├── CONTEXT.md
└── API_CONTRACT.md
```

---

## Paso 3: Iniciar Claude Code

Dentro de la carpeta del proyecto:
```bash
claude
```

Esto abre una sesión interactiva donde podés hablar con Claude.

---

## Paso 4: Darle contexto a Claude Code

Cuando inicies la sesión, lo primero es darle contexto. Escribí algo así:

```
Hola Claude. Estoy desarrollando el backend de una plataforma de adopción de animales.
Este es mi primer proyecto backend, así que necesito que me expliques cada paso.

Tengo tres documentos en este directorio:
- REQUIREMENTS.md: Los requerimientos funcionales
- CONTEXT.md: Explicaciones de las tecnologías
- API_CONTRACT.md: El contrato JSON de la API

Por favor leé estos archivos para entender el proyecto.
Después vamos a inicializar el proyecto Node.js paso a paso.
```

Claude va a leer los archivos y entender el contexto completo.

---

## Paso 5: Flujo de trabajo recomendado

### Cómo pedirle cosas a Claude Code

**❌ NO hagas esto:**
```
Haceme todo el backend
```

**✅ SÍ hacé esto:**
```
Vamos a inicializar el proyecto Node.js.
Explicame qué hace cada comando antes de ejecutarlo.
Empezá con npm init.
```

### El patrón de trabajo ideal

1. **Pedí UNA cosa a la vez**
2. **Pedí que te explique antes de hacer**
3. **Revisá lo que hizo antes de continuar**
4. **Si no entendés algo, preguntá**

### Ejemplo de sesión buena

```
Vos: Quiero crear el archivo package.json. ¿Qué es y para qué sirve?

Claude: [explica qué es package.json]

Vos: Ok, entendido. Crealo con las dependencias que necesitamos.

Claude: [crea el archivo y explica cada dependencia]

Vos: ¿Por qué pusiste "express": "^4.18.2"? ¿Qué significa el ^?

Claude: [explica versionado semántico]

Vos: Perfecto, ahora instalá las dependencias.

Claude: [ejecuta npm install]
```

---

## Paso 6: Comandos útiles de Claude Code

### Durante la sesión

| Comando | Qué hace |
|---------|----------|
| `/help` | Muestra ayuda |
| `/clear` | Limpia el historial de la conversación |
| `/exit` | Sale de Claude Code |

### Cómo pedirle que haga cosas

**Ver un archivo:**
```
Mostrá el contenido de src/app.js
```

**Crear un archivo:**
```
Creá el archivo src/config/database.js con la configuración de Prisma
```

**Editar un archivo:**
```
En src/app.js, agregá el middleware de CORS
```

**Ejecutar comandos:**
```
Ejecutá npm install express
```

**Ver errores:**
```
Corré npm run dev y decime si hay errores
```

---

## Paso 7: Orden de implementación sugerido

Seguí este orden, pidiendo UNA cosa a la vez:

### Sesión 1: Setup inicial
1. "Inicializá el proyecto con npm init"
2. "Instalá las dependencias que necesitamos"
3. "Creá la estructura de carpetas"
4. "Creá el archivo .env.example"
5. "Creá el archivo .gitignore"
6. "Creá el app.js básico que levante Express"
7. "Probemos que funciona con npm run dev"

### Sesión 2: Base de datos
1. "Configuremos Prisma para conectar a PostgreSQL"
2. "Creá el schema.prisma con las 3 tablas"
3. "Explicame cómo funcionan las migraciones"
4. "Ejecutá la migración"
5. "Creá un seed para el usuario admin"

### Sesión 3: Autenticación
1. "Creá la ruta POST /api/auth/login"
2. "Explicame cómo funciona JWT mientras lo hacés"
3. "Creá el middleware de verificación de token"
4. "Probemos el login con Postman/Thunder Client"

### Sesión 4: CRUD Animales
1. "Creá GET /api/animals"
2. "Creá GET /api/animals/:id"
3. "Creá POST /api/animals con validaciones"
4. "Creá PUT /api/animals/:id"
5. "Creá PATCH /api/animals/:id/status"
6. "Creá DELETE /api/animals/:id"

### Sesión 5: Imágenes y Solicitudes
1. "Configurá Cloudinary"
2. "Creá POST /api/upload"
3. "Creá POST /api/adoption-requests con las validaciones"
4. "Creá GET y PATCH para solicitudes"

### Sesión 6: Email y Deploy
1. "Configurá Nodemailer"
2. "Agregá el envío de email cuando llega solicitud"
3. "Preparemos el proyecto para producción"
4. "Deploy a Render"

---

## Consejos importantes

### 1. No tengas miedo de preguntar
```
No entiendo qué hace esta línea:
const { PrismaClient } = require('@prisma/client')

¿Me explicás?
```

### 2. Si algo falla, mostrá el error completo
```
Me da este error cuando corro npm run dev:
[pegá el error completo]

¿Qué significa y cómo lo soluciono?
```

### 3. Pedí que comente el código
```
En el controller que creaste, agregá comentarios explicando qué hace cada parte
```

### 4. Guardá checkpoints
Cada vez que algo funcione, hacé commit en Git:
```
Ya funciona el login. Hacé git add y commit con mensaje "feat: implementar autenticación JWT"
```

### 5. Si te perdés, pedí un resumen
```
¿En qué punto del proyecto estamos? 
¿Qué funciona y qué falta?
```

---

## Antes de empezar: Checklist

- [ ] Node.js instalado (`node --version`)
- [ ] Claude Code instalado (`npm install -g @anthropic-ai/claude-code`)
- [ ] Claude Code autenticado (`claude auth`)
- [ ] Carpeta del proyecto creada
- [ ] Documentos de contexto en la carpeta
- [ ] Cuenta en Supabase (https://supabase.com)
- [ ] Cuenta en Cloudinary (https://cloudinary.com)
- [ ] Postman o Thunder Client instalado (para probar la API)

---

## ¿Listo?

Una vez que tengas todo el checklist, abrí la terminal en la carpeta del proyecto y escribí:

```bash
claude
```

Y empezá con:

```
Hola Claude. Leé los archivos REQUIREMENTS.md, CONTEXT.md y API_CONTRACT.md 
para entender el proyecto. Después vamos a inicializar el proyecto paso a paso.
Explicame cada cosa que hagas porque estoy aprendiendo.
```

¡Éxitos! 🚀
