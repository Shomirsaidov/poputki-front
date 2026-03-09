<script>
import api from '../api';

export default {
  data() {
    return {
      fromCity: '',
      toCity: '',
      date: '',
      availableCities: [],
      activeTab: 'rides'
    };
  },
  methods: {
    async fetchCities() {
      try {
        const res = await api.get('/general/cities');
        this.availableCities = res.data;
      } catch (err) {
        console.error('Failed to fetch cities:', err);
      }
    },
    goToSearch() {
      this.$router.push({
        path: '/search',
        query: {
          from: this.fromCity || undefined,
          to: this.toCity || undefined,
          date: this.date || undefined,
          tab: this.activeTab === 'buses' ? 'bus' : 'rides'
        }
      });
    }
  },
  mounted() {
    this.fetchCities();
  }
};
</script>

<template>
  <div class="relative min-h-screen bg-[#060a15] pb-24 font-outfit overflow-x-hidden text-slate-100 selection:bg-pink-500/30">
    
    <!-- Background Aurora Effect (CSS ONLY) -->
    <div class="fixed inset-0 pointer-events-none overflow-hidden z-0">
      <div class="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] bg-pink-600/20 blur-[130px] rounded-full mix-blend-screen animate-pulse-slow"></div>
      <div class="absolute top-[10%] -right-[20%] w-[60%] h-[60%] bg-cyan-600/20 blur-[140px] rounded-full mix-blend-screen animate-pulse-slow" style="animation-delay: 2s;"></div>
      <div class="absolute -bottom-[20%] left-[20%] w-[50%] h-[50%] bg-indigo-600/20 blur-[150px] rounded-full mix-blend-screen animate-pulse-slow" style="animation-delay: 4s;"></div>
    </div>

    <!-- Content Wrapper -->
    <div class="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl pt-10 md:pt-20">
      
      <!-- Top Navigation (Subtle) -->
      <nav class="flex items-center justify-between mb-12 border-b border-white/5 pb-6">
        <div class="flex items-center space-x-3">
          <div class="w-10 h-10 bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl flex items-center justify-center shadow-lg shadow-pink-500/20">
             <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span class="text-2xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">Poputki</span>
        </div>
        <button @click="$router.push('/auth')" class="text-sm font-bold bg-white/10 hover:bg-white/20 px-5 py-2.5 rounded-full transition-all border border-white/5 hover:border-white/20 backdrop-blur-md">
          Войти
        </button>
      </nav>

      <!-- Hero Header -->
      <header class="text-center space-y-6 pb-14 md:pb-20">
        <div class="inline-flex items-center space-x-2 bg-white/5 border border-white/10 px-4 py-2 rounded-full text-xs font-bold tracking-wide backdrop-blur-md mb-2 text-pink-300 shadow-[0_0_20px_rgba(236,72,153,0.1)]">
          <span class="relative flex h-2 w-2 mr-1">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
            <span class="relative inline-flex rounded-full h-2 w-2 bg-pink-500"></span>
          </span>
          №1 Сервис совместных поездок
        </div>
        <h1 class="text-5xl md:text-7xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-white via-slate-200 to-slate-600 pb-2 leading-tight">
          Попути —<br class="md:hidden" /> дешевле и быстрее
        </h1>
        <p class="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto font-medium leading-relaxed">
          Экономьте на межгороде. Надежные водители, комфортные автобусы и попутчики в Таджикистане и по всей Средней Азии.
        </p>
      </header>

      <!-- Search Component (Glassmorphism) -->
      <div class="bg-white/10 backdrop-blur-3xl rounded-[32px] p-2 md:p-3 shadow-2xl shadow-black/50 border border-white/10 mx-auto max-w-4xl transform transition-all hover:border-white/20">
        
        <!-- Tab Switcher -->
        <div class="flex gap-2 p-2 bg-black/40 rounded-[24px] mb-3 border border-white/5">
          <button @click="activeTab = 'rides'" 
            :class="activeTab === 'rides' ? 'bg-white/15 text-white shadow-lg shadow-white/5 border-white/20' : 'text-slate-400 hover:text-white hover:bg-white/5 border-transparent'"
            class="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-sm md:text-[15px] transition-all duration-300 border">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 hidden sm:block" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"/>
              <path stroke-linecap="round" stroke-linejoin="round" d="M13 16H7v-3l2-5h8l2 5v3h-2"/>
            </svg>
            Поездки с попутчиками
          </button>
          <button @click="activeTab = 'buses'" 
            :class="activeTab === 'buses' ? 'bg-white/15 text-white shadow-lg shadow-white/5 border-white/20' : 'text-slate-400 hover:text-white hover:bg-white/5 border-transparent'"
            class="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-sm md:text-[15px] transition-all duration-300 border">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 hidden sm:block" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <rect x="3" y="5" width="18" height="14" rx="2"/>
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 11h18M7 19v2M17 19v2M3 8h18"/>
              <circle cx="7.5" cy="16" r="1" fill="currentColor"/>
              <circle cx="16.5" cy="16" r="1" fill="currentColor"/>
            </svg>
            Автобусные рейсы
          </button>
        </div>

        <!-- Desktop Grid / Mobile Stack -->
        <div class="grid grid-cols-1 md:grid-cols-[1fr_1fr_1fr_auto] gap-3 p-1">
          
          <!-- From -->
          <div class="relative group">
            <div class="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none">
               <div class="w-3 h-3 rounded-full border-[3px]" :class="activeTab === 'rides' ? 'border-pink-400' : 'border-cyan-400'"></div>
            </div>
            <select v-model="fromCity" class="w-full h-[60px] pl-11 pr-4 bg-black/20 rounded-[20px] outline-none text-white font-medium appearance-none transition-all border border-white/5 focus:border-white/30 focus:bg-black/60 cursor-pointer">
              <option value="" disabled selected class="text-slate-800">Откуда поедем?</option>
              <option v-for="city in availableCities" :key="'from-'+city" :value="city" class="text-slate-800">{{ city }}</option>
            </select>
            <div class="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/40">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
            </div>
          </div>

          <!-- To -->
          <div class="relative group">
            <div class="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none">
               <div class="w-3 h-3 rounded-full border-[3px] border-white/40"></div>
            </div>
            <select v-model="toCity" class="w-full h-[60px] pl-11 pr-4 bg-black/20 rounded-[20px] outline-none text-white font-medium appearance-none transition-all border border-white/5 focus:border-white/30 focus:bg-black/60 cursor-pointer">
              <option value="" disabled selected class="text-slate-800">Куда направляемся?</option>
              <option v-for="city in availableCities" :key="'to-'+city" :value="city" class="text-slate-800">{{ city }}</option>
            </select>
            <div class="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/40">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
            </div>
          </div>

          <!-- Date -->
          <div class="relative group">
            <input type="date" v-model="date" class="w-full h-[60px] px-5 bg-black/20 rounded-[20px] outline-none text-white font-medium appearance-none transition-all border border-white/5 focus:border-white/30 focus:bg-black/60 cursor-pointer [color-scheme:dark]" />
          </div>

          <!-- CTA Button -->
          <button @click="goToSearch" class="h-[60px] md:w-[150px] w-full rounded-[20px] font-bold text-lg text-white shadow-[0_0_20px_rgba(236,72,153,0.3)] hover:shadow-[0_0_30px_rgba(236,72,153,0.5)] bg-gradient-to-r from-pink-500 to-rose-500 active:scale-95 transition-all flex items-center justify-center gap-2">
            <span>Найти</span>
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
          </button>
        </div>
      </div>

      <!-- Features Section -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20 md:mt-32">
        <div class="bg-white/5 backdrop-blur-md rounded-[32px] p-8 border border-white/10 hover:bg-white/10 hover:-translate-y-1 transition-all duration-300 shadow-xl shadow-black/20">
          <div class="w-14 h-14 bg-gradient-to-br from-pink-500/20 to-rose-500/20 rounded-2xl flex items-center justify-center mb-6 text-pink-400 border border-pink-500/20">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <h3 class="text-xl font-bold mb-3 text-white">Выгодные цены</h3>
          <p class="text-slate-400 font-medium leading-relaxed">Разделите расходы на поездку с попутчиками или покупайте дешевые билеты на автобус без посредников.</p>
        </div>

        <div class="bg-white/5 backdrop-blur-md rounded-[32px] p-8 border border-white/10 hover:bg-white/10 hover:-translate-y-1 transition-all duration-300 shadow-xl shadow-black/20">
          <div class="w-14 h-14 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-2xl flex items-center justify-center mb-6 text-cyan-400 border border-cyan-500/20">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
          </div>
          <h3 class="text-xl font-bold mb-3 text-white">Надежность</h3>
          <p class="text-slate-400 font-medium leading-relaxed">Система рейтингов и верифицированные номера телефонов всех участников обеспечат вам полную безопасность в дороге.</p>
        </div>

        <div class="bg-white/5 backdrop-blur-md rounded-[32px] p-8 border border-white/10 hover:bg-white/10 hover:-translate-y-1 transition-all duration-300 shadow-xl shadow-black/20">
          <div class="w-14 h-14 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center mb-6 text-indigo-400 border border-indigo-500/20">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          </div>
          <h3 class="text-xl font-bold mb-3 text-white">Удобство в 2 клика</h3>
          <p class="text-slate-400 font-medium leading-relaxed">Бронируйте места онлайн. Получайте уведомления и электронные билеты со всеми деталями прямо в Telegram.</p>
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap');

.font-outfit {
  font-family: 'Outfit', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
}

.animate-pulse-slow {
  animation: bg-pulse 8s ease-in-out infinite alternate;
}

@keyframes bg-pulse {
  0% { opacity: 0.5; transform: scale(0.9) translate(0, 0); }
  50% { opacity: 0.8; transform: scale(1.05) translate(2%, 2%); }
  100% { opacity: 0.5; transform: scale(0.9) translate(-2%, -2%); }
}

/* Fallback for the date input picker icon in dark mode */
input[type="date"]::-webkit-calendar-picker-indicator {
    filter: invert(1);
    opacity: 0.5;
    cursor: pointer;
}
input[type="date"]::-webkit-calendar-picker-indicator:hover {
    opacity: 1;
}
</style>
