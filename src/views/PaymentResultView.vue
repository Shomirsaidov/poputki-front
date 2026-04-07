<script>
import api from '../api';

export default {
    name: 'PaymentResultView',
    data() {
        return {
            status: 'loading', // loading | confirmed | failed | pending
            bookingId: null,
            paymentLink: null,
            orderId: null,
            pollCount: 0,
            maxPolls: 10,
            booking: null
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
                    // Fetch booking details to show on success
                    this.fetchBookingDetails();
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
        async fetchBookingDetails() {
            try {
                // The verify endpoint returns booking_id
                const res = await api.get(`/bus-bookings/${this.bookingId}`);
                this.booking = res.data;
            } catch (e) {
                console.error('Fetch booking details error:', e);
            }
        },
        formatDate(dateStr) {
            if (!dateStr) return '';
            const d = new Date(dateStr);
            return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
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
    <div class="min-h-screen bg-[#0F172A] flex items-center justify-center px-6 font-['IBM_Plex_Sans',sans-serif] overflow-hidden relative">
        <!-- Decorational background glow -->
        <div class="absolute top-1/4 -left-20 w-80 h-80 bg-amber-500/20 rounded-full blur-[120px] pointer-events-none animate-pulse"></div>
        <div class="absolute bottom-1/4 -right-20 w-80 h-80 bg-indigo-500/20 rounded-full blur-[120px] pointer-events-none animate-pulse" style="animation-delay: 1s"></div>

        <Transition name="fade-scale" mode="out-in">
            <!-- Loading State -->
            <div v-if="status === 'loading'" :key="'loading'" class="text-center relative z-10 w-full max-w-sm">
                <div class="w-24 h-24 mx-auto relative mb-8">
                    <div class="absolute inset-0 border-[3px] border-amber-500/10 rounded-full"></div>
                    <div class="absolute inset-0 border-[3px] border-amber-500 border-t-transparent rounded-full animate-spin"></div>
                    <div class="absolute inset-4 border-[2px] border-indigo-500/20 rounded-full"></div>
                    <div class="absolute inset-4 border-[2px] border-indigo-400 border-b-transparent rounded-full animate-spin-reverse"></div>
                </div>
                <h2 class="text-2xl font-bold text-white tracking-tight">Проверяем оплату</h2>
                <div class="flex items-center justify-center gap-1 mt-3">
                    <div class="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce" style="animation-delay: 0s"></div>
                    <div class="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
                    <div class="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce" style="animation-delay: 0.4s"></div>
                </div>
                <p class="text-slate-400 text-sm mt-6">Пожалуйста, не закрывайте страницу</p>
            </div>

            <!-- Success State -->
            <div v-else-if="status === 'confirmed'" :key="'confirmed'" class="w-full max-w-sm relative z-10">
                <div class="text-center mb-8">
                    <div class="w-20 h-20 mx-auto bg-emerald-500/10 rounded-3xl flex items-center justify-center mb-6 ring-1 ring-emerald-500/30">
                        <svg class="w-10 h-10 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
                        </svg>
                    </div>
                    <h2 class="text-3xl font-black text-white tracking-tighter">Оплата прошла!</h2>
                    <p class="text-slate-400 text-sm mt-2">Билет успешно забронирован</p>
                </div>

                <!-- Animated ticket card -->
                <div v-if="booking" class="bg-white/5 backdrop-blur-2xl rounded-[32px] border border-white/10 overflow-hidden shadow-2xl mb-8 animate-slide-up">
                    <div class="p-6">
                        <div class="flex items-center justify-between mb-6">
                            <div class="bg-amber-500/10 text-amber-500 text-[10px] font-bold uppercase tracking-[0.2em] px-3 py-1 rounded-lg ring-1 ring-amber-500/20">
                                Электронный билет
                            </div>
                            <div class="text-[10px] text-slate-500 font-mono">#{{ booking.id }}</div>
                        </div>

                        <div class="flex items-center gap-4 mb-6">
                            <div class="flex-1">
                                <div class="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1 group-hover:text-amber-400 transition-colors">Откуда</div>
                                <div class="text-white font-bold leading-tight">{{ booking.bus_tickets?.from_city }}</div>
                            </div>
                            <div class="flex flex-col items-center gap-1 opacity-40">
                                <svg class="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
                            </div>
                            <div class="flex-1 text-right">
                                <div class="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1">Куда</div>
                                <div class="text-white font-bold leading-tight">{{ booking.bus_tickets?.to_city }}</div>
                            </div>
                        </div>

                        <div class="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                            <div>
                                <div class="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1">Дата</div>
                                <div class="text-white text-sm font-semibold">{{ formatDate(booking.bus_tickets?.departure_date) }}</div>
                            </div>
                            <div class="text-right">
                                <div class="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1">Места</div>
                                <div class="text-amber-500 text-sm font-black">{{ (booking.seat_numbers || []).join(', ') }}</div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Perforated effect -->
                    <div class="relative h-6 flex items-center justify-between px-[-12px]">
                        <div class="w-6 h-6 rounded-full bg-[#0F172A] -ml-3"></div>
                        <div class="flex-1 border-t border-dashed border-white/10 mx-2"></div>
                        <div class="w-6 h-6 rounded-full bg-[#0F172A] -mr-3"></div>
                    </div>

                    <div class="p-6 pt-2">
                        <div class="text-center">
                            <div class="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-2">Перевозчик</div>
                            <div class="text-white font-bold">{{ booking.bus_tickets?.transport_company }}</div>
                        </div>
                    </div>
                </div>

                <div class="space-y-3">
                    <button @click="goToMyTickets" 
                        class="w-full py-4 rounded-2xl font-bold bg-amber-500 text-white shadow-lg shadow-amber-500/20 active:scale-95 transition-all hover:bg-amber-400">
                        Мои билеты
                    </button>
                    <button @click="goHome" 
                        class="w-full py-4 rounded-2xl font-bold text-slate-400 hover:text-white transition-all">
                        На главную
                    </button>
                </div>
            </div>

            <!-- Failed State -->
            <div v-else-if="status === 'failed'" :key="'failed'" class="text-center w-full max-w-sm relative z-10">
                <div class="w-20 h-20 mx-auto bg-red-500/10 rounded-3xl flex items-center justify-center mb-6 ring-1 ring-red-500/30">
                    <svg class="w-10 h-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                </div>
                <h2 class="text-3xl font-black text-white tracking-tighter">Оплата не прошла</h2>
                <p class="text-slate-400 text-sm mt-3 px-8 leading-relaxed">К сожалению, платеж был отклонен или время сессии истекло.</p>
                
                <div class="mt-10 space-y-3">
                    <button v-if="paymentLink" @click="retryPayment" 
                        class="w-full py-4 rounded-2xl font-bold bg-white text-slate-900 shadow-xl active:scale-95 transition-all">
                        Попробовать снова
                    </button>
                    <button @click="goHome" 
                        class="w-full py-4 rounded-2xl font-bold text-slate-400 hover:text-white transition-all">
                        Вернуться на главную
                    </button>
                </div>
            </div>

            <!-- Pending State -->
            <div v-else-if="status === 'pending'" :key="'pending'" class="text-center w-full max-w-sm relative z-10">
                <div class="w-20 h-20 mx-auto bg-amber-500/10 rounded-3xl flex items-center justify-center mb-6 ring-1 ring-amber-500/30">
                    <svg class="w-10 h-10 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                </div>
                <h2 class="text-3xl font-black text-white tracking-tighter">Ожидание...</h2>
                <p class="text-slate-400 text-sm mt-3 px-8">Мы всё еще ждем подтверждения от банка. Если вы уже оплатили, подождите минуту.</p>
                
                <div class="mt-10 space-y-3">
                    <button @click="pollCount = 0; status = 'loading'; verifyPayment()" 
                        class="w-full py-4 rounded-2xl font-bold bg-amber-500 text-white shadow-lg active:scale-95 transition-all">
                        Проверить еще раз
                    </button>
                    <button @click="goHome" 
                        class="w-full py-4 rounded-2xl font-bold text-slate-400 hover:text-white transition-all">
                        На главную
                    </button>
                </div>
            </div>
        </Transition>
    </div>
</template>

<style scoped>
@keyframes spin-reverse {
    from { transform: rotate(0deg); }
    to { transform: rotate(-360deg); }
}
.animate-spin-reverse {
    animation: spin-reverse 1.5s linear infinite;
}

.fade-scale-enter-active, .fade-scale-leave-active {
    transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.fade-scale-enter-from {
    opacity: 0;
    transform: scale(0.9);
}
.fade-scale-leave-to {
    opacity: 0;
    transform: scale(1.05);
}

.animate-slide-up {
    animation: slideUp 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
}
@keyframes slideUp {
    from { opacity: 0; transform: translateY(40px); }
    to { opacity: 1; transform: translateY(0); }
}
</style>

