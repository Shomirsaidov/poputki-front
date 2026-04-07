<script>
export default {
    props: {
        show:        { type: Boolean, required: true },
        title:       { type: String,  default: '' },
        message:     { type: String,  default: '' },
        type:        { type: String,  default: 'info' }, // 'info' | 'success' | 'error' | 'warning'
        confirmText: { type: String,  default: 'ОК' },
        showCancel:  { type: Boolean, default: false },
        cancelText:  { type: String,  default: 'Отмена' },
        showBotLink: { type: Boolean, default: false }
    },
    emits: ['confirm', 'cancel', 'close'],
    computed: {
        iconConfig() {
            switch (this.type) {
                case 'success':
                    return {
                        bg:   'bg-emerald-50',
                        ring: 'ring-emerald-100',
                        color:'text-emerald-500',
                        path: 'M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                    };
                case 'error':
                    return {
                        bg:   'bg-red-50',
                        ring: 'ring-red-100',
                        color:'text-red-500',
                        path: 'M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z'
                    };
                case 'warning':
                    return {
                        bg:   'bg-amber-50',
                        ring: 'ring-amber-100',
                        color:'text-amber-500',
                        path: 'M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z'
                    };
                default: // info
                    return {
                        bg:   'bg-blue-50',
                        ring: 'ring-blue-100',
                        color:'text-blue-500',
                        path: 'M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z'
                    };
            }
        },
        confirmBtnClass() {
            switch (this.type) {
                case 'success': return 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200';
                case 'error':   return 'bg-red-600 hover:bg-red-700 shadow-red-200';
                case 'warning': return 'bg-amber-500 hover:bg-amber-600 shadow-amber-200';
                default:        return 'bg-slate-900 hover:bg-slate-800 shadow-slate-200';
            }
        }
    },
    methods: {
        openBot() {
            window.open('https://t.me/poputkionline_bot', '_blank');
            this.$emit('close');
        }
    }
};
</script>

<template>
    <Teleport to="body">
        <Transition name="modal">
            <div
                v-if="show"
                class="fixed inset-0 z-[100] flex items-center justify-center p-5"
                role="dialog"
                aria-modal="true"
                :aria-labelledby="title ? 'modal-title' : undefined"
            >
                <!-- Backdrop -->
                <div
                    @click="$emit('close')"
                    class="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
                ></div>

                <!-- Card -->
                <div class="modal-card relative bg-white w-full max-w-[340px] rounded-3xl shadow-2xl shadow-black/15 overflow-hidden">

                    <!-- Top accent line -->
                    <div class="h-[3px] w-full" :class="{
                        'bg-emerald-500': type === 'success',
                        'bg-red-500':     type === 'error',
                        'bg-amber-500':   type === 'warning',
                        'bg-blue-500':    type === 'info' || !type
                    }"></div>

                    <div class="px-7 pt-8 pb-7 text-center">
                        <!-- Icon badge -->
                        <div
                            class="w-16 h-16 rounded-2xl mx-auto mb-5 flex items-center justify-center ring-4"
                            :class="[iconConfig.bg, iconConfig.ring]"
                        >
                            <svg
                                class="w-8 h-8"
                                :class="iconConfig.color"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                stroke-width="1.7"
                                aria-hidden="true"
                            >
                                <path stroke-linecap="round" stroke-linejoin="round" :d="iconConfig.path" />
                            </svg>
                        </div>

                        <!-- Title -->
                        <h3
                            v-if="title"
                            id="modal-title"
                            class="text-[17px] font-bold text-slate-900 leading-snug mb-2"
                        >{{ title }}</h3>

                        <!-- Message -->
                        <p
                            v-if="message"
                            class="text-[13.5px] text-slate-500 leading-relaxed mb-7"
                        >{{ message }}</p>

                        <!-- Actions -->
                        <div class="space-y-2.5">
                            <button
                                @click="$emit('confirm')"
                                class="w-full text-white font-semibold text-[14px] py-3.5 rounded-2xl transition-all duration-150 active:scale-[0.97] shadow-lg cursor-pointer"
                                :class="confirmBtnClass"
                            >
                                {{ confirmText }}
                            </button>

                            <button
                                v-if="showCancel"
                                @click="$emit('cancel')"
                                class="w-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold text-[14px] py-3.5 rounded-2xl transition-all duration-150 active:scale-[0.97] cursor-pointer"
                            >
                                {{ cancelText }}
                            </button>

                            <!-- Telegram bot link -->
                            <button
                                v-if="showBotLink"
                                @click="openBot"
                                class="w-full bg-[#0088cc] hover:bg-[#007ab8] text-white font-semibold text-[14px] py-3.5 rounded-2xl transition-all duration-150 active:scale-[0.97] shadow-lg shadow-sky-200 flex items-center justify-center gap-2 cursor-pointer"
                            >
                                <!-- Telegram logo SVG (Simple Icons) -->
                                <svg class="w-4.5 h-4.5 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                                    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                                </svg>
                                Открыть бота
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </Transition>
    </Teleport>
</template>

<style scoped>
/* Backdrop fade */
.modal-enter-active,
.modal-leave-active {
    transition: opacity 0.25s ease;
}
.modal-enter-from,
.modal-leave-to {
    opacity: 0;
}

/* Card spring */
.modal-enter-active .modal-card,
.modal-leave-active .modal-card {
    transition: transform 0.28s cubic-bezier(0.34, 1.4, 0.64, 1), opacity 0.2s ease;
}
.modal-enter-from .modal-card {
    transform: scale(0.92) translateY(16px);
    opacity: 0;
}
.modal-leave-to .modal-card {
    transform: scale(0.96) translateY(8px);
    opacity: 0;
}
</style>
