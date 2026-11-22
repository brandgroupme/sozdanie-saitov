# Медиа, происхождение и следующий этап

## Созданные материалы

Зебра, ворона, хамелеон, бумажная фактура и favicon созданы непосредственно SVG/CSS-кодом в этой сессии для данного проекта. Внешних растровых изображений, шрифтов, платных stock-материалов и клиентских логотипов нет. Авторские методы и названия предоставлены Евгенией. Использование этих обозначений в данном проекте основано на её запросе; это не проверка регистрации товарных знаков.

Все используемые медиа перечислены в `dist/asset-manifest.json`, включая source/provenance, назначение, размеры, alpha и доступные версии. Параметры кадров и длительности для SVG имеют null: SVG не является видео. Векторный alpha поддерживается; обычного MP4 с обещанной прозрачностью нет. Органическая жидкость и объёмный поворот в выбранном направлении не требуются и не реализованы.

## Проверенная оценка до выбора SVG

22 ноября 2026 получены read-only оценки Higgsfield:

- GPT Image 2.6: один кадр 16:9, 0.75 кредита.
- Wan 3.0: пять секунд, 720p, без аудио, 7.5 кредита. Референсы ещё не подготовлены; успешный quote не проверяет валидность будущих reference media.
- ElevenLabs v4 Turbo: короткая проба 0.3 кредита; полный подготовленный текст 1.8 кредита.
- База: 4 × 0.75 + 3 × 7.5 + 0.3 + 1.8 = 27.6 кредита.
- Резерв одного повтора кадра, клипа и финального голоса: 0.75 + 7.5 + 1.8 = 10.05. Итого 37.65, предлагался потолок 38.
- Рублёвая стоимость не получена. Баланс, цены, модели и условия нужно перепроверить перед будущим запуском.

Пользователь выбрала сайт и SVG. Генерации не запускались, reference IDs не придумывались, голос не выбран по прослушиванию. В каталоге обнаружены доступные модели TTS, включая русский Qwen Audio 3.0 TTS Flash и ElevenLabs. Список preset-голосов был получен; это доступность инструмента, а не свидетельство качества русского произношения.

## Промпты для будущих опорных кадров

Общий стиль: hand-drawn ink illustration on off-white uncoated paper, confident imperfect graphite contour, muted sage and restrained lavender, stable anatomy, no text, no logos, no gradients or neon. All characters in the same gentle daylight, fixed horizon and camera height.

Кадр A: full-body side view zebra facing right, four anatomically consistent legs, elegant upright ears, long neck, black irregular stripes, a violet crow above right and a small sage chameleon below left, ample empty left half for separately rendered HTML text.

Кадр B: same zebra, identical silhouette, scale, lighting and ground contact as A; only the body pattern changes to an irregular black and white grid with one sage square. No change in face, eyes, proportions or camera.

Кадр C: same violet crow, isolated 3/4 side silhouette facing right, wings at highest upstroke; ample edge clearance, consistent line weight and paper background. It is not a transparency request for an MP4.

Кадр D: same sage chameleon facing right, curled tail, rear left leg lifted, stable eye and body markings, no text or props. Uniform paper background for later separate composition.

## Промпты будущих клипов

1. Zebra transform, 5 s: begin exactly in approved pose A, weight on front left and rear right feet; make one slow deliberate step right while black stripes continuously reorganize into the approved grid B. End with all feet grounded, head facing right. Continuous action, stable anatomy and silhouette; slow 10-degree real camera orbit only if generated intermediate frames preserve volume and visible surfaces. No text, no logo, no cuts, no zoom jumps. Reject anatomical/pattern flicker. If orbit fails, keep a fixed camera and disclose that choice.
2. Crow loop, 5 s: use approved C, same character identity, two gentle wing beats with a stable body position, end with wings in the same upstroke as start. Fixed camera, no text, no cuts. Separate route from wing animation during composition. Check loop join manually.
3. Chameleon, 5 s: use approved D, take one slow step right, keep tail spiral and eye identity, finish with body grounded. Fixed camera and light, no cuts or text. Web route remains independent from the clip's local movement.

Сначала утверждаются опорные кадры, только затем клипы. После генерации нужно сохранить provider originals и poster, измерить ffprobe длительность/fps/размеры, проверить контур на светлом/тёмном фоне и выбрать реальный способ рендеринга. SVG clipPath не заменяет обработку alpha у видео.

## Черновик русской озвучки

У вашего бизнеса уже есть свой характер. В том, как вы работаете, что замечаете и почему к вам возвращаются. Сайт помогает увидеть это с первого экрана. Здесь зебра меняет полосы на клетку, фиолетовая ворона предлагает посмотреть на задачу иначе, а хамелеон напоминает об адаптации. Мы начинаем с вашего продукта и пути клиента. Затем собираем структуру, тексты и визуальную историю, которая ведёт человека к понятному действию. Посмотрите примеры, выберите близкое направление и расскажите, какой сайт нужен вашему бизнесу. С этого начнётся наш проект.

Это ещё не аудиофайл. Фактическая длительность не измерялась; целевой диапазон 30–45 секунд может потребовать сокращения после пробы.

## Ручная генерация и импорт при будущем подключении

В ElevenLabs или другом согласованном TTS выбрать русский поддерживаемый голос и прослушать короткую пробу: «У вашего бизнеса свой характер. Давайте сделаем сайт, в котором его видно с первого экрана». Направление: спокойно, тепло, разговорно, без рекламного нажима. После согласования сгенерировать полный текст, сохранить original WAV и web MP3. Измерить реальную длительность: `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 voice.mp3`.

Добавить файл в `dist/assets/voice/`, записать реальную длительность и provenance в manifest, реализовать отдельную Audio-дорожку с кнопкой запуска, mute, обработкой отказа play() и согласовать маршрут экскурсии с измеренным таймингом. Текущий config.narration выключен; простое изменение флага не включает несуществующий плеер. Ключи сервисов никогда не размещать в dist или публичном JS.
