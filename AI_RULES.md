# AI Development Rules for Veo 2 Video Generator

This document outlines the core technologies used in this application and provides clear guidelines on which libraries and frameworks to use for specific functionalities. Adhering to these rules ensures consistency, maintainability, and efficient development.

## 🚀 Tech Stack Overview

The Veo 2 Video Generator application is built with a modern and robust web development stack:

*   **React**: A declarative, component-based JavaScript library for building user interfaces.
*   **TypeScript**: A superset of JavaScript that adds static typing, enhancing code quality and developer experience.
*   **Tailwind CSS**: A utility-first CSS framework for rapidly building custom designs directly in your markup.
*   **Vite**: A fast and opinionated build tool that provides a lightning-fast development experience.
*   **Google Gemini API**: Utilized for advanced AI functionalities, including video generation, intelligent prompt creation, image variations, and basic text-to-speech.
*   **ElevenLabs API**: Integrated for high-quality, multilingual text-to-speech capabilities.
*   **Local Storage**: Used for client-side data persistence, specifically for managing API keys and user authentication status.
*   **Custom Icon Components**: SVG-based icon components are used for various UI elements.
*   **Authentication Service**: A custom service (`authService.ts`) handles user login, session management, and rate limiting.

## 🛠️ Library Usage Rules

To maintain a clean and consistent codebase, please follow these guidelines for library usage:

*   **UI Components**:
    *   **Preference**: Always try to use components from the **shadcn/ui** library for new UI elements. These components are pre-styled with Tailwind CSS and provide accessibility features.
    *   **Custom Components**: If a required component is not available in shadcn/ui or needs significant customization, create a new, small, and focused custom component in `src/components/` using React and Tailwind CSS.
*   **Styling**:
    *   **Primary**: Use **Tailwind CSS** exclusively for all styling. Apply utility classes directly in your JSX.
    *   **Avoid**: Do not use inline styles (unless absolutely necessary for dynamic values) or separate CSS modules for component-specific styling.
*   **AI Interactions**:
    *   **Core AI (Gemini)**: For all core AI functionalities like video generation, prompt generation, image variations, logo/avatar generation, and basic text-to-speech, use the **`@google/genai`** library via `services/geminiService.ts`.
    *   **Premium TTS (ElevenLabs)**: For higher quality or specific voice text-to-speech, use the **`@elevenlabs/elevenlabs-js`** library via `services/elevenlabsService.ts`.
*   **State Management**:
    *   **Local State**: Use React's built-in hooks (`useState`, `useCallback`, `useEffect`) for managing component-specific state and side effects.
    *   **Global State**: For application-wide state, prefer the React Context API. Avoid introducing external state management libraries unless a clear need arises and is approved.
*   **Icons**:
    *   **Preference**: For new icons, use the **`lucide-react`** package.
    *   **Existing**: Continue to use the custom SVG icon components in `src/components/icons/` for existing icons.
*   **Routing**: If application routing becomes necessary, use **React Router**. All routes should be defined and managed within `src/App.tsx`.
*   **Authentication**: All authentication logic (login, logout, session checks, rate limiting) must be handled by the `services/authService.ts` module.
*   **API Key Management**: API keys should be managed dynamically via `localStorage` or the `window` object, as implemented in `services/geminiService.ts` and `components/Header.tsx`. Avoid hardcoding API keys directly into components or services.