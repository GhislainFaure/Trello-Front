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
