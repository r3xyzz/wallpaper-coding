async function obtenerClimaPorCiudad(nombreCiudad) {
	try {
		const urlBusqueda = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(nombreCiudad)}&count=1&language=es&format=json`;
		const respuestaBusqueda = await fetch(urlBusqueda);

		if (!respuestaBusqueda.ok) {
			document.getElementById("clima-ciudad").textContent = nombreCiudad;
			document.getElementById("clima-temp").textContent = "-- °C";
			return;
		}

		const datosBusqueda = await respuestaBusqueda.json();
		const lugar = datosBusqueda?.results?.[0];

		if (!lugar) {
			document.getElementById("clima-ciudad").textContent = nombreCiudad;
			document.getElementById("clima-temp").textContent = "-- °C";
			return;
		}

		const urlClima = `https://api.open-meteo.com/v1/forecast?latitude=${lugar.latitude}&longitude=${lugar.longitude}&current=temperature_2m&timezone=auto`;
		const respuestaClima = await fetch(urlClima);

		if (!respuestaClima.ok) {
			document.getElementById("clima-ciudad").textContent = lugar.name || nombreCiudad;
			document.getElementById("clima-temp").textContent = "-- °C";
			return;
		}

		const datosClima = await respuestaClima.json();
		const temperatura = datosClima?.current?.temperature_2m || 0;
		const unidad = datosClima?.current_units?.temperature_2m || "°C";

		document.getElementById("clima-ciudad").textContent = lugar.name || nombreCiudad;
		document.getElementById("clima-temp").textContent = `${Math.round(temperatura)} ${unidad}`;
	} catch (_error) {
		document.getElementById("clima-ciudad").textContent = nombreCiudad;
		document.getElementById("clima-temp").textContent = "-- °C";
	}
}

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
	const segundosTranscurridos = (horaNumero * 3600) + (minutoNumero * 60) + segundoNumero;
	const progresoDia = ((segundosTranscurridos / 86400) * 100).toFixed(2);

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
		`        System.out.<span class="code-func">println</span>(<span class="code-string">\"Progreso del dia: \"</span> + progresoDia + <span class="code-string">\"%\"</span>); <span class="code-comment">// Progreso del dia: ${progresoDia}%</span>`,
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

}

window.wallpaperPropertyListener = {
	applyUserProperties: function (properties) {
		if (properties.city) {
			const ciudadEscrita = properties.city.value;
			if (ciudadEscrita && ciudadEscrita.trim()) {
				document.getElementById("clima-ciudad").textContent = "Buscando...";
				obtenerClimaPorCiudad(ciudadEscrita);
			}
		}
	}
};

actualizarDatos();
setInterval(actualizarDatos, 1000);
