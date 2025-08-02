// src/utils/apiConfig.js

const isLocalhost = window.location.hostname === 'localhost';

export const MoovoUrl = isLocalhost 
  ? 'http://localhost:4003' 
  : 'https://admin-portal-bw0z.onrender.com';  


