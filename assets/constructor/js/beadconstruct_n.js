var GlobMsDown = false;     // Состояние ЛКМ
var beads = []              // Массив бусин текущий (из объектов SVG)
var beadsBuff = []          // Массив буферный, для копирования
var paletteGrads = [];      // Палитра градиентных заливок для текущего массива бусин
var currentPalette = 0      // Индекс выбранной (текущей) заливки
var currentDiam = 3         // Текущий диаметр бусины
var swatches = []           // Массив образцов для палитры град. заливок (из объектов SVG)
var bdkey = 0               // Индекс выбранной бусины
var spreadLength = 200      // Длина нити
var color_ind = {}          // Для подсказки номера цвета
var circlePath = false         // Пустой объект опорной кривой
var bdStepDiam = 0.5        // Шаг увеличения/уменьшения диаметра бусины
var bdLimitsDiam = [1,20]       // Пределы для диаметра бусины

document.querySelector('body').addEventListener('mousedown', function () {GlobMsDown = true}) //нажата ЛКМ
document.querySelector('body').addEventListener('mouseup', function () {GlobMsDown = false}) //отпущена ЛКМ

var draw = SVG().addTo('#drawing').size('100%','100%').viewbox(0, 0, 160, 160)
paletteGrads = createStepGrads(10,draw); // Создать палитру для экземпляра draw

var palPicker = SVG().addTo('#picker').size('2880px','40px').viewbox(0,0,1440,20);
var palettePickerGrads = createStepGrads(10,palPicker); // Создать палитру для экземпляра palPicker

createSwatches(1,palPicker); // Нарисовать образцы цвета

// Нить для бусин
recreateBaseCurve (spreadLength)

color_ind = draw.text("").move(80, 80)
color_ind.transform({origin: [80,80], rotate: -90, flip: 'x'})

var subdraw = draw.nested()

// Функция создает круглую кривую (нить) заданной длины
function recreateBaseCurve (length) {
  var diam = length/3.14
  if (circlePath) circlePath.remove()
  circlePath = draw.circle(diam)
  circlePath.center(diam/2+10,diam/2+10)
  circlePath = circlePath.toPath()
  circlePath.fill('none').stroke({width:1, color: '#ccc'})
  draw.viewbox(0,0,diam+20,diam+20)
}

// Функция обновляет заголовок input-а для длины нити
function showSpLength () {
  var Rlabel = document.querySelector('#spLengh-label > strong')
  changeSpread(document.querySelector('#spLengh').value)
  Rlabel.innerHTML = document.querySelector('#spLengh').value + 'мм'
}

//Функции уменьшения и увеличения текущего размера бусины
function bdIncrDiam () {
  currentDiam = (currentDiam < bdLimitsDiam[1]) ? currentDiam + bdStepDiam : currentDiam
  text_sizecurrent.text(String(currentDiam))
}

function bdDecrDiam () {
  currentDiam = (currentDiam > bdLimitsDiam[0]) ? currentDiam - bdStepDiam : currentDiam
  text_sizecurrent.text(String(currentDiam))
}

// Функция создает hsl палитру цветов для объекта svg.js
function createStepGrads (step=5,svg_obj) {
  var hlss1 = '', hlss2 = '', hlss3 = ''
  var palette = []
  j = 0 
  function hsl (sat, light1, light2, light3, hue) {
      hlss1 = 'hsl(' + hue + ',' + sat + ',' + light1 + ')'
      hlss2 = 'hsl(' + hue + ',' + sat + ',' + light2 + ')'
      hlss3 = 'hsl(' + hue + ',' + sat + ',' + light3 + ')'
      palette[j] = svg_obj.gradient('radial', function(add) {   // Заливка бусин
        add.stop(0, hlss1)
        add.stop(1, hlss2)
        add.stop(2, hlss3)
    })
  }
  function hls36 (sat, light1, light2, light3) {               // saturation and lightness in %
    for (var i = 0; i < 360; i+=step) {
      hsl (sat, light1, light2, light3, i)
      j++
    }
  }
  for (var i = 0; i <= 100; i+=5) {
    hsl ('0%', '100%', Math.round(i*0.8) + '%', Math.round(i/5) + '%', 0)
    j++
  }
  hls36('90%','90%','40%','20%')
  hls36('60%','90%','40%','20%')
  hls36('30%','90%','40%','20%')
  return palette;
}

// Функция создает образцы цветов (круглые) для объекта svg.js
function createSwatches (step=1,svg_obj) {
  var dx = 9, dy = 9
  for (var i = 0; i <= 128; i+=step) {
    	swatches[i] = svg_obj.circle(10)
      swatches[i].center(dx, dy)
      swatches[i].fill(palettePickerGrads[i]);
      swatches[i].data('index', i);   //ключ в массиве
      swatches[i].click(function() {                   // Выделить образец обводкой и применить цвет к выделенным бусинам
        dored(this)
        dored(swatches[currentPalette])
        currentPalette = this.data('index')
        text_colorcurrent.text(String(currentPalette)) // Поменять номер на индикаторе текущего цвета
        changeColor()
      })
      swatches[i].mouseover(function() {
        if (!color_ind.visible()) color_ind.show()
        text_colorpressed.text(this.data('index'))   // Поменять номер на индикаторе цвета под указателем
      })
      swatches[i].mouseout(function() {
        text_colorpressed.text('----')
      })
      dx += 10;
  }
  dored(swatches[currentPalette])
}

// Функция перемещает весь текущий набор (при изменении опорной кривой)
function redrawBeads (baseCurve, CLength) {
  beads = beads.map(function (bead) {
    if (bead.data('pAt') <= CLength - bead.attr('r')) {
      var p = baseCurve.pointAt(bead.data('pAt'))
      bead.center(p.x, p.y)
      if (!bead.visible()) { bead.show() }
    } else { bead.hide() }  // Если не помещаются - скрыть
    return bead
  })
}

// Функция создает опорную кривую и переносит бусины на нее
function changeSpread (length) {
  recreateBaseCurve (length)
  spreadLength = circlePath.length()
  circlePath.back()
  redrawBeads (circlePath, spreadLength)
}

// Добавить бусину
function addbead (diam = 20) {
  if (checkLength(spreadLength - diam)) {
    beads.push(subdraw.circle(diam))
    var atPath = (bdkey == 0) ? diam/2 : beads[bdkey-1].data('pAt') + beads[bdkey-1].attr('r') + beads[bdkey].attr('r')
    var p = circlePath.pointAt(atPath)
    beads[bdkey].fill(paletteGrads[currentPalette])
    beads[bdkey].center(p.x, p.y)
    beads[bdkey].data('colorindex', currentPalette);  //Номер цвета в палитре
    beads[bdkey].data('index', bdkey);   //ключ в массиве
    beads[bdkey].data('pAt', atPath);  //точка на кривой
    beads[bdkey].click(function() {
      dored(this)
    })
    beads[bdkey].mouseover(function() {
      text_colorpressed.text(this.data('colorindex'))
      text_sizepressed.text(this.attr('r')*2)
      if (GlobMsDown) dored(this);
    })
    beads[bdkey].mouseout(function() {
      text_colorpressed.text('----')
      text_sizepressed.text('--')
    })
    bdkey++
  } 
}

// Вставить бусину после выделенных
function insertOneBead (diam = 20) {
  selectns = checkSelected()
  if (selectns.exist) {
    insertOne(selectns.lustIndex, diam, currentPalette)
  }
}

// Скопировать выделенные в буфер обмена (не настоящий, просто переменная)
function copySelected () {
  selectns = checkSelected()
  if (selectns.cont) {
    beadsBuff = []
    beads.forEach(function(bead) {
      if (bead.attr('stroke') == 'red') beadsBuff.push(bead);
    })
    deselectAll()
  } else alert("Копировать можно бусины, выделенные подряд!")
}

// Вставить скопированное
function pasteBeads (mirror) {
  selectns = checkSelected()
  if (selectns.exist) {
    insertSelectedBeads (mirror, selectns.lustIndex)
  } else {
    insertSelectedBeads (mirror, beads.length-1) 
  }
}

// Вставить скопированное в буфер после index
function insertSelectedBeads (mirror = false, index) {
  i = index
  if (beadsBuff) {
    if (!mirror) {
      beadsBuff.forEach(function(bead) {
        console.log(i)
        if (insertOne(i, bead.attr('r')*2, bead.data('colorindex'))) i++
      })
    } else {
      beadsBuff.slice().reverse().forEach(function(bead) {
        if (insertOne(i, bead.attr('r')*2, bead.data('colorindex'))) i++
      })
    }
  }
}

// Удалить все бусины
function clearAll () {
  bdkey = 0
  subdraw.clear()
  beads = []
}

// Выделить обводкой (toggle)
function dored (geom) {
  if (geom.attr('stroke') == 'red') {
    geom.stroke('') 
  } else {
    geom.stroke('red')
  }
}

// Полностью выделить диапазон (между двумя крайними выделенными)
function slectRange () {
  var selection = checkSelected()
  if (selection.exist) {
    for (var i=selection.firstIndex; i <= selection.lustIndex; i++) {
      if (beads[i].attr('stroke') != 'red') {
        dored(beads[i])
      }
    }
  }
}

// Снять выделение со всех
function deselectAll () {
  if (checkSelected().exist) {
    beads = beads.map(function (bead) {
      if (bead.attr('stroke') == 'red') {
        bead.stroke('')
      }
      return bead
    })
  }
}

// Удалить одну бусину
function clearOne(geom) {
  remIndex = geom.data('index')
  remDiam = geom.attr('r')*2
  geom.remove()
  beads = beads.map(function (bead) {
    if (bead.data('index') > remIndex) {
      var pAt = bead.data('pAt') - remDiam
      bead.data('pAt', pAt) 
      bead.data('index', bead.data('index')-1)
      var p = circlePath.pointAt(pAt) 
      bead.center(p.x, p.y)
      if (!bead.visible() && bead.data('pAt') <= spreadLength - bead.attr('r')) { bead.show() }
    }
    return bead
  })
  beads.splice(remIndex,1)
  bdkey--
  // console.log(beads.length)   // убрать
  // console.log(JSON.stringify(beads));  возвращает ошибку, надо конвертировать для сохранения с помощью array.map
}

// Удалить бусины, выделенные обводкой
function clearSelected() {
  beads.forEach(function(bead) {
    if (bead.attr('stroke') == 'red') clearOne(bead);
  })
}

// Изменить цвет выделенных
function changeColor() {
  if (checkSelected().exist) {
    beads = beads.map(function (bead) {
      if (bead.attr('stroke') == 'red') {
        bead.fill(paletteGrads[currentPalette])
        bead.data('colorindex', currentPalette)
      }
      return bead
    })
  }
}

// Вставить бусину после index
function insertOne(index, diam, color) {
  // console.log(spreadLength - diam) //убрать
  if (checkLength(spreadLength - diam)) {
    beads = beads.map(function (bead) {                     // Сначала сдвигаем массив!!!!
      if (bead.data('index') > index) {
        var pAt = bead.data('pAt') + Number(diam)
        bead.data('pAt', pAt) 
        bead.data('index', bead.data('index')+1)
        var p = circlePath.pointAt(pAt) 
        bead.center(p.x, p.y)
        if (bead.visible() && bead.data('pAt') > spreadLength - bead.attr('r')) { bead.hide() }  // спрятать те, что не влезают !!
      }
      return bead
    })
    var realIndex = (beads.length > 0) ? index+1 : 0   //на случай когда бусин перед вставкой нет!
    // console.log(index)
    // console.log(realIndex)
    // console.log(beads[index])
    var atPath = (beads.length > 0) ? beads[index].data('pAt') + beads[index].attr('r') + diam/2 : diam/2
    var p = circlePath.pointAt(atPath)
    beads.splice(realIndex, 0, subdraw.circle(diam));
    beads[realIndex].fill(paletteGrads[color])
    beads[realIndex].center(p.x, p.y)
    beads[realIndex].data('colorindex', color)
    beads[realIndex].data('index', realIndex);   //ключ в массиве
    beads[realIndex].data('pAt', atPath);      //точка на кривой
    beads[realIndex].click(function() {
      dored(this)
    })
    beads[realIndex].mouseover(function() {
      text_colorpressed.text(this.data('colorindex'))
      text_sizepressed.text(this.attr('r')*2)
      if (GlobMsDown) dored(this);
    })
    beads[realIndex].mouseout(function() {
      text_colorpressed.text('----')
      text_sizepressed.text('--')
    })
    bdkey++
    return true
  }
  return false
}

// Проверка наличия выделенных бусин (возвращает объект {"exist": boolean, "cont": boolean, "number": number, "firstIndex": number,"lustIndex": number})
function checkSelected() {
  let info = {}
  info.exist = false
  info.cont = true
  info.number = 0
  i = 0
  olrMeetRed = false
  info.lustIndex = null
  info.firstIndex = null
  beads.forEach(function (bead) {
    i++
    if (bead.attr('stroke') == 'red') {
      if (!info.exist) info.firstIndex = i - 1
      info.exist = true
      info.lustIndex = i-1
      info.number++ 
      info.cont = !olrMeetRed
    } else {
      olrMeetRed = info.exist
    }
  })
  if (!info.exist) info.cont = false
  return info
}

// Изменение текущего диаметра, и отражение его на индикаторе
function changeCurDiam (diam) {
  currentDiam = diam
  text_sizecurrent.text(String(currentDiam))
}

// Проверка общей длины
function checkLength (Lng) {
  return beads.reduce((sum, bead) => sum + bead.attr('r')*2, 0) < Lng
}