import { defineStore } from 'pinia'
import {
    GoogleAuthProvider,
    signInWithPopup,
    onAuthStateChanged,
    signOut,
    RecaptchaVerifier,
    signInWithPhoneNumber,
    signInWithCustomToken,
} from 'firebase/auth'
import { httpsCallable } from 'firebase/functions'
import { auth, functions } from '../firebase'
import { liff, isInLiff } from '../liff' // Import LIFF helpers

// Helper to generate a random string for the state parameter
const generateRandomString = (length) => {
    let result = ''
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    const charactersLength = characters.length
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength))
    }
    return result
}

export const useAuthStore = defineStore('auth', {
    state: () => ({
        user: null,
        confirmationResult: null,
        authInitialized: false,
    }),
    getters: {
        isLineLogin: (state) => state.user?.providerData.some((p) => p.providerId === 'custom'),
    },
    actions: {
        init() {
            if (this.authInitialized) return

            onAuthStateChanged(auth, (currentUser) => {
                console.log(
                    'Auth State Changed:',
                    currentUser ? `Logged in as ${currentUser.uid}` : 'Logged Out',
                )
                this.user = currentUser
                this.authInitialized = true
            })
        },

        // The main LINE Login entry point
        async handleLineLogin() {
            if (isInLiff()) {
                console.log('Login requested from LIFF environment.')
                await this.loginWithLiff()
            } else {
                console.log('Login requested from Desktop environment.')
                await this.startDesktopLineLogin()
            }
        },

        async loginWithLiff() {
            try {
                if (!liff.isLoggedIn()) {
                    console.log('LIFF user is not logged in, redirecting to login...')
                    liff.login()
                    return // Stop execution, will redirect
                }

                console.log('Getting LIFF access token...')
                const accessToken = liff.getAccessToken()
                if (!accessToken) {
                    throw new Error('Could not get LIFF access token.')
                }

                const liffAuthHandler = httpsCallable(functions, 'liffAuthHandler')
                const result = await liffAuthHandler({ accessToken })

                if (!result.data || !result.data.token) {
                    throw new Error('No custom token returned from backend for LIFF auth.')
                }

                const { token } = result.data
                await signInWithCustomToken(auth, token)
                console.log('Successfully signed in with Firebase using LIFF token.')
            } catch (error) {
                console.error('Error during LIFF login process:', error)
            }
        },

        async loginWithGoogle() {
            const provider = new GoogleAuthProvider()
            await signInWithPopup(auth, provider)
        },

        startDesktopLineLogin() {
            console.log('Starting LINE Desktop Login...')

            // Read config from environment variables
            const lineChannelId = import.meta.env.VITE_LINE_CLIENT_ID
            const redirectUri = import.meta.env.VITE_LINE_REDIRECT_URI

            if (!lineChannelId || !redirectUri) {
                console.error(
                    'VITE_LINE_CLIENT_ID or VITE_LINE_REDIRECT_URI is not set in your .env file.',
                )
                return
            }

            const state = generateRandomString(16)
            sessionStorage.setItem('line_login_state', state)

            const params = new URLSearchParams({
                response_type: 'code',
                client_id: lineChannelId,
                redirect_uri: redirectUri,
                state: state,
                scope: 'profile openid email',
            })

            const authorizationUrl = `https://access.line.me/oauth2/v2.1/authorize?${params.toString()}`
            window.location.href = authorizationUrl
        },

        async finishDesktopLineLogin(code, state) {
            const storedState = sessionStorage.getItem('line_login_state')
            if (state !== storedState) {
                throw new Error('State mismatch. Possible CSRF attack.')
            }
            sessionStorage.removeItem('line_login_state')

            // Get redirect URI from environment variable to pass to the function
            const redirectUri = import.meta.env.VITE_LINE_REDIRECT_URI
            if (!redirectUri) {
                console.error('VITE_LINE_REDIRECT_URI is not set in your .env file.')
                return
            }

            const lineAuthHandler = httpsCallable(functions, 'lineAuthHandler')
            // Pass both code and redirectUri to the backend function
            const result = await lineAuthHandler({ code, redirectUri })

            if (!result.data || !result.data.token) {
                throw new Error('No custom token returned from backend')
            }

            const { token } = result.data
            await signInWithCustomToken(auth, token)
        },

        async logout() {
            if (isInLiff() && liff.isLoggedIn()) {
                liff.logout()
            }
            await signOut(auth)
            this.user = null

            const router = (await import('../router')).default
            if (router.currentRoute.value.path !== '/') {
                router.push('/')
            }
        },

        // --- OTP Methods ---
        setupRecaptcha(containerId) {
            if (window.recaptchaVerifier) return
            window.recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
                size: 'invisible',
            })
        },
        async sendOtp(phoneNumber) {
            const appVerifier = window.recaptchaVerifier
            this.confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, appVerifier)
        },
        async verifyOtp(otpCode) {
            if (!this.confirmationResult) throw new Error('No OTP request found.')
            await this.confirmationResult.confirm(otpCode)
        },
    },
})
