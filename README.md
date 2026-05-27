# 🏆 Prode Mundial 254

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)
![Make](https://img.shields.io/badge/Make-000000?style=for-the-badge&logo=make&logoColor=white)

> **Prode Mundial 254** es una plataforma web de pronósticos deportivos donde los usuarios compiten en un ranking global prediciendo resultados. El sistema cuenta con una interfaz moderna y "Mobile-First", gestión robusta de usuarios y bases de datos, y un flujo de correos automatizados en tiempo real.

---

## ✨ Características Principales

*   📱 **Diseño Mobile-First:** Interfaz altamente optimizada para celulares. Elementos táctiles ("touch targets") adaptados, tarjetas expansivas y navegación amigable.
*   🔐 **Autenticación y Sesiones:** Sistema de registro, login y manejo de sesiones de usuario totalmente seguro.
*   ⚽ **Fase de Grupos y Eliminatorias:** Vistas dedicadas para predecir los partidos de grupos y un cuadro interactivo ("bracket") para la fase de Mata-Mata.
*   📊 **Dashboard de Usuario:** Panel de control con cálculo de puntajes en tiempo real (Puntos totales, plenos y aciertos parciales) y un ranking global para ver la posición contra otros jugadores.
*   ✉️ **Correos Automatizados:** Integración de Webhooks que disparan un correo de bienvenida instantáneo con credenciales de acceso apenas se registra un nuevo usuario.

---

## 🛠️ Stack Tecnológico

El proyecto está construido bajo una arquitectura moderna "Serverless", separando el frontend del backend y las automatizaciones.

*   **Frontend:** HTML5, CSS3 (Vanilla con variables CSS y Flexbox/Grid) y JavaScript (ES6+).
*   **Backend & Base de Datos:** [Supabase](https://supabase.com/) (PostgreSQL + Auth).
*   **Hosting & CI/CD:** [Vercel](https://vercel.com/) (Despliegues automáticos y enrutamiento limpio vía `vercel.json`).
*   **Automatizaciones:** [Make.com](https://www.make.com/) (Webhooks integrados con Gmail API).

---

## 📂 Estructura del Proyecto

```text
/
├── index.html              # Pantalla de Login y Registro
├── vercel.json             # Configuración de enrutamiento estricto de Vercel
├── style.css               # Hoja de estilos global (Mobile-first, animaciones, HUD)
├── /pages/                 # Vistas principales de la app
│   ├── dashboard.html      # Panel de control, estadísticas y ranking
│   ├── prode.html          # Vista de predicciones: Fase de Grupos
│   └── mata-mata.html      # Vista de predicciones: Rondas Eliminatorias
└── /js/                    # Lógica de la aplicación
    ├── login.js            # Conexión con Supabase Auth
    ├── groups.js           # Guardado y lectura de pronósticos de grupos
    └── bracket.js          # Lógica interactiva del cuadro de eliminatorias