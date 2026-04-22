# Salda

> Cuentas claras, amistades largas.

Calculá cómo dividir gastos entre varias personas. Sin registro, sin backend, sin complicaciones.

## Funcionalidades

**División simple**
- Ingresás el monto total y la cantidad de personas
- Obtenés el monto exacto por persona

**División compuesta**
- Agregás participantes con nombre y alias de transferencia (CVU/alias argentino)
- Cada participante carga sus propios gastos con descripción opcional
- Los gastos nuevos incluyen automáticamente a todos los participantes activos
- Podés excluir participantes de gastos específicos
- El algoritmo calcula las transferencias mínimas necesarias para saldar todas las deudas

**Resultado**
- Lista de transferencias: quién le paga a quién y cuánto
- Botón para copiar el texto formateado al portapapeles
- Botón para compartir directamente por WhatsApp
- Integración con Cafecito para donaciones (configurable)

**UX**
- Dark / Light mode con preferencia persistida
- Estado guardado en localStorage con expiración de 3 horas
- Responsive — funciona en celular y computadora

## Stack

- [Vue 3](https://vuejs.org/) + `<script setup>` + TypeScript
- [Vite](https://vitejs.dev/)
- [Tailwind CSS v4](https://tailwindcss.com/)

## Desarrollo local

```bash
npm install
cp .env.example .env   # completar variables opcionales
npm run dev
```

## Variables de entorno

Copiá `.env.example` a `.env` y completá los valores:

| Variable | Descripción |
|---|---|
| `VITE_DONATION_ALIAS` | Alias que se agrega al final del mensaje compartido. Si está vacío, no aparece. |
| `VITE_CAFECITO_URL` | URL de tu perfil de Cafecito. Si está vacío, el botón no se muestra. |

> Las variables `VITE_*` se embeben en el build del cliente — no pongas datos sensibles.

## Deploy en Vercel

1. Importar el repositorio en Vercel
2. Framework preset: **Vite**
3. Agregar las variables de entorno en el panel de Vercel (Settings → Environment Variables)
4. Deploy

No requiere servidor ni base de datos.

## Build

```bash
npm run build   # genera /dist
npm run preview # previsualización local del build
```
