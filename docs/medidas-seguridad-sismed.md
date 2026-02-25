# Medidas de seguridad: JWT, cookies y HTTPS en SISMED

Este documento explica **por qué** debe aplicarse cada medida de seguridad en el sistema SISMED, en el contexto de su arquitectura actual y de los datos que maneja. No describe implementación en código; sirve como justificación y guía para el diseño seguro de la API y del frontend.

---

## Resumen ejecutivo

| Medida | Dónde aplica | Objetivo en SISMED |
|--------|--------------|--------------------|
| HTTPS (dev: cert. falsos; prod: reales) | Servidor / proxy | Cifrar credenciales y tokens en tránsito; evitar interceptación en red. |
| Cookie httpOnly | Configuración de la cookie (backend) | Impedir que JavaScript lea el token; reducir robo por XSS. |
| Cookie Secure | Configuración de la cookie | Enviar la cookie solo por HTTPS; evitar sniffing o downgrade. |
| Cookie SameSite (Lax) | Configuración de la cookie | Reducir riesgo CSRF en peticiones cross-site. |
| Tokens solo en cookies (no en JSON ni localStorage) | Respuesta login/refresh | Que el front nunca almacene el token; minimizar superficie de ataque XSS. |
| Rotación del refresh token | Simple JWT (config) | Limitar la ventana de uso de un refresh token robado. |
| Blacklist tras rotación | Simple JWT (config + app) | Invalidar el refresh token anterior en servidor. |
| Logout = blacklist + borrar cookies | Endpoint de logout | Asegurar que al cerrar sesión el token deje de ser válido. |
| Validación: cookie primero, Bearer respaldo | Autenticación en cada request | Soportar navegador (cookies) y clientes sin cookies (móvil, Postman). |
| CORS + Allow-Credentials | Backend CORS | Permitir envío de cookies desde el origen del front (Next.js). |
| No exponer token en JSON ni en logs | Respuestas y logging | Evitar fugas en historial, DevTools o sistemas de logs. |

---

## 1. Contexto del sistema SISMED

**SISMED** es un sistema de información para la gestión del servicio médico de una organización. Gestiona datos sensibles: historias clínicas, personas (incluyendo datos de contacto y de salud), citas médicas, personal sanitario, inventario de farmacia y medicamentos, antecedentes (alergias, medicación habitual, gineco-obstétricos, pediátricos, salud mental), exámenes de laboratorio y documentos asociados a las consultas. El tratamiento de esta información exige confidencialidad, integridad y control de acceso.

**Stack actual:** Backend en Django 5.2 con Django Rest Framework y PostgreSQL; las tablas se organizan por esquemas (`users`, `organization`, `medical_staff`, `appointments`, `medical_history`, `inventory`). El frontend previsto es Next.js, consumiendo una API REST que aún no está expuesta. Hoy solo existe el panel de administración de Django (`/admin`) protegido con sesiones; no hay JWT ni endpoints de login para la API. Los usuarios de negocio se almacenan en la tabla `users.usuarios` (username, contraseña). Cuando se implemente la API y el frontend, la autenticación se hará con tokens (por ejemplo JWT); ese mecanismo debe diseñarse de forma segura desde el inicio.

En este contexto, las medidas que se describen a continuación justifican **por qué** en SISMED es necesario: (1) cifrar todo el tráfico con HTTPS, (2) entregar y validar los tokens mediante cookies httpOnly y políticas adecuadas, (3) rotar y blacklistear refresh tokens y (4) no exponer tokens en respuestas ni en logs. El documento desarrolla cada punto en relación con este sistema concreto.

---

## 2. Medidas de seguridad y su justificación en SISMED

### 2.1 HTTPS: certificados en desarrollo (falsos/autofirmados) y en producción (reales)

**Qué es:** HTTPS cifra la comunicación entre el cliente (navegador o app) y el servidor. En desarrollo se suelen usar certificados autofirmados o generados con herramientas como mkcert para simular el mismo flujo que en producción. En producción se usan certificados emitidos por una autoridad de confianza (por ejemplo Let's Encrypt o certificados corporativos).

**Dónde aplica:** En el servidor que sirve la API (o en el proxy que termina HTTPS delante de Django). La configuración de cookies (por ejemplo el flag `Secure`) y la confianza del usuario en la conexión dependen de que el canal sea HTTPS.

**Por qué en SISMED:** En el login, el frontend enviará usuario y contraseña a la API; después, en cada petición, el navegador enviará las cookies con los tokens. Si la comunicación fuera solo HTTP, cualquiera con acceso a la red (Wi‑Fi compartido, proxy, hombre en el medio) podría leer credenciales y tokens en claro. En un sistema de servicio médico eso implica riesgo de suplantación de identidad y acceso a historias clínicas y datos personales. Usar HTTPS en desarrollo (aunque sea con certificados “falsos”) permite probar cookies `Secure`, redirecciones y flujos completos sin diferencias sorpresa al pasar a producción.

**Riesgo si no se aplica:** Interceptación de credenciales y tokens, suplantación de usuarios y acceso no autorizado a datos de salud, además de incumplimiento de buenas prácticas y posible normativa de protección de datos.

---

### 2.2 Cookie httpOnly

**Qué es:** El flag `httpOnly` en una cookie hace que el navegador la envíe automáticamente en las peticiones al dominio correspondiente pero **no** la exponga a JavaScript (`document.cookie` no la incluye). Solo el servidor puede establecerla y el navegador la envía por protocolo.

**Dónde aplica:** En la respuesta del backend cuando se hace `Set-Cookie` para el access token (y, si se usa cookie para el refresh, también para el refresh token). Por ejemplo en la configuración de Simple JWT o en vistas custom que devuelven tokens solo por cookie.

**Por qué en SISMED:** El frontend será una SPA (Next.js) que consume la API. Cualquier vulnerabilidad XSS (script inyectado por un fallo en sanitización, dependencia comprometida, etc.) podría intentar leer el token para enviarlo a un atacante. Si el token estuviera en `localStorage` o en memoria accesible desde JS, el atacante podría robarlo y suplantar al usuario. Con el token en una cookie httpOnly, el script malicioso no puede leerlo; el navegador envía la cookie solo en peticiones al mismo dominio (o al configurado por CORS y dominio de la cookie), reduciendo el impacto del XSS para el robo directo del token.

**Riesgo si no se aplica:** Un único XSS podría permitir robar el token y acceder a historias clínicas, citas y datos de personas en nombre del usuario afectado.

---

### 2.3 Cookie Secure

**Qué es:** El flag `Secure` en una cookie indica al navegador que solo la envíe por conexiones HTTPS. En peticiones HTTP la cookie no se envía.

**Dónde aplica:** En el mismo `Set-Cookie` que usa para el access (y refresh) token. En desarrollo, si se usa HTTP localmente, suele ponerse `Secure = False`; en producción debe ser siempre `True`.

**Por qué en SISMED:** Si la cookie no fuera `Secure`, en un entorno con HTTP y HTTPS (por error de configuración o downgrade) la cookie podría enviarse por HTTP y ser capturada. En un sistema con datos de salud, el canal debe ser cifrado en producción; la cookie con token es tan sensible como la contraseña y no debe viajar nunca en claro.

**Riesgo si no se aplica:** Exposición del token en redes no cifradas y posibilidad de robo de sesión si en algún momento la petición cae en HTTP.

---

### 2.4 Cookie SameSite (Lax)

**Qué es:** El atributo `SameSite` de una cookie controla cuándo el navegador la envía en peticiones “cross-site”. Con `Lax`, la cookie se envía en navegaciones de primer nivel (por ejemplo el usuario hace clic en un enlace a tu dominio) y en peticiones same-site; no se envía en peticiones cross-site iniciadas por otros sitios (por ejemplo un `fetch` o un `img` desde otro dominio). Con `Strict` la cookie solo se envía en contexto same-site; con `None` (y obligatorio `Secure`) se envía también en cross-site.

**Dónde aplica:** En la configuración de la cookie en el backend al hacer `Set-Cookie`.

**Por qué en SISMED:** Si un sitio externo malicioso intenta hacer una petición autenticada a la API de SISMED en nombre del usuario (ataque CSRF), con `SameSite=Lax` el navegador no enviará la cookie en esas peticiones cross-site iniciadas por ese sitio, reduciendo el riesgo. `Lax` suele ser un buen equilibrio: protege frente a CSRF típico y sigue permitiendo que el usuario llegue a la aplicación desde un enlace externo (por ejemplo desde un correo o un portal corporativo) con la cookie enviada en esa navegación de primer nivel.

**Riesgo si no se aplica:** Mayor superficie para ataques CSRF: un sitio malicioso podría provocar acciones en la API (por ejemplo crear o modificar datos) usando la sesión del usuario sin que este lo note.

**Nota en desarrollo:** Para que las cookies `SameSite=Lax` se envíen correctamente, usa el mismo host en frontend y backend (por ejemplo `localhost` en ambos). Evita mezclar `localhost` y `127.0.0.1`.

---

### 2.5 Tokens solo en cookies (no en el cuerpo JSON ni en localStorage)

**Qué es:** En login y refresh, el backend **no** devuelve los campos `access` ni `refresh` en el JSON de la respuesta; solo envía los tokens mediante cabeceras `Set-Cookie`. El frontend no lee ni guarda el token en memoria ni en `localStorage`; todas las peticiones a la API se hacen con `credentials: 'include'` para que el navegador envíe las cookies.

**Dónde aplica:** En las vistas o serializers que responden al login y al refresh (por ejemplo sobrescribiendo la respuesta por defecto de Simple JWT para eliminar el cuerpo con tokens y añadir solo las cookies).

**Por qué en SISMED:** Si el token viajara en el body del JSON, el frontend tendría que guardarlo en memoria o en `localStorage` para enviarlo en cada petición. Cualquier XSS podría entonces leer ese valor. Además, el token quedaría en el historial de respuestas en DevTools, en posibles copias de respuestas y en cualquier herramienta que registre el cuerpo de la respuesta. Al enviar el token únicamente por cookie httpOnly, el frontend no tiene acceso al valor del token; el navegador lo maneja de forma restringida y se reduce la superficie de ataque.

**Riesgo si no se aplica:** El token podría ser robado por XSS desde el almacenamiento o desde el cuerpo de la respuesta, y quedar expuesto en herramientas de desarrollo o en logs que capturen el body.

---

### 2.6 Rotación del refresh token

**Qué es:** En cada llamada al endpoint de refresh, el backend no solo emite un nuevo access token sino también un **nuevo** refresh token, y el refresh token anterior deja de ser válido para obtener nuevos pares (sobre todo si se combina con blacklist).

**Dónde aplica:** En la configuración de Simple JWT, por ejemplo `ROTATE_REFRESH_TOKENS = True`.

**Por qué en SISMED:** El refresh token tiene una vida más larga que el access token y permite obtener nuevos access tokens sin volver a pedir contraseña. Si alguien roba un refresh token (por ejemplo por un fallo puntual o por un dispositivo comprometido), con rotación ese token solo sirve hasta la próxima vez que el usuario legítimo haga refresh; después, el token robado deja de ser aceptado porque se ha emitido uno nuevo y el viejo se invalida. En un sistema con datos de salud, limitar la ventana de uso de un token robado es importante para contener el daño.

**Riesgo si no se aplica:** Un refresh token robado podría usarse durante toda su vigencia para generar access tokens y mantener sesiones ilegítimas.

---

### 2.7 Blacklist tras rotación

**Qué es:** Cuando se rota el refresh token, el token anterior se registra en una “lista negra” (blacklist) en el servidor. Cualquier petición de refresh que use ese token antiguo se rechaza aunque el token no haya expirado por tiempo.

**Dónde aplica:** En la configuración de Simple JWT (`BLACKLIST_AFTER_ROTATION = True`) y en la app `rest_framework_simplejwt.token_blacklist`, que mantiene las tablas donde se registran los tokens blacklisteados.

**Por qué en SISMED:** La rotación por sí sola invalida el token viejo en la lógica de negocio (solo el último refresh es válido); la blacklist hace que el servidor rechace explícitamente intentos de reutilizar ese token. Así se refuerza la política “un refresh válido, un uso” y se evita que un atacante con una copia del refresh anterior siga intentando refrescar. En un entorno con múltiples usuarios (personal médico, administración, etc.), poder invalidar tokens en servidor es fundamental.

**Riesgo si no se aplica:** Aunque se rote, sin blacklist podría haber ambigüedad o ventanas donde un token antiguo siga siendo aceptado según la implementación; la blacklist cierra esa posibilidad.

---

### 2.8 Logout = blacklist + borrar cookies

**Qué es:** El endpoint de logout hace dos cosas: (1) invalida el refresh token del usuario (lo añade a la blacklist o marca la sesión como cerrada) para que no pueda volver a usarse, y (2) responde con cabeceras `Set-Cookie` que borran las cookies del access y del refresh (por ejemplo `max_age=0` o fecha de expiración pasada). El frontend solo llama a ese endpoint con `credentials: 'include'` y redirige al login; no necesita borrar nada en JavaScript.

**Dónde aplica:** En una vista o endpoint dedicado (por ejemplo `POST /api/auth/logout/`) que reciba la petición con la cookie, blacklistee el refresh token y devuelva las instrucciones para borrar las cookies.

**Por qué en SISMED:** Si el usuario cierra sesión pero el token sigue siendo válido en el backend, quien tenga una copia del token (por ejemplo en otra pestaña, en un script o en un dispositivo) podría seguir accediendo a la API. En un servicio médico, el cierre de sesión debe implicar que esa credencial deje de tener validez de inmediato. Blacklistear el refresh (y opcionalmente el access si se usa blacklist también para access) y borrar las cookies asegura que el token no vuelva a aceptarse y que el navegador deje de enviarlo.

**Riesgo si no se aplica:** Sesiones que “sobreviven” al logout y posibilidad de uso indebido del token tras el cierre de sesión, sobre todo en equipos compartidos o en caso de robo del token.

---

### 2.9 Validación en cada request: cookie primero, Bearer como respaldo

**Qué es:** En cada petición a un endpoint protegido, el backend busca el token en este orden: (1) en una cookie (por ejemplo `access_token`), (2) si no hay cookie, en la cabecera `Authorization: Bearer <token>`. Se valida la firma, la expiración y, si aplica, la blacklist, y se asigna `request.user`.

**Dónde aplica:** En la clase de autenticación usada por DRF (por ejemplo una `CookieJWTAuthentication` o similar que herede o componga la lógica de Simple JWT), registrada en `DEFAULT_AUTHENTICATION_CLASSES`.

**Por qué en SISMED:** El flujo principal será el navegador (Next.js) enviando cookies con `credentials: 'include'`; por tanto, leer primero la cookie cubre el caso estándar. Permitir además `Authorization: Bearer` permite que clientes que no manejan cookies (aplicación móvil, Postman, scripts de integración) usen la misma API con un token en cabecera. Así se mantiene un solo backend y unas mismas reglas de negocio para web y otros clientes, sin duplicar lógica.

**Riesgo si no se aplica:** Si solo se aceptara Bearer, el frontend tendría que leer el token de alguna forma para ponerlo en la cabecera, lo que suele implicar exponerlo a JavaScript. Si solo se aceptara cookie, clientes sin cookies no podrían autenticarse de forma práctica.

---

### 2.10 CORS y credenciales (Allow-Credentials)

**Qué es:** CORS (Cross-Origin Resource Sharing) define qué orígenes pueden hacer peticiones al backend. `Access-Control-Allow-Credentials: true` indica que el servidor acepta que el cliente envíe cookies (y cabeceras de autorización) en peticiones cross-origin. El frontend debe hacer las peticiones con `credentials: 'include'` para que el navegador envíe las cookies.

**Dónde aplica:** En la configuración del backend (por ejemplo con `django-cors-headers`: `CORS_ALLOW_CREDENTIALS = True` y `CORS_ALLOWED_ORIGINS` con los orígenes exactos del frontend, sin usar `CORS_ALLOW_ALL_ORIGINS = True` en producción).

**Por qué en SISMED:** Si el frontend Next.js se sirve desde un origen (por ejemplo `https://app.sismed.int`) y la API desde otro (por ejemplo `https://api.sismed.int`), las peticiones son cross-origin. Por defecto el navegador no envía cookies en esas peticiones y puede rechazar respuestas que incluyan `Set-Cookie` si CORS no está bien configurado. Sin `Allow-Credentials` y sin `credentials: 'include'`, las cookies de autenticación no se enviarían y el flujo de login por cookie fallaría. Configurar CORS de forma explícita y restrictiva (solo los orígenes del front) además reduce el riesgo de que sitios no autorizados consuman la API con credenciales del usuario.

**Riesgo si no se aplica:** Las cookies no se envían o el navegador bloquea la respuesta; la autenticación por cookie parece “no funcionar” cuando el problema es de CORS y credenciales. En producción, abrir CORS a todos los orígenes aumentaría el riesgo de abuso.

---

### 2.11 No exponer el token en respuestas JSON ni en logs

**Qué es:** En las respuestas de login y refresh no se incluyen los campos `access` ni `refresh` en el cuerpo JSON; solo se envían por cookie. En los logs del servidor no se imprime el token (ni siquiera truncado de forma que permita identificarlo); solo se registran datos como `user_id`, `username` o tipo de evento (login, refresh, logout).

**Dónde aplica:** En las vistas o serializers que generan la respuesta de login/refresh (no devolver tokens en `response.data`) y en cualquier middleware, vista o utilidad de logging que pudiera registrar el body de la petición o la respuesta, o las cabeceras (donde podría ir Bearer).

**Por qué en SISMED:** Si el token apareciera en el JSON, quedaría en el historial de respuestas en DevTools, en posibles copias de respuestas y en cualquier sistema que registre el body (por ejemplo proxies o APM). Si se logueara el token, quedaría en ficheros de log, agregadores o SIEM, ampliando la superficie de fuga. En un sistema con datos de salud, los tokens son credenciales de acceso y deben tratarse como secretos: solo el servidor y el navegador (en la cookie) los manejan; el código del frontend y los logs no deben tener acceso a ellos.

**Riesgo si no se aplica:** Fuga del token en historial del navegador, en herramientas de desarrollo, en sistemas de monitorización o en logs, con posibilidad de robo o uso indebido por quien tenga acceso a esos sistemas.

---

## 3. Referencias

- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [OWASP Session Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html)
- [Simple JWT – Documentación (settings, blacklist)](https://django-rest-framework-simplejwt.readthedocs.io/)
- [MDN: SameSite (cookies)](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie/SameSite)
- [MDN: Credentials in fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch#sending_a_request_with_credentials_included)

---

## 4. Checklist de verificación manual

### Backend

- [ ] `POST /api/auth/login/` responde 200 y **no** devuelve `access`/`refresh` en el JSON.
- [ ] La respuesta de login incluye cookies `access_token` y `refresh_token` con `httpOnly` y `SameSite=Lax`.
- [ ] `POST /api/auth/refresh/` rota el refresh y devuelve nuevas cookies.
- [ ] `POST /api/auth/logout/` invalida el refresh (blacklist) y borra cookies.
- [ ] `GET /api/auth/me/` funciona con cookie y devuelve el usuario actual.

### Frontend

- [ ] Las peticiones llevan `credentials: 'include'` (Axios `withCredentials: true`).
- [ ] No hay tokens en `localStorage` ni en el body de las respuestas.
- [ ] Al expirar el access token, el frontend llama a `/auth/refresh/` y reintenta la petición.

### Seguridad de transporte

- [ ] En producción, el sitio usa HTTPS y las cookies tienen `Secure=true`.
- [ ] CORS permite el origen del frontend y `Allow-Credentials=true`.

---

## 5. Pruebas rápidas con curl (local)

> Nota: en desarrollo usa HTTP. En producción cambia a HTTPS.

### Login (guarda cookies)

```
curl -i -c cookies.txt \
	-H "Content-Type: application/json" \
	-d '{"username":"testuser","password":"Testpass123!"}' \
	http://127.0.0.1:8000/api/auth/login/
```

### Perfil (usa cookies)

```
curl -i -b cookies.txt \
	http://127.0.0.1:8000/api/auth/me/
```

### Refresh (rota cookies)

```
curl -i -b cookies.txt -c cookies.txt \
	-X POST http://127.0.0.1:8000/api/auth/refresh/
```

### Logout (invalida refresh y borra cookies)

```
curl -i -b cookies.txt -c cookies.txt \
	-X POST http://127.0.0.1:8000/api/auth/logout/
```

*Documento de justificación de medidas de seguridad para SISMED. No sustituye la implementación técnica; sirve como base para el diseño seguro de la API y del frontend.*
