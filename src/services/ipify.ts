import axios from 'axios';

async function getIPAddress() {
  const response = await axios.get('https://api.ipify.org/?format=json');
  return response.data.ip;
}

export default getIPAddress;
