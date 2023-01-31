// Подготовка данных для сборочной спецификации и сохранения

var storeBeads = []                                     // Массив для хранения и выгрузки
var specBeads = [{diam : 0, colorindex : 0, sum: 0}]    // Массив для спецификации

// Функция возвращает массив с необходимой информацией для сборки или отрисовки
function prepareBeads() {
  var resultBeads = []
  beads.forEach(function(bead) {
    resultBeads.push({diam : bead.attr('r')*2, colorindex: bead.data('colorindex'), index: bead.data('index')})
  })
  return resultBeads
}

// Функция сортирует массив для сборки
function sortBeads (beadsArray) {
  var sorto = {
    colorindex:"asc", diam:"asc"
  };
  mksort.sort(beadsArray, sorto);
}

// Функция заполняет массив для спецификации и добавляет в массив для хранения поле с "номером коробки"
function specifyBeads () {
  storeBeads = prepareBeads()
  specBeads = [{diam : 0, colorindex : 0, sum: 0}]
  var sortedBd = prepareBeads()
  var boxIndex = 0
  sortBeads(sortedBd)
  for (var i =0; i < sortedBd.length; i++) {
    if (i > 0) {
      if (sortedBd[i].diam != sortedBd[i-1].diam || sortedBd[i].colorindex != sortedBd[i-1].colorindex) {
        boxIndex++
        specBeads.push({diam : 0, colorindex : 0, sum: 0})
      } 
    }
    storeBeads[sortedBd[i].index].Nbox = boxIndex
    specBeads[boxIndex].colorindex = sortedBd[i].colorindex
    specBeads[boxIndex].diam = sortedBd[i].diam
    specBeads[boxIndex].sum += 1
  }
}

// Функция заолняет модальное окно со спецификацией
function renderSpec () {
  specifyBeads ()
  let bead_spec = document.querySelector("#specification")
  bead_spec.innerHTML = ""
  specBeads.forEach(function(bead, index) {
    let row = document.createElement('div')
    row.className = "row"
    bead_spec.appendChild(row)
    let col_diam = document.createElement('div')
    col_diam.className = "col-md-4 shrink33"
    col_diam.innerHTML = '<span>'+ bead.diam +'</span>'
    let col_color = document.createElement('div')
    col_color.className = "col-md-4 shrink33"
    col_color.id = "colicon" + index
    col_color.innerHTML = '<span>'+ bead.colorindex +'</span>'
    let col_number = document.createElement('div')
    col_number.className = "col-md-4 shrink33"
    col_number.innerHTML = '<span>'+ bead.sum +'</span>'
    row.appendChild(col_diam)
    row.appendChild(col_color)
    row.appendChild(col_number)
    drawSpecSwatch (bead.colorindex, index)
  })
  function drawSpecSwatch (color, nbox) {
    let svginst = SVG().addTo('#colicon' + nbox).size('50px','50px').viewbox(0, 0, 20, 20)
    let swatch = svginst.circle(18)
    swatch.center(10,10)
    swatch.fill(palettePickerGrads[color])
  }
  saveSpecToSvg ()
}

// Функция рисует спецификацию целиком в svg для сохранения и отправки
function renderSpecSvg () {
  var specDraw = []
  var specExp = SVG().addTo('#specExport').size('210mm','297mm').viewbox(0, 0, 210, 297)
  var specBasePath = specExp.path('m 12.772216,54.378676 c 14.48282,20.968982 39.480698,-25.078993 65.505333,-24.73846 20.479664,0.267977 7.712201,32.346568 32.802021,33.833827 25.08982,1.487258 13.4345,-36.449074 38.49531,-40.516569 25.644,-4.162148 30.19135,55.231914 48.39447,48.837861')
  specBasePath.attr({fill: 'none', stroke: '#000', 'stroke-width': 0.2})
  var scaleFact = specBasePath.length()/spreadLength
  var specPalette = createStepGrads(10,specExp)
  // иллюстрация (возможно надо несколько форм, в зависимости от длины)
  var isBeadsFit = checkLength(spreadLength)
  var fitted = 0, count = 0
  storeBeads.forEach(function(elem,index) {
      var sdiam = elem.diam*scaleFact
      fitted += sdiam
      if (fitted <= specBasePath.length()- sdiam) {
        specDraw.push(specExp.circle(sdiam))
        var atPath = (index == 0) ? sdiam/2 : specDraw[index-1].data('pAt') + specDraw[index-1].attr('r') + specDraw[index].attr('r')
        var p = specBasePath.pointAt(atPath)
        specDraw[index].fill(specPalette[elem.colorindex])
        specDraw[index].center(p.x, p.y)
        specDraw[index].data('pAt', atPath);  //точка на кривой
    } else count++
  })
  // таблица
  var textStyleSm = {'font-style' : 'normal', 'font-weight' : 'normal', 'font-size' : '3.175px', 'font-family' : 'sans-serif', 'fill' : '#000000','stroke' : 'none'}
  var textStyleSReg = {'font-style' : 'normal', 'font-weight' : 'normal', 'font-size' : '3.52778px', 'font-family' : 'sans-serif', 'fill' : '#000000','stroke' : 'none'}
  var textStyleBd = {'font-style' : 'normal', 'font-weight' : 'bold', 'font-size' : '3.52778px', 'font-family' : 'sans-serif', 'fill' : '#000000','stroke' : 'none'}
  baseStr = isBeadsFit ? 'Длина основы: ' + Math.round(spreadLength) + 'мм' : 'Длина основы:' + Math.round(spreadLength) + 'мм' +  ' (не помещается ' + count + ' !)'
  var textInfobase = specExp.text(baseStr).attr({x: 9.67, y: 75.58}).attr(textStyleSm);
  var textTableHd = {
    col1 : specExp.text('Порядковый номер').attr({x: 9.67, y: 91.45}).attr(textStyleBd),
    col2 : specExp.text('Диаметр').attr({x: 76.82, y: 91.45}).attr(textStyleBd),
    col3 : specExp.text('Цвет').attr({x: 131.01, y: 91.45}).attr(textStyleBd),
    col4 : specExp.text('Количество').attr({x: 174.74, y: 91.45}).attr(textStyleBd)
  }
  var textTableRws = []
  specBeads.forEach(function (bead, index){
    textTableRws.push({
      line : specExp.path('M 9.9377927, ' + String(94.43699 + 8*index) +' H 200.07292').attr({fill: 'none', stroke: '#000', 'stroke-width': 0.1}),
      number : specExp.text(String(index + 1)).attr({x: 9.67, y: 100.4 + 8*index}).attr(textStyleSReg),
      diam : specExp.text(String(bead.diam)).attr({x: 76.82, y: 100.4 + 8*index}).attr(textStyleSReg),
      color : specExp.circle(6).center(134.34, 98.4 + 8*index).fill(specPalette[bead.colorindex]),
      amount : specExp.text(String(bead.sum)).attr({x: 174.74, y: 100.4 + 8*index}).attr(textStyleSReg)
    })
  })
  specExp.path('M 9.9377927, ' + String(94.43699 + 8*specBeads.length) +' H 200.07292').attr({fill: 'none', stroke: '#000', 'stroke-width': 0.1})
}



// Функция сохраняет спецификацию из скрытого div в svg
function saveSpecToSvg () {
  document.querySelector('#specExport').innerHTML = ''
  renderSpecSvg ()
  modal_doc = document.querySelector('#specExport > svg')
  document.querySelector('#nablob').setAttribute('href',bloberize(modal_doc))
}

// Экспериментальная функция - из любого нода блоб
function bloberize (object) {
  let blob = new Blob([object.outerHTML], {type: 'text/html'});
  return URL.createObjectURL(blob)
}