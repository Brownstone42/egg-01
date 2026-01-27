import liff from '@line/liff'

// The liff object that will be used throughout the app
export { liff }

// The LIFF ID from your channel.
const LIFF_ID = '2008872756-AKJqN84t'

/**
 * Initializes the LIFF SDK.
 * @returns {Promise<void>}
 */
export const liffInit = async () => {
    try {
        console.log(`Initializing LIFF with ID: ${LIFF_ID}`)
        await liff.init({ liffId: LIFF_ID })
        console.log('LIFF initialized successfully.')
    } catch (error) {
        console.error('LIFF initialization failed:', error.code, error.message)
    }
}

/**
 * A reactive helper to indicate if the app is inside the LIFF browser.
 * This value is only reliable after liffInit has been called.
 * @returns {boolean}
 */
export const isInLiff = () => {
    // liff.isInClient() is the official way to check
    return liff.isInClient()
}
