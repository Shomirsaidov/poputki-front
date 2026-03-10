<template>
  <div :class="['flex items-center', containerClass]">
    <div :class="['flex items-center justify-center rounded-xl shadow-lg', iconBgClass, iconSizeClass]">
      <svg 
        viewBox="0 0 24 24" 
        fill="currentColor" 
        :class="['text-white', iconClass]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <!-- Simple Camel Silhouette -->
        <path d="M21.3,10.1c-0.1-0.1-0.2-0.1-0.3-0.1c-0.1-0.7-0.8-1.3-1.5-1.3c-0.5,0-0.8,0.2-1.1,0.6c-0.1-1-0.9-1.8-1.9-1.8c-0.1,0-0.2,0-0.4,0c-0.5-1.3-1.8-2.2-3.3-2.2c-0.1,0-0.2,0-0.3,0C12,3.8,10.4,3,8.6,3C6.1,3,4,5.1,4,7.6c0,0.1,0,0.2,0,0.3C2.4,8.4,1.3,9.7,1.3,11.2c0,0.9,0.4,1.7,1.1,2.2c-0.2,0.2-0.3,0.4-0.3,0.6c0,0.9,0.7,1.7,1.6,1.7h0.1l0.8,3.5h1.8l0.8-3.5h0.2c0.9,0,1.6-0.7,1.6-1.6c0-0.1,0-0.2,0-0.3c0.3,0.1,0.5,0.1,0.8,0.1c0.3,0,0.6-0.1,0.8-0.2c0.3,0.4,0.7,0.7,1.2,0.8c0,0.1,0,0.1,0,0.2c0,0.9,0.7,1.7,1.6,1.7h0.1l0.8,3.5h1.8l0.8-3.5h0.1c0.9,0,1.6-0.8,1.6-1.7c0-0.2,0-0.3-0.1-0.5c0.7-0.4,1.1-1.1,1.1-2v-0.1c0.1,0,0.2,0,0.2,0c0.8,0,1.5-0.7,1.5-1.5c0-0.3-0.1-0.5-0.2-0.7v0C21.3,10.2,21.3,10.1,21.3,10.1z"/>
      </svg>
    </div>
    <span v-if="showText" :class="['font-black tracking-tight text-slate-900 ml-3', textClass]">
      Poputki
    </span>
  </div>
</template>

<script>
export default {
  name: 'AppLogo',
  props: {
    showText: {
      type: Boolean,
      default: true
    },
    containerClass: String,
    iconBgClass: {
      type: String,
      default: 'bg-gradient-to-br from-amber-400 to-orange-500'
    },
    iconSizeClass: {
      type: String,
      default: 'w-10 h-10'
    },
    iconClass: {
      type: String,
      default: 'h-6 w-6'
    },
    textClass: {
      type: String,
      default: 'text-2xl'
    }
  }
}
</script>
