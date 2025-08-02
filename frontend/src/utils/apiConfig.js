// src/utils/apiConfig.js

const isLocalhost = window.location.hostname === 'localhost';

export const MoovoUrl = isLocalhost 
  ? 'https://admin-portal-bw0z.onrender.com' 
  : 'https://admin-portal-bw0z.onrender.com';  


