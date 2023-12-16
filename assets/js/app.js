
// on objet qui contient des fonctions
var app = {

  base_url: "http://localhost:3000",
  showAddListModal: () => {
     app.modal = document.getElementById('addListModal');
     app.modal.classList.add('is-active');  
  },
  hideAddListModal: () => {
      app.modal.classList.remove('is-active');

  },
  showAddCardModal: (event) => {
    const input = document.querySelector("#addCardModal input[name=list_id]");
    input.value = event.target.closest(".panel").getAttribute('data-list-id');
    document.getElementById('addCardModal').classList.add('is-active');
    document.querySelector("#addCardModal input[name=title]").value = "";

  },
  hideCardModal: () => {
    document.getElementById('addCardModal').classList.remove('is-active');
  },
  makeListInDom: (list) => {
    
    const template = document.getElementById('listTemplate');
    const cloneTemplate = template.content.cloneNode(true);
    // ici on modifie le titre de la liste
    cloneTemplate.querySelector("h2").textContent = list.name;
    // ici on modifie l'id de la liste
    cloneTemplate.querySelector(".panel").dataset.listId =list.id
     // ajout de l'ecouteur du click sur le boutton + pour ajouter une carte
    cloneTemplate.querySelector("a.is-pulled-right").addEventListener("click", app.showAddCardModal)
    document.querySelector(".card-lists").append(cloneTemplate);
   
    
    // gestion de la soumission du formulaire pour ajouter une carte
     document.querySelector('#addCardModal form').addEventListener('submit', app.handleAddCardForm)
   

  },
  makeCardInDom: (card) => {
     const templateCard = document.getElementById("cardTemplate");
     const cloneTemplateCard = templateCard.content.cloneNode(true);
     cloneTemplateCard.querySelector(".column").textContent = card.content;
     cloneTemplateCard.querySelector(".box").dataset.cardId = card.id;
     document.querySelector(`.panel[data-list-id="${card.list_id}"] .panel-block`).append(cloneTemplateCard);

  },
  
  addListenersToActions: () => {
    // gestion du click sur le bouton pour afficher la modal
    document.getElementById('addListButton').addEventListener('click', app.showAddListModal);
    // gestion du click sur les bouton pour fermer la modal 
    const buttons = document.querySelectorAll(".close");
      for ( const button of buttons ) {
        button.addEventListener('click', app.hideAddListModal);
      };
    // gestion de la soumission du formulaire pour ajouter une liste
    document.querySelector('#addListModal form').addEventListener('submit', app.handleAddListForm)
    // // gestion du click sur le boutton + d'une liste pour ajouter une carte
    // const btsAddCard = document.querySelectorAll('.icon');
    // for(const btn of btsAddCard) {
    //   btn.addEventListener('click', app.showAddCardModal );
    // }
     // gestion du click sur les bouton pour fermer la modal 
     const closeBtnsCardModal = document.querySelectorAll(".close");
     for ( const button of closeBtnsCardModal ) {
       button.addEventListener('click', app.hideCardModal);
     };
    // gestion de la soumission du formulaire pour ajouter une carte
     document.querySelector('#addCardModal form').addEventListener('submit', app.handleAddCardForm)
  }, 
  handleAddListForm: async(event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    app.makeListInDom(formData);
    app.hideAddListModal();

  },
  handleAddCardForm: (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const cardTitle = formData.get("title");
    const listId = document.querySelector("#addCardModal input[name=list_id]").value;
    app.makeCardInDom(cardTitle, listId);
    app.hideCardModal();
  

  },
  getListsFromAPI: async() => {
    try {
      const response = await fetch(`${app.base_url}/lists`);
      console.log(response);
      const lists = await response.json();
      for(const list of lists ) {
        app.makeListInDom(list);
        for(const card of list.cards) {
          app.makeCardInDom(card);
        }
        }
      console.log(lists);
      
    } catch (error) {
      console.error(error);
      
    }
   
  },
  init: function () {
    app.addListenersToActions();
    app.getListsFromAPI();
    
  },

};


// on accroche un écouteur d'évènement sur le document : quand le chargement est terminé, on lance app.init
document.addEventListener('DOMContentLoaded', app.init );