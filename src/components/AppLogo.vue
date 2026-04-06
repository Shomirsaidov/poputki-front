<template>
  <div :class="['flex items-center', containerClass]">
    <div :class="['flex items-center justify-center rounded-xl shadow-lg', iconBgClass, iconSizeClass]">
      <img src="../assets/logo-itself.png" alt="Poputki Logo" class="w-full h-full object-contain p-0.5" />
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
