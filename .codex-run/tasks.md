# Task Plan

## slice-1-db: M3 Expressive Component Storybook persistence model

- Status: pending
- Layer: db
- Feature IDs: db-001
- Depends on: none
- Assigned agent: Database and persistence agent
- Skill pack: PostgreSQL, TypeORM entity-first/code-first modeling, data contracts, migrations, seed data
- System prompt: Design durable relational persistence with TypeORM entity classes as the source of truth. Express relations, indexes, constraints, and timestamps in code, keep migrations reversible and aligned with entity metadata, and make seeds realistic.

## slice-2-api: M3 Expressive Component Storybook GraphQL read and write contract

- Status: pending
- Layer: api
- Feature IDs: api-001
- Depends on: db-001
- Assigned agent: NestJS GraphQL API agent
- Skill pack: GraphQL code-first, NestJS modules, TypeORM repositories, health checks, resolver tests, validation
- System prompt: Build module-scoped NestJS API code. Keep src/main.ts and src/app.module.ts flat, put domain logic under src/modules/<domain>, and back persistence through TypeORM entity-first repositories.

## slice-3-ux: M3 Expressive Component Storybook UX architecture and design system

- Status: pending
- Layer: ux
- Feature IDs: ux-001
- Depends on: none
- Assigned agent: UI/UX design system agent
- Skill pack: Google UI/UX, Material Design 3, Material Design 3 Expressive, accessibility, atomic design
- System prompt: Define workflows, information architecture, responsive states, tokens, component anatomy, and accessibility behavior before implementation.

## slice-4-web: M3 Expressive Component Storybook responsive product surface

- Status: pending
- Layer: web
- Feature IDs: web-001
- Depends on: api-001, ux-001
- Assigned agent: Next.js frontend implementation agent
- Skill pack: GraphQL client flows, Next.js App Router, React, Tailwind CSS, TypeScript, responsive UI states
- System prompt: Implement the actual usable product surface first. Follow the UX slice, use atomic components, and cover loading, empty, error, desktop, and mobile states.

## slice-5-devops: M3 Expressive Component Storybook local operations and deployment readiness

- Status: pending
- Layer: devops
- Feature IDs: devops-001
- Depends on: api-001, web-001
- Assigned agent: DevOps and runtime agent
- Skill pack: CI checks, Docker Compose, deployment readiness, environment templates, local runtime scripts
- System prompt: Own runtime wiring, scripts, environment contracts, CI/verification order, and deployment readiness without taking over app feature implementation.

## slice-6-e2e: M3 Expressive Component Storybook seeded user journey

- Status: pending
- Layer: e2e
- Feature IDs: e2e-001
- Depends on: devops-001, web-001
- Assigned agent: QA and E2E testing agent
- Skill pack: Playwright, accessibility checks, screenshots, seeded journeys, smoke tests
- System prompt: Prove the user journey end-to-end from seeded data through UI mutation and persistence. Capture screenshots for visual review.

## slice-7-cross-cutting: M3 Expressive Component Storybook quality review

- Status: pending
- Layer: cross-cutting
- Feature IDs: review-001
- Depends on: e2e-001
- Assigned agent: Team leader and integration reviewer
- Skill pack: Code review, architecture consistency, final verification, integration checks
- System prompt: Review scope, feature depth, UX quality, module boundaries, DevOps readiness, tests, and verification artifacts. Block incomplete or brittle work.

