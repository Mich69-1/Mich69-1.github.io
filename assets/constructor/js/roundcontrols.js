var roundCtrl = SVG('#svg5')

// Инициализация граф. интерфейса
var batton_pastemirror = roundCtrl.findOne('#int-pastemirror')
var batton_deselectall = roundCtrl.findOne('#int-deselectall')
var batton_addbead = roundCtrl.findOne('#int-addbead')
var batton_addaftersel = roundCtrl.findOne('#int-addaftersel')
var batton_copy = roundCtrl.findOne('#int-copy')
var batton_paste = roundCtrl.findOne('#int-paste')
var batton_selectrange = roundCtrl.findOne('#int-selectrange')
var batton_sizeplus = roundCtrl.findOne('#int-sizeplus')
var batton_sizeminus = roundCtrl.findOne('#int-sizeminus')
var batton_delete = roundCtrl.findOne('#int-delete')

var text_sizecurrent = roundCtrl.findOne('#int-sizecurrent')
var text_colorcurrent = roundCtrl.findOne('#int-colorcurrent')
var text_sizepressed = roundCtrl.findOne('#int-sizepressed')
var text_colorpressed = roundCtrl.findOne('#int-colorpressed')

// Инициализация кнопок подсказок
var tipbatton_pastemirror = roundCtrl.findOne('#tip-int-pastemirror')
var tipbatton_deselectall = roundCtrl.findOne('#tip-int-deselectall')
var tipbatton_addbead = roundCtrl.findOne('#tip-int-addbead')
var tipbatton_addaftersel = roundCtrl.findOne('#tip-int-addaftersel')
var tipbatton_copy = roundCtrl.findOne('#tip-int-copy')
var tipbatton_paste = roundCtrl.findOne('#tip-int-paste')
var tipbatton_selectrange = roundCtrl.findOne('#tip-int-selectrange')
var tipbatton_sizeplus = roundCtrl.findOne('#tip-int-sizeplus')
var tipbatton_sizeminus = roundCtrl.findOne('#tip-int-sizeminus')
var tipbatton_delete = roundCtrl.findOne('#tip-int-delete')

var tipwindow_text = document.querySelector('#tipwindow-text')
var tipbattons_check = document.querySelector('#formCheck-1')

// Инициализация текстовых индикаторов в центре
text_sizepressed.text('--')
text_colorpressed.text('----')

text_sizecurrent.text(String(currentDiam))
text_colorcurrent.text(String(currentPalette))

// Декорирование кнопок
batton_pastemirror.attr({fill: '#b3cccc', 'fill-opacity': 0.6, stroke: '#000', 'stroke-width': 1})
batton_deselectall.attr({fill: '#b3cccc', 'fill-opacity': 0.6, stroke: '#000', 'stroke-width': 1})
batton_addbead.attr({fill: '#b3cccc', 'fill-opacity': 0.6, stroke: '#000', 'stroke-width': 1})
batton_addaftersel.attr({fill: '#b3cccc', 'fill-opacity': 0.6, stroke: '#000', 'stroke-width': 1})
batton_copy.attr({fill: '#b3cccc', 'fill-opacity': 0.6, stroke: '#000', 'stroke-width': 1})
batton_paste.attr({fill: '#b3cccc', 'fill-opacity': 0.6, stroke: '#000', 'stroke-width': 1})
batton_selectrange.attr({fill: '#b3cccc', 'fill-opacity': 0.6, stroke: '#000', 'stroke-width': 1})
batton_sizeplus.attr({fill: '#b3cccc', 'fill-opacity': 0.6, stroke: '#000', 'stroke-width': 1})
batton_sizeminus.attr({fill: '#b3cccc', 'fill-opacity': 0.6, stroke: '#000', 'stroke-width': 1})
batton_delete.attr({fill: '#ff8000', 'fill-opacity': 0.6, stroke: '#000', 'stroke-width': 1})

//Назначение обработчиков
buttons_handler(batton_addbead, () => {addbead(currentDiam)})
buttons_handler(batton_pastemirror, () => {pasteBeads(true)})
buttons_handler(batton_deselectall, () => {deselectAll()})
buttons_handler(batton_addaftersel, () => {insertOneBead(currentDiam)})
buttons_handler(batton_copy, () => {copySelected()})
buttons_handler(batton_paste, () => {pasteBeads()})
buttons_handler(batton_selectrange, () => {slectRange()})
buttons_handler(batton_sizeplus, () => {bdIncrDiam()})
buttons_handler(batton_sizeminus, () => {bdDecrDiam()})
buttons_handler(batton_delete, () => {clearSelected()})

tipbuttons_handler(tipbatton_pastemirror, 'Вставляет скопированные бусины зеркально (в обратном порядке)')
tipbuttons_handler(tipbatton_deselectall, 'Снимает выделение со всех бусин')
tipbuttons_handler(tipbatton_addbead, 'Добавляет бусину текущего размера и цвета в конец набора')
tipbuttons_handler(tipbatton_addaftersel, 'Добавляет бусину текущего размера и цвета после выделенных')
tipbuttons_handler(tipbatton_copy, 'Копирует выделенные бусины (должны быть выделены подряд)')
tipbuttons_handler(tipbatton_paste, 'Вставляет скопированные бусины')
tipbuttons_handler(tipbatton_selectrange, 'Выделяет все бусины между крайними выделенными')
tipbuttons_handler(tipbatton_sizeplus, 'Увеличивает размер бусины')
tipbuttons_handler(tipbatton_sizeminus, 'Уменьшает размер бусины')
tipbuttons_handler(tipbatton_delete, 'Удаляет выделенные бусины')

// Обработчик управления
function buttons_handler(geom, handler) {
  geom.click(handler);
  geom.mouseover(function () { this.attr({ 'fill-opacity': 0.4 }) });
  geom.mouseout(function () { this.attr({ 'fill-opacity': 0.6 }) });
  geom.mousedown(function () { this.attr({ 'fill-opacity': 0.4, stroke: 'red' }) });
  geom.mouseup(function () { this.attr({ 'fill-opacity': 0.6 , stroke: '#000' }) });
  geom.touchstart(function () { this.attr({ 'fill-opacity': 0.4, stroke: 'red' }) });
  geom.touchend(function () { this.attr({ 'fill-opacity': 0.6 , stroke: '#000' }) });
}

// Обработчик подсказок
function tipbuttons_handler(geom, tipstring) {
  geom.click(() => {
    document.querySelectorAll('.controls-tip').forEach((item) => {
      item.classList.remove('controls-tip-selected')
    })
    geom.addClass('controls-tip-selected')
    tipwindow_text.innerHTML = tipstring
  })
}

// Скрыть/показать подсказки
tipbattons_check.addEventListener('click', () => {
  document.querySelectorAll('.controls-tip').forEach((item) => {
    if (tipbattons_check.checked) {
      item.classList.add('hidden_')
      item.classList.remove('controls-tip-selected')
      tipwindow_text.innerHTML = 'Снимите галочку, если нужны подсказки'
    } else {
      item.classList.remove('hidden_')
    }
  })
})







