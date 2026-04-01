<script>
import api from '../api';
import AppModal from '../components/AppModal.vue';

export default {
    name: 'PaymentResultView',
    components: { AppModal },
    data() {
        return {
            status: 'loading', // loading | confirmed | failed | pending
            bookingId: null,
            paymentLink: null,
            orderId: null,
            pollCount: 0,
            maxPolls: 10,
            modal: { show: false, title: '', message: '', type: 'info', confirmText: 'ОК', showCancel: false, onConfirm: null }
        };
    },
    methods: {
        async verifyPayment() {
            this.orderId = this.$route.query.order_id;
            if (!this.orderId) {
                this.status = 'failed';
                return;
            }

            try {
                const res = await api.get(`/payments/verify/${this.orderId}`);
                const data = res.data;

                if (data.status === 'confirmed') {
                    this.status = 'confirmed';
                    this.bookingId = data.booking_id;
                } else if (data.status === 'failed') {
                    this.status = 'failed';
                } else if (data.status === 'pending') {
                    this.paymentLink = data.payment_link;
                    // Auto-poll a few times
                    if (this.pollCount < this.maxPolls) {
                        this.pollCount++;
                        setTimeout(() => this.verifyPayment(), 3000);
                    } else {
                        this.status = 'pending';
                    }
                }
            } catch (e) {
                console.error('Payment verify error:', e);
                this.status = 'failed';
            }
        },
        goToMyTickets() {
            this.$router.replace({ name: 'my-bus-tickets', query: { booked: 'true' } });
        },
        retryPayment() {
            if (this.paymentLink) {
                window.location.href = this.paymentLink;
            }
        },
        goHome() {
            this.$router.replace('/');
        }
    },
    mounted() {
        this.verifyPayment();
    }
};
</script>

<template>
    <div class="min-h-screen bg-slate-50 flex items-center justify-center px-6">
        <!-- Loading -->
        <div v-if="status === 'loading'" class="text-center space-y-6">
            <div class="w-20 h-20 mx-auto relative">
                <div class="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
                <div class="absolute inset-0 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <div>
                <h2 class="text-xl font-bold text-slate-800">Проверяем оплату...</h2>
                <p class="text-sm text-gray-500 mt-2">Подождите, это займет несколько секунд</p>
            </div>
        </div>

        <!-- Success -->
        <div v-else-if="status === 'confirmed'" class="text-center space-y-6 max-w-sm">
            <div class="w-24 h-24 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                <svg class="w-12 h-12 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/>
                </svg>
            </div>
            <div>
                <h2 class="text-2xl font-black text-slate-800">Оплата прошла!</h2>
                <p class="text-sm text-gray-500 mt-2">Ваш билет подтвержден. Мы отправили электронный билет в Telegram.</p>
            </div>
            <button @click="goToMyTickets"
                class="w-full py-4 rounded-2xl font-bold text-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xl shadow-blue-500/30 active:scale-95 transition-all">
                Мои билеты
            </button>
        </div>

        <!-- Failed -->
        <div v-else-if="status === 'failed'" class="text-center space-y-6 max-w-sm">
            <div class="w-24 h-24 mx-auto bg-red-100 rounded-full flex items-center justify-center">
                <svg class="w-12 h-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"/>
                </svg>
            </div>
            <div>
                <h2 class="text-2xl font-black text-slate-800">Оплата не прошла</h2>
                <p class="text-sm text-gray-500 mt-2">Платеж был отклонен или истек. Попробуйте снова или выберите другой способ оплаты.</p>
            </div>
            <div class="space-y-3">
                <button v-if="paymentLink" @click="retryPayment"
                    class="w-full py-4 rounded-2xl font-bold text-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xl shadow-blue-500/30 active:scale-95 transition-all">
                    Попробовать снова
                </button>
                <button @click="goHome"
                    class="w-full py-4 rounded-2xl font-bold text-lg bg-slate-100 text-slate-500 active:scale-95 transition-all">
                    На главную
                </button>
            </div>
        </div>

        <!-- Pending -->
        <div v-else-if="status === 'pending'" class="text-center space-y-6 max-w-sm">
            <div class="w-24 h-24 mx-auto bg-amber-100 rounded-full flex items-center justify-center">
                <svg class="w-12 h-12 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
            </div>
            <div>
                <h2 class="text-2xl font-black text-slate-800">Ожидание оплаты</h2>
                <p class="text-sm text-gray-500 mt-2">Платеж еще обрабатывается. Если вы уже оплатили, подождите немного.</p>
            </div>
            <div class="space-y-3">
                <button @click="pollCount = 0; status = 'loading'; verifyPayment()"
                    class="w-full py-4 rounded-2xl font-bold text-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xl shadow-blue-500/30 active:scale-95 transition-all">
                    Проверить снова
                </button>
                <button v-if="paymentLink" @click="retryPayment"
                    class="w-full py-4 rounded-2xl font-bold text-lg bg-slate-100 text-slate-500 active:scale-95 transition-all">
                    Перейти к оплате
                </button>
            </div>
        </div>
    </div>
</template>
