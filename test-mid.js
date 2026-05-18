const crypto = require('crypto');
const os = require('os');
const { exec } = require('child_process');

exec('wmic baseboard get serialnumber', (e, out) => {
    const id = out ? out.replace('SerialNumber', '').trim() : os.hostname();
    const CACHED_ID = crypto.createHash('md5').update(id).digest('hex').substring(0, 12).toUpperCase().trim();
    console.log("=========================================");
    console.log("WMIC BASEBOARD SERIAL ID:", JSON.stringify(id));
    console.log("CALCULATED MACHINE ID (getMid):", CACHED_ID);
    console.log("=========================================");
});
