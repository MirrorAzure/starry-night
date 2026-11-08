// Адрес сервера: замените пример и установите addressIsExample: false.
window.STARRY_CONFIG = {
  serverAddress: 'play.example.com',
  addressIsExample: false,
  // Расписание выключено, пока вы не зададите реальные даты.
  season: {
    enabled: true,
    name: 'Сезон 1',
    timeZone: 'Europe/Moscow',
    // Формат: '2026-12-01T19:00:00'. Дата и время в указанном timeZone.
    startsAt: '2026-12-10T20:00:00',
    // Необязательно: оставьте '' для сезона без даты окончания.
    endsAt: '',
    thanksTitle: 'Спасибо за этот сезон!',
    thanksMessage: 'Спасибо за постройки, приключения и тёплые вечера вместе. Увидимся в новом сезоне!'
  },
  // Вставьте HTTPS-ссылку на форму приглашения.
  applicationUrl: 'https://forms.gle/81XF7oVjEB7wYv667',
  // Списки каналов: { name: 'Название канала', url: 'https://...' }
  trustedChannels: [
    {
        name: 'MirrorAzure',
        url: 'https://www.twitch.tv/mirrorazure'
    },

    {
        name: 'Iceman',
        url: 'https://www.twitch.tv/iceman_icy'
    },
    {
        name: 'Pelmeni',
        url: 'https://www.twitch.tv/pelmeni283'
    },
],
  partnerChannels: [
    {
        name: 'MirrorAzure',
        url: 'https://www.twitch.tv/mirrorazure'
    },

    {
        name: 'Iceman',
        url: 'https://www.twitch.tv/iceman_icy'
    },
    {
        name: 'Pelmeni',
        url: 'https://www.twitch.tv/pelmeni283'
    },
],
  // Участники: { name: 'Никнейм', role: 'Администратор', description: 'О себе', daysPlayed: 42 }
  // Для стабильного скина после смены никнейма можно дополнительно указать uuid.
  // view: 'head' — голова (по умолчанию); 'full-body' — персонаж в полный рост.
  // Вид задаётся явно для любого участника, независимо от роли.
  // daysPlayed — вручную обновляемое число наигранных дней; можно не указывать.
  members: [
{
    name: 'MirrorAzure',
    role: 'Администратор',
    view: 'full-body',
    description: 'Технический администратор. На его плечах держится весь сервер. Постоянно чинит датапаки, моды, плагины, механизмы и свой режим сна.\ni use arch btw 🐧',
    isDemo: false
},
{
    name: 'IcemanIcy',
    role: 'Администратор',
    view: 'full-body',
    description: 'Управленец сообщества. Айсмен отвечает за философию и творческое направление Starry Night.\nЯ архитектор!🍹',
    isDemo: false
},
{
    name: 'Ksemsha',
    role: 'Игрок',
    view: 'head',
    description: '',
    isDemo: false
},
{
    name: 'Limon8546',
    role: 'Игрок',
    view: 'head',
    description: '',
    isDemo: false
},
{
    name: 'DraggyFrog',
    role: 'Игрок',
    view: 'head',
    description: '',
    isDemo: false
},
{
    name: 'BlackTheDragon',
    role: 'Игрок',
    view: 'head',
    description: '',
    isDemo: false
},
{
    name: 'Dilk0',
    role: 'Игрок',
    view: 'head',
    description: '',
    isDemo: false
},
{
    name: 'TLAkER268',
    role: 'Игрок',
    view: 'head',
    description: '',
    isDemo: false
},
{
    name: 'Ruslan_cursed',
    role: 'Игрок',
    view: 'head',
    description: '',
    isDemo: false
},
{
    name: 'ElzevirT',
    role: 'Игрок',
    view: 'head',
    description: '',
    isDemo: false
},
{
    name: 'kimtsuntsun',
    role: 'Игрок',
    view: 'head',
    description: '',
    isDemo: false
},
{
    name: 'ShamanSay',
    role: 'Игрок',
    view: 'head',
    description: '',
    isDemo: false
},
{
    name: 'LarInfernal',
    role: 'Игрок',
    view: 'head',
    description: '',
    isDemo: false
},
{
    name: 'CrimsonSCycles',
    role: 'Игрок',
    view: 'head',
    description: '',
    isDemo: false
},
{
    name: 'xbot_random',
    role: 'Игрок',
    view: 'head',
    description: '',
    isDemo: false
},
{
    name: 'Dusechka',
    role: 'Игрок',
    view: 'head',
    description: '',
    isDemo: false
},
{
    name: 'avD_qq',
    role: 'Игрок',
    view: 'head',
    description: '',
    isDemo: false
},
{
    name: 'Xoziain',
    role: 'Игрок',
    view: 'head',
    description: '',
    isDemo: false
},
{
    name: 'uzanpx',
    role: 'Игрок',
    view: 'head',
    description: '',
    isDemo: false
},
{
    name: 'Zavergan',
    role: 'Игрок',
    view: 'head',
    description: '',
    isDemo: false
},
],
  // Например: 'Обновлено в ноябре 2026'. Оставьте пустым до добавления статистики.
  membersUpdated: ''
};
