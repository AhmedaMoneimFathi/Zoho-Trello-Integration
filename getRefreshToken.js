const axios = require('axios');

const CLIENT_ID = '1000.1SMXQVZVV3MC6Q5DMR4KQDF77RWUHU';
const CLIENT_SECRET = 'b3190278fb18017a54325f53cf1ef201d92deaa28f';
const REDIRECT_URI = 'http://localhost:3000';
const CODE = '1000.8410a805096e3c41159622275e67a93b.1918c03858a206fdd8f3c239066ed75d';

(async () => {
  try {
    const res = await axios.post('https://accounts.zoho.com/oauth/v2/token', null, {
      params: {
        grant_type: 'authorization_code',
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
        code: CODE,
      },
    });

    console.log(' Full Response:', res.data);
    console.log('Access Token:', res.data.access_token);
  } catch (err) {
    console.error(' Error fetching token:', err.response?.data || err.message);
  }
})();
