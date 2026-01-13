const functions = require("firebase-functions/v1");
const admin = require("firebase-admin");
const axios = require("axios");
const cors = require("cors")({ origin: true });
const jwt = require("jsonwebtoken");

admin.initializeApp();
const db = admin.firestore();

// --- Secret Keys ---
const OMISE_SECRET_KEY = "skey_test_63bgheu6ailreazhcdf"; 
const LINE_CHANNEL_ID = "2008872756";
const LINE_CHANNEL_SECRET = "800cb4f9600a0c34eda9882f631a86d9";

const omise = require("omise")({
  secretKey: OMISE_SECRET_KEY,
});

// --- Reusable Helper Function for Firebase User Creation/Update (FIXED) ---
const findOrCreateFirebaseUser = async (lineUserId, displayName, pictureUrl, email) => {
    const uid = `line:${lineUserId}`;
    console.log(`Finding or creating user for uid: ${uid}`);

    try {
        await admin.auth().getUser(uid);
        console.log("Found existing user:", uid);
        
        const updateUserPayload = {
            displayName: displayName,
            photoURL: pictureUrl,
        };
        if (email) {
            updateUserPayload.email = email;
        }
        await admin.auth().updateUser(uid, updateUserPayload);

    } catch (error) {
        if (error.code === 'auth/user-not-found') {
            console.log("Creating new user:", uid);

            const createUserPayload = {
                uid: uid,
                displayName: displayName,
                photoURL: pictureUrl,
            };
            if (email) {
                createUserPayload.email = email;
                createUserPayload.emailVerified = true;
            }
            await admin.auth().createUser(createUserPayload);

        } else {
            console.error("Error during user lookup/creation:", error);
            throw error;
        }
    }
    return uid;
};


// --- LIFF Auth Handler (NEW) ---
exports.liffAuthHandler = functions.region("asia-southeast1").https.onCall(async (data, context) => {
    const accessToken = data.accessToken;
    if (!accessToken) {
        throw new functions.https.HttpsError('invalid-argument', 'LIFF Access Token is required');
    }

    try {
        // 1. Verify LIFF access token and get user profile from LINE API
        const profileResponse = await axios.get('https://api.line.me/v2/profile', {
            headers: { 'Authorization': `Bearer ${accessToken}` },
        });

        const lineProfile = profileResponse.data;
        if (!lineProfile || !lineProfile.userId) {
            throw new functions.https.HttpsError('internal', 'Could not get user profile from LINE.');
        }
        
        const uid = await findOrCreateFirebaseUser(lineProfile.userId, lineProfile.displayName, lineProfile.pictureUrl, null /* email */);

        // 3. Create a custom Firebase token.
        const customToken = await admin.auth().createCustomToken(uid);
        console.log("Custom Token Created for LIFF user:", uid);
        return { token: customToken };

    } catch (error) {
        console.error("LIFF Auth Function Error:", error.response ? error.response.data : error.message);
        if (error instanceof functions.https.HttpsError) throw error;
        throw new functions.https.HttpsError('internal', 'LIFF authentication failed.', error.message);
    }
});


// --- Desktop LINE Login Handler (Refactored & FIXED for Production) ---
exports.lineAuthHandler = functions.region("asia-southeast1").https.onCall(async (data, context) => {
    const { code, redirectUri } = data; // Receive redirectUri from client

    if (!code || !redirectUri) {
        throw new functions.https.HttpsError('invalid-argument', 'Authorization code and redirectUri are required');
    }

    try {
        // 1. Exchange Authorization Code for tokens
        const tokenResponse = await axios.post('https://api.line.me/oauth2/v2.1/token', 
            new URLSearchParams({
                grant_type: 'authorization_code',
                code: code,
                redirect_uri: redirectUri, // Use the provided redirectUri
                client_id: LINE_CHANNEL_ID,
                client_secret: LINE_CHANNEL_SECRET,
            }), {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            }
        );

        const id_token = tokenResponse.data.id_token;
        if (!id_token) {
             throw new functions.https.HttpsError('internal', 'Could not get id_token from LINE');
        }

        // 2. Decode ID Token to get user profile
        const decodedToken = jwt.decode(id_token);
        if (!decodedToken || !decodedToken.sub) {
            throw new functions.https.HttpsError('internal', 'Failed to decode id_token or missing user ID.');
        }

        // 3. Find or Create Firebase User using the helper
        const uid = await findOrCreateFirebaseUser(decodedToken.sub, decodedToken.name, decodedToken.picture, decodedToken.email);

        // 4. Create Firebase Custom Token
        const customToken = await admin.auth().createCustomToken(uid);
        console.log("Custom Token Created for Desktop user:", uid);
        return { token: customToken };

    } catch (error) {
        console.error("Desktop LINE Auth Function Error:", error.response ? error.response.data : error.message);
        if (error instanceof functions.https.HttpsError) throw error;
        throw new functions.https.HttpsError('internal', 'Desktop LINE authentication failed.', error.message);
    }
});


// --- Omise & Order Functions (Existing, Unchanged) ---

// Helper Function
const calculateDeliveryDates = (deliveryScheduleStr) => {
    const daysMap = {'Sunday': 0, 'Monday': 1, 'Tuesday': 2, 'Wednesday': 3, 'Thursday': 4, 'Friday': 5, 'Saturday': 6};
    let targetDay = -1;
    for (const day in daysMap) {
        if (deliveryScheduleStr.includes(day)) {
            targetDay = daysMap[day];
            break;
        }
    }
    if (targetDay === -1) return [];

    const now = new Date();
    const thaiTimeOffset = 7 * 60 * 60 * 1000;
    const nowThai = new Date(now.getTime() + thaiTimeOffset);
    const currentDay = nowThai.getUTCDay();
    let daysUntilTarget = targetDay - currentDay;
    if (daysUntilTarget <= 0) {
        daysUntilTarget += 7;
    }

    const dates = [];
    const firstDeliveryDate = new Date(nowThai);
    firstDeliveryDate.setUTCDate(nowThai.getUTCDate() + daysUntilTarget);
    firstDeliveryDate.setUTCHours(0, 0, 0, 0);

    for (let i = 0; i < 4; i++) {
        const d = new Date(firstDeliveryDate);
        d.setUTCDate(firstDeliveryDate.getUTCDate() + (i * 7));
        const saveDate = new Date(d.getTime() - thaiTimeOffset);
        dates.push(saveDate);
    }
    return dates;
};

exports.createCharge = functions.region("asia-southeast1").https.onRequest((req, res) => {
  cors(req, res, async () => {
    if (req.method !== "POST") return res.status(405).send("Method Not Allowed");
    try {
      const { source, amount, currency = "thb", metadata } = req.body;
      if (!source || !amount) return res.status(400).send({ error: "Missing source or amount" });

      const charge = await omise.charges.create({
        amount: amount, currency: currency, source: source,
        return_uri: "http://localhost:5173/success",
        metadata: metadata || {}
      });
      return res.status(200).send(charge);
    } catch (error) {
      console.error("Omise Charge Error:", error);
      return res.status(500).send({ error: error.message });
    }
  });
});

exports.checkChargeStatus = functions.region("asia-southeast1").https.onRequest((req, res) => {
    cors(req, res, async () => {
        if (req.method !== "POST") return res.status(405).send("Method Not Allowed");
        try {
            const { chargeId } = req.body;
            if (!chargeId) return res.status(400).send({ error: "Missing chargeId" });

            const charge = await omise.charges.retrieve(chargeId);
            
            if (charge.status === 'successful') {
                const orderRef = db.collection('orders').doc(charge.metadata.orderId || chargeId);
                const doc = await orderRef.get();
                if (!doc.exists) {
                    const orderData = charge.metadata || {};
                    let deliveryDates = [];
                    if (orderData.deliverySchedule) {
                        deliveryDates = calculateDeliveryDates(orderData.deliverySchedule);
                    }
                    await orderRef.set({
                        ...orderData,
                        chargeId: chargeId,
                        amount: charge.amount,
                        status: 'paid',
                        createdAt: admin.firestore.FieldValue.serverTimestamp(),
                        paymentMethod: 'promptpay',
                        deliveryDates: deliveryDates,
                        remainingDeliveries: 4
                    });
                    console.log(`Order saved for charge ${chargeId} with ${deliveryDates.length} delivery dates.`);
                } else {
                     console.log(`Order for charge ${chargeId} already exists. Skipping save.`);
                }
            }
            return res.status(200).send({ status: charge.status });
        } catch (error) {
            console.error("Check Status Error:", error);
            return res.status(500).send({ error: error.message });
        }
    });
});