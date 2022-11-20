//API's
const pokedexAPI = "https://pokeapi.co/api/v2/pokemon/";
const typesAPI = "https://pokeapi.co/api/v2/type/";

//DOM
const sectionPokedex = document.getElementById("pokedex");
const selectTypes = document.getElementById("selectTypes");
const spinner = document.getElementById("spinner");

const dictionaryTypes = {
    normal: "Normal",
    fighting: "Lucha",
    flying: "Volador",
    poison: "Veneno",
    ground: "Tierra",
    rock: "Roca",
    bug: "Bicho",
    ghost: "Fantasma",
    steel: "Acero",
    fire: "Fuego",
    water: "Agua",
    grass: "Planta",
    electric: "Eléctrico",
    psychic: "Psíquico",
    ice: "Hielo",
    dragon: "Dragón",
    dark: "Siniestro",
    fairy: "Hada"
}

const cssTypes = ["grass", "ice", "fire", "water", "electric", "poison", "psychic", "ground", "dragon", "bug", "rock", "ghost"];

let pkmArray = [];
let pkmFavs = [];
let pkmTypes = [];

const imgNoResults = "../img/charizard-sad.png";

function updateLocalStorage(key, value) {
    let valueToJSON = JSON.stringify(value);
    localStorage.setItem(key, valueToJSON);
}

// Obtiene un rango de pokemon de la API, los guarda en memoria y los dibuja
async function getPokedex(minPokemon, maxPokemon) {
    showSpinner();
    for (let id = minPokemon; id <= maxPokemon; id++) {
        await getPkm(id, null);
    }
    hideSpinner();
    drawArray();
}

// Obtiene datos extendidos de un pokemon por su id y lo guarda en memoria
async function getPkm(id, url) {
    let response;
    if (id === null) {
        response = await fetch(`${url}`)
    } else {
        response = await fetch(`${pokedexAPI}${id}`)
    }
    let dataPokemon = await response.json();
    await addPkmToArray(dataPokemon);
}

// Añade un pokemon a memoria
function addPkmToArray(pkm) {
    pkmArray.splice(pkm.id, 0, pkm);
}

// Dibuja los pokemon guardados en memoria
function drawArray() {
    if (pkmArray.length == 0) {
        drawNoResults();
    } else {
        pkmArray.forEach(dataPokemon => {
            drawCard(dataPokemon);
        });
    }

}

// Obtiene de la API y rellena el selector de tipos
async function getTypes() {
    let response = await fetch(`${typesAPI}`)
    let dataTypes = await response.json();
    fillSelectTypes(dataTypes);
}

// Dibuja a los pokemon en función del tipo seleccionado
function drawPokemonByType() {
    let type = selectTypes.value;
    sectionPokedex.innerHTML = "";
    let empty = true;
    switch (type) {
        case "all":
            pkmArray.forEach(dataPokemon => {
                drawCard(dataPokemon);
            });
            break;
        case "favourites":
            pkmArray.forEach(dataPokemon => {
                if (pkmFavs.includes(dataPokemon.id.toString())) {
                    drawCard(dataPokemon);
                    empty = false;
                }
            });
            if (empty) {
                drawNoResults();
            }
            break;
        default:
            pkmArray.forEach(dataPokemon => {
                let firstType = dataPokemon.types[0].type.name;
                // Algunos pokemon no tienen un segundo tipo
                let secondType = undefined;
                if (dataPokemon.types[1]) {
                    secondType = dataPokemon.types[1].type.name;
                }
                if (firstType == type || secondType == type) {
                    drawCard(dataPokemon);
                    empty = false;
                }
            });
            if (empty) {
                drawNoResults();
            }
            break;
    }
}

// Obtiene la lista de todos los pokemon que sean de un tipo (no usado actualmente)
async function getPkmByType() {
    let type = selectTypes.value;
    let response = await fetch(`${typesAPI}${type}`)
    let dataTypes = await response.json();
    sectionPokedex.innerHTML = "";
    dataTypes.pokemon.forEach(pkm => {
        getPkm(null, pkm.pokemon.url);
    });
}

// Dibuja un pokemon en pantalla
const drawCard = dataPokemon => {
    let card = document.createElement("div");

    let title = document.createElement("h1");
    title.innerText = capitalize(dataPokemon.name);
    card.appendChild(title);

    let idPkm = document.createElement("h3");
    idPkm.innerText = "#" + dataPokemon.id;
    card.appendChild(idPkm);

    let image = document.createElement("img");
    let imgFuente1 = dataPokemon.sprites.other.dream_world.front_default;
    let imgFuente2 = dataPokemon.sprites.front_default;
    if (imgFuente1 === null) {
        image.setAttribute("src", imgFuente2);
    } else {
        image.setAttribute("src", imgFuente1);
    }
    card.appendChild(image);

    let favIcon = document.createElement("span");
    favIcon.classList.add("material-icons", "nofavorite");
    favIcon.innerText = "star_rate";
    favIcon.setAttribute("id", dataPokemon.id);
    favIcon.addEventListener("click", addFavourite);
    if (pkmFavs.includes(dataPokemon.id.toString())) {
        favIcon.classList.add("favorite");
        favIcon.classList.remove("nofavorite");
    } else {
        favIcon.classList.add("nofavorite");
        favIcon.classList.remove("favorite");
    }

    card.appendChild(favIcon);

    let firstType = dataPokemon.types[0].type.name;
    if (cssTypes.includes(firstType)) {
        card.classList.add(firstType);
    }
    card.classList.add("card");

    sectionPokedex.appendChild(card);
}

const drawNoResults = () => {
    let card = document.createElement("div");

    let image = document.createElement("img");
    image.setAttribute("src", imgNoResults);
    image.classList.add("noResultImg");

    card.appendChild(image);

    let title = document.createElement("h1");
    title.innerText = "Sin resultados";
    title.classList.add("pkmFont");
    card.appendChild(title);

    sectionPokedex.appendChild(card);
}

function capitalize(word) {
    return word[0].toUpperCase() + word.slice(1).toLowerCase();
}

// Rellena el selector de tipos
const fillSelectTypes = dataTypes => {

    for (let type = 0; type < dataTypes.count; type++) {
        let typeName = dataTypes.results[type].name;

        if (!dictionaryTypes.hasOwnProperty(typeName))
            continue;

        let optionElement = document.createElement("option");
        optionElement.value = typeName;

        if (dictionaryTypes[typeName]) {
            optionElement.textContent = dictionaryTypes[typeName];
        } else {
            optionElement.textContent = typeName;
        }

        selectTypes.appendChild(optionElement);
    }

}

function showSpinner() {
    spinner.classList.add('show');
}

function hideSpinner() {
    spinner.classList.remove('show');
}

async function checkLocalStorage() {
    //Comprobar si las keys están creadas
    let pkmFavLS = localStorage.getItem('pkmFavs');
    if (pkmFavLS == undefined) {
        const pkmFavJSON = JSON.stringify(pkmFavs);
        localStorage.setItem('pkmFavs', pkmFavJSON);
        pkmFavLS = localStorage.getItem('pkmFavs');
    }

    let pkmTypesLS = localStorage.getItem('pkmTypes');
    if (pkmTypesLS == undefined) {
        const pkmTypesJSON = JSON.stringify(pkmTypes);
        localStorage.setItem('pkmTypes', pkmTypesJSON);
        pkmTypesLS = localStorage.getItem('pkmTypes');
    }

    // Parsear los datos guardados
    pkmFavs = JSON.parse(pkmFavLS);
    pkmTypes = JSON.parse(pkmTypesLS);

    if (pkmTypes.length == 0) {
        getTypes();
    }

}

function addFavourite() {
    if (!pkmFavs.includes(this.id)) {
        pkmFavs.push(this.id);
        pkmFavs.sort();
        this.classList.add("favorite");
        this.classList.remove("nofavorite");
    } else {
        let index = pkmFavs.indexOf(this.id);
        pkmFavs.splice(index, 1);
        this.classList.add("nofavorite");
        this.classList.remove("favorite");
    }
    updateLocalStorage("pkmFavs", pkmFavs)
}



// Sólo obtenemos los datos de la API al cargar la página la primera vez
getPokedex(1, 151);
checkLocalStorage();

// Si queremos añadir la carga de n número de pokemon en función del scroll
/*
window.addEventListener('scroll', () => {
    const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
    //scrollTop: Píxeles que han sido desplazados del scroll
    //scrollHeight: Todo el padding y contenido visible o no en pantalla
    //clientHeight: Sólo el padding y contenido visible en pantalla
    if (scrollTop + clientHeight >= scrollHeight - 10) {
        offsetPkm = offsetPkm + pkmPerPage;
        limitPkm = limitPkm + pkmPerPage;
        getPokedex(offsetPkm, limitPkm);
    }
});
*/
