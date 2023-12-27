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
