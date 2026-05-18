const express = require('express');
const https = require('https');
const fs = require('fs');
const path = require('path');
const os = require('os');
const crypto = require('crypto');
const { exec } = require('child_process');

const cors = require('cors');

const app = express();
const PORT = 3000;
const SECRET_KEY = 'classico_secure_key_2024';

// Supabase Config
const SUPABASE_URL = 'https://qhlxmdbvvqelgbyzpugt.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFobHhtZGJ2dnFlbGdieXpwdWd0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY3MDQzNjIsImV4cCI6MjA5MjI4MDM2Mn0.0m75h76gjrkR9zADCrkw-0zsibI4qXGhM8PzlZdkSgk';

app.use(cors());
app.use(express.json({ limit: '50mb' }));

const DEFAULT_MENU = [
    { id: 1, name: "سموذي مانجو", price: 45 },
    { id: 2, name: "سموذي فراولة", price: 45 },
    { id: 3, name: "سموذي توت أزرق", price: 45 },
    { id: 4, name: "سموذي بطيخ", price: 45 },
    { id: 5, name: "سموذي ليمون نعناع", price: 45 },
    { id: 6, name: "هوت شوكليت (L)", price: 65 },
    { id: 7, name: "هوت شوكليت (S)", price: 40 },
    { id: 8, name: "هوت نوتيلا (L)", price: 65 },
    { id: 9, name: "هوت نوتيلا (S)", price: 50 },
    { id: 10, name: "هوت كراميل (L)", price: 75 },
    { id: 11, name: "هوت كراميل (S)", price: 40 },
    { id: 12, name: "هوت أوريو (L)", price: 85 },
    { id: 13, name: "هوت أوريو (S)", price: 60 },
    { id: 14, name: "كابتشينو (L)", price: 65 },
    { id: 15, name: "كابتشينو (S)", price: 40 },
    { id: 16, name: "سخاكنية (L)", price: 55 },
    { id: 17, name: "سخاكنية (S)", price: 30 },
    { id: 18, name: "هوت لاتيه (L)", price: 65 },
    { id: 19, name: "هوت لاتيه (S)", price: 40 },
    { id: 20, name: "هوت موكا (L)", price: 65 },
    { id: 21, name: "هوت موكا (S)", price: 40 },
    { id: 22, name: "ميلك شيك فانيليا", price: 60 },
    { id: 23, name: "ميلك شيك نوتيلا", price: 60 },
    { id: 24, name: "ميلك شيك أوريو", price: 70 },
    { id: 25, name: "ميلك شيك فراولة", price: 60 },
    { id: 26, name: "ميلك شيك مانجو", price: 60 },
    { id: 27, name: "ميلك شيك بلوبيري", price: 60 },
    { id: 28, name: "ميلك شيك كيندر", price: 70 },
    { id: 29, name: "قهوة تركي (L)", price: 40 },
    { id: 30, name: "قهوة تركي (S)", price: 25 },
    { id: 31, name: "قهوة تركي اسبيشيال (L)", price: 45 },
    { id: 32, name: "قهوة تركي اسبيشيال (S)", price: 30 },
    { id: 33, name: "قهوة تركي محوج (L)", price: 45 },
    { id: 34, name: "قهوة تركي محوج (S)", price: 30 },
    { id: 35, name: "قهوة فرنساوي (L)", price: 45 },
    { id: 36, name: "قهوة فرنساوي (S)", price: 30 },
    { id: 37, name: "قهوة بندق (L)", price: 50 },
    { id: 38, name: "قهوة بندق (S)", price: 35 },
    { id: 39, name: "قهوة فانيليا (L)", price: 50 },
    { id: 40, name: "قهوة فانيليا (S)", price: 35 },
    { id: 41, name: "قهوة شوكليت (L)", price: 50 },
    { id: 42, name: "قهوة شوكليت (S)", price: 35 },
    { id: 43, name: "قهوة بندق نوتيلا (L)", price: 55 },
    { id: 44, name: "قهوة بندق نوتيلا (S)", price: 40 },
    { id: 45, name: "قهوة classico (L)", price: 60 },
    { id: 46, name: "قهوة classico (S)", price: 35 },
    { id: 47, name: "شاي كلاسيك", price: 15 },
    { id: 48, name: "شاي نكهات", price: 20 },
    { id: 49, name: "شاي بحليب", price: 25 },
    { id: 50, name: "قرفة بحليب", price: 25 },
    { id: 51, name: "شاي classico", price: 25 },
    { id: 52, name: "سحلب", price: 40 },
    { id: 53, name: "سحلب مكسرات", price: 50 },
    { id: 54, name: "آيس لاتيه", price: 55 },
    { id: 55, name: "آيس موكا", price: 55 },
    { id: 56, name: "آيس كوفي", price: 50 },
    { id: 57, name: "آيس نوتيلا", price: 60 },
    { id: 58, name: "آيس أوريو", price: 60 },
    { id: 59, name: "آيس لوتس", price: 60 },
    { id: 60, name: "وافل شوكليت دارك", price: 60 },
    { id: 61, name: "وافل نوتيلا", price: 60 },
    { id: 62, name: "وافل وايت شوكليت", price: 60 },
    { id: 63, name: "وافل كراميل", price: 60 },
    { id: 64, name: "وافل بستاشيو", price: 120 },
    { id: 65, name: "وافل كيندر", price: 70 },
    { id: 66, name: "وافل لوتس", price: 70 },
    { id: 67, name: "وافل فور سيزون", price: 100 },
    { id: 68, name: "ساندوتش موز", price: 75 },
    { id: 69, name: "ساندوتش لوتس", price: 75 },
    { id: 70, name: "ساندوتش أوريو", price: 75 },
    { id: 71, name: "ساندوتش كيندر", price: 120 },
    { id: 72, name: "ساندوتش كلاسيكو", price: 120 },
    { id: 73, name: "ستروب نوتيلا", price: 65 },
    { id: 74, name: "ستروب فواكه", price: 80 },
    { id: 75, name: "ستروب كيندر", price: 120 },
    { id: 76, name: "ستروب أوريو", price: 80 },
    { id: 77, name: "ستروب بستاشيو", price: 80 },
    { id: 78, name: "ستروب كلاسيكو", price: 100 },
    { id: 79, name: "مانجو", price: 40 },
    { id: 80, name: "فراولة", price: 40 },
    { id: 81, name: "جوافة", price: 35 },
    { id: 82, name: "فراولة بحليب", price: 45 },
    { id: 83, name: "موز بحليب", price: 35 },
    { id: 84, name: "بلح بحليب", price: 40 },
    { id: 85, name: "ليمون", price: 25 },
    { id: 86, name: "ليمون نعناع", price: 30 },
    { id: 87, name: "تمر هندي", price: 20 },
    { id: 88, name: "عناب", price: 20 },
    { id: 89, name: "فروت سلاد", price: 40 },
    { id: 90, name: "فروت سلاد نوتيلا", price: 50 },
    { id: 91, name: "فروت سلاد السعادة", price: 65 },
    { id: 92, name: "بان كيك شوكليت/وايت/كراميل (صغير)", price: 45 },
    { id: 93, name: "بان كيك شوكليت/وايت/كراميل (وسط)", price: 60 },
    { id: 94, name: "بان كيك شوكليت/وايت/كراميل (كبير)", price: 90 },
    { id: 95, name: "بان كيك لوتس/وايت/كيندر (صغير)", price: 60 },
    { id: 96, name: "بان كيك لوتس/وايت/كيندر (وسط)", price: 85 },
    { id: 97, name: "بان كيك لوتس/وايت/كيندر (كبير)", price: 110 },
    { id: 98, name: "بان كيك بستاشيو/وايت/كراميل (صغير)", price: 60 },
    { id: 99, name: "بان كيك بستاشيو/وايت/كراميل (وسط)", price: 90 },
    { id: 100, name: "بان كيك بستاشيو/وايت/كراميل (كبير)", price: 130 },
    { id: 101, name: "بان كيك دارك/وايت/كيندر (صغير)", price: 50 },
    { id: 102, name: "بان كيك دارك/وايت/كيندر (وسط)", price: 70 },
    { id: 103, name: "بان كيك دارك/وايت/كيندر (كبير)", price: 90 },
    { id: 104, name: "موهيتو كلاسيك", price: 45 },
    { id: 105, name: "موهيتو بلو بيري", price: 50 },
    { id: 106, name: "موهيتو ميكس بيري", price: 55 },
    { id: 107, name: "موهيتو خوخ", price: 50 },
    { id: 108, name: "موهيتو بطيخ", price: 50 },
    { id: 109, name: "موهيتو فراولة", price: 50 },
    { id: 110, name: "موهيتو باشون فروت", price: 50 },
    { id: 111, name: "موهيتو أناناس", price: 50 },
    { id: 112, name: "موهيتو مانجو", price: 50 },
    { id: 113, name: "موهيتو كريز", price: 50 },
    { id: 114, name: "موهيتو جيلي كولا", price: 50 },
    { id: 115, name: "بلو باشون", price: 60 },
    { id: 116, name: "أورانج بيري", price: 60 },
    { id: 117, name: "شيري كولا", price: 60 },
    { id: 118, name: "مزمرة", price: 60 },
    { id: 119, name: "كوكتيل فلوريدا", price: 40 },
    { id: 120, name: "فلوريدا", price: 50 },
    { id: 121, name: "فورسيزون", price: 60 },
    { id: 122, name: "مياه", price: 10 },
    { id: 123, name: "كانز", price: 25 },
    { id: 124, name: "أندومي", price: 20 }
];

const DEFAULT_DEVICES = [
    { id: 1, name: "PlayStation 1", status: "stopped", hourPrice: 50, orders: [] },
    { id: 2, name: "PlayStation 2", status: "stopped", hourPrice: 50, orders: [] },
    { id: 3, name: "PlayStation 3", status: "stopped", hourPrice: 50, orders: [] },
    { id: 4, name: "PlayStation 4", status: "stopped", hourPrice: 50, orders: [] },
    { id: 5, name: "PlayStation 5", status: "stopped", hourPrice: 50, orders: [] },
    { id: 6, name: "بلياردو 1", status: "stopped", hourPrice: 50, orders: [] },
    { id: 7, name: "تنس طاولة 1", status: "stopped", hourPrice: 50, orders: [] }
];

// 1. Core Sync API (Moved up for priority)
app.get('/portal', (req, res) => {
    res.sendFile(path.join(__dirname, 'OwnerPortal.html'));
});

app.get(['/logoapp.png', '/api/logo', '/portal/logoapp.png'], (req, res) => {
    const logoPath = path.resolve(__dirname, 'logoapp.png');
    if (fs.existsSync(logoPath)) {
        res.sendFile(logoPath);
    } else {
        console.error(`[Server] Logo not found at: ${logoPath}`);
        res.status(404).send('Logo not found');
    }
});

// 2. Static Files (Main App)
app.use(express.static(path.join(__dirname, 'classico-v3/dist')));

// 2. Supabase Service Helper
const SupabaseService = {
    request(method, path, body = null) {
        return new Promise((resolve, reject) => {
            const options = {
                hostname: SUPABASE_URL.replace('https://', ''),
                port: 443,
                path: path,
                method: method,
                headers: { 'Content-Type': 'application/json', 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
            };
            const req = https.request(options, (res) => {
                let data = '';
                res.on('data', d => data += d);
                res.on('end', () => {
                    try {
                        let parsedData = [];
                        if (data && data.trim()) {
                            try { parsedData = JSON.parse(data); }
                            catch(e) { parsedData = { raw: data }; }
                        }
                        
                        if (res.statusCode >= 200 && res.statusCode < 300) {
                            resolve(parsedData);
                        } else {
                            console.error(`Cloud Error (${res.statusCode}):`, data);
                            reject({ status: res.statusCode, data: parsedData });
                        }
                    } catch (e) {
                        console.error("Supabase Request Error:", e);
                        reject({ status: 500, error: e.message });
                    }
                });
            });
            req.on('error', (e) => {
                console.error("Network Error:", e);
                reject({ status: 500, error: e.message });
            });
            req.setTimeout(5000, () => { // 5 seconds timeout
                req.destroy();
                reject({ status: 408, error: 'Connection Timeout' });
            });
            if (body) req.write(JSON.stringify(body));
            req.end();
        });
    }
};

let CACHED_ID = null;
async function getMid() {
    if (CACHED_ID) return CACHED_ID;
    return new Promise(resolve => {
        exec('wmic baseboard get serialnumber', (e, out) => {
            const id = out ? out.replace('SerialNumber', '').trim() : os.hostname();
            CACHED_ID = crypto.createHash('md5').update(id).digest('hex').substring(0, 12).toUpperCase().trim();
            resolve(CACHED_ID);
        });
    });
}

function getDataPath() {
    const devPath = path.join(__dirname, 'database.json');
    const parentDevPath = path.join(__dirname, '..', 'database.json');
    const userDataPath = process.env.CLASSICO_DATA_PATH ? path.join(process.env.CLASSICO_DATA_PATH, 'database.json') : null;
    
    const possiblePaths = [userDataPath, devPath, parentDevPath].filter(p => p !== null);
    
    for (const p of possiblePaths) {
        if (fs.existsSync(p)) return p;
    }
    return possiblePaths[0] || devPath;
}

// Helper to ensure directory exists
function ensureDirectory(filePath) {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

// Helper to get owner machine ID for a given machine ID
async function getOwnerMachineId(mid) {
    try {
        // 1. Check if directly in subscriptions (i.e. this machine is the owner)
        const subResults = await SupabaseService.request('GET', `/rest/v1/subscriptions?machine_id=eq.${mid}&status=eq.active&select=*`);
        if (subResults && subResults.length > 0) {
            return mid; // Owner
        }
        // 2. Otherwise, check if activated as a sub-device
        const keyResults = await SupabaseService.request('GET', `/rest/v1/subscription_keys?used_by=eq.${mid}&status=eq.used&select=owner_machine_id`);
        if (keyResults && keyResults.length > 0) {
            return keyResults[0].owner_machine_id;
        }
    } catch (e) {
        console.error("[getOwnerMachineId] Error:", e.message);
    }
    return null;
}

// --- SECURE API SUBSCRIPTION GATEWAY MIDDLEWARE ---
async function requireActiveSubscription(req, res, next) {
    try {
        // 1. Allow all GET requests (prevent boot deadlocks and let the app render the subscriptions view)
        if (req.method === 'GET') {
            return next();
        }

        // 2. Allow license activation and factory reset requests to pass through
        if (req.body && (req.body.is_activation === true || req.body.is_reset === true)) {
            return next();
        }

        const mid = (await getMid()).toUpperCase().trim();
        const now = new Date();

        const baseDir = process.env.CLASSICO_DATA_PATH || __dirname;
        const localPath = path.join(baseDir, 'database.json');
        
        if (!fs.existsSync(localPath)) {
            return res.status(403).json({ success: false, error: 'Database not initialized, active license required.' });
        }

        const localData = JSON.parse(fs.readFileSync(localPath, 'utf8'));
        const localSub = localData.classico_subscription;

        if (!localSub || localSub.status !== 'active' || !localSub.token) {
            return res.status(403).json({ success: false, error: 'Subscription inactive or expired. Please purchase a license to access the program.' });
        }

        const [tokenPayload, sig] = localSub.token.split('.');
        if (!tokenPayload || !sig) {
            return res.status(403).json({ success: false, error: 'Invalid subscription token format. Access denied.' });
        }

        const expectedSig = crypto.createHmac('sha256', SECRET_KEY).update(tokenPayload).digest('hex');
        if (sig !== expectedSig) {
            return res.status(403).json({ success: false, error: 'Cryptographic signature mismatch! Access denied.' });
        }

        const [cachedMid, status, expiryStr] = tokenPayload.split('|');
        if (cachedMid !== mid) {
            console.warn(`[Subscription Security] Machine ID mismatch. Cached in token: ${cachedMid}, Current machine: ${mid}. Allowing because signature is verified.`);
        }
        if (status !== 'active' || new Date(expiryStr) <= now) {
            return res.status(403).json({ success: false, error: 'Subscription is expired.' });
        }

        // All checks passed securely!
        next();
    } catch (err) {
        console.error("[Security] Middleware error:", err.message);
        res.status(500).json({ success: false, error: 'Security validation failure.' });
    }
}

// 3. Core Sync API
app.get('/api/data', requireActiveSubscription, async (req, res) => {
    try {
        const mid = (await getMid()).toUpperCase();
        
        const localPath = getDataPath();
        let foundExisting = fs.existsSync(localPath);
        if (foundExisting) console.log(`[Server] (OK) Database found at: ${localPath}`);

        // --- AUTO-MIGRATION ---
        // If we found NO data in AppData but we HAVE data in the project root, COPY IT!
        if (process.env.CLASSICO_DATA_PATH && !foundExisting) {
            const rootPath = path.join(__dirname, 'database.json');
            const parentRootPath = path.join(__dirname, '..', 'database.json');
            const sourcePath = fs.existsSync(rootPath) ? rootPath : (fs.existsSync(parentRootPath) ? parentRootPath : null);
            
            if (sourcePath && sourcePath !== localPath) {
                try {
                    console.log(`[Migration] 📦 Copying data from ${sourcePath} to ${localPath}`);
                    fs.copyFileSync(sourcePath, localPath);
                    foundExisting = true; // Now it exists
                } catch (mErr) {
                    console.error("[Migration] Failed to migrate data:", mErr.message);
                }
            }
        }

        console.log(`[Server] (--) Fetching data from: ${localPath}`);
        let data = null;

        if (foundExisting && fs.existsSync(localPath)) {
            try {
                data = JSON.parse(fs.readFileSync(localPath, 'utf8'));
                console.log(`[Server] (OK) Data loaded successfully (${fs.statSync(localPath).size} bytes)`);
            } catch (err) {
                console.error("Failed to read local database.json:", err);
            }
        }

        // If no data or menu is empty, use defaults
        if (!data) {
            data = {
                classico_devices: DEFAULT_DEVICES,
                classico_menu: DEFAULT_MENU,
                classico_history: [],
                classico_users: { 'admin': { username: 'admin', password: 'admin', role: 'manager', permissions: {} } },
                classico_app_settings: { appName: 'Classico' }
            };
            // Save defaults to local file for next time
            ensureDirectory(localPath);
            fs.writeFileSync(localPath, JSON.stringify(data, null, 2));
        } else {
            // Ensure menu exists even if empty (optional: only if explicitly null/missing)
            if (!data.classico_menu || data.classico_menu.length === 0) {
                data.classico_menu = DEFAULT_MENU;
            }
            if (!data.classico_devices || data.classico_devices.length === 0) {
                data.classico_devices = DEFAULT_DEVICES;
            }
        }

        // --- UNIFIED USER/STAFF SYNC (Shared Accounts) ---
        try {
            const ownerMid = await getOwnerMachineId(mid);
            if (ownerMid) {
                const sharedUsersRes = await SupabaseService.request('GET', `/rest/v1/cloud_backups?machine_id=eq.shared_users_${ownerMid}&select=data`);
                if (sharedUsersRes && sharedUsersRes.length > 0 && sharedUsersRes[0].data) {
                    const sharedUsers = sharedUsersRes[0].data.classico_users;
                    if (sharedUsers && Object.keys(sharedUsers).length > 0) {
                        data.classico_users = sharedUsers;
                        // Cache it locally for offline resilience
                        fs.writeFileSync(localPath, JSON.stringify(data, null, 2));
                        console.log(`[Users Sync] Centralized users updated successfully from shared_users_${ownerMid}`);
                    }
                }
            }
        } catch (uErr) {
            console.warn("[Users Sync] Failed to fetch shared users list:", uErr.message);
        }

        res.json(data);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/save', requireActiveSubscription, async (req, res) => {
    try {
        const mid = (await getMid()).toUpperCase();
        const data = req.body;

        const localPath = getDataPath();

        // 1. Save locally IMMEDIATELY (Fast)
        try {
            ensureDirectory(localPath);
            fs.writeFileSync(localPath, JSON.stringify(data, null, 2));
        } catch (err) {
            console.error("[Save] Failed to update local database.json:", err);
            return res.status(500).json({ success: false, error: 'Local Save Failed' });
        }

        // 2. Respond to client IMMEDIATELY (Smoothness)
        res.json({ success: true, message: 'Saved locally, syncing to cloud in background...' });

        // 3. Perform Cloud Sync in the background (Non-blocking)
        (async () => {
            try {
                // Sync shared users list first (Centralized Employee accounts)
                try {
                    const ownerMid = await getOwnerMachineId(mid);
                    if (ownerMid && data.classico_users) {
                        const sharedUsersRes = await SupabaseService.request('GET', `/rest/v1/cloud_backups?machine_id=eq.shared_users_${ownerMid}&select=machine_id`);
                        if (sharedUsersRes && sharedUsersRes.length > 0) {
                            await SupabaseService.request('PATCH', `/rest/v1/cloud_backups?machine_id=eq.shared_users_${ownerMid}`, {
                                data: { classico_users: data.classico_users },
                                updated_at: new Date().toISOString()
                            });
                        } else {
                            await SupabaseService.request('POST', '/rest/v1/cloud_backups', {
                                machine_id: `shared_users_${ownerMid}`,
                                data: { classico_users: data.classico_users },
                                updated_at: new Date().toISOString()
                            });
                        }
                        console.log(`[Users Sync] Centralized users saved successfully under shared_users_${ownerMid}`);
                    }
                } catch (uErr) {
                    console.error("[Users Sync] Failed to sync users to cloud:", uErr.message);
                }

                // Safety check: Don't overwrite cloud data with empty local data unless it's a deliberate reset
                const isDataEmpty = !data || !data.classico_menu || data.classico_menu.length === 0;
                const isDeliberateReset = data && data.is_reset === true;

                // For background sync, we can just use PATCH. If it's a new machine, we might need POST.
                // To keep it simple and safe, we can still do a quick check or just try/catch.

                // If it's a deliberate reset, we MUST also clear the backups directory
                if (isDeliberateReset) {
                    const backupDir = path.join(__dirname, 'backups');
                    if (fs.existsSync(backupDir)) {
                        fs.readdirSync(backupDir).forEach(f => fs.unlinkSync(path.join(backupDir, f)));
                    }
                }

                // Cloud Upsert logic
                try {
                    await SupabaseService.request('PATCH', `/rest/v1/cloud_backups?machine_id=eq.${mid}`, {
                        data,
                        updated_at: new Date().toISOString()
                    });
                } catch (patchErr) {
                    // If PATCH failed (maybe record doesn't exist), try POST
                    if (patchErr.status === 404 || (Array.isArray(patchErr.data) && patchErr.data.length === 0)) {
                        await SupabaseService.request('POST', '/rest/v1/cloud_backups', {
                            machine_id: mid,
                            data,
                            updated_at: new Date().toISOString()
                        });
                    }
                }
                console.log(`[Sync] Cloud backup successful for ${mid}`);
            } catch (cloudErr) {
                console.error(`[Sync] Background cloud sync failed for ${mid}:`, cloudErr);
            }
        })();

    } catch (e) {
        console.error("[Save] Global error:", e);
        if (!res.headersSent) res.status(500).json({ error: e.message });
    }
});

// 4. System & Subscription API
app.get('/api/system/machine-id', async (req, res) => {
    const mid = await getMid();
    console.log(`[System] Machine ID requested: ${mid}`);
    res.json({ id: mid });
});

app.get('/api/system/subscription-verify', async (req, res) => {
    try {
        const mid = (await getMid()).toUpperCase().trim();
        const now = new Date();

        // --- ANTI-TAMPER LOGIC ---
        const baseDir = process.env.CLASSICO_DATA_PATH || __dirname;
        const localPath = path.join(baseDir, 'database.json');
        if (fs.existsSync(localPath)) {
            try {
                const localData = JSON.parse(fs.readFileSync(localPath, 'utf8'));
                if (localData.last_seen_time) {
                    const lastSeen = new Date(localData.last_seen_time);
                    // Margin of 75 minutes (4,500,000 ms) to accommodate Daylight Saving changes + small clock drifts
                    if (now < new Date(lastSeen.getTime() - 4500000)) {
                        console.error(`[Security] Date tampering detected for ${mid}. Now: ${now.toISOString()}, LastSeen: ${lastSeen.toISOString()}`);
                        return res.json({ 
                            success: false, 
                            status: 'tampered', 
                            message: 'تنبيه أمني: تم اكتشاف تلاعب في تاريخ الجهاز. يرجى ضبط الساعة للوقت الحالي والاتصال بالإنترنت.' 
                        });
                    }
                }
                // Update last seen if clock is moving forward
                if (!localData.last_seen_time || now > new Date(localData.last_seen_time)) {
                    localData.last_seen_time = now.toISOString();
                    fs.writeFileSync(localPath, JSON.stringify(localData, null, 2));
                }
            } catch (e) { console.warn("[Security] Could not verify last_seen_time", e.message); }
        }
        // -------------------------

        // 1. Direct check (Primary Device)
        const results = await SupabaseService.request('GET', `/rest/v1/subscriptions?machine_id=eq.${mid}&select=*`);
        let sub = (results && results.length > 0) ? results[0] : null;

        // 2. Secondary check (Additional Device via activation_keys)
        if (!sub) {
            // Search for mid inside activation_keys array of any active subscription
            const allActive = await SupabaseService.request('GET', `/rest/v1/subscriptions?status=eq.active&select=*`);
            sub = (allActive || []).find(s => {
                const keys = Array.isArray(s.activation_keys) ? s.activation_keys : [];
                return keys.some(k => k.hardware_id === mid);
            });
        }

        if (!sub) return res.json({ success: false, status: 'none', mid: mid });

        let status = sub.status;
        const expiry = sub.expires_at ? new Date(sub.expires_at) : null;

        if (status === 'active' && expiry && expiry <= now) status = 'expired';

        if (status === 'active') {
            const token = `${mid}|active|${sub.expires_at}`;
            const sig = crypto.createHmac('sha256', SECRET_KEY).update(token).digest('hex');
            res.json({
                success: true,
                status: 'active',
                activated_at: sub.activated_at || sub.created_at,
                created_at: sub.created_at,
                expires_at: sub.expires_at,
                plan_type: sub.plan_type,
                max_devices: sub.max_devices || 1,
                activation_keys: sub.activation_keys || [],
                token: `${token}.${sig}`
            });
        } else {
            // 3. Last chance: check subscription_keys table for used_by
            const keyResults = await SupabaseService.request('GET', `/rest/v1/subscription_keys?used_by=eq.${mid}&status=eq.used&select=device_name,owner_machine_id`);
            if (keyResults && keyResults.length > 0) {
                const keyInfo = keyResults[0];
                // Check if owner is active
                const ownerResults = await SupabaseService.request('GET', `/rest/v1/subscriptions?machine_id=eq.${keyInfo.owner_machine_id}&status=eq.active&select=*`);
                if (ownerResults && ownerResults.length > 0) {
                    const ownerSub = ownerResults[0];
                    const ownerExpiry = ownerSub.expires_at ? new Date(ownerSub.expires_at) : null;
                    if (ownerExpiry && ownerExpiry > now) {
                        const token = `${mid}|active|${ownerSub.expires_at}`;
                        const sig = crypto.createHmac('sha256', SECRET_KEY).update(token).digest('hex');
                        return res.json({
                            success: true,
                            status: 'active',
                            activated_at: ownerSub.activated_at || ownerSub.created_at,
                            created_at: ownerSub.created_at,
                            expires_at: ownerSub.expires_at,
                            plan_type: ownerSub.plan_type,
                            device_name: keyInfo.device_name || null,
                            token: `${token}.${sig}`
                        });
                    }
                }
            }
            res.json({ success: false, status: status });
        }
    } catch (e) { 
        console.error("[Subscription] Online verification failed. Trying secure offline fallback...", e.message);
        
        // --- SECURE OFFLINE FALLBACK CRYPTOGRAPHIC VALIDATION ---
        const baseDir = process.env.CLASSICO_DATA_PATH || __dirname;
        const localPath = path.join(baseDir, 'database.json');
        if (fs.existsSync(localPath)) {
            try {
                const localData = JSON.parse(fs.readFileSync(localPath, 'utf8'));
                const localSub = localData.classico_subscription;
                
                if (localSub && localSub.status === 'active' && localSub.token) {
                    const [tokenPayload, sig] = localSub.token.split('.');
                    if (tokenPayload && sig) {
                        const expectedSig = crypto.createHmac('sha256', SECRET_KEY).update(tokenPayload).digest('hex');
                        
                        if (sig === expectedSig) {
                            const [cachedMid, status, expiryStr] = tokenPayload.split('|');
                            if (status === 'active') {
                                if (cachedMid !== mid) {
                                    console.warn(`[Offline Fallback] Machine ID mismatch. Cached in token: ${cachedMid}, Current machine: ${mid}. Allowing because signature is verified.`);
                                }
                                const expiry = new Date(expiryStr);
                                if (expiry > now) {
                                    console.log(`[Security] Secure offline subscription verified for machine: ${mid}`);
                                    return res.json({
                                        success: true,
                                        status: 'active',
                                        activated_at: localSub.activated_at || localSub.created_at,
                                        created_at: localSub.created_at,
                                        expires_at: localSub.expires_at,
                                        plan_type: localSub.plan_type,
                                        max_devices: localSub.max_devices || 1,
                                        activation_keys: localSub.activation_keys || [],
                                        token: localSub.token
                                    });
                                }
                            }
                        }
                    }
                }
            } catch (err) {
                console.error("[Security] Offline cryptographic check error:", err.message);
            }
        }
        res.json({ success: false, status: 'error', message: 'خطأ في الاتصال بسيرفر التحقق ولم يتم العثور على تفعيل محلي موثق.' }); 
    }
});

app.post('/api/system/activate-additional', async (req, res) => {
    try {
        const mid = (await getMid()).toUpperCase().trim();
        const { serial, phone } = req.body;

        if (!serial || !phone) return res.json({ success: false, message: 'بيانات ناقصة' });

        // 1. Find the key in the new subscription_keys table
        const keys = await SupabaseService.request('GET', `/rest/v1/subscription_keys?serial_key=eq.${serial}&status=eq.unused&select=*`);
        const targetKey = (keys && keys.length > 0) ? keys[0] : null;

        if (!targetKey) {
            return res.json({ success: false, message: 'كود التفعيل غير صحيح أو مستخدم بالفعل' });
        }

        // 2. Double check if this key belongs to a subscription with this phone number
        const ownerMid = targetKey.owner_machine_id;
        const subs = await SupabaseService.request('GET', `/rest/v1/subscriptions?machine_id=eq.${ownerMid}&phone_number=eq.${phone}&status=eq.active&select=id`);
        
        if (!subs || subs.length === 0) {
            return res.json({ success: false, message: 'رقم الهاتف غير مطابق لمالك هذا الكود' });
        }

        // 3. Bind the device to the key
        await SupabaseService.request('PATCH', `/rest/v1/subscription_keys?id=eq.${targetKey.id}`, {
            status: 'used',
            used_by: mid,
            activated_at: new Date().toISOString()
        });

        res.json({ success: true, message: 'تم تفعيل الجهاز بنجاح', device_name: targetKey.device_name || null });
    } catch (e) {
        console.error("Activation failed:", e);
        res.status(500).json({ success: false, message: 'خطأ في الاتصال بالسيرفر' });
    }
});

app.post('/api/system/subscription-request', async (req, res) => {
    try {
        const mid = (await getMid()).toUpperCase().trim();
        const { plan_type, amount, payment_method, transaction_id, phone_number, max_devices } = req.body;

        const devicesCount = parseInt(max_devices) || 1;
        const phone = String(phone_number || '').trim() || 'N/A';

        // Fail-safe: Store phone and devices inside payment_method string 
        // so they appear even if DB columns are missing
        const enhancedMethod = `${payment_method} | 📱 ${phone} | 🖥️ ${devicesCount} devices`;

        const payload = {
            plan_type: plan_type || 'monthly',
            amount: Number(amount) || 0,
            payment_method: enhancedMethod,
            transaction_id: transaction_id || 'N/A',
            phone_number: phone,
            max_devices: devicesCount,
            device_limit: devicesCount,
            status: 'pending',
            created_at: new Date().toISOString()
        };

        // 0. CLEANUP OLD DATA FIRST (To ensure fresh start if re-requesting)
        try {
            // Delete any existing pending/active sub and its keys to avoid conflicts
            await SupabaseService.request('DELETE', `/rest/v1/subscriptions?machine_id=eq.${mid}`);
            await SupabaseService.request('DELETE', `/rest/v1/subscription_keys?owner_machine_id=eq.${mid}`);
        } catch (e) { console.log("Cleanup ignored (new user)"); }

        // 1. Create NEW record (Always POST now for a clean start)
        await SupabaseService.request('POST', '/rest/v1/subscriptions', {
            machine_id: mid,
            ...payload
        });
        
        res.json({ success: true, status: 'pending' });
    } catch (e) {
        console.error("[Subscription] ERROR:", e);
        res.status(500).json({ success: false, error: e.message || 'Supabase Error' });
    }
});

app.get('/api/system/subscription-history', async (req, res) => {
    try {
        const mid = (await getMid()).toUpperCase().trim();
        console.log(`[History] Fetching for ${mid}`);
        try {
            const logs = await SupabaseService.request('GET', `/rest/v1/subscription_logs?machine_id=eq.${mid}&select=*&limit=50&order=created_at.desc`);
            res.json(logs || []);
        } catch (dbErr) {
            console.error(`[Subscription History] Supabase query failed for ${mid}:`, dbErr);
            // Graceful fallback to avoid throwing 500 errors in browser console
            res.json([]);
        }
    } catch (e) { 
        console.error("[Subscription History] Global error:", e);
        res.json([]); 
    }
});

app.get('/api/admin/multi-branch-data', async (req, res) => {
    try {
        const mid = (await getMid()).toUpperCase().trim();
        const ownerMid = await getOwnerMachineId(mid);
        if (!ownerMid) {
            return res.status(400).json({ error: "Device is not part of an active multi-device subscription" });
        }

        // 1. Resolve all linked machines
        // Owner subscription details
        const subResults = await SupabaseService.request('GET', `/rest/v1/subscriptions?machine_id=eq.${ownerMid}&status=eq.active&select=*`);
        if (!subResults || subResults.length === 0) {
            return res.status(400).json({ error: "Subscription is not active" });
        }
        const sub = subResults[0];

        // Fetch sub-devices keys
        const keys = await SupabaseService.request('GET', `/rest/v1/subscription_keys?owner_machine_id=eq.${ownerMid}&status=eq.used&select=*`);

        // Compile list of branch nodes to load
        // Node structure: { machine_id, name }
        const branchNodes = [];
        const maxDevicesAllowed = sub.max_devices || 1;

        // Add owner node (always primary/main)
        branchNodes.push({ machine_id: ownerMid, name: "الفرع الرئيسي" });

        // Add sub-devices (Only up to the allowed subscription limit)
        if (keys && keys.length > 0) {
            keys.forEach(k => {
                if (k.used_by && branchNodes.length < maxDevicesAllowed) {
                    branchNodes.push({
                        machine_id: k.used_by.toUpperCase().trim(),
                        name: k.device_name || "جهاز فرعي"
                    });
                }
            });
        }

        // 2. Fetch the backup data for each node in parallel
        const branchesData = [];
        await Promise.all(branchNodes.map(async (node) => {
            try {
                // If it is the current machine, we can load local database to guarantee real-time accuracy!
                let dbData = null;
                if (node.machine_id === mid) {
                    const localPath = getDataPath();
                    if (fs.existsSync(localPath)) {
                        dbData = JSON.parse(fs.readFileSync(localPath, 'utf8'));
                    }
                }

                // If not current machine or local read failed, load from Supabase backup
                if (!dbData) {
                    const backupRes = await SupabaseService.request('GET', `/rest/v1/cloud_backups?machine_id=eq.${node.machine_id}&select=data`);
                    if (backupRes && backupRes.length > 0 && backupRes[0].data) {
                        dbData = backupRes[0].data;
                    }
                }

                // Resolve premium naming for branches (always compile node data, even if backup dbData is null/not yet synced)
                let resolvedName = node.name;
                if (dbData) {
                    if (node.machine_id === ownerMid) {
                        const customAppName = dbData.classico_app_settings?.appName || 'Classico';
                        resolvedName = `${customAppName} (الفرع الرئيسي)`;
                    } else {
                        resolvedName = node.name || dbData.classico_app_settings?.appName || "جهاز فرعي";
                    }
                } else {
                    if (node.machine_id === ownerMid) {
                        resolvedName = `Classico (الفرع الرئيسي)`;
                    } else {
                        resolvedName = node.name || "جهاز فرعي";
                    }
                }

                branchesData.push({
                    machine_id: node.machine_id,
                    name: resolvedName,
                    history: (dbData && dbData.classico_history) || [],
                    loungeHistory: (dbData && dbData.classico_lounge_history) || [],
                    archivedExpenses: (dbData && dbData.classico_archived_expenses) || [],
                    archivedSalaries: (dbData && dbData.classico_archived_salaries) || [],
                    users: (dbData && dbData.classico_users) || {},
                    appSettings: (dbData && dbData.classico_app_settings) || {},
                    activityLog: (dbData && dbData.classico_activity_log) || []
                });
            } catch (err) {
                console.error(`Failed to load backup data for branch ${node.name} (${node.machine_id}):`, err.message);
            }
        }));

        res.json({
            success: true,
            max_devices: sub.max_devices || 1,
            branches: branchesData
        });
    } catch (e) {
        console.error("[Multi-Branch API] Global error:", e);
        res.status(500).json({ error: e.message });
    }
});

app.get('/api/logo', (req, res) => {
    const logoPaths = [path.join(__dirname, 'classico-v3/src/assets/images/logoapp.png'), path.join(__dirname, 'logoapp.png')];
    let logoPath = logoPaths.find(p => fs.existsSync(p));
    if (logoPath) res.sendFile(logoPath);
    else res.status(404).send('Logo not found');
});

// 5. Special Routes
app.get('/portal', (req, res) => { res.sendFile(path.join(__dirname, 'OwnerPortal.html')); });

app.get('/api/system/cloud-backup-info', async (req, res) => {
    try {
        const mid = (await getMid()).toUpperCase().trim();
        try {
            const results = await SupabaseService.request('GET', `/rest/v1/cloud_backups?machine_id=eq.${mid}&select=updated_at`);
            if (results && results.length > 0) res.json({ updated_at: results[0].updated_at });
            else res.json(null);
        } catch (dbErr) {
            console.error(`[Cloud Backup Info] Supabase query failed for ${mid}:`, dbErr);
            res.json(null);
        }
    } catch (e) { 
        console.error("[Cloud Backup Info] Global error:", e);
        res.json(null); 
    }
});

app.get('/api/system/cloud-restore', async (req, res) => {
    try {
        const mid = (await getMid()).toUpperCase();
        const results = await SupabaseService.request('GET', `/rest/v1/cloud_backups?machine_id=eq.${mid}&select=data`);
        if (results && results.length > 0) res.json(results[0].data);
        else res.status(404).json({ error: 'No backup found' });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/system/manual-cloud-backup', async (req, res) => {
    try {
        const mid = (await getMid()).toUpperCase().trim();
        const localPath = path.join(__dirname, 'database.json');
        if (fs.existsSync(localPath)) {
            const data = JSON.parse(fs.readFileSync(localPath, 'utf8'));
            // Try to update existing first
            try {
                const existing = await SupabaseService.request('GET', `/rest/v1/cloud_backups?machine_id=eq.${mid}&select=machine_id`);
                if (existing && existing.length > 0) {
                    await SupabaseService.request('PATCH', `/rest/v1/cloud_backups?machine_id=eq.${mid}`, { data, updated_at: new Date().toISOString() });
                } else {
                    await SupabaseService.request('POST', '/rest/v1/cloud_backups', { machine_id: mid, data, updated_at: new Date().toISOString() });
                }
                console.log(`[Manual Backup] Cloud sync successful for ${mid}`);
                res.json({ success: true });
            } catch (err) {
                console.error("[Manual Backup] Supabase error:", err);
                res.status(500).json({ error: 'Failed to sync with cloud' });
            }
        } else {
            res.status(404).json({ error: 'Local database.json not found' });
        }
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/system/factory-reset', async (req, res) => {
    try {
        const mid = (await getMid()).toUpperCase().trim();
        const cleanData = req.body; // The clean state from frontend

        console.log(`[Factory Reset] Initiating for ${mid}...`);

        // 1. Wipe Cloud
        await SupabaseService.request('PATCH', `/rest/v1/cloud_backups?machine_id=eq.${mid}`, {
            data: cleanData,
            updated_at: new Date().toISOString()
        }).catch(async () => {
            // If record doesn't exist, just create a clean one
            await SupabaseService.request('POST', '/rest/v1/cloud_backups', {
                machine_id: mid,
                data: cleanData,
                updated_at: new Date().toISOString()
            });
        });

        // 2. Wipe Local
        const localPath = getDataPath();
        const backupDir = path.join(__dirname, 'backups');

        if (fs.existsSync(localPath)) {
            fs.renameSync(localPath, localPath + '.factory_reset_bak');
        }
        fs.writeFileSync(localPath, JSON.stringify(cleanData, null, 2));

        if (fs.existsSync(backupDir)) {
            const files = fs.readdirSync(backupDir);
            files.forEach(f => {
                try { fs.unlinkSync(path.join(backupDir, f)); } catch (e) { }
            });
        }

        console.log(`[Factory Reset] Completed successfully for ${mid}`);
        res.json({ success: true });
    } catch (e) {
        console.error("[Factory Reset] Failed:", e.message);
        res.status(500).json({ error: e.message });
    }
});

app.post('/api/system/archive-maintenance', async (req, res) => {
    try {
        const { monthsThreshold = 6 } = req.body;
        const localPath = path.join(__dirname, 'database.json');
        if (!fs.existsSync(localPath)) return res.status(404).json({ error: 'Database not found' });

        const data = JSON.parse(fs.readFileSync(localPath, 'utf8'));
        const now = new Date();
        const thresholdDate = new Date();
        thresholdDate.setMonth(now.getMonth() - monthsThreshold);

        const archivesDir = path.join(__dirname, 'archived_files');
        if (!fs.existsSync(archivesDir)) fs.mkdirSync(archivesDir);

        const archivedData = {
            timestamp: new Date().toISOString(),
            threshold: thresholdDate.toISOString(),
            classico_history: [],
            classico_lounge_history: [],
            classico_archived_expenses: [],
            classico_archived_salaries: [],
            classico_activity_log: []
        };

        const filterOld = (list, archiveList, dateField = 'timestamp') => {
            if (!Array.isArray(list)) return [];
            const remaining = [];
            list.forEach(item => {
                const itemDate = new Date(item[dateField] || item.archivedAt || item.created_at);
                if (!isNaN(itemDate) && itemDate < thresholdDate) {
                    archiveList.push(item);
                } else {
                    remaining.push(item);
                }
            });
            return remaining;
        };

        data.classico_history = filterOld(data.classico_history, archivedData.classico_history);
        data.classico_lounge_history = filterOld(data.classico_lounge_history, archivedData.classico_lounge_history);
        data.classico_archived_expenses = filterOld(data.classico_archived_expenses, archivedData.classico_archived_expenses);
        data.classico_archived_salaries = filterOld(data.classico_archived_salaries, archivedData.classico_archived_salaries);
        data.classico_activity_log = filterOld(data.classico_activity_log, archivedData.classico_activity_log);

        const totalArchived = archivedData.classico_history.length +
            archivedData.classico_lounge_history.length +
            archivedData.classico_archived_expenses.length +
            archivedData.classico_archived_salaries.length;

        if (totalArchived > 0) {
            const archiveFileName = `archive-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
            fs.writeFileSync(path.join(archivesDir, archiveFileName), JSON.stringify(archivedData, null, 2));
            fs.writeFileSync(localPath, JSON.stringify(data, null, 2));
            res.json({ success: true, archivedCount: totalArchived, fileName: archiveFileName });
        } else {
            res.json({ success: true, archivedCount: 0, message: 'No old data found to archive' });
        }
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// 6. Background Maintenance (Backups & Auto-Sync)
async function runMaintenance() {
    console.log('[Maintenance] Running scheduled tasks...');
    try {
        const mid = await getMid();
        const localPath = path.join(__dirname, 'database.json');
        if (!fs.existsSync(localPath)) return;

        const data = JSON.parse(fs.readFileSync(localPath, 'utf8'));

        // A. Hourly Local Backup
        const backupDir = path.join(__dirname, 'backups');
        if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir);

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupFile = path.join(backupDir, `backup-${timestamp}.json`);
        fs.writeFileSync(backupFile, JSON.stringify(data, null, 2));

        // Rotate: Keep only last 24
        const files = fs.readdirSync(backupDir)
            .filter(f => f.startsWith('backup-'))
            .map(f => ({ name: f, time: fs.statSync(path.join(backupDir, f)).mtime }))
            .sort((a, b) => b.time - a.time);

        if (files.length > 24) {
            files.slice(24).forEach(f => fs.unlinkSync(path.join(backupDir, f.name)));
            console.log(`[Maintenance] Rotated local backups. Deleted ${files.length - 24} old files.`);
        }

        // B. Daily Auto Cloud Sync
        const cloudInfo = await SupabaseService.request('GET', `/rest/v1/cloud_backups?machine_id=eq.${mid}&select=updated_at`);
        const lastCloud = (cloudInfo && cloudInfo.length > 0) ? new Date(cloudInfo[0].updated_at) : new Date(0);
        const now = new Date();

        if (now - lastCloud > 24 * 60 * 60 * 1000) {
            console.log('[Maintenance] Triggering daily cloud sync...');
            await SupabaseService.request('PATCH', `/rest/v1/cloud_backups?machine_id=eq.${mid}`, { data, updated_at: now.toISOString() })
                .catch(async () => {
                    await SupabaseService.request('POST', '/rest/v1/cloud_backups', { machine_id: mid, data, updated_at: now.toISOString() });
                });
            console.log('[Maintenance] Daily cloud sync completed.');
        }
    } catch (e) {
        console.error('[Maintenance] Task failed:', e.message);
    }
}

// Run maintenance every hour
setInterval(runMaintenance, 60 * 60 * 1000);
setTimeout(runMaintenance, 60 * 1000);

// --- ADMIN / OWNER PORTAL ENDPOINTS ---

app.get('/api/admin/subscriptions', async (req, res) => {
    try {
        const subs = await SupabaseService.request('GET', '/rest/v1/subscriptions?select=*&order=created_at.desc');
        res.json({ success: true, subs });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

app.post('/api/admin/approve', async (req, res) => {
    try {
        const { machine_id, plan_type } = req.body;
        if (!machine_id) return res.status(400).json({ error: 'Missing machine_id' });

        const mid = machine_id.toUpperCase().trim();
        console.log(`[Admin] Manual Approving ${mid} (Plan: ${plan_type})`);

        // 1. Get subscription details
        const results = await SupabaseService.request('GET', `/rest/v1/subscriptions?machine_id=eq.${mid}`);
        const sub = (results && results.length > 0) ? results[0] : null;
        if (!sub) {
            console.error(`[Admin] Subscription not found for MID: ${mid}`);
            return res.status(404).json({ error: 'Subscription not found' });
        }

        const maxDevices = parseInt(sub.max_devices) || 1;
        let days = 30; // Default monthly
        if (plan_type === 'yearly') days = 365;
        else if (plan_type === 'trial') days = 7;
        const expiry = new Date();
        expiry.setDate(expiry.getDate() + days);

        // 2. Activate main IMMEDIATELY
        console.log(`[Admin] Activating main device...`);
        await SupabaseService.request('PATCH', `/rest/v1/subscriptions?machine_id=eq.${mid}`, {
            status: 'active',
            activated_at: new Date().toISOString(),
            expires_at: expiry.toISOString()
        });

        // 2b. LOG THE ACTIVATION
        try {
            await SupabaseService.request('POST', '/rest/v1/subscription_logs', {
                machine_id: mid,
                plan_type: plan_type,
                status: 'active',
                created_at: new Date().toISOString(),
                expires_at: expiry.toISOString(),
                action: 'approved'
            });
        } catch (logErr) { console.error("[Admin] Failed to log approval:", logErr); }

        // 3. Respond to client IMMEDIATELY (Fast UI response)
        res.json({ success: true, message: 'تم تفعيل الجهاز الرئيسي وتسجيل العملية...' });

        // 4. Generate serials for others in the BACKGROUND (Non-blocking)
        if (maxDevices > 1) {
            (async () => {
                try {
                    console.log(`[Admin] Plan allows ${maxDevices} devices. Checking keys in background...`);
                    const existingKeys = await SupabaseService.request('GET', `/rest/v1/subscription_keys?owner_machine_id=eq.${mid}`);
                    const currentKeyCount = Array.isArray(existingKeys) ? existingKeys.length : 0;
                    const keysToGenerate = (maxDevices - 1) - currentKeyCount;

                    if (keysToGenerate > 0) {
                        console.log(`[Admin] Generating ${keysToGenerate} new serial keys...`);
                        for (let i = 0; i < keysToGenerate; i++) {
                            const randomKey = 'CLASS-' + Math.random().toString(36).substring(2, 6).toUpperCase() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase();
                            await SupabaseService.request('POST', '/rest/v1/subscription_keys', {
                                owner_machine_id: mid,
                                serial_key: randomKey,
                                status: 'unused',
                                expires_at: expiry.toISOString()
                            });
                        }
                        console.log(`[Admin] Background key generation completed for ${mid}`);
                    }
                } catch (bgErr) {
                    console.error(`[Admin] Background Key Gen Failed for ${mid}:`, bgErr);
                }
            })();
        }

    } catch (e) {
        console.error(`[Admin] Approval Failed:`, e);
        if (!res.headersSent) {
            res.status(500).json({ 
                success: false, 
                error: e.message || 'Internal Server Error'
            });
        }
    }
});

app.post('/api/admin/unlink-key', async (req, res) => {
    try {
        const { key_id } = req.body;
        if (!key_id) return res.status(400).json({ error: 'Missing key_id' });
        
        await SupabaseService.request('PATCH', `/rest/v1/subscription_keys?id=eq.${key_id}`, {
            status: 'unused',
            used_by: null
        });
        
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

app.post('/api/admin/update-key-name', async (req, res) => {
    try {
        const { key_id, device_name } = req.body;
        if (!key_id) return res.status(400).json({ error: 'Missing key_id' });
        
        await SupabaseService.request('PATCH', `/rest/v1/subscription_keys?id=eq.${key_id}`, {
            device_name: device_name || ''
        });
        
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

app.get('/api/admin/my-keys', async (req, res) => {
    try {
        const mid = (await getMid()).toUpperCase().trim();
        const keys = await SupabaseService.request('GET', `/rest/v1/subscription_keys?owner_machine_id=eq.${mid}`);
        res.json({ success: true, keys: keys || [] });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

app.get('/api/admin/all-keys', async (req, res) => {
    try {
        const keys = await SupabaseService.request('GET', '/rest/v1/subscription_keys?select=*');
        res.json({ success: true, keys: keys || [] });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

app.post('/api/admin/reject', async (req, res) => {
    try {
        const { machine_id } = req.body;
        if (!machine_id) return res.status(400).json({ error: 'Missing machine_id' });
        
        const mid = machine_id.toUpperCase().trim();
        console.log(`[Admin] 🗑️ Request to DELETE subscriber: [${mid}]`);

        // 1. Get info for logging before delete
        const results = await SupabaseService.request('GET', `/rest/v1/subscriptions?machine_id=eq.${mid}`);
        const sub = (results && results.length > 0) ? results[0] : null;

        if (!sub) {
            console.warn(`[Admin] ⚠️ Subscriber [${mid}] not found in Database.`);
        }

        // 2. Delete from subscriptions
        console.log(`[Admin] Executing DELETE for ${mid} from subscriptions table...`);
        await SupabaseService.request('DELETE', `/rest/v1/subscriptions?machine_id=eq.${mid}`);

        // 2b. Delete associated keys (Cleanup)
        try {
            await SupabaseService.request('DELETE', `/rest/v1/subscription_keys?owner_machine_id=eq.${mid}`);
            console.log(`[Admin] Keys cleaned up for ${mid}`);
        } catch (err) { console.error("[Admin] Key cleanup failed:", err); }

        // 3. LOG THE DELETION
        try {
            await SupabaseService.request('POST', '/rest/v1/subscription_logs', {
                machine_id: mid,
                plan_type: sub ? sub.plan_type : 'unknown',
                status: 'deleted',
                created_at: new Date().toISOString(),
                action: 'rejected'
            });
            console.log(`[Admin] Deletion logged for ${mid}`);
        } catch (logErr) { console.error("[Admin] Failed to log rejection:", logErr); }

        console.log(`[Admin] ✅ Process finished for ${mid}`);
        res.json({ success: true });
    } catch (e) {
        console.error(`[Admin] ❌ Global Reject Error for ${mid}:`, e);
        res.status(500).json({ success: false, error: e.message });
    }
});

// 7. SPA Routing & Fallback (Must be last)
app.get('*', (req, res) => {
    if (!req.path.startsWith('/api/')) {
        const indexPath = path.join(__dirname, 'classico-v3/dist/index.html');
        if (fs.existsSync(indexPath)) res.sendFile(indexPath);
        else res.sendFile(path.join(__dirname, 'OwnerPortal.html'));
    } else {
        console.warn(`[404] API Not Found: ${req.path}`);
        res.status(404).json({ error: 'API not found' });
    }
});

app.listen(PORT, () => {
    console.log(`[System] Classico Server running at http://localhost:${PORT}`);
    console.log(`[System] Working Directory: ${__dirname}`);
});
