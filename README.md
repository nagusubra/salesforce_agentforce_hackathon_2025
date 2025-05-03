# AgentForce Project Management Helper

This is a [Next.js](https://nextjs.org) application designed to help Product Managers easily manage project tasks, resources, and team availability in one place. It utilizes a Kanban board, task lists, and team overview sections to provide a comprehensive project management experience.

This example project focuses on managing tasks for a fictional app called "foodsavr", designed to help users reduce food waste at home.

## Features

*   **Task Management:** View tasks in a Kanban board (Todo, In Progress, Done) or a detailed list view.
*   **Task Creation/Editing:** Add new tasks or modify existing ones with details like title, description, required skills, priority, deadline, and assigned members.
*   **Team Overview:** View team structure, member details (skills, designation, hourly rate, assigned hours), resource utilization, skill matrix, and availability.
*   **Data Persistence:** Task data is stored and retrieved from a CSV file (`data/tasks.csv`).
*   **Configuration Driven:** Team structure, required resources, and budget are configured via `data/workplace_config.json`.

### Coming Soon

*   **Agentic Task Allocation:** Automatically suggest or assign tasks based on team member skills, current workload, availability, and task priority.
*   **Enhanced Reporting:** More detailed project progress and budget tracking.

## Screenshots

**Task List View:**
![Task List Screenshot](./app_screenshots/Task%20list%20ss.png)

**Kanban Board View:**
![Kanban Board Screenshot](./app_screenshots/Kanban%20board%20ss.png)

**Team Overview:**
![Team Overview Screenshot](./app_screenshots/Team%20overview%20ss.png)

**Team Members Details:**
![Team People Overview Screenshot](./app_screenshots/Team's%20people%20overview.png)

**Team Availability:**
![Team Availability Screenshot](./app_screenshots/Team's%20availablty%20overview.png)

**Reporting Preview:**
![Reporting Preview Screenshot](./app_screenshots/Reporting%20preview%20ss.png)

## Getting Started

First, clone the repository:

```bash
git clone https://github.com/nagusubra/salesforce_agentforce_hackathon_2025.git
cd salesforce_agentforce_hackathon_2025
```

Then, install the dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

Then, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure & Configuration

*   **Main Application Logic:** `src/app/` - Contains the main pages and UI components.
*   **API Routes:** `src/app/api/` - Handles backend logic for tasks and configuration.
*   **Core Components:** `src/components/` - Reusable UI components like Task Cards and Kanban Columns.
*   **Data Handling:** `src/lib/data/` - Contains logic for interacting with the CSV database.
*   **Configuration:** `data/workplace_config.json` - Defines team structure, skills, and budget.
*   **Task Data:** `data/tasks.csv` - Stores the project tasks.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Technology Stack

*   **Framework:** Next.js (App Router)
*   **Language:** TypeScript
*   **Styling:** Tailwind CSS
*   **UI Components:** Shadcn/UI
*   **Data Storage:** CSV file (`data/tasks.csv`)

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!
