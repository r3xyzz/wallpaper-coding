let ultimaActualizacionClima = 0;
let coordenadasClima = null;
let ciudadSeleccionada = "";
let modoClima = "ubicacion";
let consultaClimaEnCurso = false;
const INTERVALO_CLIMA_MS = 10 * 60 * 1000;

function normalizarTexto(valor) {
	return (valor || "").toString().trim();
}

function obtenerCiudadDesdeUrl() {
	const parametros = new URLSearchParams(window.location.search);
	return normalizarTexto(parametros.get("city") || parametros.get("ciudad"));
}

function actualizarVistaClima(ciudad, temperatura) {
	document.getElementById("clima-ciudad").textContent = ciudad;
	document.getElementById("clima-temp").textContent = temperatura;
}

function obtenerUbicacionActual() {
	return new Promise((resolve, reject) => {
		navigator.geolocation.getCurrentPosition(
			(posicion) => resolve(posicion.coords),
			(error) => reject(error),
			{ enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
		);
	});
}

async function obtenerNombreCiudadPorCoordenadas(latitud, longitud) {
	const urlCiudad = `https://geocoding-api.open-meteo.com/v1/reverse?latitude=${latitud}&longitude=${longitud}&language=es&count=1`;
	const respuestaCiudad = await fetch(urlCiudad);

	if (!respuestaCiudad.ok) {
		return "Ciudad desconocida";
	}

	const datosCiudad = await respuestaCiudad.json();
	const lugar = datosCiudad?.results?.[0];
	return lugar?.name || lugar?.admin1 || "Ciudad desconocida";
}

async function obtenerClimaPorCoordenadas(latitud, longitud, nombreCiudad) {
	const urlClima = `https://api.open-meteo.com/v1/forecast?latitude=${latitud}&longitude=${longitud}&current=temperature_2m&timezone=auto`;
	const respuestaClima = await fetch(urlClima);

	if (!respuestaClima.ok) {
		throw new Error("No se pudo obtener el clima");
	}

	const datosClima = await respuestaClima.json();
	const temperatura = datosClima?.current?.temperature_2m;
	const unidad = datosClima?.current_units?.temperature_2m || "°C";
	const ciudad = normalizarTexto(nombreCiudad) || (await obtenerNombreCiudadPorCoordenadas(latitud, longitud));

	return {
		ciudad,
		temperatura: `${Math.round(temperatura)} ${unidad}`
	};
}

async function actualizarClimaDesdeCiudad(nombreCiudad) {
	if (consultaClimaEnCurso) {
		return;
	}

	consultaClimaEnCurso = true;
	actualizarVistaClima(nombreCiudad, "Buscando...");

	try {
		const urlCiudad = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(nombreCiudad)}&count=1&language=es&format=json`;
		const respuestaCiudad = await fetch(urlCiudad);

		if (!respuestaCiudad.ok) {
			throw new Error("No se pudo buscar la ciudad");
		}

		const datosCiudad = await respuestaCiudad.json();
		const lugar = datosCiudad?.results?.[0];

		if (!lugar) {
			actualizarVistaClima(`Ciudad no encontrada: ${nombreCiudad}`, "-- °C");
			ultimaActualizacionClima = Date.now();
			return;
		}

		coordenadasClima = {
			latitude: lugar.latitude,
			longitude: lugar.longitude
		};
		const clima = await obtenerClimaPorCoordenadas(lugar.latitude, lugar.longitude, lugar.name || nombreCiudad);
		actualizarVistaClima(clima.ciudad, clima.temperatura);
		ultimaActualizacionClima = Date.now();
	} catch (_error) {
		actualizarVistaClima("Sin datos de clima", "-- °C");
	} finally {
		consultaClimaEnCurso = false;
	}
}

async function actualizarClimaDesdeUbicacion() {
	if (consultaClimaEnCurso) {
		return;
	}

	consultaClimaEnCurso = true;

	try {
		if (!navigator.geolocation) {
			actualizarVistaClima("Configura una ciudad", "-- °C");
			return;
		}

		const ubicacion = await obtenerUbicacionActual();
		coordenadasClima = ubicacion;
		const clima = await obtenerClimaPorCoordenadas(ubicacion.latitude, ubicacion.longitude);
		actualizarVistaClima(clima.ciudad, clima.temperatura);
		ultimaActualizacionClima = Date.now();
	} catch (_error) {
		actualizarVistaClima("Configura una ciudad", "-- °C");
	} finally {
		consultaClimaEnCurso = false;
	}
}

async function inicializarClima() {
	const ciudadInicial = ciudadSeleccionada || obtenerCiudadDesdeUrl();

	if (ciudadInicial) {
		modoClima = "ciudad";
		ciudadSeleccionada = ciudadInicial;
		await actualizarClimaDesdeCiudad(ciudadInicial);
		return;
	}

	modoClima = "ubicacion";
	await actualizarClimaDesdeUbicacion();
}

function establecerCiudad(valorCiudad) {
	const nuevaCiudad = normalizarTexto(valorCiudad);

	if (!nuevaCiudad) {
		ciudadSeleccionada = "";
		modoClima = "ubicacion";
		coordenadasClima = null;
		ultimaActualizacionClima = 0;
		inicializarClima();
		return;
	}

	ciudadSeleccionada = nuevaCiudad;
	modoClima = "ciudad";
	coordenadasClima = null;
	ultimaActualizacionClima = 0;
	actualizarClimaDesdeCiudad(nuevaCiudad);
}

window.wallpaperPropertyListener = {
	applyUserProperties: function (properties) {
		if (properties.city) {
			establecerCiudad(properties.city.value);
		}

		if (properties.ciudad) {
			establecerCiudad(properties.ciudad.value);
		}
	}
};

function actualizarDatos() {
	const meses = [
		"enero", "febrero", "marzo", "abril", "mayo", "junio",
		"julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"
	];

	const ahora = new Date();
	const dia = ahora.getDate();
	const mesNumero = ahora.getMonth() + 1;
	const mesNombre = meses[ahora.getMonth()];
	const anio = ahora.getFullYear();
	const horaNumero = ahora.getHours();
	const minutoNumero = ahora.getMinutes();
	const segundoNumero = ahora.getSeconds();
	const hora = String(horaNumero).padStart(2, "0");
	const minutos = String(minutoNumero).padStart(2, "0");
	const segundos = String(segundoNumero).padStart(2, "0");

	const texto = [
		`<span class="code-keyword">import</span> <span class="code-package">java.time.LocalDateTime</span>;`,
		"",
		`<span class="code-keyword">public</span> <span class="code-keyword">class</span> FechaHora {`,
		`    <span class="code-keyword">public</span> <span class="code-keyword">static</span> <span class="code-keyword">void</span> <span class="code-func">main</span>(String[] args) {`,
		`        <span class="code-comment">// Obtenemos la fecha y hora actual</span>`,
		`        <span class="code-type">LocalDateTime</span> ahora = <span class="code-type">LocalDateTime</span>.<span class="code-func">now</span>();`,
		"",
		`        <span class="code-comment">// Mostramos los resultados</span>`,
		`        System.out.<span class="code-func">println</span>(<span class="code-string">\"Dia: \"</span> + dia); <span class="code-comment">// Dia: ${dia}</span>`,
		`        System.out.<span class="code-func">println</span>(<span class="code-string">\"Mes: \"</span> + mes); <span class="code-comment">// Mes: ${mesNumero} (${mesNombre})</span>`,
		`        System.out.<span class="code-func">println</span>(<span class="code-string">\"Anio: \"</span> + anio); <span class="code-comment">// Anio: ${anio}</span>`,
		`        System.out.<span class="code-func">println</span>(<span class="code-string">\"Hora: \"</span> + hora); <span class="code-comment">// Hora: ${hora}</span>`,
		`        System.out.<span class="code-func">println</span>(<span class="code-string">\"Minutos: \"</span> + minutos); <span class="code-comment">// Minutos: ${minutos}</span>`,
		`        System.out.<span class="code-func">println</span>(<span class="code-string">\"Segundos: \"</span> + segundos); <span class="code-comment">// Segundos: ${segundos}</span>`,
		"    }",
		"}"
	].join("\n");

	document.getElementById("salida").innerHTML = texto;
	document.getElementById("reloj-fecha").textContent = `${dia} ${mesNombre} ${anio}`;

	const anguloHora = (horaNumero % 12) * 30 + minutoNumero * 0.5;
	const anguloMinuto = minutoNumero * 6 + segundoNumero * 0.1;
	const anguloSegundo = segundoNumero * 6;

	document.getElementById("manecilla-hora").style.setProperty("--angulo", `${anguloHora}deg`);
	document.getElementById("manecilla-minuto").style.setProperty("--angulo", `${anguloMinuto}deg`);
	document.getElementById("manecilla-segundo").style.setProperty("--angulo", `${anguloSegundo}deg`);

	if (Date.now() - ultimaActualizacionClima > INTERVALO_CLIMA_MS && !consultaClimaEnCurso) {
		if (modoClima === "ciudad" && ciudadSeleccionada) {
			actualizarClimaDesdeCiudad(ciudadSeleccionada).catch(() => {
				actualizarVistaClima("Sin datos de clima", "-- °C");
			});
		} else if (coordenadasClima) {
			actualizarClimaDesdeUbicacion().catch(() => {
				actualizarVistaClima("Sin datos de clima", "-- °C");
			});
		}
	}
}

inicializarClima();
actualizarDatos();
setInterval(actualizarDatos, 1000);
