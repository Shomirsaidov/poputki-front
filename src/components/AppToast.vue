<template>
  <Transition name="toast">
    <div v-if="show" class="fixed bottom-24 left-1/2 -translate-x-1/2 z-[200] w-[90%] max-w-sm">
      <div 
        class="bg-slate-900/90 backdrop-blur-md text-white px-6 py-4 rounded-2xl shadow-2xl border border-white/10 flex items-center space-x-3 pointer-events-auto"
        :class="type === 'success' ? 'border-green-500/20' : type === 'error' ? 'border-red-500/20' : ''"
      >
        <div v-if="type === 'success'" class="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center text-green-400 shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div v-else-if="type === 'error'" class="w-8 h-8 bg-red-500/20 rounded-full flex items-center justify-center text-red-400 shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <div v-else class="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-400 shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        
        <p class="text-sm font-bold tracking-tight">{{ message }}</p>
      </div>
    </div>
  </Transition>
</template>

<script>
export default {
  props: {
    show: Boolean,
    message: String,
    type: {
      type: String,
      default: 'info'
    }
  }
}
</script>

<style scoped>
.toast-enter-active, .toast-leave-active {
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.toast-enter-from {
  opacity: 0;
  transform: translate(-50%, 20px) scale(0.9);
}
.toast-leave-to {
  opacity: 0;
  transform: translate(-50%, 10px) scale(0.95);
}
</style>
