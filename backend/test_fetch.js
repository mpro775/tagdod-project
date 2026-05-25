const axios = require('axios');

async function testFetch() {
  try {
    const res = await axios.post('https://api.allawzi.net/api/v1/auth/dev-login', {
      phone: '777777777',
      password: 'Admin123!@#'
    });
    console.log('Success:', res.status, JSON.stringify(res.data, null, 2));
  } catch (err) {
    if (err.response) {
      console.error('Server error:', err.response.status, err.response.data);
    } else {
      console.error('Error fetching:', err.message);
    }
  }
}

testFetch();
