<template>
  <div class="min-h-screen bg-slate-50 relative pb-10">
    <!-- Header -->
    <div class="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-b border-gray-100 z-50 px-5 py-4 flex items-center shadow-sm">
      <button @click="$router.back()" class="w-10 h-10 bg-slate-100 text-slate-600 rounded-full flex items-center justify-center mr-4 active:scale-95 transition-transform shrink-0">
        <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <h1 class="text-xl font-bold text-slate-800 line-clamp-1">Оферта Poputki.online</h1>
    </div>

    <!-- Content -->
    <div class="pt-24 px-5">
      <div class="bg-white rounded-3xl p-6 md:p-10 shadow-sm border border-slate-100 text-slate-700 space-y-6 leading-relaxed">
        
        <div class="text-center space-y-2 mb-8">
            <h2 class="text-2xl font-black text-slate-900 uppercase">ПУБЛИЧНАЯ ОФЕРТА (ДОГОВОР)</h2>
            <p class="text-slate-500 font-medium">на оказание информационных услуг IT-платформы «Poputki.online»</p>
            <div class="flex items-center justify-between text-sm text-slate-400 pt-4 px-2 font-medium">
                <span>г. Худжанд</span>
                <span>2026 г.</span>
            </div>
        </div>

        <section class="space-y-3">
          <h3 class="text-lg font-bold text-slate-800">1. ОБЩИЕ ПОЛОЖЕНИЯ</h3>
          <p>
            1.1. Настоящий документ является официальным предложением (Публичной офертой) ООО «Авҷи Рӯмон», именуемого в дальнейшем «Агрегатор», для любого физического лица (ИП) или юридического лица в РТ (далее — «Перевозчик»).
          </p>
          <p>
            1.2. Акцептом (принятием) оферты является регистрация Перевозчика в Telegram_Bot или на сайте Poputki.online.
          </p>
        </section>

        <section class="space-y-3">
          <h3 class="text-lg font-bold text-slate-800">2. ТЕРМИНЫ И ОПРЕДЕЛЕНИЯ</h3>
          <ul class="list-disc pl-5 space-y-2">
            <li><strong class="text-slate-800">Агрегатор</strong> — Сервис «Poputki.online», предоставляющий доступ к IT-платформе для поиска и взаимодействия между Перевозчиками и Пассажирами.</li>
            <li><strong class="text-slate-800">Перевозчик</strong> — Юридическое лицо, ИП или физическое лицо, осуществляющий деятельность по перевозке пассажиров и багажа, прошедший регистрацию на Платформе.</li>
            <li><strong class="text-slate-800">Платформа</strong> — Совокупность программного обеспечения, сайта и мобильных приложений Poputki.online.</li>
            <li><strong class="text-slate-800">Заказ</strong> — Сформированный запрос Пассажира на поиск услуги перевозки по заданному маршруту.</li>
            <li><strong class="text-slate-800">Пассажир</strong> — физическое лицо, использующее Платформу для поиска перевозчика.</li>
            <li><strong class="text-slate-800">Стоимость заказа</strong> — сумма, согласованная Перевозчиком и Пассажиром через Платформу.</li>
          </ul>
        </section>

        <section class="space-y-3">
          <h3 class="text-lg font-bold text-slate-800">3. ПРЕДМЕТ ДОГОВОРА</h3>
          <p>
            2.1. Агрегатор обязуется оказывать Перевозчику услуги по предоставлению доступа к функционалу Платформы для получения информации о заказах, а Перевозчик обязуется оплачивать вознаграждение Агрегатора.
          </p>
          <p>
            2.2. Агрегатор не является агентом по организации перевозок, но вправе выступать агентом по приему платежей в порядке, предусмотренном разделом 4.
          </p>
          <p>
            2.3. Все сделки по перевозке заключаются напрямую между Перевозчиком и Пассажиром.
          </p>
        </section>

        <section class="space-y-3">
          <h3 class="text-lg font-bold text-slate-800">4. ПРАВА И ОБЯЗАННОСТИ СТОРОН</h3>
          <p class="font-bold">3.1. Перевозчик обязан:</p>
          <ul class="list-disc pl-5 space-y-2">
            <li>Обеспечивать соответствие транспортного средства и водителя требованиям законодательства (наличие лицензий, страховок, тех. осмотра).</li>
            <li>Предоставлять достоверную информацию о тарифах и маршрутах.</li>
            <li>Своевременно обновлять статус выполнения заказа в приложении.</li>
          </ul>
          <p class="font-bold mt-4">3.2. Агрегатор обязан:</p>
          <ul class="list-disc pl-5 space-y-2">
            <li>Обеспечивать круглосуточный доступ к Платформе (за исключением периодов тех. работ).</li>
            <li>Обеспечивать конфиденциальность данных Перевозчика.</li>
          </ul>
        </section>

        <section class="space-y-3">
          <h3 class="text-lg font-bold text-slate-800">5. ПОРЯДОК РАСЧЕТОВ</h3>
          <p>
            4.1. За использование IT-платформы Перевозчик уплачивает Агрегатору вознаграждение в размере <strong class="text-slate-800">10% (десять процентов)</strong> от стоимости каждого оформленного через Платформу заказа.
          </p>
          <p>
            4.2. По желанию Пассажира Агрегатор вправе выступать агентом по приему безналичных платежей. В этом случае Пассажир оплачивает полную стоимость заказа Агрегатору, а Агрегатор перечисляет Перевозчику сумму за вычетом комиссии (п. 4.1).
          </p>
          <p>
            4.3. Расчеты производятся через платежную систему Smartpay в национальной валюте (Сомони).
          </p>
        </section>

        <section class="space-y-3">
          <h3 class="text-lg font-bold text-slate-800">6. ОТВЕТСТВЕННОСТЬ СТОРОН</h3>
          <p>
            5.1. Перевозчик несет полную ответственность за жизнь, здоровье пассажиров и сохранность багажа в процессе оказания услуг.
          </p>
          <p>
            5.2. Агрегатор не несет ответственности за:
          </p>
          <ul class="list-disc pl-5 space-y-2">
            <li>Убытки, возникшие вследствие неправомерных действий третьих лиц или сбоев в работе сети Интернет.</li>
            <li>Достоверность данных, передаваемых Пассажирами.</li>
          </ul>
          <p>
            5.3. В случае нарушения правил Платформы (отмена заказов, низкий рейтинг, жалобы), Агрегатор имеет право заблокировать доступ Перевозчика к сервису в одностороннем порядке.
          </p>
          <p>
            5.4. Агрегатор вправе изменять условия оферты в одностороннем порядке, уведомив Перевозчика за 5–10 дней через сайт/Telegram.
          </p>
          <p>
            5.5. Если Перевозчик продолжает пользоваться Платформой после изменений — он согласен с новой редакцией.
          </p>
        </section>

      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TermsView',
  mounted() {
    window.scrollTo(0, 0);
  }
}
</script>
