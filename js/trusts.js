var nodes = null;
var edges = null;
var network = null;
var dataURL;
var direction = 'access';
var csvData;

function ready () {
  let dropArea = document.getElementById('dropzone');
  ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, preventDefaults, false);
  });

  dropArea.addEventListener('drop', handleDrop, false);
  dropArea.addEventListener('click', selectFile, false);
}

function preventDefaults (e) {
  e.preventDefault();
  e.stopPropagation();
}

function handleFiles (files) {
  files = [...files];
  previewFile(files[0]);
}

function handleDrop (e) {
  let dt = e.dataTransfer;
  let files = dt.files;

  handleFiles(files);
}

function selectFile (e) {
  document.getElementById('fileElem').click();
}

function multiDimensionalUnique (arr) {
  var uniques = [];
  var itemsFound = {};
  for (var i = 0, l = arr.length; i < l; i++) {
    var stringified = JSON.stringify(arr[i]);
    if (itemsFound[stringified]) { continue; }
    uniques.push(arr[i]);
    itemsFound[stringified] = true;
  }
  return uniques;
}

function previewFile (file) {
  let reader = new FileReader();
  reader.readAsText(file, 'UTF-8');
  reader.onloadend = function () {
    var cdata = Papa.parse(reader.result).data;
    csvData = multiDimensionalUnique(cdata);
    parseCsvData(csvData);
    draw();
  };
}

function parseCsvData (cdata) {
  var sourceI = Math.max(cdata[0].indexOf('SourceDomain'), cdata[0].indexOf('SourceName'));
  var targetI = Math.max(cdata[0].indexOf('TargetDomain'), cdata[0].indexOf('TargetName'));
  var typeI = cdata[0].indexOf('TrustType');
  var attrI = cdata[0].indexOf('TrustAttributes');
  var directionI = cdata[0].indexOf('TrustDirection');
  if (sourceI < 0 || targetI < 0 || directionI < 0) {
    alert('could not find required columns in csv');
  }

  var nodesA = [];
  var edgesA = [];
  var domains = [];

  for (let i = 1; i < cdata.length; i++) {
    if (cdata[0].length !== cdata[i].length) { continue; }
    let source = cdata[i][sourceI];
    let target = cdata[i][targetI];
    let type = cdata[i][typeI];
    let direction = cdata[i][directionI];
    let attr = (attrI > -1) ? cdata[i][attrI] : null;

    if (!domains.includes(source)) {
      domains.push(source);
      nodesA.push({ id: source, label: source, shape: 'box', color: '#FFCC00' });
    }
    if (!domains.includes(target)) {
      domains.push(target);
      nodesA.push({ id: target, label: target, shape: 'box', color: '#FFCC00' });
    }

    if (!edgesA.find(e => (e.from === source && e.to === target) ||
      (e.from === target && e.to === source))) {
      let arrows = '';
      if (direction === 'Inbound') {
        arrows = 'to';
      } else if (direction === 'Outbound') {
        arrows = 'from';
      } else if (direction === 'Bidirectional') { arrows = 'to, from'; }

      let color = { color: 'violet', highlight: 'violet' };
      let title = 'Unknown Type';
      if (type === 'ParentChild') {
        title = 'ParentChild';
        color = { color: 'green', highlight: 'green' };
      } else if (type === 'CrossLink') {
        title = 'CrossLink';
        color = { color: 'teal', highlight: 'teal' };
      } else if (attr && attr.indexOf('WITHIN_FOREST') > -1) {
        title = 'Intra-Forest';
        color = { color: 'green', highlight: 'green' };
      } else if (type === 'External' || attr === '' || attr === 'TREAT_AS_EXTERNAL' || attr === 'FILTER_SIDS') {
        title = 'External';
        color = { color: 'red', highlight: 'red' };
      } else if (attr === 'FOREST_TRANSITIVE') {
        title = 'Inter-Forest';
        color = { color: 'blue', highlight: 'blue' };
      }

      edgesA.push({ from: source, to: target, title: title, arrows: arrows, length: 150, color: color, width: 2 });
    }
  }

  console.log(nodesA);
  console.log(edgesA);

  nodes = new vis.DataSet(nodesA);
  edges = new vis.DataSet(edgesA);
}

function destroy () {
  if (network !== null) {
    network.destroy();
    network = null;
  }
}

function draw () {
  destroy();

  var data = {
    nodes: nodes,
    edges: edges
  };

  document.getElementById('dropzone').style.display = 'none';
  document.getElementById('main').style.display = 'initial';

  var container = document.getElementById('mynetwork');
  console.log(data);
  console.log(container);
  network = new vis.Network(container, data, {});

  network.on('afterDrawing', function (ctx) {
    dataURL = ctx.canvas.toDataURL('image/png');
  });
}

function savePng (filename) {
  // var png = dataURL.split(',')[1];
  var blob = fetch(dataURL)
    .then(res => res.blob())
    .then(blob => {
      if (window.navigator.msSaveOrOpenBlob) {
        window.navigator.msSaveBlob(blob, filename);
      } else {
        var elem = window.document.createElement('a');
        elem.href = window.URL.createObjectURL(blob);
        elem.download = filename;
        document.body.appendChild(elem);
        elem.click();
        document.body.removeChild(elem);
      }
    });
}

function updateDir (dir) {
  if (dir === direction) return;

  if (dir === 'access' && direction === 'trust') {
    flipArrows();
    direction = 'access';
    document.getElementById('dir-of-trust').innerHTML = '&#x2610; Direction of Trust';
    document.getElementById('dir-of-access').innerHTML = '&#x2611; Direction of Access';
  }
  if (dir === 'trust' && direction === 'access') {
    flipArrows();
    direction = 'trust';
    document.getElementById('dir-of-trust').innerHTML = '&#x2611; Direction of Trust';
    document.getElementById('dir-of-access').innerHTML = '&#x2610; Direction of Access';
  }
}

function flipArrows () {
  edges.getIds().forEach(id => {
    let edge = edges.get(id);
    if (edge.arrows === 'to') {
      edge.arrows = 'from';
    } else if (edge.arrows === 'from') {
      edge.arrows = 'to';
    }
    edges.update(edge);
  });
}
