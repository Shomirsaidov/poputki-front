<script>
export default {
    props: {
        show: {
            type: Boolean,
            required: true
        },
        title: {
            type: String,
            default: ''
        },
        message: {
            type: String,
            default: ''
        },
        type: {
            type: String,
            default: 'info' // 'info', 'success', 'error', 'warning'
        },
        confirmText: {
            type: String,
            default: 'ОК'
        },
        showCancel: {
            type: Boolean,
            default: false
        },
        cancelText: {
            type: String,
            default: 'Отмена'
        },
        showBotLink: {
            type: Boolean,
            default: false
        }
    },
    emits: ['confirm', 'cancel', 'close'],
    computed: {
        icon() {
            switch (this.type) {
                case 'success': return '✅';
                case 'error': return '❌';
                case 'warning': return '⚠️';
                default: return 'ℹ️';
            }
        },
        typeClass() {
            switch (this.type) {
                case 'success': return 'text-green-500 bg-green-50';
                case 'error': return 'text-red-500 bg-red-50';
                case 'warning': return 'text-orange-500 bg-orange-50';
                default: return 'text-blue-500 bg-blue-50';
            }
        }
    },
    methods: {
        openBot() {
            window.open('https://t.me/poputkionline_bot', '_blank');
            this.$emit('close');
        }
    }
}
</script>

<template>
    <Teleport to="body">
        <Transition name="modal">
            <div v-if="show" class="fixed inset-0 z-[100] flex items-center justify-center p-6">
                <!-- Backdrop -->
                <div @click="$emit('close')" class="absolute inset-0 bg-slate-900/60 backdrop-blur-md"></div>
                
                <!-- Modal Content -->
                <div class="relative bg-white w-full max-w-sm rounded-[32px] overflow-hidden shadow-2xl shadow-black/20 transform transition-all p-8 text-center">
                    <div :class="['w-20 h-20 rounded-3xl mx-auto flex items-center justify-center text-4xl mb-6 shadow-sm', typeClass]">
                        {{ icon }}
                    </div>
                    
                    <h3 v-if="title" class="text-2xl font-bold text-slate-800 mb-2">{{ title }}</h3>
                    <p v-if="message" class="text-slate-500 leading-relaxed mb-8">{{ message }}</p>
                    
                    <div class="space-y-3">
                        <button 
                            @click="$emit('confirm')" 
                            class="w-full bg-slate-900 text-white font-bold py-4 rounded-2xl active:scale-[0.98] transition-all hover:bg-slate-800 shadow-lg shadow-slate-900/10"
                        >
                            {{ confirmText }}
                        </button>
                        
                        <button 
                            v-if="showCancel" 
                            @click="$emit('cancel')" 
                            class="w-full bg-gray-100 text-slate-600 font-bold py-4 rounded-2xl active:scale-[0.98] transition-all hover:bg-gray-200"
                        >
                            {{ cancelText }}
                        </button>

                        <button 
                            v-if="showBotLink" 
                            @click="openBot" 
                            class="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl active:scale-[0.98] transition-all hover:bg-blue-700 shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
                        >
                            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.11.02-1.93 1.23-5.46 3.62-.51.35-.98.52-1.4.51-.46-.01-1.35-.26-2.01-.48-.81-.27-1.45-.42-1.39-.88.03-.24.37-.48 1.02-.73 4-1.74 6.67-2.88 8.01-3.41 3.81-1.51 4.6-1.77 5.12-1.78.11 0 .37.03.54.17.14.12.18.28.2.45-.02.07-.02.14-.03.22z"/></svg>
                            Открыть бота
                        </button>
                    </div>
                </div>
            </div>
        </Transition>
    </Teleport>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
    transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
    opacity: 0;
}

.modal-enter-active .relative,
.modal-leave-active .relative {
    transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.modal-enter-from .relative {
    transform: scale(0.9) translateY(20px);
}

.modal-leave-to .relative {
    transform: scale(0.95) translateY(10px);
}
</style>
