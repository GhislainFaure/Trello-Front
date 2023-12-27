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
