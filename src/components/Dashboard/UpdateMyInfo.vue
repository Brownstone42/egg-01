<template>
    <div class="box">
        <h2 class="title is-4 mb-4">Update My Info</h2>

        <div class="content">
            <p>Manage your account connections here.</p>

            <!-- Current User Info -->
            <div class="media mb-5">
                <div class="media-left">
                    <figure class="image is-64x64">
                        <img
                            :src="
                                user?.photoURL || 'https://bulma.io/images/placeholders/128x128.png'
                            "
                            class="is-rounded"
                            alt="Profile"
                        />
                    </figure>
                </div>
                <div class="media-content">
                    <p class="title is-5">{{ user?.displayName || 'User' }}</p>
                    <p class="subtitle is-6">
                        <span v-if="user?.email">{{ user.email }}</span>
                        <span v-if="user?.email && user?.phoneNumber"> | </span>
                        <span v-if="user?.phoneNumber">{{ user.phoneNumber }}</span>
                        <span v-if="isLineLogin"> | LINE User</span>
                    </p>
                </div>
            </div>

            <hr />

            <!-- Account Linking Section -->
            <h3 class="title is-5">Linked Accounts</h3>

            <!-- Google Link Button (Hide if logged in via LINE) -->
            <div class="field is-grouped is-grouped-multiline" v-if="!isLineLogin">
                <div class="control">
                    <button
                        class="button"
                        :class="isGoogleLinked ? 'is-success' : 'is-google'"
                        @click="linkGoogle"
                        :disabled="isGoogleLinked"
                    >
                        <span class="icon">
                            <i class="fab fa-google"></i>
                        </span>
                        <span>{{ isGoogleLinked ? 'Google Linked' : 'Link with Google' }}</span>
                    </button>
                </div>

                <!-- Phone Link Button (Hide if logged in via LINE) -->
                <div class="control">
                    <button
                        class="button"
                        :class="isPhoneLinked ? 'is-success' : 'is-info'"
                        @click="openPhoneLinkModal"
                        :disabled="isPhoneLinked"
                    >
                        <span class="icon">
                            <i class="fas fa-mobile-alt"></i>
                        </span>
                        <span>{{ isPhoneLinked ? 'Phone Linked' : 'Link Phone Number' }}</span>
                    </button>
                </div>
            </div>

            <!-- Message for LINE Users -->
            <div v-else class="notification is-info is-light">
                <p>You are logged in via LINE. Account linking is disabled for LINE users.</p>
            </div>
        </div>

        <!-- Phone Linking Modal -->
        <div class="modal" :class="{ 'is-active': showLinkPhoneModal }">
            <div class="modal-background" @click="closeLinkPhoneModal"></div>
            <div class="modal-content">
                <div class="box">
                    <h3 class="title is-4">Link Phone Number</h3>

                    <div v-if="!otpSent">
                        <div class="field">
                            <label class="label">Phone Number</label>
                            <div class="control">
                                <input
                                    class="input"
                                    type="tel"
                                    v-model="phoneToLink"
                                    placeholder="+66..."
                                />
                            </div>
                        </div>
                        <div id="recaptcha-container-link"></div>
                        <button
                            class="button is-primary mt-3"
                            @click="sendLinkOtp"
                            :class="{ 'is-loading': linkingLoading }"
                        >
                            Send OTP
                        </button>
                    </div>

                    <div v-else>
                        <div class="field">
                            <label class="label">Enter OTP</label>
                            <div class="control">
                                <input
                                    class="input"
                                    type="text"
                                    v-model="linkOtpCode"
                                    placeholder="123456"
                                />
                            </div>
                        </div>
                        <button
                            class="button is-success mt-3"
                            @click="verifyLinkOtp"
                            :class="{ 'is-loading': linkingLoading }"
                        >
                            Verify & Link
                        </button>
                    </div>

                    <p class="help is-danger mt-2" v-if="linkErrorMessage">
                        {{ linkErrorMessage }}
                    </p>
                </div>
            </div>
            <button
                class="modal-close is-large"
                aria-label="close"
                @click="closeLinkPhoneModal"
            ></button>
        </div>
    </div>
</template>

<script>
import { useAuthStore } from '@/stores/auth'
import { mapStores } from 'pinia'
import { getAuth, linkWithPhoneNumber, RecaptchaVerifier } from 'firebase/auth'

export default {
    props: {
        user: {
            type: Object,
            required: true,
        },
    },
    data() {
        return {
            showLinkPhoneModal: false,
            phoneToLink: '',
            otpSent: false,
            linkOtpCode: '',
            confirmationResult: null,
            linkingLoading: false,
            linkErrorMessage: '',
        }
    },
    computed: {
        ...mapStores(useAuthStore),
        isGoogleLinked() {
            return this.user?.providerData.some((p) => p.providerId === 'google.com')
        },
        isPhoneLinked() {
            return this.user?.providerData.some((p) => p.providerId === 'phone')
        },
        isLineLogin() {
            // Check if user is logged in via LINE (Custom Token)
            return this.user?.uid.startsWith('line:')
        },
    },
    methods: {
        async linkGoogle() {
            if (this.isGoogleLinked) return
            const success = await this.authStore.linkGoogle()
            if (success) {
                // Success alert handled in store or via redirect check
            }
        },
        openPhoneLinkModal() {
            this.showLinkPhoneModal = true
            this.linkErrorMessage = ''
            this.phoneToLink = ''
            this.otpSent = false
            this.$nextTick(() => {
                if (!window.recaptchaVerifierLink) {
                    window.recaptchaVerifierLink = new RecaptchaVerifier(
                        getAuth(),
                        'recaptcha-container-link',
                        {
                            size: 'invisible',
                        },
                    )
                }
            })
        },
        closeLinkPhoneModal() {
            this.showLinkPhoneModal = false
        },
        async sendLinkOtp() {
            if (!this.phoneToLink) return
            this.linkingLoading = true
            this.linkErrorMessage = ''

            const auth = getAuth()
            try {
                this.confirmationResult = await linkWithPhoneNumber(
                    auth.currentUser,
                    this.phoneToLink,
                    window.recaptchaVerifierLink,
                )
                this.otpSent = true
            } catch (error) {
                console.error('Link Phone Error:', error)
                if (error.code === 'auth/credential-already-in-use') {
                    this.linkErrorMessage =
                        'This phone number is already linked to another account.'
                } else {
                    this.linkErrorMessage = 'Failed to send OTP: ' + error.message
                }
            } finally {
                this.linkingLoading = false
            }
        },
        async verifyLinkOtp() {
            if (!this.linkOtpCode) return
            this.linkingLoading = true
            try {
                await this.confirmationResult.confirm(this.linkOtpCode)
                alert('Phone number linked successfully!')
                this.closeLinkPhoneModal()
            } catch (error) {
                console.error('Verify Link OTP Error:', error)
                this.linkErrorMessage = 'Invalid OTP or error linking.'
            } finally {
                this.linkingLoading = false
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
</style>
