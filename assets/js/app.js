
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
    // document.querySelector("#addCardModal input[name=title]").value = "";
    
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
    cloneTemplate.querySelector(".panel").dataset.listId = list.id;
    cloneTemplate.querySelector('input[name="list-id"]').value = list.id;
     // ajout de l'ecouteur du click sur le boutton + pour ajouter une carte
    cloneTemplate.querySelector("a.add-card-icon").addEventListener("click", app.showAddCardModal)
    // ajout de l'ecouteur du doubleClick sur le titre h2 de la liste
    cloneTemplate.querySelector("h2").addEventListener("dblclick",app.showEditListForm);
    //ajout de l'ecouteur du click sur l'icone poubelle 
    cloneTemplate.querySelector(".delete-list-icon").addEventListener("click", app.deleteList);
    // gestion de la soumission du formulaire pour l'édition d'une liste
    cloneTemplate.querySelector('form').addEventListener("submit", app.handleEditlistForm)

      // créer une instance de Sortable et insérer le container panel-block
      const container = cloneTemplate.querySelector(".panel-block");
      new Sortable(container, {
       group: 'list',
       draggable: '.box',
       onEnd: app.onCardDraggable,
      });
 
    
    document.querySelector(".card-lists").append(cloneTemplate);
  },
  onCardDraggable: async function(event) {
    // récuperer la liste d'origine
    const oldList = event.from;
    // récuperer la nvlle liste
    const newList = event.to;
    // récuperer toutes les cartes de la liste d'origine
    let cards = oldList.querySelectorAll('.box');
    await app.moveCards(cards);
    cards = newList.querySelectorAll('.box');
    await app.moveCards(cards);
    
   
  },
  moveCards: async function(cards) {
// boucler sur les cartes pour mettre a jour leur position coté API
    cards.forEach(async (card, index) =>  {
      const id = card.dataset.cardId;
      const listId = card.closest('.panel').dataset.listId; 
      const formData = new FormData();
      formData.set("position", index);
      formData.set("list_id", listId);
      // faire le call API en PATCH pour modifier la position de la carte
      try {    
        await fetch(`${app.base_url}/cards/${id}`, {
        method: 'PATCH', 
        body: formData,
      })
        
      } catch (error) {
        console.error(error);
        alert('impossible de déplacer cette carte');      
      }
    })

  },
  makeCardInDom: (card) => {
     const templateCard = document.getElementById("cardTemplate");
     const cloneTemplateCard = templateCard.content.cloneNode(true);
     //changer le nom de la liste
     cloneTemplateCard.querySelector(".column").textContent = card.content;
     //changer la couleur de fond de la carte
     const cardDom =  cloneTemplateCard.querySelector(".box")

     cardDom.style.backgroundColor = card.color;
     cardDom.dataset.cardId = card.id;
     // modifier l'id de la card du formulaire d'édition
     cardDom.querySelector("input[name='card-id']").value = card.id;
     // on place un ecouteur d'evenement sur le premier a de la div qui possède la class column
     cardDom.querySelector(".edit-card-icon").addEventListener("click", app.showEditCardForm);
     // on place un écouteur d'évenement sur le duxième a de la div qui possède la classe colum
     cardDom.querySelector(".delete-card-icon").addEventListener("click", app.deleteCard);
     // gestion de la soumission du formulaire pour éditer une carte
     cardDom.querySelector("form").addEventListener("submit", app.handleEditCardForm)
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
   
    // on envoie à l'API les infos du formulaire sous forme de FormData
    const response = await fetch(`${app.base_url}/lists`, {
      method: 'POST',
      body: formData
      
    });
    const list = await response.json();
    app.makeListInDom(list);
    app.hideAddListModal();

  },
  handleAddCardForm: async(event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    // const listId = document.querySelector("#addCardModal input[name=list_id]").value;
    const response = await fetch(`${app.base_url}/cards`, {
      method: "POST",
      body: formData
    })
    const card = await response.json();
    app.makeCardInDom(card);
    

    app.hideCardModal();
  

  },
  showEditListForm: async(event) => {
    // on cache le titre
    event.target.classList.add("is-hidden");
    // on affiche le formulaire d'édition
    event.target.nextElementSibling.classList.remove('is-hidden');
    
  },
  showEditCardForm: async(event) => {
    event.target.closest(".columns").querySelector(".column").classList.add("is-hidden");
    event.target.closest(".columns").querySelector("form").classList.remove("is-hidden");
  },
  handleEditlistForm: async(event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    if(!formData.get("name")) return alert("La liste doit avoir un nom !")
    const h2 = event.target.previousElementSibling;
    try {
      await fetch(`${app.base_url}/lists/${formData.get('list-id')}`, {
        method: "PATCH",
        body:formData
      });
      h2.textContent = formData.get('name');
    } catch (error) {
      console.trace(error);
      alert(`La liste n'a pas pu etre modifiée !`)
    }
    event.target.classList.add("is-hidden");
    h2.classList.remove('is-hidden');

  },
  handleEditCardForm: async(event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    if(!formData.get("content")) return alert("Le nom de la carte ne doit pas etre vide!");
    try {
      await fetch(`${app.base_url}/cards/${formData.get("card-id")}`, {
        method: 'PATCH',
        body: formData
      })
     
      event.target.previousElementSibling.innerHTML = formData.get("content");
      event.target.closest(".box").style.backgroundColor = formData.get("color");
  
    } catch (error) {
      console.error(error);
      alert("Impossible de modifier la carte!")
    }
    event.target.previousElementSibling.classList.remove("is-hidden");
    event.target.classList.add("is-hidden");
    
  
  },
  deleteCard: async(event) => {
    const cardId = event.target.closest(".columns").querySelector("input[name='card-id']").value;
    try {
      await fetch(`${app.base_url}/cards/${cardId}`, {
        method: "DELETE",
      })
      event.target.closest(".box").remove();
    } catch (error) {
      console.error(error);
      alert("Impossible de suprimer la carte!");
    }
  },
  deleteList: async(event) => {
    const listId = event.target.closest(".panel").dataset.listId;
    // demander la confirmation à l'utilisateur
    if(!confirm("Voulez vous vraiment supprimer cette liste")) return 
    // il faut vérifier que la liste ne contient aucunes cartes avant de la supprimer
    const cardsInDom = event.target.closest(".panel").querySelector(".box");
    if(cardsInDom)  return alert("Impossible de supprimer cette liste car elle possède des cartes !");
  
    try {
      await fetch(`${app.base_url}/lists/${listId}`, {
        method: "DELETE",
      });
      event.target.closest(".panel").remove();
    } catch (error) {
      console.error(error);
      alert("Impossible de supprimer la liste");
      
    }
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



