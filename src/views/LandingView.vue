<script>
import api from '../api';

export default {
  data() {
    return {
      fromCity: '',
      toCity: '',
      date: '',
      availableCities: [],
      activeTab: 'rides',
      recentRides: []
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
    async fetchRecentRides() {
      try {
        const res = await api.get('/rides');
        // Get the top 4 most recent rides
        this.recentRides = res.data.slice(0, 4);
      } catch (err) {
        console.error('Failed to fetch recent rides:', err);
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
    },
  },
  mounted() {
    this.fetchCities();
    this.fetchRecentRides();
  }
};
</script>

<template>
  <div class="min-h-screen bg-slate-50 font-sans text-slate-800 selection:bg-amber-200 overflow-x-hidden">
    
    <!-- Hero Section -->
    <div class="relative bg-white pt-6 pb-20 md:pt-16 md:pb-32 overflow-hidden border-b border-gray-100 shadow-sm shadow-blue-900/5">
        
        <!-- Decoration Elements -->
        <div class="absolute top-0 right-0 -mr-32 -mt-32 w-96 h-96 bg-amber-400/10 rounded-full blur-[80px] pointer-events-none"></div>
        <div class="absolute bottom-0 left-0 -ml-32 -mb-32 w-80 h-80 bg-blue-500/10 rounded-full blur-[80px] pointer-events-none"></div>

        <div class="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
            <!-- Navigation -->
            <nav class="flex items-center justify-between mb-16 md:mb-24">
                <div class="flex items-center space-x-3">
                    <div class="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/20">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                    </div>
                    <span class="text-2xl font-black tracking-tight text-slate-900">Poputki</span>
                </div>
                <div class="flex items-center space-x-4">
                    <button @click="$router.push('/auth')" class="text-sm font-bold text-slate-700 hover:text-amber-500 transition-colors hidden md:block">
                        Войти
                    </button>
                    <button @click="$router.push('/search')" class="text-sm font-bold bg-slate-900 text-white hover:bg-slate-800 px-5 py-2.5 rounded-full transition-all shadow-md active:scale-95">
                        Найти поездку
                    </button>
                </div>
            </nav>

            <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
                <!-- Hero Text -->
                <div class="lg:col-span-5 text-center lg:text-left space-y-6 lg:pr-8">
                    <div class="inline-flex items-center space-x-2 bg-amber-50 border border-amber-200/50 px-4 py-1.5 rounded-full text-xs font-bold tracking-wide mb-2 text-amber-600">
                        №1 Сервис совместных поездок
                    </div>
                    <h1 class="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.1]">
                        Попути —<br class="hidden lg:block"/> 
                        <span class="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-500">
                            дешевле
                        </span> 
                        и быстрее
                    </h1>
                    <p class="text-lg text-slate-500 font-medium leading-relaxed max-w-2xl mx-auto lg:mx-0">
                        Экономьте на межгороде. Надежные водители, комфортные автобусы и попутчики в Таджикистане и по всей Средней Азии.
                    </p>
                </div>

                <!-- Search Widget -->
                <div class="lg:col-span-7">
                    <div class="bg-white rounded-[32px] p-2 md:p-3 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border border-gray-100 max-w-3xl mx-auto lg:mx-0 lg:ml-auto">
                        
                        <!-- Tab Switcher -->
                        <div class="flex gap-2 p-2 bg-slate-50 border border-slate-100 rounded-[24px] mb-3">
                            <button @click="activeTab = 'rides'" 
                                :class="activeTab === 'rides' ? 'bg-white text-slate-900 shadow-md shadow-gray-200/50 border-gray-100/50' : 'text-slate-500 hover:text-slate-700 hover:bg-white/50 border-transparent'"
                                class="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-sm md:text-[15px] transition-all duration-300 border">
                                <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 hidden sm:block" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"/>
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M13 16H7v-3l2-5h8l2 5v3h-2"/>
                                </svg>
                                Совместные поездки
                            </button>
                            <button @click="activeTab = 'buses'" 
                                :class="activeTab === 'buses' ? 'bg-white text-slate-900 shadow-md shadow-gray-200/50 border-gray-100/50' : 'text-slate-500 hover:text-slate-700 hover:bg-white/50 border-transparent'"
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

                        <!-- Search Fields Stack/Grid -->
                        <div class="grid grid-cols-1 md:grid-cols-4 gap-2 md:gap-3 p-1">
                            
                            <!-- From -->
                            <div class="relative group md:col-span-1 border border-transparent rounded-[20px] focus-within:border-amber-200/50">
                                <div class="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none">
                                    <div class="w-3 h-3 rounded-full border-[3px]" :class="activeTab === 'rides' ? 'border-amber-400' : 'border-blue-400'"></div>
                                </div>
                                <select v-model="fromCity" class="w-full h-[60px] pl-11 pr-4 bg-slate-50 rounded-[20px] outline-none text-slate-800 font-bold appearance-none transition-all focus:bg-white cursor-pointer hover:bg-slate-100">
                                    <option value="" disabled selected class="font-normal">Откуда?</option>
                                    <option v-for="city in availableCities" :key="'from-'+city" :value="city">{{ city }}</option>
                                </select>
                                <div class="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
                                </div>
                            </div>

                            <!-- To -->
                            <div class="relative group md:col-span-1 border border-transparent rounded-[20px] focus-within:border-slate-300/50">
                                <div class="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none">
                                    <div class="w-3 h-3 rounded-full border-[3px] border-slate-300"></div>
                                </div>
                                <select v-model="toCity" class="w-full h-[60px] pl-11 pr-4 bg-slate-50 rounded-[20px] outline-none text-slate-800 font-bold appearance-none transition-all focus:bg-white cursor-pointer hover:bg-slate-100">
                                    <option value="" disabled selected class="font-normal">Куда?</option>
                                    <option v-for="city in availableCities" :key="'to-'+city" :value="city">{{ city }}</option>
                                </select>
                                <div class="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
                                </div>
                            </div>

                            <!-- Date -->
                            <div class="relative group md:col-span-1 border border-transparent rounded-[20px] focus-within:border-slate-300/50">
                                <input type="date" v-model="date" class="w-full h-[60px] px-5 bg-slate-50 rounded-[20px] outline-none text-slate-800 font-bold appearance-none transition-all focus:bg-white cursor-pointer hover:bg-slate-100 text-sm" />
                            </div>

                            <!-- Search CTA -->
                            <div class="md:col-span-1">
                                <button @click="goToSearch" class="h-[60px] w-full rounded-[20px] font-bold text-base md:text-lg text-white shadow-lg shadow-blue-600/20 hover:shadow-xl hover:shadow-blue-600/30 bg-blue-600 active:scale-95 transition-all flex items-center justify-center gap-2">
                                    <span>Найти</span>
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- How it works -->
    <div class="py-20 md:py-24 bg-slate-50">
        <div class="container mx-auto px-4 max-w-6xl">
            <div class="text-center mb-16">
                <h2 class="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">Как это работает?</h2>
                <p class="text-slate-500 mt-3 font-medium text-lg">Три простых шага к вашей следующей поездке</p>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
                <!-- Connector Line (Desktop only) -->
                <div class="hidden md:block absolute top-[45px] left-[15%] right-[15%] h-[2px] border-t-2 border-dashed border-slate-200 z-0"></div>

                <div class="relative z-10 flex flex-col items-center text-center p-6 bg-white rounded-3xl shadow-sm border border-gray-100/50">
                    <div class="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center text-amber-500 mb-6 border-8 border-white shadow-sm">
                        <svg class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    </div>
                    <h3 class="text-xl font-bold text-slate-900 mb-2">Найдите маршрут</h3>
                    <p class="text-slate-500">Укажите откуда, куда и когда вы хотите поехать.</p>
                </div>

                <div class="relative z-10 flex flex-col items-center text-center p-6 bg-white rounded-3xl shadow-sm border border-gray-100/50">
                    <div class="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center text-blue-500 mb-6 border-8 border-white shadow-sm">
                        <svg class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    </div>
                    <h3 class="text-xl font-bold text-slate-900 mb-2">Забронируйте место</h3>
                    <p class="text-slate-500">Выберите водителя или автобус и зарезервируйте.</p>
                </div>

                <div class="relative z-10 flex flex-col items-center text-center p-6 bg-white rounded-3xl shadow-sm border border-gray-100/50">
                    <div class="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center text-green-500 mb-6 border-8 border-white shadow-sm">
                        <svg class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <h3 class="text-xl font-bold text-slate-900 mb-2">Наслаждайтесь поездкой</h3>
                    <p class="text-slate-500">Оплачивайте напрямую водителю и экономьте.</p>
                </div>
            </div>
        </div>
    </div>

    <!-- Recent Rides Sections -->
    <div class="py-20 md:py-24 bg-white border-y border-gray-100">
        <div class="container mx-auto px-4 max-w-6xl">
            <div class="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
               <div>
                   <h2 class="text-3xl font-extrabold text-slate-900 tracking-tight">Свежие поездки</h2>
                   <p class="text-slate-500 font-medium mt-1">Только что опубликованные маршруты от наших водителей</p>
               </div>
               <button @click="$router.push('/search')" class="text-blue-600 font-bold hover:text-blue-700 transition-colors flex items-center gap-1">
                   Все поездки <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" /></svg>
               </button>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div v-for="ride in recentRides" :key="ride.id" @click="$router.push({ name: 'ride-details', params: { id: ride.id } })"
                    class="group cursor-pointer bg-slate-50 hover:bg-white rounded-2xl p-5 border border-transparent hover:border-gray-200 transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] active:scale-95 flex flex-col justify-between">
                    <div>
                        <div class="flex items-center justify-between mb-8">
                            <div>
                                <div class="text-lg font-bold text-slate-900 leading-tight">{{ ride.from_city }}</div>
                                <div class="text-sm font-semibold text-slate-500 mt-0.5">{{ ride.to_city }}</div>
                            </div>
                            <div class="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-blue-500 group-hover:bg-blue-50 transition-colors shrink-0 ml-2">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                            </div>
                        </div>
                    </div>
                    <div class="flex items-center justify-between text-sm mt-auto">
                        <span class="text-slate-500 font-medium">{{ ride.date }}</span>
                        <span class="font-bold text-lg text-slate-800">{{ ride.price }} с.</span>
                    </div>
                </div>
            </div>
            
            <div v-if="recentRides.length === 0" class="text-center py-8 text-slate-500">
                Загрузка поездок...
            </div>
        </div>
    </div>

    <!-- Trust / Safety -->
    <div class="py-20 md:py-24 bg-slate-50">
        <div class="container mx-auto px-4 max-w-4xl text-center">
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
                <div class="bg-white p-8 rounded-3xl shadow-sm border border-gray-100/50 text-left">
                    <div class="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-amber-500 mb-5">
                       <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                    </div>
                    <h3 class="text-xl font-bold text-slate-900 mb-2">Безопасность прежде всего</h3>
                    <p class="text-slate-500 leading-relaxed">Система рейтингов и верифицированные номера телефонов всех участников обеспечат вам безопасность в дороге.</p>
                </div>
                
                <div class="bg-white p-8 rounded-3xl shadow-sm border border-gray-100/50 text-left">
                     <div class="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-500 mb-5">
                       <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                    </div>
                    <h3 class="text-xl font-bold text-slate-900 mb-2">Telegram интеграция</h3>
                    <p class="text-slate-500 leading-relaxed">Получайте все уведомления о бронированиях напрямую в Telegram. Быстро, удобно и всегда под рукой.</p>
                </div>
            </div>

            <h2 class="text-3xl md:text-4xl font-extrabold text-slate-900 mb-6">Готовы в путь?</h2>
            <p class="text-slate-500 text-lg mb-8 max-w-xl mx-auto">Присоединяйтесь к тысячам пользователей, которые уже экономят на поездках вместе с нами.</p>
            <button @click="$router.push('/search')" class="bg-blue-600 text-white font-bold text-lg px-8 py-4 rounded-2xl shadow-lg shadow-blue-500/30 hover:shadow-xl hover:-translate-y-1 transition-all">
                Начать поиск поездки
            </button>
        </div>
    </div>

    <!-- Simple Footer -->
    <footer class="bg-white border-t border-gray-100 py-8 text-center text-slate-400 text-sm">
        <p>&copy; 2024 Poputki.online. Все права защищены.</p>
    </footer>

  </div>
</template>

<style scoped>
/* Fallback for the date input picker icon */
input[type="date"]::-webkit-calendar-picker-indicator {
    opacity: 0.5;
    cursor: pointer;
}
input[type="date"]::-webkit-calendar-picker-indicator:hover {
    opacity: 1;
}
</style>
