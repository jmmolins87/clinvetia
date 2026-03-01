# reCAPTCHA Enterprise (ClinvetIA)

## 1) Variables de entorno

Configura estas variables en local y en Vercel:

- `NEXT_PUBLIC_RECAPTCHA_SITE_KEY`
- `RECAPTCHA_ENTERPRISE_PROJECT_ID`
- `RECAPTCHA_ENTERPRISE_API_KEY`

Opcional (fallback legacy):

- `RECAPTCHA_SECRET_KEY`

## 2) Dominios permitidos (Google Cloud)

En Google Cloud Console, para la key de reCAPTCHA Enterprise:

- Añade `clinvetia.com`
- Añade `www.clinvetia.com`
- Añade el dominio preview de Vercel (si aplica)
- Añade `localhost` para desarrollo local

Si el dominio no está permitido, el token puede generarse pero la verificación del assessment fallará.

## 3) Acciones usadas en la app

La app valida acciones específicas:

- `session_create`
- `booking_create`
- `contact_submit`
- `admin_login`

El backend rechaza tokens cuyo `action` no coincide con la esperada.

