# Create Nuxt Launchpad

[![npm version][npm-version-shield]][npm-url]
[![npm downloads][npm-downloads-shield]][npm-url]
[![MIT License][license-shield]][license-url]

> ⚡ **The fastest way to start a production-ready Nuxt 4 project with Feature-Sliced Design (FSD) architecture.**

Stop wasting time on project setup. Get a scalable, type-safe Nuxt application with FSD structure, pre-configured ESLint, and ready-to-use CRUD API services.

---

## 🚀 Quick Start

```bash
npx create-nuxt-launchpad
```

That's it! The CLI will:
1. Create a new Nuxt project
2. Set up FSD folder structure
3. Install all dependencies
4. Configure ESLint, TypeScript, and API layers

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🏗 **FSD Architecture** | Pre-configured layers (`entities`, `features`, `widgets`, `shared`) for scalable code organization |
| 🔌 **CRUD API Factory** | Type-safe `useApiFactory` composable for generating API services in seconds |
| 🛡 **Type Safety** | Full TypeScript support with strict mode enabled |
| 🧹 **Code Quality** | Pre-configured ESLint with `@antfu/eslint-config` |
| 🔧 **Developer Experience** | Husky + lint-staged for pre-commit hooks |

---

## 📁 Project Structure

```
my-app/
├── app/
│   ├── entities/          # Business entities (user, product, etc.)
│   ├── features/          # User interactions (auth, forms, etc.)
│   ├── widgets/           # Page-level components
│   ├── shared/            # Global utilities, UI, types
│   └── pages/             # Nuxt routing
└── public/                # Static assets
```

### Why FSD?

Feature-Sliced Design separates concerns by **business logic**, not technical roles. This makes your codebase:
- ✅ Easier to navigate
- ✅ Simpler to refactor
- ✅ Ready for team collaboration

---

## 🛠 Usage Example

Create a type-safe API service in 30 seconds:

```ts
// app/entities/tickets/api/tickets.ts
import type { TicketItem, TicketFilters, CreateTicketForm } from '../types'
import { useApiFactory } from '#shared/api'

const ticketsApi = useApiFactory<
  TicketItem,
  TicketFilters,
  CreateTicketForm
>('/api/tickets')

export default ticketsApi
```

Use it in your components:

```vue
<script setup lang="ts">
const { data: tickets, pending } = ticketsApi.getAll({
  params: { status: 'open' }
})
</script>

<template>
  <div v-if="pending">Loading...</div>
  <div v-else>
    <TicketCard v-for="ticket in tickets" :key="ticket.id" :ticket />
  </div>
</template>
```

---

### Coming Soon (v1.0.0)
- [✅] Choose package manager (npm, yarn, pnpm, bun)
- [ ] Optional features (Tailwind, Pinia, Auth)

---

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. **Fork** the repository [Github](https://github.com/KhatmullinBulat/nuxt-launchpad)
2. **Create a branch** (`git checkout -b feat/your-feature`)
3. **Make changes** and commit (`git commit -m 'feat: description'`)
4. **Push** to your branch (`git push origin feat/your-feature`)
5. **Open a Pull Request**

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

## 🙏 Acknowledgments

- [Feature-Sliced Design](https://feature-sliced.design/) — Architecture methodology
- [Nuxt](https://nuxt.com/) — The Vue.js framework
- [Anthony Fu](https://github.com/antfu) — ESLint config

---

[npm-version-shield]: https://img.shields.io/npm/v/create-nuxt-launchpad.svg?style=flat-square
[npm-url]: https://www.npmjs.com/package/create-nuxt-launchpad
[npm-downloads-shield]: https://img.shields.io/npm/dm/create-nuxt-launchpad.svg?style=flat-square
[license-shield]: https://img.shields.io/github/license/KhatmullinBulat/nuxt-launchpad.svg?style=flat-square
[license-url]: https://github.com/KhatmullinBulat/nuxt-launchpad/blob/main/LICENSE