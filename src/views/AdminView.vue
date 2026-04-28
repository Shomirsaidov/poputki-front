<script>
import api from '../api';
import AppLogo from '../components/AppLogo.vue';
import { 
  Chart as ChartJS, 
  Title, 
  Tooltip, 
  Legend, 
  LineElement, 
  PointElement, 
  CategoryScale, 
  LinearScale,
  ArcElement,
  BarElement
} from 'chart.js';
import { Line, Pie, Bar } from 'vue-chartjs';

ChartJS.register(
  Title, 
  Tooltip, 
  Legend, 
  LineElement, 
  PointElement, 
  CategoryScale, 
  LinearScale,
  ArcElement,
  BarElement
);

export default {
    components: {
        LineChart: Line,
        PieChart: Pie,
        BarChart: Bar,
        AppLogo
    },
    data() {
        return {
            isAuthenticated: !!localStorage.getItem('adminToken'),
            passcode: '',
            activeTab: 'dashboard',
            stats: null,
            users: [],
            rides: [],
            busTickets: [],
            reviews: [],
            ridesCities: [],
            busCities: [],
            newRideCity: '',
            newBusCity: '',
            loading: false,
            isCreatingBus: false,
            busForm: {
                transport_company: '',
                from_city: '',
                from_address: '',
                to_city: '',
                to_address: '',
                departure_date: '',
                departure_time: '',
                arrival_date: '',
                arrival_time: '',
                duration_hours: '',
                price: '',
                total_seats: 44,
                bus_type: 'single',
                passenger_comments: '',
                intermediate_stops: []
            },
            busErrors: {},
            busDrivers: [],
            newBusDriver: {
                name: '',
                surname: '',
                phone: '',
                password: ''
            },
            editingFee: null, // { driverId, value }
            user: JSON.parse(localStorage.getItem('user') || 'null'),
            error: '',
            mobileMenuOpen: false,
            editingUser: null,
            // Drill-down: bus ticket bookings
            selectedBusTicket: null,
            selectedBusTicketBookings: [],
            ticketBookingsLoading: false,
            // Drill-down: bus driver rides
            selectedBusDriver: null,
            selectedBusDriverTickets: [],
            driverDetailLoading: false,
            editingRide: null,
            showUserEditModal: false,
            showRideEditModal: false,
            navItems: [
                { id: 'dashboard', label: 'Дашборд' },
                { id: 'users', label: 'Пользователи' },
                { id: 'bus-drivers', label: 'Водители автобусов' },
                { id: 'rides', label: 'Поездки' },
                { id: 'bus-tickets', label: 'Автобусы' },
                { id: 'reviews', label: 'Отзывы' },
                { id: 'cities', label: 'Города' }
            ],
            chartOptions: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: { color: '#475569' }
                    }
                },
                scales: {
                    y: {
                        grid: { color: '#f1f5f9' },
                        ticks: { color: '#64748b' }
                    },
                    x: {
                        grid: { color: '#f1f5f9' },
                        ticks: { color: '#64748b' }
                    }
                }
            },
            pieOptions: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: { color: '#475569' }
                    }
                }
            }
        }
    },
    computed: {
        growthChartData() {
            if (!this.stats) return null;
            
            // Collect last 7 dates
            const labels = [];
            for (let i = 6; i >= 0; i--) {
                const date = new Date();
                date.setDate(date.getDate() - i);
                labels.push(date.toISOString().split('T')[0]);
            }

            const ridesMap = Object.fromEntries(this.stats.ridesLast7Days.map(r => [r.date, r.count]));
            const usersMap = Object.fromEntries(this.stats.usersLast7Days.map(u => [u.register_date, u.count]));

            return {
                labels,
                datasets: [
                    {
                        label: 'Поездки',
                        data: labels.map(l => ridesMap[l] || 0),
                        borderColor: '#f59e0b',
                        backgroundColor: '#f59e0b',
                        tension: 0.4
                    },
                    {
                        label: 'Регистрации',
                        data: labels.map(l => usersMap[l] || 0),
                        borderColor: '#3b82f6',
                        backgroundColor: '#3b82f6',
                        tension: 0.4
                    }
                ]
            };
        },
        ageChartData() {
            if (!this.stats || !this.stats.ageDistribution) return null;
            return {
                labels: this.stats.ageDistribution.map(a => a.label),
                datasets: [{
                    label: 'Пользователи',
                    data: this.stats.ageDistribution.map(a => a.count),
                    backgroundColor: '#3b82f6',
                    borderRadius: 8
                }]
            };
        },
        carModelChartData() {
            if (!this.stats || !this.stats.carModelDistribution) return null;
            return {
                labels: this.stats.carModelDistribution.map(c => c.model),
                datasets: [{
                    data: this.stats.carModelDistribution.map(c => c.count),
                    backgroundColor: ['#f59e0b', '#3b82f6', '#10b981', '#6366f1', '#ec4899', '#f43f5e', '#8b5cf6', '#06b6d4', '#475569', '#1e293b'],
                    borderWidth: 0
                }]
            };
        },
        vehicleChartData() {
            if (!this.stats) return null;
            return {
                labels: ['С авто', 'Без авто'],
                datasets: [{
                    data: [this.stats.usersWithCars || 0, this.stats.usersWithoutCars || 0],
                    backgroundColor: ['#10b981', '#f43f5e'],
                    borderWidth: 0
                }]
            };
        }
    },
    methods: {
        async checkPasscode() {
            if (!this.passcode) return;
            this.loading = true;
            try {
                const res = await api.post('/admin/login', { passcode: this.passcode });
                if (res.data.token) {
                    localStorage.setItem('adminToken', res.data.token);
                    this.isAuthenticated = true;
                    this.fetchDashboardData();
                }
            } catch (e) {
                if (e.response?.status === 401) {
                    alert('Неверный код доступа');
                } else if (!e.response) {
                    // This is likely a CORS or Network error
                    alert('Ошибка сети или доступа (CORS). Пожалуйста, свяжитесь с администратором.');
                    console.error('Network/CORS Error:', e);
                } else {
                    alert(e.response?.data?.error || 'Произошла ошибка при входе');
                }
            } finally {
                this.loading = false;
            }
        },
        logout() {
            localStorage.removeItem('adminToken');
            this.isAuthenticated = false;
        },
        async fetchDashboardData() {
            this.loading = true;
            try {
                const res = await api.get('/admin/stats');
                this.stats = res.data;
            } catch (e) {
                console.error(e);
            } finally {
                this.loading = false;
            }
        },
        async fetchUsers() {
            this.loading = true;
            try {
                const res = await api.get('/admin/users');
                this.users = res.data;
            } catch (e) { console.error(e); } finally { this.loading = false; }
        },
        async deleteUser(id) {
            if (confirm('Удалить пользователя?')) {
                await api.delete(`/admin/users/${id}`);
                this.fetchUsers();
            }
        },
        openEditUserModal(user) {
            this.editingUser = { ...user };
            this.showUserEditModal = true;
        },
        async updateUser() {
            try {
                await api.put(`/admin/users/${this.editingUser.id}`, this.editingUser);
                alert('Пользователь обновлен');
                this.showUserEditModal = false;
                this.fetchUsers();
                this.fetchBusDrivers();
            } catch (e) {
                alert('Ошибка при обновлении');
            }
        },
        async fetchBusDrivers() {
             this.loading = true;
             try {
                 const res = await api.get('/admin/bus-drivers');
                 this.busDrivers = res.data;
             } catch (e) { console.error(e); } finally { this.loading = false; }
        },
        startEditFee(driver) {
            this.editingFee = { driverId: driver.id, value: driver.service_fee_percent ?? 10 };
        },
        cancelEditFee() {
            this.editingFee = null;
        },
        async saveDriverFee(driver) {
            if (!this.editingFee) return;
            const fee = parseFloat(this.editingFee.value);
            if (isNaN(fee) || fee < 0 || fee > 100) {
                alert('Введите корректный процент (0–100)');
                return;
            }
            try {
                await api.put(`/admin/bus-drivers/${driver.id}/fee`, { service_fee_percent: fee });
                driver.service_fee_percent = fee;
                this.editingFee = null;
            } catch (e) {
                alert(e.response?.data?.error || 'Ошибка при сохранении');
            }
        },
        async createBusDriver() {
            if (!this.newBusDriver.phone || !this.newBusDriver.password) {
                alert('Номер телефона и пароль обязательны');
                return;
            }
            this.loading = true;
            try {
                await api.post('/admin/bus-drivers', this.newBusDriver);
                alert('Водитель автобуса успешно создан');
                this.newBusDriver = { name: '', surname: '', phone: '', password: '' };
                this.fetchBusDrivers();
            } catch (e) {
                alert(e.response?.data?.error || 'Ошибка при создании водителя');
            } finally {
                this.loading = false;
            }
        },
        async blockDriver(id) {
            if (confirm('Заблокировать водителя? Он не сможет создавать новые рейсы.')) {
                try {
                    await api.put(`/admin/bus-drivers/${id}/block`);
                    this.fetchBusDrivers();
                } catch (e) { alert('Ошибка при блокировке'); }
            }
        },
        async unblockDriver(id) {
            if (confirm('Разблокировать водителя?')) {
                try {
                    await api.put(`/admin/bus-drivers/${id}/unblock`);
                    this.fetchBusDrivers();
                } catch (e) { alert('Ошибка при разблокировке'); }
            }
        },
        async fetchRides() {
            this.loading = true;
            try {
                const res = await api.get('/admin/rides');
                this.rides = res.data;
            } catch (e) { console.error(e); } finally { this.loading = false; }
        },
        async deleteRide(id) {
            if (confirm('Удалить поездку?')) {
                await api.delete(`/admin/rides/${id}`);
                this.fetchRides();
            }
        },
        openEditRideModal(ride) {
            this.editingRide = { ...ride };
            this.showRideEditModal = true;
        },
        async updateRide() {
            try {
                const data = { ...this.editingRide };
                delete data.driver_name; // Computed field
                await api.put(`/admin/rides/${this.editingRide.id}`, data);
                alert('Поездка обновлена');
                this.showRideEditModal = false;
                this.fetchRides();
            } catch (e) {
                alert('Ошибка при обновлении');
            }
        },
        async fetchBusTickets() {
            this.loading = true;
            try {
                const res = await api.get('/admin/bus-tickets');
                this.busTickets = res.data;
            } catch (e) { console.error(e); } finally { this.loading = false; }
        },
        async deleteBusTicket(id) {
            if (confirm('Удалить этот рейс?')) {
                await api.delete(`/admin/bus-tickets/${id}`);
                this.fetchBusTickets();
            }
        },
        async fetchReviews() {
            this.loading = true;
            try {
                const res = await api.get('/admin/reviews');
                this.reviews = res.data;
            } catch (e) {
                console.error(e);
            } finally {
                this.loading = false;
            }
        },
        async deleteReview(id) {
            if (confirm('Удалить этот отзыв?')) {
                await api.delete(`/admin/reviews/${id}`);
                this.fetchReviews();
            }
        },
        async fetchCities() {
            this.loading = true;
            try {
                const [ridesRes, busesRes] = await Promise.all([
                    api.get('/admin/cities', { params: { type: 'ride' } }),
                    api.get('/admin/cities', { params: { type: 'bus' } })
                ]);
                this.ridesCities = ridesRes.data;
                this.busCities = busesRes.data;
            } catch (e) { console.error(e); } finally { this.loading = false; }
        },
        async addCity(type) {
            const name = type === 'ride' ? this.newRideCity : this.newBusCity;
            if (!name) return;
            try {
                await api.post('/admin/cities', { name, type });
                if (type === 'ride') this.newRideCity = ''; else this.newBusCity = '';
                this.fetchCities();
            } catch (e) { 
                alert(e.response?.data?.error || 'Ошибка при добавлении города'); 
            }
        },
        async deleteCity(id) {
            if (confirm('Удалить город?')) {
                await api.delete(`/admin/cities/${id}`);
                this.fetchCities();
            }
        },

        // Bus Ticket Creation Methods
        addStop() {
            this.busForm.intermediate_stops.push({ city: '', time: '', address: '' });
        },
        removeStop(index) {
            this.busForm.intermediate_stops.splice(index, 1);
        },
        validateBusForm() {
            const e = {};
            if (!this.busForm.transport_company.trim()) e.transport_company = 'Укажите компанию';
            if (!this.busForm.from_city) e.from_city = 'Укажите город отправления';
            if (!this.busForm.from_address.trim()) e.from_address = 'Укажите место отправления';
            if (!this.busForm.to_city) e.to_city = 'Укажите город прибытия';
            if (!this.busForm.to_address.trim()) e.to_address = 'Укажите место прибытия';
            if (!this.busForm.departure_date) e.departure_date = 'Укажите дату отправления';
            if (!this.busForm.departure_time) e.departure_time = 'Укажите время отправления';
            if (!this.busForm.arrival_date) e.arrival_date = 'Укажите дату прибытия';
            if (!this.busForm.arrival_time) e.arrival_time = 'Укажите время прибытия';
            if (!this.busForm.duration_minutes || this.busForm.duration_minutes <= 0) e.duration_minutes = 'Укажите длительность';
            if (!this.busForm.price || this.busForm.price <= 0) e.price = 'Укажите цену';
            if (!this.busForm.total_seats || this.busForm.total_seats < 1) e.total_seats = 'Укажите количество мест';
            this.busErrors = e;
            return Object.keys(e).length === 0;
        },
        async submitBusTicket() {
            if (!this.validateBusForm()) {
                alert('Пожалуйста, заполните все обязательные поля');
                return;
            }
            this.loading = true;
            try {
                await api.post('/bus-tickets', {
                    ...this.busForm,
                    operator_id: this.user?.id || 1,
                    duration_minutes: Number(this.busForm.duration_hours) * 60,
                    price: Number(this.busForm.price),
                    total_seats: Number(this.busForm.total_seats)
                });
                alert('Рейс успешно создан!');
                this.isCreatingBus = false;
                this.fetchBusTickets();
                this.busForm = {
                    transport_company: '', from_city: '', from_address: '',
                    to_city: '', to_address: '', departure_date: '',
                    departure_time: '', arrival_date: '', arrival_time: '',
                    duration_hours: '', price: '', total_seats: 44,
                    bus_type: 'single', passenger_comments: '',
                    intermediate_stops: []
                };
            } catch (e) {
                alert(e.response?.data?.error || 'Ошибка при создании');
            } finally {
                this.loading = false;
            }
        },

        // ─── Drill-down: Bus Ticket Bookings ───────────────────────────
        async openBusTicketBookings(ticket) {
            this.selectedBusTicket = ticket;
            this.selectedBusTicketBookings = [];
            this.ticketBookingsLoading = true;
            try {
                const res = await api.get(`/admin/bus-tickets/${ticket.id}/bookings`);
                this.selectedBusTicketBookings = res.data;
            } catch (e) {
                alert('Ошибка загрузки бронирований: ' + (e.response?.data?.error || e.message));
            } finally {
                this.ticketBookingsLoading = false;
            }
        },
        closeBusTicketBookings() {
            this.selectedBusTicket = null;
            this.selectedBusTicketBookings = [];
        },
        async deleteAdminBooking(bookingId) {
            if (!confirm('Полностью удалить это бронирование? Места будут освобождены.')) return;
            try {
                await api.delete(`/bus-admin/bookings/${bookingId}`);
                this.selectedBusTicketBookings = this.selectedBusTicketBookings.filter(b => b.id !== bookingId);
            } catch (e) {
                alert('Ошибка при удалении: ' + (e.response?.data?.error || e.message));
            }
        },
        passengerManifestForBookings(bookings) {
            const manifest = [];
            (bookings || []).forEach(b => {
                const pData = b.passengers_data || [];
                if (pData.length === 0) {
                    manifest.push({
                        lastName: b.passenger_name || '—', firstName: '', middleName: '',
                        seat: (b.seat_numbers || []).join(', '),
                        gender: '—', birthDate: '—', docType: '—', docNumber: '—', citizenship: '—',
                        contactPhone: b.passenger_phone || b.phone,
                        pickup_city: b.pickup_city, drop_off_city: b.drop_off_city,
                        paymentStatus: b.status === 'pending_payment' ? 'Ожидает оплаты' : (b.total_price === 0 ? 'Ручная' : 'Оплачено'),
                        originalBookingId: b.id
                    });
                } else {
                    pData.forEach((p, idx) => {
                        manifest.push({
                            ...p,
                            seat: (b.seat_numbers && b.seat_numbers[idx]) ? b.seat_numbers[idx] : '—',
                            contactPhone: p.phone || b.passenger_phone || b.phone,
                            pickup_city: b.pickup_city, drop_off_city: b.drop_off_city,
                            paymentStatus: b.status === 'pending_payment' ? 'Ожидает оплаты' : (b.total_price === 0 ? 'Ручная' : 'Оплачено'),
                            originalBookingId: b.id
                        });
                    });
                }
            });
            return manifest;
        },

        // ─── Drill-down: Bus Driver Rides ──────────────────────────────
        async openBusDriverDetail(driver) {
            this.selectedBusDriver = driver;
            this.selectedBusDriverTickets = [];
            this.driverDetailLoading = true;
            try {
                const res = await api.get(`/admin/bus-drivers/${driver.id}/tickets`);
                this.selectedBusDriverTickets = res.data;
            } catch (e) {
                alert('Ошибка загрузки рейсов: ' + (e.response?.data?.error || e.message));
            } finally {
                this.driverDetailLoading = false;
            }
        },
        closeBusDriverDetail() {
            this.selectedBusDriver = null;
            this.selectedBusDriverTickets = [];
        }
    },
    watch: {
        activeTab(newTab) {
            this.isCreatingBus = false;
            if (newTab === 'dashboard') this.fetchDashboardData();
            if (newTab === 'users') this.fetchUsers();
            if (newTab === 'bus-drivers') this.fetchBusDrivers();
            if (newTab === 'rides') this.fetchRides();
            if (newTab === 'bus-tickets') {
                this.fetchBusTickets();
                this.fetchCities();
            }
            if (newTab === 'reviews') this.fetchReviews();
            if (newTab === 'cities') this.fetchCities();
        }
    },
    mounted() {
        if (this.isAuthenticated && this.activeTab === 'dashboard') {
            this.fetchDashboardData();
        }
    }
}
</script>

<template>
    <div class="admin-panel h-screen bg-white text-slate-900 flex overflow-hidden font-sans">
        <!-- Mobile Header -->
        <div class="lg:hidden fixed top-0 inset-x-0 z-40 bg-white border-b border-slate-100 p-4 flex justify-between items-center shadow-sm">
            <div class="flex items-center space-x-3">
                <AppLogo 
                    :showText="false" 
                    iconSizeClass="w-8 h-8"
                    iconClass="h-5 w-5"
                    iconBgClass="bg-amber-500 text-white"
                />
                <span class="text-lg font-bold tracking-tight text-slate-900">Admin</span>
            </div>
            <button @click="mobileMenuOpen = !mobileMenuOpen" class="text-slate-500 p-2">
                <svg v-if="!mobileMenuOpen" xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
        </div>
        
        <!-- Auth Overlay -->
        <div v-if="!isAuthenticated" class="fixed inset-0 z-[100] bg-slate-50 flex items-center justify-center p-4 sm:p-6">
            <div class="max-w-md w-full bg-white p-8 rounded-[40px] border border-slate-100 shadow-xl text-center">
                <div class="w-20 h-20 bg-amber-50 rounded-[28px] flex items-center justify-center mx-auto mb-8 border border-amber-100">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                </div>
                <h1 class="text-3xl font-black mb-2 text-slate-900">Admin Panel</h1>
                <p class="text-slate-400 mb-8 font-medium">Введите код доступа для работы с системой</p>
                <input 
                    v-model="passcode" 
                    type="password" 
                    placeholder="••••••"
                    class="w-full bg-slate-50 border border-slate-100 rounded-3xl p-5 text-center text-3xl tracking-[0.5em] focus:border-amber-500 outline-none transition-all mb-8 shadow-inner text-slate-900"
                    @keyup.enter="checkPasscode"
                />
                <button 
                    @click="checkPasscode"
                    class="w-full bg-amber-500 hover:bg-amber-600 text-white font-black py-5 rounded-[24px] transition-all shadow-lg shadow-amber-500/20 text-lg"
                >
                    Войти в систему
                </button>
            </div>
        </div>

        <!-- Sidebar -->
        <aside 
            class="lg:w-72 bg-slate-50 border-r border-slate-100 flex flex-col pt-10 fixed lg:relative inset-y-0 left-0 z-30 transition-transform transform lg:translate-x-0 w-64"
            :class="mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'"
        >
            <div class="px-8 mb-12">
                <div class="flex items-center space-x-3">
                    <AppLogo 
                        :showText="false" 
                        iconSizeClass="w-10 h-10"
                        iconClass="h-6 w-6"
                        iconBgClass="bg-amber-500 text-white"
                    />
                    <span class="text-xl font-black tracking-tight text-slate-900">Poputki Admin</span>
                </div>
            </div>

            <nav class="flex-1 px-4 space-y-1.5 overflow-y-auto">
                <button 
                    v-for="item in navItems" 
                    :key="item.id"
                    @click="activeTab = item.id; mobileMenuOpen = false"
                    class="w-full px-5 py-4 rounded-2xl flex items-center space-x-3 transition-all group font-bold"
                    :class="activeTab === item.id ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20' : 'text-slate-400 hover:bg-white hover:text-slate-900'"
                >
                    <span class="capitalize">{{ item.label }}</span>
                </button>
            </nav>

            <div class="p-8 border-t border-slate-100">
                <button @click="logout" class="text-xs font-bold text-slate-300 hover:text-red-400 transition-colors uppercase tracking-widest">Выйти из сессии</button>
            </div>
        </aside>

        <!-- Main Content -->
        <main class="flex-1 overflow-y-auto bg-white p-4 sm:p-6 lg:p-10 pt-20 lg:pt-10 w-full overflow-x-hidden">
            
            <!-- Dashboard Section -->
            <section v-if="activeTab === 'dashboard'" class="space-y-6 lg:space-y-10">
                <div class="flex justify-between items-end">
                    <div>
                        <h2 class="text-4xl font-bold">Дашборд</h2>
                        <p class="text-slate-500 mt-2">Обзор ключевых показателей платформы</p>
                    </div>
                </div>

                <!-- Dashboard Stats Skeletons -->
                <div v-if="!stats" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 lg:gap-6 animate-pulse">
                    <div v-for="i in 2" :key="'stat-skel-'+i" class="bg-white p-6 lg:p-8 rounded-2xl lg:rounded-[32px] border border-slate-100 shadow-sm">
                        <div class="h-3 w-20 bg-slate-100 rounded mb-4"></div>
                        <div class="h-10 w-32 bg-slate-50 rounded"></div>
                    </div>
                </div>

                <div v-if="stats" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 lg:gap-6">
                    <div class="bg-white p-6 lg:p-8 rounded-2xl lg:rounded-[32px] border border-slate-100 shadow-sm">
                        <p class="text-slate-400 text-xs lg:text-sm font-black uppercase tracking-widest mb-2">Пользователи</p>
                        <h3 class="text-3xl lg:text-4xl font-black text-slate-900 font-mono">{{ stats.totalUsers }}</h3>
                    </div>
                    <div class="bg-white p-6 lg:p-8 rounded-2xl lg:rounded-[32px] border border-slate-100 shadow-sm border-l-[6px] border-l-amber-500">
                        <p class="text-slate-400 text-xs lg:text-sm font-black uppercase tracking-widest mb-2">Активные поездки</p>
                        <h3 class="text-3xl lg:text-4xl font-black text-amber-500 font-mono">{{ stats.activeRides }}</h3>
                    </div>
                </div>

                <!-- Dashboard Charts Skeletons Row 1 -->
                <div v-if="!stats" class="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10 animate-pulse">
                    <div v-for="i in 2" :key="'chart-skel-1-'+i" class="bg-white p-6 lg:p-8 rounded-2xl lg:rounded-[32px] border border-slate-100 shadow-sm">
                        <div class="flex justify-between items-center mb-6">
                            <div class="h-6 w-40 bg-slate-100 rounded"></div>
                            <div class="h-3 w-24 bg-slate-50 rounded"></div>
                        </div>
                        <div class="h-[300px] bg-slate-50 rounded-xl flex items-center justify-center">
                            <svg class="w-12 h-12 text-slate-100" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div v-if="stats" class="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10">
                    <!-- Growth Chart -->
                    <div class="bg-white p-6 lg:p-8 rounded-2xl lg:rounded-[32px] border border-slate-100 shadow-sm">
                        <h4 class="text-lg lg:text-xl font-bold mb-6 flex justify-between items-center text-slate-800">
                            <span>Динамика роста</span>
                            <span class="text-xs text-slate-400 font-normal">Последние 7 дней</span>
                        </h4>
                        <div class="h-[300px]">
                            <LineChart :data="growthChartData" :options="chartOptions" />
                        </div>
                    </div>

                    <!-- Car Models -->
                    <div class="bg-white p-6 lg:p-8 rounded-2xl lg:rounded-[32px] border border-slate-100 shadow-sm">
                        <h4 class="text-lg lg:text-xl font-bold mb-6 text-slate-800">Модели автомобилей</h4>
                        <div class="h-[300px]">
                            <PieChart :data="carModelChartData" :options="pieOptions" />
                        </div>
                    </div>
                </div>

                <!-- Dashboard Charts Skeletons Row 2 -->
                <div v-if="!stats" class="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10 animate-pulse">
                    <div v-for="i in 2" :key="'chart-skel-2-'+i" class="bg-white p-6 lg:p-8 rounded-2xl lg:rounded-[32px] border border-slate-100 shadow-sm">
                        <div class="h-6 w-48 bg-slate-100 rounded mb-6"></div>
                        <div class="h-[300px] bg-slate-50 rounded-xl flex items-center justify-center">
                             <svg class="w-12 h-12 text-slate-100" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div v-if="stats" class="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10">
                     <!-- Age Distribution -->
                     <div class="bg-white p-6 lg:p-8 rounded-2xl lg:rounded-[32px] border border-slate-100 shadow-sm">
                        <h4 class="text-lg lg:text-xl font-bold mb-6 text-slate-800">Возраст пользователей</h4>
                        <div class="h-[300px]">
                            <BarChart :data="ageChartData" :options="chartOptions" />
                        </div>
                    </div>

                    <!-- Vehicle Distribution -->
                    <div class="bg-white p-6 lg:p-8 rounded-2xl lg:rounded-[32px] border border-slate-100 shadow-sm">
                        <h4 class="text-lg lg:text-xl font-bold mb-6 text-slate-800">Наличие авто</h4>
                        <div class="h-[300px]">
                            <PieChart :data="vehicleChartData" :options="pieOptions" />
                        </div>
                    </div>
                </div>

                <!-- Dashboard Lists Skeletons -->
                <div v-if="!stats" class="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10 animate-pulse">
                    <div v-for="i in 2" :key="'list-skel-'+i" class="bg-white p-6 lg:p-8 rounded-2xl lg:rounded-[32px] border border-slate-100 shadow-sm">
                        <div class="h-6 w-40 bg-slate-100 rounded mb-8"></div>
                        <div class="space-y-6">
                            <div v-for="j in 4" :key="'list-item-skel-'+j" class="flex justify-between items-center pb-3 border-b border-slate-50 last:border-0">
                                <div class="h-4 w-32 bg-slate-50 rounded"></div>
                                <div class="h-4 w-16 bg-slate-50 rounded-full"></div>
                            </div>
                        </div>
                    </div>
                </div>

                <div v-if="stats" class="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10">
                    <div class="bg-white p-6 lg:p-8 rounded-2xl lg:rounded-[32px] border border-slate-100 shadow-sm">
                        <h4 class="text-lg lg:text-xl font-bold mb-4 lg:mb-6 text-slate-800">Новые пользователи</h4>
                        <div class="space-y-4">
                            <div v-for="u in stats.recentUsers" :key="u.id" class="flex justify-between items-center border-b border-slate-50 pb-3 last:border-0">
                                <span class="font-medium text-sm lg:text-base text-slate-700">{{ u.name }}</span>
                                <span class="text-xs text-slate-400">{{ new Date(u.created_at).toLocaleDateString() }}</span>
                            </div>
                        </div>
                    </div>
                    <div class="bg-white p-6 lg:p-8 rounded-2xl lg:rounded-[32px] border border-slate-100 shadow-sm">
                        <h4 class="text-lg lg:text-xl font-bold mb-4 lg:mb-6 text-slate-800">Популярные города</h4>
                        <div class="space-y-4">
                            <div v-for="d in stats.popularDestinations" :key="d.to_city" class="flex justify-between items-center border-b border-slate-50 pb-3 last:border-0">
                                <span class="font-medium text-sm lg:text-base text-slate-700">{{ d.to_city }}</span>
                                <span class="bg-amber-50 text-amber-600 px-3 py-1 rounded-full text-xs font-bold">{{ d.count }} поездок</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <!-- Users Section -->
            <section v-if="activeTab === 'users'" class="space-y-6 lg:space-y-8">
                <h2 class="text-2xl lg:text-3xl text-slate-900 font-bold">Пользователи</h2>
                <div class="bg-white rounded-2xl lg:rounded-[32px] border border-slate-100 overflow-x-auto shadow-sm">
                    <table class="w-full text-left min-w-[700px]">
                        <thead class="bg-slate-50 border-b border-slate-100">
                            <tr>
                                <th class="px-6 py-4 text-slate-500 font-semibold">ID</th>
                                <th class="px-6 py-4 text-slate-500 font-semibold">Имя</th>
                                <th class="px-6 py-4 text-slate-500 font-semibold">Телефон</th>
                                <th class="px-6 py-4 text-slate-500 font-semibold">Рейтинг</th>
                                <th class="px-6 py-4 text-slate-500 font-semibold">Действия</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-50">
                            <tr v-for="(user, index) in users" :key="user.id" class="hover:bg-slate-50 transition-colors text-slate-700">
                                <td class="px-6 py-4 font-mono text-slate-400">#{{ users.length - index }}</td>
                                <td class="px-6 py-4 font-bold">{{ user.name }} {{ user.surname }}</td>
                                <td class="px-6 py-4 font-mono">{{ user.phone }}</td>
                                <td class="px-6 py-4">
                                    <span class="bg-amber-50 text-amber-600 px-3 py-1 rounded-full text-sm font-bold">★ {{ user.rating }}</span>
                                </td>
                                 <td class="px-6 py-4 text-right space-x-3">
                                     <button @click="openEditUserModal(user)" class="text-amber-600 hover:text-amber-700 font-bold text-sm">Изменить</button>
                                     <button @click="deleteUser(user.id)" class="text-red-500 hover:text-red-600 font-bold text-sm">Удалить</button>
                                 </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>

            <!-- Bus Drivers Section -->
            <section v-if="activeTab === 'bus-drivers'" class="space-y-6 lg:space-y-8">
                <h2 class="text-2xl lg:text-3xl text-slate-900 font-bold">Водители автобусов</h2>
                
                <div class="bg-white rounded-2xl lg:rounded-[32px] border border-slate-100 p-6 lg:p-8 shadow-sm space-y-6">
                    <h3 class="text-xl font-bold text-amber-600">Добавить водителя</h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <input v-model="newBusDriver.name" placeholder="Имя" class="bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 outline-none focus:border-amber-500" />
                        <input v-model="newBusDriver.surname" placeholder="Фамилия" class="bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 outline-none focus:border-amber-500" />
                        <input v-model="newBusDriver.phone" placeholder="Телефон" type="tel" class="bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 outline-none focus:border-amber-500" />
                        <input v-model="newBusDriver.password" placeholder="Пароль" type="text" class="bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 outline-none focus:border-amber-500" />
                    </div>
                    <div class="flex justify-end">
                        <button @click="createBusDriver" :disabled="loading" class="bg-amber-500 text-white font-bold px-6 py-3 rounded-xl shadow-lg hover:-translate-y-1 transition-all disabled:opacity-50">Создать водителя</button>
                    </div>
                </div>

                <div class="bg-white rounded-2xl lg:rounded-[32px] border border-slate-100 overflow-x-auto shadow-sm mt-8">
                    <table class="w-full text-left min-w-[700px]">
                        <thead class="bg-slate-50 border-b border-slate-100">
                            <tr>
                                <th class="px-6 py-4 text-slate-500 font-semibold">ID</th>
                                <th class="px-6 py-4 text-slate-500 font-semibold">Имя</th>
                                <th class="px-6 py-4 text-slate-500 font-semibold">Телефон</th>
                                <th class="px-6 py-4 text-slate-500 font-semibold">Дата создания</th>
                                <th class="px-6 py-4 text-slate-500 font-semibold">Сбор (%)</th>
                                <th class="px-6 py-4 text-slate-500 font-semibold">Действия</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-50">
                            <tr v-for="driver in busDrivers" :key="driver.id" @click="openBusDriverDetail(driver)" class="hover:bg-amber-50 cursor-pointer transition-colors text-slate-700">
                                <td class="px-6 py-4 font-mono text-slate-400">#{{ driver.id }}</td>
                                <td class="px-6 py-4 font-bold">
                                    <div class="flex items-center gap-2">
                                        {{ driver.name }} {{ driver.surname }}
                                        <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
                                    </div>
                                </td>
                                <td class="px-6 py-4 font-mono">{{ driver.phone }}</td>
                                <td class="px-6 py-4">
                                    <span v-if="driver.is_blocked" class="bg-red-50 text-red-600 px-3 py-1 rounded-full text-xs font-bold border border-red-100 italic">Заблокирован</span>
                                    <span v-else class="text-slate-500 text-sm">{{ new Date(driver.created_at).toLocaleDateString() }}</span>
                                </td>
                                <!-- Inline fee editor -->
                                <td class="px-6 py-4" @click.stop>
                                    <div v-if="editingFee && editingFee.driverId === driver.id" class="flex items-center gap-2">
                                        <input
                                            v-model.number="editingFee.value"
                                            type="number" min="0" max="100" step="0.5"
                                            class="w-20 bg-slate-50 border border-amber-300 rounded-lg px-2 py-1 text-sm text-slate-900 outline-none focus:border-amber-500 font-mono"
                                            @keyup.enter="saveDriverFee(driver)"
                                            @keyup.esc="cancelEditFee"
                                        />
                                        <button @click.stop="saveDriverFee(driver)" class="text-xs font-bold text-emerald-600 hover:text-emerald-700 cursor-pointer">Сохр</button>
                                        <button @click.stop="cancelEditFee" class="text-xs font-bold text-slate-400 hover:text-slate-600 cursor-pointer">Итм</button>
                                    </div>
                                    <button v-else @click.stop="startEditFee(driver)" class="inline-flex items-center gap-1 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-700 font-bold text-sm px-3 py-1 rounded-full transition-colors cursor-pointer">
                                        {{ driver.service_fee_percent ?? 10 }}%
                                        <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125"/></svg>
                                    </button>
                                </td>
                                <td class="px-6 py-4 space-x-3" @click.stop>
                                     <button @click.stop="openEditUserModal(driver)" class="text-amber-600 hover:text-amber-700 font-bold text-sm cursor-pointer">Изменить</button>
                                     <button v-if="!driver.is_blocked" @click.stop="blockDriver(driver.id)" class="text-slate-400 hover:text-red-500 font-bold text-sm cursor-pointer">Блокировать</button>
                                     <button v-else @click.stop="unblockDriver(driver.id)" class="text-emerald-600 hover:text-emerald-700 font-bold text-sm cursor-pointer">Разблокировать</button>
                                     <button @click.stop="deleteUser(driver.id)" class="text-red-500 hover:text-red-600 font-bold text-sm cursor-pointer opacity-30 hover:opacity-100 transition-opacity">Удалить</button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>


            </section>

             <!-- Rides Section -->
             <section v-if="activeTab === 'rides'" class="space-y-6 lg:space-y-8">
                <h2 class="text-2xl lg:text-3xl text-slate-900 font-bold">Все поездки</h2>
                <div class="bg-white rounded-2xl lg:rounded-[32px] border border-slate-100 overflow-x-auto shadow-sm">
                    <table class="w-full text-left min-w-[800px]">
                        <thead class="bg-slate-50 border-b border-slate-100">
                            <tr>
                                <th class="px-6 py-4 text-slate-500 font-semibold">ID</th>
                                <th class="px-6 py-4 text-slate-500 font-semibold">Маршрут</th>
                                <th class="px-6 py-4 text-slate-500 font-semibold">Водитель</th>
                                <th class="px-6 py-4 text-slate-500 font-semibold">Дата/Время</th>
                                <th class="px-6 py-4 text-slate-500 font-semibold">Статус</th>
                                <th class="px-6 py-4 text-slate-500 font-semibold text-right">Управление</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-50">
                            <tr v-for="ride in rides" :key="ride.id" class="hover:bg-slate-50 transition-colors text-slate-700">
                                <td class="px-6 py-4 font-mono text-slate-400">#{{ ride.id }}</td>
                                <td class="px-6 py-4">
                                    <div class="flex items-center space-x-2">
                                        <span class="font-bold text-slate-800">{{ ride.from_city }}</span>
                                        <span class="text-slate-400">→</span>
                                        <span class="font-bold text-slate-800">{{ ride.to_city }}</span>
                                    </div>
                                </td>
                                <td class="px-6 py-4 font-medium">{{ ride.driver_name }}</td>
                                <td class="px-6 py-4 font-mono text-sm text-slate-500">{{ ride.date }} {{ ride.time }}</td>
                                <td class="px-6 py-4">
                                    <span :class="ride.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-500'" class="px-3 py-1 rounded-full text-xs font-bold uppercase">{{ ride.status || 'active' }}</span>
                                </td>
                                <td class="px-6 py-4 text-right space-x-3">
                                    <button @click="openEditRideModal(ride)" class="text-amber-600 hover:text-amber-700 font-bold text-sm">Изменить</button>
                                    <button @click="deleteRide(ride.id)" class="text-red-500 hover:text-red-600 font-bold text-sm">Удалить</button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>

            <!-- Cities Section -->
            <section v-if="activeTab === 'cities'" class="space-y-6 lg:space-y-10">
                <div class="mb-8">
                    <h2 class="text-3xl font-bold text-slate-900">Управление городами</h2>
                    <p class="text-slate-500 mt-2">Раздельное управление списками для попуток и автобусов</p>
                </div>

                <div class="grid grid-cols-1 xl:grid-cols-2 gap-8 lg:gap-12">
                    
                    <!-- Rides Cities -->
                    <div class="space-y-6">
                        <div class="flex items-center justify-between bg-white p-6 rounded-[28px] border border-slate-100 shadow-sm">
                            <div class="flex items-center space-x-4">
                                <div class="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600 border border-amber-100">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" /><circle cx="7" cy="17" r="2" /><path stroke-linecap="round" stroke-linejoin="round" d="M9 17h6" /><circle cx="17" cy="17" r="2" /></svg>
                                </div>
                                <div>
                                    <h3 class="font-bold text-xl text-slate-800 uppercase tracking-tight">Попутки</h3>
                                    <p class="text-xs text-slate-400">Для частных поездок</p>
                                </div>
                            </div>
                            <div class="flex gap-2">
                                <input v-model="newRideCity" type="text" placeholder="Новый город" class="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm outline-none focus:border-amber-500 w-32 md:w-auto text-slate-700">
                                <button @click="addCity('ride')" class="bg-amber-500 text-white px-4 py-2 rounded-xl font-bold text-sm shadow-md hover:bg-amber-600 transition-colors">+</button>
                            </div>
                        </div>
                        
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div v-for="city in ridesCities" :key="'ride-city-'+city.id" class="bg-white p-4 rounded-2xl border border-slate-100 flex justify-between items-center group hover:border-amber-500/30 transition-all shadow-sm">
                                <span class="font-medium text-slate-700">{{ city.name }}</span>
                                <button @click="deleteCity(city.id)" class="text-slate-300 hover:text-red-400 p-1.5 rounded-lg hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" /></svg>
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Bus Cities -->
                    <div class="space-y-6">
                        <div class="flex items-center justify-between bg-white p-6 rounded-[28px] border border-slate-100 shadow-sm">
                            <div class="flex items-center space-x-4">
                                <div class="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 border border-blue-100">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><rect x="3" y="5" width="18" height="14" rx="2"/><path stroke-linecap="round" stroke-linejoin="round" d="M3 11h18M7 19v2M17 19v2M3 8h18"/><circle cx="7.5" cy="16" r="1" fill="currentColor"/><circle cx="16.5" cy="16" r="1" fill="currentColor"/></svg>
                                </div>
                                <div>
                                    <h3 class="font-bold text-xl text-slate-800 uppercase tracking-tight">Автобусы</h3>
                                    <p class="text-xs text-slate-400">Для официальных рейсов</p>
                                </div>
                            </div>
                            <div class="flex gap-2">
                                <input v-model="newBusCity" type="text" placeholder="Новый город" class="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm outline-none focus:border-blue-500 w-32 md:w-auto text-slate-700">
                                <button @click="addCity('bus')" class="bg-blue-500 text-white px-4 py-2 rounded-xl font-bold text-sm shadow-md hover:bg-blue-600 transition-colors">+</button>
                            </div>
                        </div>

                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div v-for="city in busCities" :key="'bus-city-'+city.id" class="bg-white p-4 rounded-2xl border border-slate-100 flex justify-between items-center group hover:border-blue-400/30 transition-all shadow-sm">
                                <span class="font-medium text-slate-700">{{ city.name }}</span>
                                <button @click="deleteCity(city.id)" class="text-slate-300 hover:text-red-400 p-1.5 rounded-lg hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" /></svg>
                                </button>
                            </div>
                        </div>
                    </div>

                </div>
            </section>

            <!-- Bus Tickets Section -->
            <section v-if="activeTab === 'bus-tickets'" class="space-y-6 lg:space-y-8">
                <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
                    <h2 class="text-2xl lg:text-3xl font-bold">Управление автобусами</h2>
                    <button 
                        class="bg-amber-500 text-slate-900 px-6 py-2 rounded-xl font-bold shadow-lg shadow-amber-500/20 w-full sm:w-auto" 
                        @click="isCreatingBus = !isCreatingBus"
                    >
                        {{ isCreatingBus ? 'Отмена' : 'Добавить рейс' }}
                    </button>
                </div>

                <!-- ADD BUS TICKET INTERFACE (Embedded) -->
                <div v-if="isCreatingBus" class="bg-white rounded-[32px] border border-slate-100 p-8 shadow-2xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <div class="flex justify-between items-center">
                        <h3 class="text-2xl font-bold text-slate-800">Новый автобусный рейс</h3>
                        <div class="flex items-center space-x-2">
                             <span class="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
                             <span class="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Создание записи</span>
                        </div>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <!-- Company -->
                        <div class="space-y-2">
                            <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Компания</label>
                            <input v-model="busForm.transport_company" placeholder="Название перевозчика" 
                                class="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-slate-900 outline-none focus:border-blue-500 transition-all shadow-inner"
                                :class="{'border-red-500': busErrors.transport_company}" />
                        </div>

                        <!-- From City -->
                        <div class="space-y-2">
                            <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Откуда</label>
                            <select v-model="busForm.from_city" class="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-slate-900 outline-none focus:border-blue-500 transition-all shadow-inner appearance-none cursor-pointer" :class="{'border-red-500': busErrors.from_city}">
                                <option value="" disabled>Выберите город</option>
                                <option v-for="c in busCities" :key="'bus-from-'+c.id" :value="c.name">{{ c.name }}</option>
                            </select>
                        </div>

                        <!-- From Address -->
                        <div class="space-y-2">
                            <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Адрес отправления</label>
                            <input v-model="busForm.from_address" placeholder="Точный адрес автовокзала" 
                                class="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-slate-900 outline-none focus:border-blue-500 transition-all shadow-inner" />
                        </div>

                        <!-- To City -->
                        <div class="space-y-2">
                            <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Куда</label>
                            <select v-model="busForm.to_city" class="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-slate-900 outline-none focus:border-blue-500 transition-all shadow-inner appearance-none cursor-pointer" :class="{'border-red-500': busErrors.to_city}">
                                <option value="" disabled>Выберите город</option>
                                <option v-for="c in busCities" :key="'bus-to-'+c.id" :value="c.name">{{ c.name }}</option>
                            </select>
                        </div>

                        <!-- To Address -->
                        <div class="space-y-2">
                            <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Адрес прибытия</label>
                            <input v-model="busForm.to_address" placeholder="Точный адрес прибытия" 
                                class="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-slate-900 outline-none focus:border-blue-500 transition-all shadow-inner" />
                        </div>

                        <!-- Dates (Departure) -->
                        <div class="grid grid-cols-2 gap-4">
                            <div class="space-y-2">
                                <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Дата отпр.</label>
                                <input v-model="busForm.departure_date" type="date" class="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-slate-900 outline-none focus:border-blue-400 text-xs" :class="{'border-red-500': busErrors.departure_date}" />
                            </div>
                            <div class="space-y-2">
                                <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Время отпр.</label>
                                <input v-model="busForm.departure_time" type="time" class="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-slate-900 outline-none focus:border-blue-400 text-xs" :class="{'border-red-500': busErrors.departure_time}" />
                            </div>
                        </div>

                        <!-- Dates (Arrival) -->
                        <div class="grid grid-cols-2 gap-4">
                            <div class="space-y-2">
                                <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Дата приб.</label>
                                <input v-model="busForm.arrival_date" type="date" class="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-slate-900 outline-none focus:border-blue-400 text-xs" :class="{'border-red-500': busErrors.arrival_date}" />
                            </div>
                            <div class="space-y-2">
                                <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Время приб.</label>
                                <input v-model="busForm.arrival_time" type="time" class="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-slate-900 outline-none focus:border-blue-400 text-xs" :class="{'border-red-500': busErrors.arrival_time}" />
                            </div>
                        </div>

                        <!-- Price -->
                        <div class="space-y-2">
                            <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Цена (TJS)</label>
                            <input v-model="busForm.price" type="number" placeholder="000.00" 
                                class="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-blue-600 font-bold text-xl outline-none focus:border-blue-500 transition-all shadow-inner" />
                        </div>

                         <!-- Bus Type Selection (Premium Toggles) -->
                         <div class="space-y-2 flex flex-col">
                            <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2">Конфигурация автобуса</label>
                            <div class="flex bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
                                <button @click="busForm.bus_type = 'single'; busForm.total_seats = 44"
                                    :class="busForm.bus_type === 'single' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400'"
                                    class="flex-1 py-3 rounded-xl font-bold text-xs transition-all tracking-tighter uppercase whitespace-pretty px-2"
                                >
                                    Обычный (44)
                                </button>
                                <button @click="busForm.bus_type = 'double'; busForm.total_seats = 72"
                                    :class="busForm.bus_type === 'double' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400'"
                                    class="flex-1 py-3 rounded-xl font-bold text-xs transition-all tracking-tighter uppercase whitespace-pretty px-2"
                                >
                                    Двухэтажный (72)
                                </button>
                            </div>
                        </div>

                        <!-- Total Seats & Duration -->
                         <div class="grid grid-cols-2 gap-4">
                            <div class="space-y-2">
                                <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Мест всего</label>
                                <input v-model="busForm.total_seats" type="number" class="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-slate-900 outline-none" />
                            </div>
                            <div class="space-y-2">
                                <label class="text-[9px] text-slate-400 font-bold uppercase ml-1">Длительность (ч.)</label>
                                <input v-model="busForm.duration_hours" type="number" step="0.5" class="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-slate-900 outline-none" />
                            </div>
                         </div>
                    </div>

                    <!-- Intermediate Stops (Premium Rows) -->
                    <div class="space-y-4 pt-4 border-t border-slate-700/50">
                        <div class="flex items-center justify-between">
                            <h4 class="text-xs font-black text-slate-400 uppercase tracking-widest">Промежуточные остановки</h4>
                            <button @click="addStop" class="text-xs font-bold text-amber-500 bg-amber-500/10 px-4 py-2 rounded-xl border border-amber-500/20 hover:bg-amber-500 hover:text-slate-900 transition-all">
                                + Добавить остановку
                            </button>
                        </div>
                        
                        <div v-if="busForm.intermediate_stops.length === 0" class="text-center py-8 rounded-[32px] border-2 border-dashed border-slate-700 text-slate-500 italic text-sm">
                            Рейс без остановок
                        </div>

                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div v-for="(stop, index) in busForm.intermediate_stops" :key="'admin-stop-'+index" class="bg-slate-700/20 p-5 rounded-3xl border border-slate-700 flex flex-col space-y-3 relative group overflow-hidden">
                                <div class="absolute inset-y-0 left-0 w-1 bg-amber-500"></div>
                                <button @click="removeStop(index)" class="absolute top-4 right-4 text-red-400 hover:scale-110 transition-transform">
                                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                                </button>
                                <div class="grid grid-cols-2 gap-3">
                                    <select v-model="stop.city" class="bg-slate-800 border border-slate-600 rounded-xl p-2 text-sm text-slate-100 outline-none">
                                        <option value="" disabled>Город</option>
                                        <option v-for="c in cities" :key="'stop-city-'+c.id" :value="c.name">{{ c.name }}</option>
                                    </select>
                                    <input v-model="stop.time" type="time" class="bg-slate-800 border border-slate-600 rounded-xl p-2 text-sm text-slate-100 outline-none" />
                                </div>
                                <input v-model="stop.address" placeholder="Адрес / Терминал" class="bg-slate-800 border border-slate-600 rounded-xl p-2 text-xs text-slate-400 outline-none w-full" />
                            </div>
                        </div>
                    </div>

                    <!-- Passenger Comments -->
                    <div class="space-y-2">
                        <label class="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Комментарии для пассажиров</label>
                        <textarea v-model="busForm.passenger_comments" rows="2" placeholder="Удобства, правила багажа и т.д."
                            class="w-full bg-slate-700/50 border border-slate-600 rounded-3xl p-6 text-slate-300 outline-none focus:border-amber-500 transition-all resize-none shadow-inner"></textarea>
                    </div>

                    <!-- Submit Button -->
                    <div class="flex justify-end pt-4">
                         <button 
                            @click="submitBusTicket" 
                            :disabled="loading"
                            class="px-12 py-4 rounded-2xl bg-amber-500 text-slate-900 font-bold text-lg shadow-xl shadow-amber-500/20 hover:shadow-amber-500/40 hover:-translate-y-1 active:scale-95 transition-all flex items-center gap-3 disabled:opacity-50"
                        >
                            <span v-if="loading" class="w-5 h-5 border-2 border-slate-900/30 border-t-slate-900 rounded-full animate-spin"></span>
                            {{ loading ? 'Создание...' : 'Опубликовать рейс' }}
                        </button>
                    </div>
                </div>

                <div class="bg-white rounded-2xl lg:rounded-[32px] border border-slate-100 overflow-x-auto shadow-sm">
                    <table class="w-full text-left min-w-[900px]">
                        <thead class="bg-slate-50 border-b border-slate-100">
                            <tr>
                                <th class="px-6 py-4 text-slate-500 font-semibold">Маршрут</th>
                                <th class="px-6 py-4 text-slate-500 font-semibold">Компания</th>
                                <th class="px-6 py-4 text-slate-500 font-semibold">Дата/Время</th>
                                <th class="px-6 py-4 text-slate-500 font-semibold">Свободно</th>
                                <th class="px-6 py-4 text-slate-500 font-semibold">Цена</th>
                                <th class="px-6 py-4 text-slate-500 font-semibold text-right">Действия</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-50">
                            <tr v-for="ticket in busTickets" :key="ticket.id" @click="openBusTicketBookings(ticket)" class="hover:bg-amber-50 cursor-pointer transition-colors text-slate-700">
                                <td class="px-6 py-4">
                                    <div class="flex flex-col">
                                        <span class="font-bold text-slate-800 flex items-center gap-1.5">
                                            {{ ticket.from_city }}
                                            <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 text-amber-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
                                            {{ ticket.to_city }}
                                        </span>
                                        <span class="text-xs text-slate-400">{{ ticket.from_address }}</span>
                                    </div>
                                </td>
                                <td class="px-6 py-4 text-sm">{{ ticket.transport_company }}</td>
                                <td class="px-6 py-4 font-mono text-sm text-slate-500">{{ ticket.departure_date }} {{ ticket.departure_time }}</td>
                                <td class="px-6 py-4">
                                     <span class="text-amber-600 font-bold">{{ ticket.total_seats }}</span>
                                </td>
                                <td class="px-6 py-4 font-bold text-emerald-600">{{ ticket.price }} с.</td>
                                <td class="px-6 py-4 text-right" @click.stop>
                                    <button @click.stop="deleteBusTicket(ticket.id)" class="text-red-500 hover:text-red-600 transition-colors text-sm font-bold">Удалить</button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>


            </section>

             <!-- Reviews Section -->
             <section v-if="activeTab === 'reviews'" class="space-y-6 lg:space-y-8">
                <h2 class="text-2xl lg:text-3xl text-slate-900 font-bold">Управление отзывами</h2>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
                    <div v-for="review in reviews" :key="review.id" class="bg-white p-5 lg:p-6 rounded-2xl lg:rounded-[32px] border border-slate-100 relative group shadow-sm">
                        <button @click="deleteReview(review.id)" class="absolute top-4 right-4 lg:top-6 lg:right-6 p-2 rounded-xl bg-red-50 text-red-500 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                            </svg>
                        </button>
                        <div class="flex items-center space-x-4 mb-4">
                            <div class="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center font-bold text-xl text-amber-500 border border-slate-200">
                                {{ review.reviewer_name?.[0] }}
                            </div>
                            <div>
                                <h4 class="font-bold text-slate-800">{{ review.reviewer_name }}</h4>
                                <p class="text-sm text-slate-500">Для водителя <span class="text-slate-700 font-medium">{{ review.driver_name }}</span></p>
                            </div>
                        </div>
                        <div class="flex items-center space-x-1 text-amber-500 mb-3">
                            <span v-for="i in 5" :key="i" :class="i <= review.rating ? 'opacity-100' : 'opacity-20'">★</span>
                        </div>
                        <p class="text-slate-600 italic">"{{ review.comment }}"</p>
                    </div>
                </div>
            </section>

            <!-- User Edit Modal -->
            <div v-if="showUserEditModal" class="fixed inset-0 z-[110] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
                <div class="max-w-md w-full bg-white p-8 rounded-[32px] border border-slate-100 shadow-2xl">
                    <h3 class="text-2xl font-bold mb-6 text-slate-900">Редактировать пользователя</h3>
                    <div class="space-y-4">
                        <input v-model="editingUser.name" placeholder="Имя" class="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 outline-none focus:border-amber-500 text-slate-900" />
                        <input v-model="editingUser.surname" placeholder="Фамилия" class="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 outline-none focus:border-amber-500 text-slate-900" />
                        <input v-model="editingUser.phone" placeholder="Телефон" class="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 outline-none focus:border-amber-500 text-slate-900" />
                    </div>
                    <div class="flex space-x-4 mt-8">
                        <button @click="showUserEditModal = false" class="flex-1 py-4 text-slate-400 font-bold">Отмена</button>
                        <button @click="updateUser" class="flex-1 bg-amber-500 text-white py-4 rounded-xl font-bold shadow-lg shadow-amber-500/20">Сохранить</button>
                    </div>
                </div>
            </div>

            <!-- Ride Edit Modal -->
            <div v-if="showRideEditModal" class="fixed inset-0 z-[110] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
                <div class="max-w-md w-full bg-white p-8 rounded-[32px] border border-slate-100 shadow-2xl">
                    <h3 class="text-2xl font-bold mb-6 text-slate-900">Редактировать поездку</h3>
                    <div class="space-y-4">
                        <div class="grid grid-cols-2 gap-4">
                            <input v-model="editingRide.from_city" placeholder="Откуда" class="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 outline-none focus:border-amber-500 text-slate-900" />
                            <input v-model="editingRide.to_city" placeholder="Куда" class="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 outline-none focus:border-amber-500 text-slate-900" />
                        </div>
                        <input v-model="editingRide.date" type="date" class="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 outline-none focus:border-amber-500 text-slate-900" />
                        <input v-model="editingRide.time" type="time" class="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 outline-none focus:border-amber-500 text-slate-900" />
                        <input v-model="editingRide.price" type="number" placeholder="Цена" class="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 outline-none focus:border-amber-500 text-slate-900" />
                    </div>
                    <div class="flex space-x-4 mt-8">
                        <button @click="showRideEditModal = false" class="flex-1 py-4 text-slate-400 font-bold">Отмена</button>
                        <button @click="updateRide" class="flex-1 bg-amber-500 text-white py-4 rounded-xl font-bold shadow-lg shadow-amber-500/20">Сохранить</button>
                    </div>
                </div>
            </div>

        </main>

        <!-- ── GLOBAL DRILL-DOWN OVERLAYS ── -->
        
        <!-- Driver Detail Overlay -->
        <div v-if="selectedBusDriver" class="fixed inset-0 z-[200] bg-slate-900/40 backdrop-blur-sm flex items-stretch justify-center" @click.self="closeBusDriverDetail">
            <div class="w-full bg-white h-full overflow-y-auto shadow-2xl flex flex-col">
                <div class="sticky top-0 bg-white border-b border-slate-100 px-8 py-5 flex items-center gap-4 z-10">
                    <button @click="closeBusDriverDetail" class="p-2 rounded-xl hover:bg-slate-100 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
                    </button>
                    <div>
                        <h3 class="text-xl font-black text-slate-900">{{ selectedBusDriver.name }} {{ selectedBusDriver.surname }}</h3>
                        <p class="text-sm text-slate-400 font-mono">{{ selectedBusDriver.phone }} · Сбор: {{ selectedBusDriver.service_fee_percent ?? 10 }}%</p>
                    </div>
                    <span v-if="selectedBusDriver.is_blocked" class="ml-auto bg-red-50 text-red-600 px-3 py-1 rounded-full text-xs font-bold border border-red-100">Заблокирован</span>
                </div>
                <div class="p-8 flex-1">
                    <div v-if="driverDetailLoading" class="flex items-center justify-center py-20">
                        <span class="w-8 h-8 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin"></span>
                    </div>
                    <div v-else-if="selectedBusDriverTickets.length === 0" class="text-center py-20 text-slate-400">
                        <p class="text-lg font-medium">У этого водителя нет рейсов</p>
                    </div>
                    <div v-else class="overflow-x-auto rounded-2xl border border-slate-100">
                        <table class="w-full text-left min-w-[800px]">
                            <thead class="bg-slate-50 border-b border-slate-100 text-xs uppercase text-slate-400 font-bold tracking-widest">
                                <tr>
                                    <th class="px-5 py-4">Маршрут</th>
                                    <th class="px-5 py-4">Компания</th>
                                    <th class="px-5 py-4">Дата / Время</th>
                                    <th class="px-5 py-4">Мест (своб./всего)</th>
                                    <th class="px-5 py-4">Цена</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-slate-50">
                                <tr v-for="ticket in selectedBusDriverTickets" :key="ticket.id"
                                    @click="openBusTicketBookings(ticket)"
                                    class="hover:bg-amber-50 cursor-pointer transition-colors text-slate-700">
                                    <td class="px-5 py-4">
                                        <div class="font-bold text-slate-800 flex items-center gap-1.5">
                                            {{ ticket.from_city }}
                                            <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 text-amber-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
                                            {{ ticket.to_city }}
                                        </div>
                                        <div class="text-xs text-slate-400">{{ ticket.from_address }}</div>
                                    </td>
                                    <td class="px-5 py-4 text-sm text-slate-600">{{ ticket.transport_company }}</td>
                                    <td class="px-5 py-4 font-mono text-sm text-slate-500">{{ ticket.departure_date }} {{ ticket.departure_time }}</td>
                                    <td class="px-5 py-4">
                                        <span class="font-bold" :class="ticket.free_seats === 0 ? 'text-red-500' : 'text-emerald-600'">{{ ticket.free_seats }}</span>
                                        <span class="text-slate-400"> / {{ ticket.total_seats }}</span>
                                    </td>
                                    <td class="px-5 py-4 font-bold text-emerald-600">{{ ticket.price }} с.</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>

        <!-- Booking Manifest Overlay -->
        <div v-if="selectedBusTicket" class="fixed inset-0 z-[210] bg-slate-900/40 backdrop-blur-sm flex items-stretch justify-center" @click.self="closeBusTicketBookings">
            <div class="w-full bg-white h-full overflow-y-auto shadow-2xl flex flex-col">
                <div class="sticky top-0 bg-white border-b border-slate-100 px-8 py-5 flex items-center gap-4 z-10">
                    <button @click="closeBusTicketBookings" class="p-2 rounded-xl hover:bg-slate-100 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
                    </button>
                    <div>
                        <h3 class="text-xl font-black text-slate-900">{{ selectedBusTicket.from_city }} → {{ selectedBusTicket.to_city }}</h3>
                        <p class="text-sm text-slate-400">{{ selectedBusTicket.transport_company }} · {{ selectedBusTicket.departure_date }} {{ selectedBusTicket.departure_time }}</p>
                    </div>
                    <span class="ml-auto text-sm font-bold text-slate-500">{{ selectedBusTicketBookings.length }} бронирований</span>
                </div>
                <div class="p-8 flex-1 overflow-x-auto">
                    <div v-if="ticketBookingsLoading" class="flex items-center justify-center py-20">
                        <span class="w-8 h-8 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin"></span>
                    </div>
                    <div v-else-if="selectedBusTicketBookings.length === 0" class="text-center py-20 text-slate-400">
                        <p class="text-lg font-medium">Нет бронирований для этого рейса</p>
                    </div>
                    <table v-else class="w-full text-left min-w-[1100px]">
                        <thead class="bg-slate-50 border-b border-slate-100 text-[10px] uppercase text-slate-400 font-black tracking-widest">
                            <tr>
                                <th class="px-4 py-4">#</th>
                                <th class="px-4 py-4">ФИО</th>
                                <th class="px-4 py-4">Место</th>
                                <th class="px-4 py-4">Пол</th>
                                <th class="px-4 py-4">Дата рождения</th>
                                <th class="px-4 py-4">Документ</th>
                                <th class="px-4 py-4">Гражданство</th>
                                <th class="px-4 py-4">Маршрут (П/В)</th>
                                <th class="px-4 py-4">Контакт</th>
                                <th class="px-4 py-4">Оплата</th>
                                <th class="px-4 py-4">Действия</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-50">
                            <tr v-for="(p, idx) in passengerManifestForBookings(selectedBusTicketBookings)" :key="idx" class="hover:bg-slate-50/50 transition-colors text-slate-700 text-sm">
                                <td class="px-4 py-3 text-slate-400 font-mono text-xs">{{ idx + 1 }}</td>
                                <td class="px-4 py-3 font-bold text-slate-800 whitespace-nowrap">{{ p.lastName }} {{ p.firstName }} {{ p.middleName }}</td>
                                <td class="px-4 py-3"><span class="px-2 py-1 bg-amber-50 text-amber-600 rounded-lg text-xs font-black border border-amber-100">{{ p.seat }}</span></td>
                                <td class="px-4 py-3 text-xs font-bold uppercase text-slate-500">{{ p.gender === 'male' ? 'Муж' : p.gender === 'female' ? 'Жен' : '—' }}</td>
                                <td class="px-4 py-3 text-xs font-mono text-slate-500">{{ p.birthDate || '—' }}</td>
                                <td class="px-4 py-3 text-xs text-slate-500">{{ p.docType }} {{ p.docNumber }}</td>
                                <td class="px-4 py-3 text-xs text-slate-500">{{ p.citizenship || '—' }}</td>
                                <td class="px-4 py-3">
                                    <div class="text-[10px] text-slate-500 font-bold uppercase">{{ p.pickup_city || '—' }}</div>
                                    <div class="text-[10px] text-amber-600 font-black uppercase">{{ p.drop_off_city || '—' }}</div>
                                </td>
                                <td class="px-4 py-3 text-xs font-mono text-slate-700">{{ p.contactPhone || '—' }}</td>
                                <td class="px-4 py-3">
                                    <span class="text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg border"
                                        :class="{
                                            'bg-blue-50 text-blue-600 border-blue-100': p.paymentStatus === 'Ручная',
                                            'bg-emerald-50 text-emerald-600 border-emerald-100': p.paymentStatus === 'Оплачено',
                                            'bg-amber-50 text-amber-600 border-amber-100': p.paymentStatus === 'Ожидает оплаты'
                                        }">{{ p.paymentStatus }}</span>
                                </td>
                                <td class="px-4 py-3">
                                    <button @click="deleteAdminBooking(p.originalBookingId)" class="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all" title="Удалить бронь">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
        </main>
    </div>
</template>

<style scoped>
.admin-panel {
    background-color: #f8fafc;
}
/* Hide scrollbar for Chrome, Safari and Opera */
main::-webkit-scrollbar {
    display: none;
}
/* Hide scrollbar for IE, Edge and Firefox */
main {
    -ms-overflow-style: none;
    scrollbar-width: none;
}
</style>
