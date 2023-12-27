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
