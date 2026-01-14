const Production=import.meta.env.MODE==="production";
// const API_URL=
// import.meta.env.VITE_API_URL_PRODUCTION
const API_URL=Production?
import.meta.env.VITE_API_URL_PRODUCTION
:
import.meta.env.VITE_API_URL

export {API_URL,Production};
