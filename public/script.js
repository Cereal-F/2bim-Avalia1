const CLIENT_ID = "920975746902-ujdijub8r4e2knt8jh931je36ml0756r.apps.googleusercontent.com";

const formulario = document.getElementById("formulario");
const campoNumero = document.getElementById("numero");
const area = document.getElementById("desenho");
const mensagem = document.getElementById("mensagem");
const botaoBaixar = document.getElementById("baixar");

let idToken = null;
let svgAtual = "";

google.accounts.id.initialize({
  client_id: CLIENT_ID,
  callback: (response) => {
    idToken = response.credential;
    mensagem.textContent = "Login realizado com sucesso.";
  }
});

google.accounts.id.renderButton(
  document.getElementById("g_id_signin"),
  {
    theme: "outline",
    size: "large"
  }
);

function erro(texto) {
  mensagem.textContent = texto;
}

formulario.addEventListener("submit", async (evento) => {
  evento.preventDefault();

  mensagem.textContent = "";
  area.innerHTML = "";

  const numero = Number(campoNumero.value);

  const headers = {
    "Content-Type": "application/json"
  };

  if (idToken) {
    headers.Authorization = "Bearer " + idToken;
  }

  try {
    const resposta = await fetch("/api/desenho", {
      method: "POST",
      headers,
      body: JSON.stringify({ numero })
    });

    if (resposta.status === 400) {
      return erro("Número inválido: use um inteiro de 1 a 100.");
    }

    if (resposta.status === 401) {
      idToken = null;
      return erro("Faça login com o Google.");
    }

    if (!resposta.ok) {
      return erro("Erro " + resposta.status);
    }

    svgAtual = await resposta.text();

    area.innerHTML = svgAtual;
    botaoBaixar.hidden = false;
  } catch (e) {
    erro("Falha ao conectar com o servidor.");
  }
});

botaoBaixar.addEventListener("click", () => {
  const arquivo = new Blob(
    [svgAtual],
    { type: "image/svg+xml" }
  );

  const url = URL.createObjectURL(arquivo);

  const link = document.createElement("a");

  link.href = url;
  link.download = "exemplo.svg";
  link.click();

  URL.revokeObjectURL(url);
});
