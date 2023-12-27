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
