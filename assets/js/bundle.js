(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
const cardModule = require("./cardModule");
const listModule = require("./listModule");
const tagModule = require("./tagModule");
const utilsModule = require("./utilsModule");

// on objet qui contient des fonctions
var app = {
  addListenersToActions: () => {
    // gestion du click sur le bouton pour afficher la modal
    document
      .getElementById("addListButton")
      .addEventListener("click", listModule.showAddListModal);
    // gestion du click sur les bouton pour fermer la modal
    const buttons = document.querySelectorAll(".close");
    for (const button of buttons) {
      button.addEventListener("click", utilsModule.hideModal);
    }

    // gestion de la soumission du formulaire pour ajouter une liste
    document
      .querySelector("#addListModal form")
      .addEventListener("submit", listModule.handleAddListForm);
    // // gestion du click sur le boutton + d'une liste pour ajouter une carte
    // const btsAddCard = document.querySelectorAll('.icon');
    // for(const btn of btsAddCard) {
    //   btn.addEventListener('click', app.showAddCardModal );
    // }
    // gestion du click sur les bouton pour fermer la modal
    const closeBtnsCardModal = document.querySelectorAll(".close");
    for (const button of closeBtnsCardModal) {
      button.addEventListener("click", cardModule.hideCardModal);
    }
    // gestion de la soumission du formulaire pour ajouter une carte
    document
      .querySelector("#addCardModal form")
      .addEventListener("submit", cardModule.handleAddCardForm);

    // gestion de la soumission du formulaire pour ajouter un tag à une carte
    document
      .querySelector("#addTagModal form")
      .addEventListener("submit", tagModule.associateTagToCard);
  },
  getListsFromAPI: async () => {
    try {
      const response = await fetch(`${utilsModule.base_url}/lists`);
      const lists = await response.json();
      for (const list of lists) {
        listModule.makeListInDom(list);
        for (const card of list.cards) {
          cardModule.makeCardInDom(card);
          for (const tag of card.tags) {
            tagModule.makeTagInDom(tag);
          }
        }
      }
    } catch (error) {
      console.error(error);
    }
  },
  // fonction d'initialisation lancée au chargement de la page
  init: function () {
    app.addListenersToActions();
    app.getListsFromAPI();
    tagModule.fillSelectTagModal();
  },
};
// on accroche un écouteur d'évènement sur le document : quand le chargement est terminé, on lance app.init
document.addEventListener("DOMContentLoaded", app.init);

},{"./cardModule":2,"./listModule":3,"./tagModule":4,"./utilsModule":5}],2:[function(require,module,exports){
const tagModule = require("./tagModule");
const utilsModule = require("./utilsModule");
const cardModule = {
  showAddCardModal: (event) => {
    const input = document.querySelector("#addCardModal input[name=list_id]");
    input.value = event.target.closest(".panel").getAttribute("data-list-id");
    document.getElementById("addCardModal").classList.add("is-active");
    // document.querySelector("#addCardModal input[name=title]").value = "";
  },
  onCardDraggable: async function (event) {
    // récuperer la liste d'origine
    const oldList = event.from;
    // récuperer la nvlle liste
    const newList = event.to;
    // récuperer toutes les cartes de la liste d'origine
    let cards = oldList.querySelectorAll(".box");
    await cardModule.moveCards(cards);
    cards = newList.querySelectorAll(".box");
    await cardModule.moveCards(cards);
  },
  moveCards: async function (cards) {
    // boucler sur les cartes pour mettre a jour leur position coté API
    cards.forEach(async (card, index) => {
      const id = card.dataset.cardId;
      const listId = card.closest(".panel").dataset.listId;
      const formData = new FormData();
      formData.set("position", index);
      formData.set("list_id", listId);
      // faire le call API en PATCH pour modifier la position de la carte
      try {
        await fetch(`${utilsModule.base_url}/cards/${id}`, {
          method: "PATCH",
          body: formData,
        });
      } catch (error) {
        console.error(error);
        alert("impossible de déplacer cette carte");
      }
    });
  },
  handleAddCardForm: async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    // const listId = document.querySelector("#addCardModal input[name=list_id]").value;
    const response = await fetch(`${utilsModule.base_url}/cards`, {
      method: "POST",
      body: formData,
    });
    const card = await response.json();
    cardModule.makeCardInDom(card);

    cardModule.hideCardModal();
  },
  makeCardInDom: (card) => {
    const templateCard = document.getElementById("cardTemplate");
    const cloneTemplateCard = templateCard.content.cloneNode(true);
    //changer le nom de la liste
    cloneTemplateCard.querySelector(".column").textContent = card.content;
    //changer la couleur de fond de la carte
    const cardDom = cloneTemplateCard.querySelector(".box");

    cardDom.style.backgroundColor = card.color;
    cardDom.dataset.cardId = card.id;
    // modifier l'id de la card du formulaire d'édition
    cardDom.querySelector("input[name='card-id']").value = card.id;
    // on place un ecouteur d'evenement sur le premier a de la div qui possède la class column
    cardDom
      .querySelector(".add-tag-icon")
      .addEventListener("click", tagModule.showAddTagModal);
    // on place un écouteur d'évenement sur le deuxième a de la div qui possède la classe colum
    cardDom
      .querySelector(".edit-card-icon")
      .addEventListener("click", cardModule.showEditCardForm);
    // on place un écouteur d'évenement sur le troisième a de la div qui possède la classe colum
    cardDom
      .querySelector(".delete-card-icon")
      .addEventListener("click", cardModule.deleteCard);
    // gestion de la soumission du formulaire pour éditer une carte
    cardDom
      .querySelector("form")
      .addEventListener("submit", cardModule.handleEditCardForm);
    document
      .querySelector(`.panel[data-list-id="${card.list_id}"] .panel-block`)
      .append(cloneTemplateCard);
  },
  showEditCardForm: (event) => {
    event.target
      .closest(".columns")
      .querySelector(".column")
      .classList.add("is-hidden");
    event.target
      .closest(".columns")
      .querySelector("form")
      .classList.remove("is-hidden");
  },
  handleEditCardForm: async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    if (!formData.get("content"))
      return alert("Le nom de la carte ne doit pas etre vide!");
    try {
      await fetch(`${utilsModule.base_url}/cards/${formData.get("card-id")}`, {
        method: "PATCH",
        body: formData,
      });

      event.target.previousElementSibling.innerHTML = formData.get("content");
      event.target.closest(".box").style.backgroundColor =
        formData.get("color");
    } catch (error) {
      console.error(error);
      alert("Impossible de modifier la carte!");
    }
    event.target.previousElementSibling.classList.remove("is-hidden");
    event.target.classList.add("is-hidden");
  },
  deleteCard: async (event) => {
    const cardId = event.target
      .closest(".columns")
      .querySelector("input[name='card-id']").value;
    try {
      await fetch(`${utilsModule.base_url}/cards/${cardId}`, {
        method: "DELETE",
      });
      event.target.closest(".box").remove();
    } catch (error) {
      console.error(error);
      alert("Impossible de suprimer la carte!");
    }
  },
  hideCardModal: () => {
    document.getElementById("addCardModal").classList.remove("is-active");
  },
};

module.exports = cardModule;

},{"./tagModule":4,"./utilsModule":5}],3:[function(require,module,exports){
const utilsModule = require("./utilsModule");
const cardModule = require("./utilsModule");

const listModule = {
  showAddListModal: () => {
    listModule.modal = document.getElementById("addListModal");
    listModule.modal.classList.add("is-active");
  },
  handleAddListForm: async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);

    // on envoie à l'API les infos du formulaire sous forme de FormData
    const response = await fetch(`${utilsModule.base_url}/lists`, {
      method: "POST",
      body: formData,
    });
    const list = await response.json();
    listModule.makeListInDom(list);
    utilsModule.hideModal();
  },
  makeListInDom: (list) => {
    const template = document.getElementById("listTemplate");
    const cloneTemplate = template.content.cloneNode(true);
    // ici on modifie le titre de la liste
    cloneTemplate.querySelector("h2").textContent = list.name;
    // ici on modifie l'id de la liste
    cloneTemplate.querySelector(".panel").dataset.listId = list.id;
    cloneTemplate.querySelector('input[name="list-id"]').value = list.id;
    // ajout de l'ecouteur du click sur le boutton + pour ajouter une carte
    cloneTemplate
      .querySelector("a.add-card-icon")
      .addEventListener("click", cardModule.showAddCardModal);
    // ajout de l'ecouteur du doubleClick sur le titre h2 de la liste
    cloneTemplate
      .querySelector("h2")
      .addEventListener("dblclick", listModule.showEditListForm);
    //ajout de l'ecouteur du click sur l'icone poubelle
    cloneTemplate
      .querySelector(".delete-list-icon")
      .addEventListener("click", listModule.deleteList);
    // gestion de la soumission du formulaire pour l'édition d'une liste
    cloneTemplate
      .querySelector("form")
      .addEventListener("submit", listModule.handleEditlistForm);

    // créer une instance de Sortable et insérer le container panel-block
    const container = cloneTemplate.querySelector(".panel-block");
    new Sortable(container, {
      group: "list",
      draggable: ".box",
      onEnd: cardModule.onCardDraggable,
    });

    document.querySelector(".card-lists").append(cloneTemplate);
  },
  showEditListForm: async (event) => {
    // on cache le titre
    event.target.classList.add("is-hidden");
    // on affiche le formulaire d'édition
    event.target.nextElementSibling.classList.remove("is-hidden");
  },
  handleEditlistForm: async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    if (!formData.get("name")) return alert("La liste doit avoir un nom !");
    const h2 = event.target.previousElementSibling;
    try {
      await fetch(`${utilsModule.base_url}/lists/${formData.get("list-id")}`, {
        method: "PATCH",
        body: formData,
      });
      h2.textContent = formData.get("name");
    } catch (error) {
      console.trace(error);
      alert(`La liste n'a pas pu etre modifiée !`);
    }
    event.target.classList.add("is-hidden");
    h2.classList.remove("is-hidden");
  },
  deleteList: async (event) => {
    const listId = event.target.closest(".panel").dataset.listId;
    // demander la confirmation à l'utilisateur
    if (!confirm("Voulez vous vraiment supprimer cette liste")) return;
    // il faut vérifier que la liste ne contient aucunes cartes avant de la supprimer
    const cardsInDom = event.target.closest(".panel").querySelector(".box");
    if (cardsInDom)
      return alert(
        "Impossible de supprimer cette liste car elle possède des cartes !"
      );

    try {
      await fetch(`${utilsModule.base_url}/lists/${listId}`, {
        method: "DELETE",
      });
      event.target.closest(".panel").remove();
    } catch (error) {
      console.error(error);
      alert("Impossible de supprimer la liste");
    }
  },
};

module.exports = listModule;

},{"./utilsModule":5}],4:[function(require,module,exports){
const utilsModule = require("./utilsModule");

const tagModule = {
  fillSelectTagModal: async () => {
    // faire un call API en Get pour récuperer tous les tags
    try {
      const response = await fetch(`${utilsModule.base_url}/tags`);
      const tags = await response.json();

      // remplir le select de la modale Tag avec les tags
      const select = document.querySelector("select");
      for (const tag of tags) {
        const option = document.createElement("option");
        // changer le texte de la balise option
        option.textContent = tag.name;
        // changer la valeur de la balise option
        option.value = tag.id;
        select.append(option);
      }
    } catch (error) {
      console.trace(error);
      alert("Impossible de récuperer les tags! ");
    }
  },
  showAddTagModal: (event) => {
    // modifier card_id de l'input caché du form dans le addTagmodal après avoir récuperer le data-card_id dans la bonne carte
    const cardId = event.target.closest(".box").dataset.cardId;
    document
      .querySelector('#addTagModal input[type="hidden"]')
      .setAttribute("value", cardId);
    document.querySelector("#addTagModal").classList.add("is-active");
  },
  makeTagInDom: (tag) => {
    // on crée un span en html
    const span = document.createElement("span");
    // on attache la class tag de Bulma au span
    span.classList.add("tag");

    // on modifie son texte avec le nom du tag
    span.textContent = tag.name;
    // on change la couleur du tag
    span.style.backgroundColor = tag.color;
    // on lui donne un data attribute id
    span.dataset.tagId = tag.id;
    // on attache un écouteur d'événement dblclick sur l'élement span pour dissocier le tag de la carte
    span.addEventListener("dblclick", tagModule.dissociateTagFromCard);

    // on insère le span dans le DOM (dans la carte adéquate  )
    document
      .querySelector(`.box[data-card-id="${tag.card_has_tag.card_id}"] .tags`)
      .append(span);
  },
  associateTagToCard: async (event) => {
    event.preventDefault();
    // récuperer les informations du formulaire
    const formData = new FormData(event.target);
    const cardId = formData.get("card_id");
    try {
      const response = await fetch(
        `${utilsModule.base_url}/cards/${cardId}/tags`,
        {
          method: "POST",
          body: formData,
        }
      );
      const card = await response.json();
      // inserer le tag dans la bonne card
      // card.tags => chopper le bon tag selon son identifiant
      const tag = card.tags.find((tag) => tag.id == formData.get("tag_id"));
      // insérer le tag dans la bonne card
      tagModule.makeTagInDom(tag);
      utilsModule.hideModal();
    } catch (error) {
      console.error(error);
      alert(`Impossible d'associer ce tag à cette carte`);
    }
  },
  dissociateTagFromCard: async (event) => {
    // récuperer l'id du tag
    const tagId = event.target.dataset.tagId;
    // récuperer l'id de la carte
    const cardId = event.target.closest(".box").dataset.cardId;
    // "/cards/:cardId/tags/:tagId"
    // faire un call API en DELETE
    // const formData = new FormData();
    // formData.set('tag_id'= tagId)

    try {
      await fetch(`${utilsModule.base_url}/cards/${cardId}/tags/${tagId}`, {
        method: "DELETE",
      });
      event.target.remove();
    } catch (error) {
      console.error(error);
      alert("Impossible de dissocier le tag de la carte ! ");
    }
  },
};

module.exports = tagModule;

},{"./utilsModule":5}],5:[function(require,module,exports){
const utilsModule = {
  base_url: "http://localhost:3000",
  hideModal: () => {
    const modals = document.querySelectorAll(".modal");
    for (const modal of modals) {
      modal.classList.remove("is-active");
    }
  },
};

module.exports = utilsModule;

},{}]},{},[1]);
