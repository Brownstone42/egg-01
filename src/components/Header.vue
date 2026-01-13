<template>
    <nav class="navbar is-fixed-top" role="navigation" aria-label="main navigation">
        <div class="navbar-brand">
            <router-link to="/" class="navbar-item">
                <h1 class="title">Egg Subscription</h1>
            </router-link>

            <a
                role="button"
                class="navbar-burger"
                :class="{ 'is-active': isMenuActive }"
                @click="toggleMenu"
                aria-label="menu"
                aria-expanded="false"
                data-target="navbarBasicExample"
            >
                <span aria-hidden="true"></span>
                <span aria-hidden="true"></span>
                <span aria-hidden="true"></span>
            </a>
        </div>

        <div id="navbarBasicExample" class="navbar-menu" :class="{ 'is-active': isMenuActive }">
            <div class="navbar-start">
                <template v-if="authStore.user">
                    <router-link to="/dashboard" class="navbar-item">Dashboard</router-link>
                </template>

                <!-- Tracking Menu Item (Always Visible) -->
                <router-link to="/tracking" class="navbar-item">Tracking</router-link>
            </div>

            <div class="navbar-end">
                <div class="navbar-item" v-if="!authStore.user">
                    <div class="buttons">
                        <a class="button is-primary" @click="showLoginModal = true">
                            <strong>Login</strong>
                        </a>
                    </div>
                </div>

                <template v-if="authStore.user">
                    <div class="navbar-item is-flex is-align-items-center">
                        <figure class="image is-24x24 mr-2" v-if="authStore.user.photoURL">
                            <img
                                class="is-rounded"
                                :src="authStore.user.photoURL"
                                alt="User avatar"
                            />
                        </figure>
                        <span class="icon is-small mr-2" v-else>
                            <i class="fas fa-user-circle"></i>
                        </span>

                        <span>
                            {{ authStore.user.displayName || authStore.user.phoneNumber }}
                            <span v-if="isLineLogin" class="tag is-success is-light ml-2"
                                >LINE</span
                            >
                        </span>
                    </div>
                    <div class="navbar-item">
                        <div class="buttons">
                            <a class="button is-light" @click="authStore.logout"> Logout </a>
                        </div>
                    </div>
                </template>
            </div>
        </div>
    </nav>

    <!-- Login Modal -->
    <div class="modal" :class="{ 'is-active': showLoginModal }">
        <div class="modal-background" @click="closeLoginModal"></div>
        <div class="modal-content">
            <div class="box">
                <h3 class="title is-4 has-text-centered mb-5">Login</h3>

                <div v-if="loginStep === 'select'">
                    <button class="button is-fullwidth is-google mb-3" @click="handleGoogleLogin">
                        <span class="icon">
                            <i class="fab fa-google"></i>
                        </span>
                        <span>Login with Google</span>
                    </button>

                    <button class="button is-fullwidth is-success mb-3" @click="handleLineLogin">
                        <span class="icon">
                            <i class="fab fa-line"></i>
                        </span>
                        <span>Login with LINE</span>
                    </button>

                    <button class="button is-fullwidth is-info" @click="startOtpLogin">
                        <span class="icon">
                            <i class="fas fa-mobile-alt"></i>
                        </span>
                        <span>Login with Phone Number</span>
                    </button>
                </div>

                <div v-else-if="loginStep === 'phone'">
                    <div class="field">
                        <label class="label">Phone Number</label>
                        <div class="control has-icons-left">
                            <input
                                class="input"
                                type="tel"
                                placeholder="+66812345678"
                                v-model="phoneNumber"
                                @keyup.enter="handleSendOtp"
                            />
                            <span class="icon is-small is-left">
                                <i class="fas fa-phone"></i>
                            </span>
                        </div>
                        <p class="help">Enter phone number with country code (e.g. +66...)</p>
                    </div>
                    <div id="recaptcha-container-login"></div>
                    <div class="field is-grouped is-grouped-centered mt-4">
                        <div class="control">
                            <button class="button is-light" @click="loginStep = 'select'">
                                Back
                            </button>
                        </div>
                        <div class="control">
                            <button
                                class="button is-info"
                                :class="{ 'is-loading': isLoading }"
                                @click="handleSendOtp"
                                :disabled="!phoneNumber"
                            >
                                Send OTP
                            </button>
                        </div>
                    </div>
                </div>

                <div v-else-if="loginStep === 'otp'">
                    <div class="field">
                        <label class="label">Enter OTP Code</label>
                        <div class="control">
                            <input
                                class="input has-text-centered"
                                type="text"
                                placeholder="123456"
                                maxlength="6"
                                v-model="otpCode"
                                @keyup.enter="handleVerifyOtp"
                            />
                        </div>
                        <p class="help is-info has-text-centered">OTP sent to {{ phoneNumber }}</p>
                    </div>
                    <div class="field is-grouped is-grouped-centered mt-4">
                        <div class="control">
                            <button class="button is-light" @click="loginStep = 'phone'">
                                Back
                            </button>
                        </div>
                        <div class="control">
                            <button
                                class="button is-primary"
                                :class="{ 'is-loading': isLoading }"
                                @click="handleVerifyOtp"
                                :disabled="otpCode.length !== 6"
                            >
                                Verify & Login
                            </button>
                        </div>
                    </div>
                </div>

                <div v-if="errorMessage" class="notification is-danger mt-4 is-light">
                    {{ errorMessage }}
                </div>
            </div>
        </div>
        <button class="modal-close is-large" aria-label="close" @click="closeLoginModal"></button>
    </div>
</template>

<script>
import { useAuthStore } from '../stores/auth'
import { mapStores } from 'pinia'

export default {
    data() {
        return {
            isMenuActive: false,
            showLoginModal: false,
            loginStep: 'select', // select, phone, otp
            phoneNumber: '',
            otpCode: '',
            isLoading: false,
            errorMessage: '',
        }
    },
    computed: {
        ...mapStores(useAuthStore),
        isLineLogin() {
            return this.authStore.user?.providerData.some(p => p.providerId === 'custom');
        },
    },
    watch: {
        'authStore.user'(user) {
            if (user) {
                this.closeLoginModal()
            }
        },
    },
    methods: {
        toggleMenu() {
            this.isMenuActive = !this.isMenuActive
        },
        closeLoginModal() {
            this.showLoginModal = false
            this.resetLoginState()
        },
        resetLoginState() {
            this.loginStep = 'select'
            this.phoneNumber = ''
            this.otpCode = ''
            this.errorMessage = ''
            this.isLoading = false
        },
        async handleGoogleLogin() {
            try {
                await this.authStore.loginWithGoogle()
            } catch (error) {
                this.errorMessage = 'Google Login failed.'
            }
        },
        async handleLineLogin() {
            this.errorMessage = ''
            try {
                // UPDATED: Call the central handler
                await this.authStore.handleLineLogin(); 
            } catch (error) {
                this.errorMessage = 'Could not initiate LINE Login: ' + error.message;
            }
        },
        startOtpLogin() {
            this.loginStep = 'phone'
            this.errorMessage = ''
            this.$nextTick(() => {
                this.authStore.setupRecaptcha('recaptcha-container-login')
            })
        },
        async handleSendOtp() {
            if (!this.phoneNumber) return

            this.isLoading = true
            this.errorMessage = ''

            try {
                await this.authStore.sendOtp(this.phoneNumber)
                this.loginStep = 'otp'
            } catch (error) {
                this.errorMessage = 'Failed to send OTP: ' + error.message
            } finally {
                this.isLoading = false
            }
        },
        async handleVerifyOtp() {
            if (!this.otpCode) return

            this.isLoading = true
            this.errorMessage = ''

            try {
                await this.authStore.verifyOtp(this.otpCode)
            } catch (error) {
                this.errorMessage = 'Invalid OTP code.'
            } finally {
                this.isLoading = false
            }
        },
    },
}
</script>

<style scoped>
.button.is-google {
    background-color: #db4437;
    color: white;
    border-color: transparent;
}
.button.is-google:hover {
    background-color: #c53929;
}
.button.is-success {
    background-color: #06c755;
    border-color: transparent;
}
.button.is-success:hover {
    background-color: #05b34c;
}
</style>
