# clientes-frontend-hexagonal-ia

Frontend **React 18** (CRA / `react-scripts`, JS puro sin TypeScript) para el **ABM de Clientes con autenticación JWT**, consumiendo el backend hexagonal (`clientes-backend-hexagonal-ia`) en `http://localhost:8080`.

---

## 1. Estructura

```
clientes-frontend-hexagonal-ia/
├── package.json                    # React 18.3 + react-scripts 5.0.1 + axios
├── public/
│   └── index.html
└── src/
    ├── index.js                    # Punto de entrada (ReactDOM.createRoot)
    ├── App.js                      # Token en localStorage → ABM; sin token → Login/Registro
    ├── components/
    │   ├── Login/Login.js          # Formulario login + link a registro (401 → mensaje)
    │   ├── Registro/Registro.js    # Formulario de registro (409 email duplicado → mensaje)
    │   ├── ClienteForm/ClienteForm.js# Formulario crear/editar con validaciones (400/409)
    │   └── ClienteList/ClienteList.js# Tabla con editar/eliminar y filtro por estado
    ├── services/
    │   ├── AuthService.js          # login, registro, saveToken, getToken (localStorage),
    │   │                           # logout, isAuthenticated
    │   └── ClienteService.js        # Axios con interceptor que agrega
    │                               # "Authorization: Bearer <token>" + logout automático en 401
    └── styles/                     # CSS moderno y responsive
        ├── App.css                 # Globales: layout, header, botones, alertas, formularios
        ├── Login.css               # Pantalla de autenticación
        ├── Registro.css            # (reutiliza Login.css)
        ├── ClienteForm.css          # Grilla del formulario
        └── ClienteList.css          # Tabla, badges de estado, responsive
```

## 2. Comportamiento

- **Sin token** → pantalla de **Login** (con link a **Registro**).
- **Registro** (`POST /api/usuarios/registro`) → 201 con token JWT → se guarda en `localStorage` y entra al ABM.
- **Login** (`POST /api/usuarios/login`) → 200 con token JWT → entra al ABM.
- **ABM**: formulario crear/editar + tabla con **Editar**/**Eliminar** y filtro por estado (TODOS/ACTIVO/INACTIVO).
- **Cerrar sesión** → borra el token de `localStorage` y vuelve al login.
- **Interceptor de Axios**:
  - Request: agrega `Authorization: Bearer <token>` a cada llamada.
  - Response: si llega **401** (token inválido/expirado) → **logout automático** y vuelve al login.

## 3. Manejo de errores (mapeados del `GlobalExceptionHandler` del backend)

| Código | Causa | Comportamiento en la UI |
|--------|-------|------------------------|
| 400 | Validaciones (campos vacíos, email mal formado, estado inválido) | Mensaje en el formulario |
| 401 | Credenciales incorrectas o token inválido/expirado | Mensaje / logout automático |
| 403 | Sin sesión válida en ruta protegida | Vuelve al login |
| 404 | Cliente inexistente | Mensaje + recarga del listado |
| 409 | Email duplicado (registro o cliente) | Mensaje en el formulario |

## 4. Ejecución

```powershell
# Desde d:\desarrollo\repo\clientes-frontend-hexagonal-ia
npm install    # solo la primera vez
npm start      # -> http://localhost:3000
```

> Requiere el backend corriendo en `http://localhost:8080` (ver README del backend).
> El backend ya tiene CORS habilitado para `http://localhost:3000`.

## 5. Usuarios de prueba

```powershell
# Registrar un usuario desde la UI (botón "Registrate acá")
# o por API:
curl.exe -s -X POST -H "Content-Type: application/json" `
  -d "{`"nombre`":`"Admin`",`"email`":`"admin@escuela.com`",`"password`":`"secreto123`"}" `
  http://localhost:8080/api/usuarios/registro
```
