/**
 * script.js completo mejorado:
 * - Agregar productos
 * - Quitar 1 unidad
 * - Sumar desde carrito
 * - Eliminar producto completo
 * - Actualiza total
 */

(function () {
  'use strict';

  var RESTAURANTES = [
    { id: 'r1', nombre: 'Pizzería Napoli', categoria: 'pizza', img: './assets/rest-r1.svg' },
    { id: 'r2', nombre: 'Sushi Roll', categoria: 'asiatica', img: './assets/rest-r2.svg' },
    { id: 'r3', nombre: 'Burger Norte', categoria: 'hamburguesas', img: './assets/rest-r3.svg' },
    { id: 'r4', nombre: 'Mamma Mia Express', categoria: 'pizza', img: './assets/rest-r4.svg' }
  ];

  var MENU = {
    r1: [
      { id: 'm1', nombre: 'Margarita', precio: 8.5, img: './assets/dish-m1.svg' },
      { id: 'm2', nombre: 'Cuatro quesos', precio: 10.9, img: './assets/dish-m2.svg' }
    ],
    r2: [
      { id: 'm3', nombre: 'Menú maki (12 pzs)', precio: 14.0, img: './assets/dish-m3.svg' },
      { id: 'm4', nombre: 'Yakisoba', precio: 9.5, img: './assets/dish-m4.svg' }
    ],
    r3: [
      { id: 'm5', nombre: 'Clásica + patatas', precio: 11.0, img: './assets/dish-m5.svg' },
      { id: 'm6', nombre: 'Veggie', precio: 10.5, img: './assets/dish-m6.svg' }
    ],
    r4: [
      { id: 'm7', nombre: 'Calzone', precio: 9.0, img: './assets/dish-m7.svg' },
      { id: 'm8', nombre: 'Prosciutto', precio: 11.5, img: './assets/dish-m8.svg' }
    ]
  };

  var restauranteActual = null;
  var pedido = [];

  var elFiltro = document.getElementById('filtro-cat');
  var elListaRest = document.getElementById('lista-restaurantes');
  var elStepRest = document.getElementById('step-restaurante');
  var elStepProd = document.getElementById('step-productos');
  var elStepRes = document.getElementById('step-resumen');
  var elStepConf = document.getElementById('step-confirmacion');
  var elTituloRest = document.getElementById('titulo-restaurante');
  var elListaPlatos = document.getElementById('lista-platos');
  var elListaResumen = document.getElementById('lista-resumen');
  var elResumenVacio = document.getElementById('resumen-vacio');
  var elTotal = document.getElementById('total-delivery');
  var elMsgConfirm = document.getElementById('msg-confirm');

  function mostrarSoloPanel(panel) {
    var panels = [elStepRest, elStepProd, elStepRes, elStepConf];

    for (var i = 0; i < panels.length; i++) {
      var activo = panels[i] === panel;
      panels[i].classList.toggle('active', activo);
      panels[i].hidden = !activo;
    }

    actualizarIndicadoresPasos(panel);
  }

  function actualizarIndicadoresPasos(panel) {
    var n = '1';

    if (panel === elStepProd) n = '2';
    if (panel === elStepRes || panel === elStepConf) n = '3';

    var indicadores = document.querySelectorAll('[data-step-indicator]');

    for (var i = 0; i < indicadores.length; i++) {
      var el = indicadores[i];
      el.classList.toggle('active', el.getAttribute('data-step-indicator') === n);
    }
  }

  function escapeHtml(s) {
    var d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
  }

  function escapeAttr(s) {
    return String(s).replace(/"/g, '&quot;');
  }

  function formatEuros(n) {
    return Number(n).toFixed(2).replace('.', ',') + ' €';
  }

  function filtrarRestaurantes() {
    var cat = elFiltro.value;
    elListaRest.innerHTML = '';

    for (var i = 0; i < RESTAURANTES.length; i++) {
      var r = RESTAURANTES[i];

      if (cat !== 'todas' && r.categoria !== cat) continue;

      var li = document.createElement('li');

      li.innerHTML =
        '<button type="button" class="card-rest" data-rest="' + r.id + '">' +
          '<span class="card-rest__media">' +
            '<img src="' + r.img + '" alt="">' +
          '</span>' +
          '<span class="card-rest__body">' +
            '<strong>' + escapeHtml(r.nombre) + '</strong>' +
            '<span class="tag">' + escapeHtml(r.categoria) + '</span>' +
          '</span>' +
        '</button>';

      elListaRest.appendChild(li);
    }
  }

  function abrirMenu(restId) {
    restauranteActual = restId;
    elListaPlatos.innerHTML = '';

    for (var i = 0; i < RESTAURANTES.length; i++) {
      if (RESTAURANTES[i].id === restId) {
        elTituloRest.textContent = RESTAURANTES[i].nombre;
        break;
      }
    }

    var platos = MENU[restId] || [];

    for (var j = 0; j < platos.length; j++) {
      var pl = platos[j];
      var li = document.createElement('li');

      li.className = 'plato-row';

      li.innerHTML =
        '<img class="plato-thumb" src="' + pl.img + '" alt="">' +
        '<div class="plato-info">' +
          '<span class="plato-nombre">' + escapeHtml(pl.nombre) + '</span>' +
        '</div>' +
        '<span class="plato-precio">' + formatEuros(pl.precio) + '</span>' +
        '<button type="button" class="btn-mini"' +
          ' data-add-plato="' + pl.id + '"' +
          ' data-nombre="' + escapeAttr(pl.nombre) + '"' +
          ' data-precio="' + pl.precio + '"' +
          ' data-img="' + escapeAttr(pl.img) + '"' +
        '>+</button>';

      elListaPlatos.appendChild(li);
    }

    mostrarSoloPanel(elStepProd);
  }

  function lineaPedido(idPlato) {
    for (var i = 0; i < pedido.length; i++) {
      if (pedido[i].idPlato === idPlato) return pedido[i];
    }
    return null;
  }

  function agregarPlato(idPlato, nombre, precio, img) {
    var linea = lineaPedido(idPlato);

    if (linea) {
      linea.cantidad += 1;
    } else {
      pedido.push({
        idPlato: idPlato,
        nombre: nombre,
        precioUnit: precio,
        cantidad: 1,
        img: img
      });
    }
  }

  function quitarPlato(idPlato) {
    for (var i = 0; i < pedido.length; i++) {
      if (pedido[i].idPlato === idPlato) {
        pedido[i].cantidad--;

        if (pedido[i].cantidad <= 0) {
          pedido.splice(i, 1);
        }
        break;
      }
    }
  }

  function eliminarPlatoCompleto(idPlato) {
    for (var i = 0; i < pedido.length; i++) {
      if (pedido[i].idPlato === idPlato) {
        pedido.splice(i, 1);
        break;
      }
    }
  }

  function totalPedido() {
    var total = 0;

    for (var i = 0; i < pedido.length; i++) {
      total += pedido[i].precioUnit * pedido[i].cantidad;
    }

    return total;
  }

  function pintarResumen() {
    elListaResumen.innerHTML = '';

    elResumenVacio.hidden = pedido.length > 0;

    for (var i = 0; i < pedido.length; i++) {
      var l = pedido[i];
      var li = document.createElement('li');

      li.className = 'resumen-line';

      li.innerHTML =
        '<img class="resumen-thumb" src="' + l.img + '" alt="">' +

        '<div class="resumen-info">' +
          '<span class="resumen-nombre">' + escapeHtml(l.nombre) + '</span>' +
          '<small class="resumen-unitario">' + formatEuros(l.precioUnit) + ' c/u</small>' +
        '</div>' +

        '<div class="resumen-controles">' +
          '<button class="btn-cantidad btn-restar" data-remove-plato="' + l.idPlato + '">−</button>' +
          '<span class="cantidad-num">' + l.cantidad + '</span>' +
          '<button class="btn-cantidad btn-sumar"' +
            ' data-add-resumen="' + l.idPlato + '"' +
            ' data-nombre="' + escapeAttr(l.nombre) + '"' +
            ' data-precio="' + l.precioUnit + '"' +
            ' data-img="' + escapeAttr(l.img) + '"' +
          '>+</button>' +
        '</div>' +

        '<span class="resumen-precio">' +
          formatEuros(l.precioUnit * l.cantidad) +
        '</span>' +

        '<button class="btn-borrar" data-delete-plato="' + l.idPlato + '">✕</button>';

      elListaResumen.appendChild(li);
    }

    elTotal.textContent = formatEuros(totalPedido());
  }

  elListaRest.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-rest]');
    if (!btn) return;

    abrirMenu(btn.getAttribute('data-rest'));
  });

  elFiltro.addEventListener('change', filtrarRestaurantes);

  elListaPlatos.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-add-plato]');
    if (!btn) return;

    agregarPlato(
      btn.getAttribute('data-add-plato'),
      btn.getAttribute('data-nombre'),
      parseFloat(btn.getAttribute('data-precio')),
      btn.getAttribute('data-img')
    );
  });

  elListaResumen.addEventListener('click', function (e) {
    var btnRestar = e.target.closest('[data-remove-plato]');
    var btnSumar = e.target.closest('[data-add-resumen]');
    var btnEliminar = e.target.closest('[data-delete-plato]');

    if (btnRestar) {
      quitarPlato(btnRestar.getAttribute('data-remove-plato'));
      pintarResumen();
      return;
    }

    if (btnSumar) {
      agregarPlato(
        btnSumar.getAttribute('data-add-resumen'),
        btnSumar.getAttribute('data-nombre'),
        parseFloat(btnSumar.getAttribute('data-precio')),
        btnSumar.getAttribute('data-img')
      );

      pintarResumen();
      return;
    }

    if (btnEliminar) {
      eliminarPlatoCompleto(btnEliminar.getAttribute('data-delete-plato'));
      pintarResumen();
    }
  });

  document.getElementById('btn-volver-rest').addEventListener('click', function () {
    mostrarSoloPanel(elStepRest);
  });

  document.getElementById('btn-carrito').addEventListener('click', function () {
    pintarResumen();
    mostrarSoloPanel(elStepRes);
  });

  document.getElementById('btn-seguir-comprando').addEventListener('click', function () {
    if (restauranteActual) abrirMenu(restauranteActual);
  });

  document.getElementById('btn-comprar').addEventListener('click', function () {
    if (pedido.length === 0) {
      alert('Añade al menos un producto.');
      return;
    }

    elMsgConfirm.textContent =
      'Tu pedido ha sido enviado por ' +
      formatEuros(totalPedido()) +
      '. Tiempo estimado: 35 minutos.';

    pedido = [];
    pintarResumen();
    mostrarSoloPanel(elStepConf);
  });

  document.getElementById('btn-nuevo').addEventListener('click', function () {
    restauranteActual = null;
    mostrarSoloPanel(elStepRest);
  });

  filtrarRestaurantes();
})();
