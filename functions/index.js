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

// --- Claim Order Function (UPDATED) ---
exports.claimOrder = functions.region("asia-southeast1").https.onCall(async (data, context) => {
    // 1. Check if user is authenticated
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'The function must be called while authenticated.');
    }

    const { orderId } = data;
    if (!orderId) {
        throw new functions.https.HttpsError('invalid-argument', 'The function must be called with one argument "orderId".');
    }

    const uid = context.auth.uid;
    const orderRef = db.collection('orders').doc(orderId);

    try {
        // 2. Run a transaction to ensure atomic update
        await db.runTransaction(async (transaction) => {
            const orderDoc = await transaction.get(orderRef);

            if (!orderDoc.exists) {
                throw new functions.https.HttpsError('not-found', 'Order not found.');
            }

            const orderData = orderDoc.data();

            // 3. Check Payment Status (NEW)
            if (orderData.status !== 'paid' && orderData.status !== 'successful') {
                 throw new functions.https.HttpsError('failed-precondition', 'Order must be paid before claiming.');
            }

            // 4. Check ownership
            if (orderData.userId !== 'guest' && orderData.userId !== 'guest_user') {
                if (orderData.userId === uid) {
                    throw new functions.https.HttpsError('already-exists', 'You already own this order.');
                } else {
                    throw new functions.https.HttpsError('permission-denied', 'This order already belongs to another user.');
                }
            }

            // 5. Update ownership
            transaction.update(orderRef, { userId: uid });
        });

        return { success: true, message: 'Order successfully claimed.' };

    } catch (error) {
        console.error("Claim Order Error:", error);
        // Re-throw HttpsError so the client gets the correct code/message
        if (error instanceof functions.https.HttpsError) {
            throw error;
        }
        throw new functions.https.HttpsError('internal', 'Unable to claim order.', error.message);
    }
});


// --- Omise & Order Functions (Updated) ---

// Helper Function
const calculateDeliveryDates = (deliveryScheduleStr, numberOfDeliveries) => {
    const daysMap = {'Sunday': 0, 'Monday': 1, 'Tuesday': 2, 'Wednesday': 3, 'Thursday': 4, 'Friday': 5, 'Saturday': 6};
    
    // Default to Monday if not found
    let targetDay = 1; 
    
    if (deliveryScheduleStr) {
        for (const day in daysMap) {
            if (deliveryScheduleStr.includes(day)) {
                targetDay = daysMap[day];
                break;
            }
        }
    }

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

    for (let i = 0; i < numberOfDeliveries; i++) {
        const d = new Date(firstDeliveryDate);
        d.setUTCDate(firstDeliveryDate.getUTCDate() + (i * 7));
        const saveDate = new Date(d.getTime() - thaiTimeOffset);
        dates.push(saveDate);
    }
    return dates;
};

// Helper to determine total deliveries based on items
const getTotalDeliveries = (items) => {
    if (!items || !Array.isArray(items) || items.length === 0) return 4; // Default if no items
    
    // Check if any item is monthly.
    const hasMonthly = items.some(item => {
        // Safe check for cycle property, handle case insensitive
        const cycle = item.cycle ? item.cycle.toLowerCase() : '';
        return cycle === 'monthly';
    });
    
    console.log("Determining deliveries for items:", JSON.stringify(items));
    console.log("Has Monthly?", hasMonthly);

    return hasMonthly ? 4 : 1;
};

exports.createCharge = functions.region("asia-southeast1").https.onRequest((req, res) => {
  cors(req, res, async () => {
    if (req.method !== "POST") return res.status(405).send("Method Not Allowed");
    try {
      const { source, amount, currency = "thb", metadata } = req.body;
      if (!source || !amount) return res.status(400).send({ error: "Missing source or amount" });

      const charge = await omise.charges.create({
        amount: amount, currency: currency, source: source,
        return_uri: "http://localhost:5173/success", // Only used for credit card redirect flow
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
            // Omise Webhook sends the whole charge object in 'data' field
            // But if called manually, it might send 'chargeId'
            let charge = req.body.data;
            let chargeId = req.body.chargeId;

            if (!charge && chargeId) {
                // Manual check
                charge = await omise.charges.retrieve(chargeId);
            } else if (!charge && !chargeId) {
                // Try reading directly from body (some webhook formats)
                charge = req.body;
            }

            if (!charge || !charge.id) {
                 return res.status(400).send({ error: "Invalid payload" });
            }
            
            chargeId = charge.id;
            console.log(`Processing charge ${chargeId}, status: ${charge.status}`);

            if (charge.status === 'successful') {
                const orderId = charge.metadata.orderId || chargeId;
                const orderRef = db.collection('orders').doc(orderId);
                const doc = await orderRef.get();

                if (!doc.exists) {
                    // Fallback: This path is risky if we don't have items info.
                    console.log(`Order ${orderId} not found (created via webhook metadata).`);
                    const orderData = charge.metadata || {};
                    
                    // Default to 4 if we really don't know
                    let numberOfDeliveries = 4; 
                    let deliveryDates = calculateDeliveryDates(orderData.deliverySchedule, numberOfDeliveries);
                    
                    await orderRef.set({
                        ...orderData,
                        chargeId: chargeId,
                        amount: charge.amount,
                        status: 'paid',
                        createdAt: admin.firestore.FieldValue.serverTimestamp(),
                        paymentMethod: 'promptpay',
                        deliveryDates: deliveryDates,
                        remainingDeliveries: numberOfDeliveries
                    });
                } else {
                    // Update existing order
                    console.log(`Order ${orderId} found. Updating status to paid.`);
                    
                    const currentData = doc.data();
                    
                    // Always RE-CALCULATE delivery details on payment success
                    // to ensure they match the selected plan.
                    
                    // 1. Determine Schedule (Prefer metadata, then existing data, then default)
                    const schedule = charge.metadata.deliverySchedule || currentData.deliverySchedule || "Monday";
                    
                    // 2. Determine Number of Deliveries based on ITEMS
                    const numberOfDeliveries = getTotalDeliveries(currentData.items);
                    
                    // 3. Calculate Dates
                    const deliveryDates = calculateDeliveryDates(schedule, numberOfDeliveries);

                    console.log(`Calculated: ${numberOfDeliveries} deliveries starting ${schedule}`);

                    await orderRef.update({
                        status: 'paid',
                        chargeId: chargeId,
                        paidAt: admin.firestore.FieldValue.serverTimestamp(),
                        deliveryDates: deliveryDates,
                        remainingDeliveries: numberOfDeliveries,
                        // Ensure schedule is saved if it came from metadata
                        deliverySchedule: schedule 
                    });
                }
            }
            return res.status(200).send({ status: charge.status });
        } catch (error) {
            console.error("Check Status Error:", error);
            return res.status(500).send({ error: error.message });
        }
    });
});
