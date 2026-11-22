const $ = selector => document.querySelector(selector);
const expert = new URLSearchParams(location.search).get('type') === 'expert';
if (expert) {
  document.title = 'Личный сайт эксперта · Евгения Даныева';
  $('#direction-title').innerHTML = 'Ваш опыт должен<br><em>быть виден.</em>';
  $('#direction-lead').textContent = 'Личный сайт помогает человеку понять вашу специализацию, увидеть подход и решить, подходит ли ему работа с вами.';
  $('#direction-visual').style.background = '#ebe5ef';
  $('#direction-mascot').src = 'assets/crow.svg';
  $('#direction-mascot').alt = 'Нарисованная фиолетовая ворона';
  $('#direction-label').textContent = 'Личный сайт';
  $('#direction-phrase').innerHTML = 'Ваш подход.<br><em>Ваши доказательства.</em>';
  $('#direction-structure').textContent = 'Начните с конкретной ситуации клиента. Покажите, как работаете с ней, добавьте примеры и объясните, как проходит первая встреча. Отдельные страницы пригодятся для разных продуктов.';
  $('#direction-materials').textContent = 'Понадобятся ваш портрет, описание специализации и форматов работы. Кейсы и отзывы используем только с разрешения и с проверяемыми фактами.';
}
const recommendations = {
  request: ['Начните с понятного лендинга','Одна страница поможет объяснить предложение, показать доказательства и привести человека к обращению.','Лендинг'],
  choose: ['Разделите услуги на понятные страницы','Для каждой услуги покажите задачу, состав работы и подходящие примеры. Общая навигация поможет сравнить предложения.','Сайт бизнеса'],
  try: ['Дайте человеку небольшой результат','Тест, подборщик или авторская карточка помогут попробовать ваш подход. Конкретную механику выберем после знакомства с продуктом.','Интерактивный проект']
};
$('#goal').addEventListener('change', event => {
  const [title, copy, format] = recommendations[event.target.value];
  $('#recommendation-title').textContent = title;
  $('#recommendation-copy').textContent = copy;
  $('#direction-cta').href = `index.html?format=${encodeURIComponent(format)}#contact`;
});
