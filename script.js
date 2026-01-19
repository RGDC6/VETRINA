// Dati dei lotti
const lots = [ //qua agg/mod i vari lotti/dati
  { id: 1, title: "Lotto Soldatini Napoleonici", description: "Collezione di 24 soldatini in piombo dipinti a mano, epoca napoleonica.", images: ["img/lotto1a.jpg","img/lotto1b.jpg"], price: "€40", status: "Disponibile" },
  
  { id: 2, title: "Uniformi Wehrmacht WW2", description: "Riproduzioni fedeli di uniformi tedesche della Seconda Guerra Mondiale.", images: ["img/lotto2a.jpg"], price: "€50", status: "Sold out" },
  
  { id: 3, title: "Medaglie e Decorazioni Varie", description: "Collezione mista di medaglie, distintivi e decorazioni di varie epoche.", images: ["img/lotto3a.jpg","img/lotto3b.jpg"], price: "€100", status: "Disponibile" },
  
  { id: 4, title: "Set Veicoli Militari Scala 1:35", description: "Modelli in scala di carri armati, jeep e veicoli da trasporto.", images: ["img/lotto4a.jpg"], price: "€50", status: "Disponibile" },
  
  { id: 5, title: "Caschi Militari Replica", description: "Collezione di repliche di caschi militari.", images: ["img/lotto5a.jpg","img/lotto5b.jpg"], price: "€40", status: "Disponibile" },
  
  { id: 6, title: "Libri e Manuali Storici", description: "Raccolta di libri specialistici e manuali tecnici.", images: ["img/lotto6a.jpg"], price: "€100", status: "Sold out" }

];

// Fascia prezzo
lots.forEach(lot => {
  const value = parseInt(lot.price.replace('€',''));
  lot.priceGroup = [40,50,100].includes(value) ? value : "altro";
  lot.currentImageIndex = 0;
});

// Set selezionati
const selectedLots = new Set();

// CREA CARD CON GALLERIA FOTO E BUTTON ADD
function createProductCard(lot, index) {
  const card = document.createElement('div');
  card.className = 'product-card';

  const isPriceOnRequest = lot.price.toLowerCase().includes('richiesta') || lot.price.toLowerCase().includes('request');
  const isSoldOut = lot.status.toLowerCase() === "sold out";

  card.innerHTML = `
    <div class="image-container">
      <img src="${lot.images[0]}" class="product-image" loading="lazy">
    </div>
    <div class="product-info">
      <h3 class="product-title">${lot.title}</h3>
      <p class="product-description">${lot.description}</p>
      <div class="product-price-container">
        <div class="product-price ${isPriceOnRequest ? 'price-on-request' : ''}">${lot.price}</div>
        <button class="add-lot-btn" ${isSoldOut ? "disabled" : ""}>
          ${isSoldOut ? "Non disponibile" : (selectedLots.has(lot.id) ? "Rimuovi" : "Aggiungi")}
        </button>
        <div class="product-status ${isSoldOut ? 'sold-out' : 'available'}">${lot.status}</div>
      </div>
    </div>
  `;

  // click su card → modale
  card.addEventListener('click', e=>{
    if(!e.target.classList.contains('add-lot-btn')) openModal(index);
  });

  // click sul bottone add (solo se non è sold out)
  const btn = card.querySelector('.add-lot-btn');
  if (!isSoldOut) {
    btn.addEventListener('click', e=>{
      e.stopPropagation();
      toggleLot(lot.id);
      btn.textContent = selectedLots.has(lot.id)?'Rimuovi':'Aggiungi';
    });
  }

  return card;
}

// Toggle selezione lot
function toggleLot(lotId){
  if(selectedLots.has(lotId)) selectedLots.delete(lotId);
  else selectedLots.add(lotId);

  // Aggiorna campo nascosto
  const hiddenInput = document.getElementById("lottiSelezionati");
  hiddenInput.value = Array.from(selectedLots)
    .map(id => {
      const lot = lots.find(l => l.id === id);
      return `${lot.title} (${lot.id})`; // Titolo + ID tra parentesi
    })
    .join("\n");

  // Aggiorna riepilogo visuale (per mostrare in HTML)
  const summary = document.getElementById('selectedLotsSummary');
  summary.innerHTML = hiddenInput.value
    ? "Lotti selezionati:<br>" + hiddenInput.value.replace(/\n/g, "<br>")
    : '';
}

// Visualizza lotti per fascia
function displayLotsByPrice(lotsToDisplay) {
  const container = document.getElementById('products-container');
  container.innerHTML = '';

  const priceGroups = [40,50,100];
  priceGroups.forEach(group => {
    const groupLots = lotsToDisplay.filter(l => l.priceGroup === group);
    if(groupLots.length ===0) return;

    const sectionTitle = document.createElement('h3');
    sectionTitle.textContent = `Lotti da ${group}€`;
    sectionTitle.style.color="#6b7c3a";
    sectionTitle.style.margin="2rem 0 1rem";
    container.appendChild(sectionTitle);

    const grid = document.createElement('div');
    grid.className = 'products-grid';
    groupLots.forEach((lot,index)=> grid.appendChild(createProductCard(lot,index)));
    container.appendChild(grid);
  });
}

// FILTRO
function filterLots() {
  const priceFilter = document.getElementById('priceFilter').value;
  const statusFilter = document.getElementById('statusFilter').value;

  let filteredLots = lots;
  if(priceFilter!=="all") filteredLots = filteredLots.filter(l => l.priceGroup==parseInt(priceFilter));
  if(statusFilter!=="all") filteredLots = filteredLots.filter(l=>{
    const statusClass = l.status.toLowerCase()==='sold out'?'sold-out':'available';
    return statusClass===statusFilter;
  });

  displayLotsByPrice(filteredLots);
}

// MODALE
let currentIndex =0;
const modal = document.getElementById('lotModal');
const modalImage = document.getElementById('modalImage');
const modalTitle = document.getElementById('modalTitle');
const modalDescription = document.getElementById('modalDescription');
const modalPrice = document.getElementById('modalPrice');
const modalStatus = document.getElementById('modalStatus');

function openModal(index){
  currentIndex=index;
  showModal();
  modal.style.display="flex";
}

function showModal(){
  const lot = lots[currentIndex];
  modalImage.src = lot.images[lot.currentImageIndex];
  modalTitle.textContent = lot.title;
  modalDescription.textContent = lot.description;
  modalPrice.textContent = lot.price;
  modalStatus.textContent = lot.status;
  modalStatus.className = 'product-status ' + (lot.status.toLowerCase()==='sold out'?'sold-out':'available');
  
  // Aggiorna bottone Add nella modale
  const modalBtn = document.getElementById('modalAddBtn');
  const isSoldOut = lot.status.toLowerCase() === "sold out";
  
  if (isSoldOut) {
    modalBtn.disabled = true;
    modalBtn.textContent = "Non disponibile";
  } else {
    modalBtn.disabled = false;
    modalBtn.textContent = selectedLots.has(lot.id) ? 'Rimuovi' : 'Aggiungi';
  }
}

function navigateModal(direction){
  if(direction==='next') currentIndex=(currentIndex+1)%lots.length;
  else if(direction==='prev') currentIndex=(currentIndex-1+lots.length)%lots.length;
  showModal();
}

// EVENT LISTENER MODALE
document.querySelector('.close').addEventListener('click', ()=>modal.style.display="none");
document.querySelector('.nav.left').addEventListener('click', ()=>navigateModal('prev'));
document.querySelector('.nav.right').addEventListener('click', ()=>navigateModal('next'));
window.addEventListener('click', e=>{if(e.target===modal) modal.style.display="none";});

// Event listener per il bottone Add nella modale
document.getElementById('modalAddBtn').addEventListener('click', () => {
  const lot = lots[currentIndex];
  toggleLot(lot.id);
  
  // Aggiorna il testo del bottone nella modale
  const modalBtn = document.getElementById('modalAddBtn');
  modalBtn.textContent = selectedLots.has(lot.id) ? 'Rimuovi' : 'Aggiungi';
  
  // Aggiorna anche tutte le card nella griglia
  filterLots();
});

// Event listener per cambiare immagine cliccando sull'immagine nella modale
modalImage.addEventListener('click', () => {
  const lot = lots[currentIndex];
  if (lot.images.length > 1) {
    lot.currentImageIndex = (lot.currentImageIndex + 1) % lot.images.length;
    modalImage.src = lot.images[lot.currentImageIndex];
  }
});

// EVENT LISTENER FILTRO
document.getElementById('priceFilter').addEventListener('change',filterLots);
document.getElementById('statusFilter').addEventListener('change',filterLots);

// INIT
document.addEventListener('DOMContentLoaded',()=>{
  displayLotsByPrice(lots);
});

function openSitowebModal() {
  document.getElementById('sitowebModal').style.display = 'flex';
}

function closeSitowebModal() {
  document.getElementById('sitowebModal').style.display = 'none';
}

// Chiudi cliccando fuori dal contenuto
window.addEventListener('click', function(e) {
  const sitowebModal = document.getElementById('sitowebModal');
  if (e.target === sitowebModal) {
    sitowebModal.style.display = 'none';
  }
});






