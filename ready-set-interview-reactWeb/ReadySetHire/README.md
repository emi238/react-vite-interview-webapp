Description:
This is a REACT web application that is built with vite, tailwindcss, daisyUI, RESTFUL API and LangChain. The application is an interview management platform where you may manage your interviews, applicants, questions and facilitate a platform for the interview process where you can also see applicant answers and get help generating interview questions from LLM. 

How to run code:
Cd to downloaded folder, first finding the directory "llm-api-server". In the terminal, npm install, then run node server.js, ensuring that the message appears "the server running on port 3001". In another terminal, cd to ReadySetHire, npm install and then npm run dev to derive the localhost link, lastly, paste in Chrome browser "http://localhost:5173/". Ensure a .env file with your own key is placed in the llm-api-server folder. Due to the use of the react-speech-recognition library, please use Chrome as it fully supports the library, whereas there may be limits to using safari. 

REFERENCES:
- npm. (2025, April 29). react-speech-recognition. Npm. https://www.npmjs.com/package/react-speech-recognition
‌- Course lecture and applied codes from week 4-7. Implementation from LLM was modelled after week 7's applied class. API implementation code references lecture code. 


# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
