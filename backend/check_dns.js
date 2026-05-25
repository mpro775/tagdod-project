const dns = require('dns').promises;

async function checkDns() {
  try {
    const srv = await dns.resolveSrv('_mongodb._tcp.cluster0.vip178l.mongodb.net');
    console.log('SRV records:', srv);
  } catch (err) {
    console.error('SRV resolve error:', err);
  }
  
  try {
    const txt = await dns.resolveTxt('cluster0.vip178l.mongodb.net');
    console.log('TXT records:', txt);
  } catch (err) {
    console.error('TXT resolve error:', err);
  }
}

checkDns();
