(() => {
  "use strict";

  const token = window.location.pathname.split("/").filter(Boolean).pop() || "";
  const form = document.querySelector("#portal-form");
  const nameInput = document.querySelector("#player-name");
  const birthDateInput = document.querySelector("#birth-date");
  const suggestions = document.querySelector("#player-suggestions");
  const status = document.querySelector("#portal-status");
  const results = document.querySelector("#portal-results");
  const submitButton = document.querySelector("#portal-submit");
  let searchTimer;
  let searchController;

  async function applyBranding() {
    try {
      const response = await fetch("/api/branding", { headers: { Accept: "application/json" } });
      if (!response.ok) throw new Error("Branding aplikasi tidak dapat dimuat.");
      const payload = await response.json();
      const branding = payload.branding || {};
      if (branding.appName) document.querySelector(".portal-brand strong").textContent = branding.appName;
      if (branding.appSubtitle) document.querySelector(".portal-brand small").textContent = branding.appSubtitle;
      if (branding.tabTitle) document.title = branding.tabTitle;
      if (branding.favicon) {
        const favicon = document.querySelector('link[rel="icon"]');
        favicon.href = branding.favicon;
        favicon.type = branding.favicon.slice(5, branding.favicon.indexOf(";"));
      }
    } catch (error) {
      console.error("Identitas portal tidak dapat diselaraskan.", error);
    }
  }

  function showStatus(message, isError) {
    status.textContent = message;
    status.classList.toggle("is-error", Boolean(isError));
    status.hidden = !message;
  }

  function hideSuggestions() {
    suggestions.replaceChildren();
    suggestions.hidden = true;
    nameInput.setAttribute("aria-expanded", "false");
  }

  function selectName(name) {
    nameInput.value = name;
    hideSuggestions();
    nameInput.focus();
  }

  function showSuggestions(names) {
    suggestions.replaceChildren();
    if (!names.length) {
      hideSuggestions();
      return;
    }
    names.forEach(name => {
      const option = document.createElement("button");
      option.type = "button";
      option.className = "portal-suggestion";
      option.setAttribute("role", "option");
      option.textContent = name;
      option.addEventListener("pointerdown", event => event.preventDefault());
      option.addEventListener("click", () => selectName(name));
      suggestions.append(option);
    });
    suggestions.hidden = false;
    nameInput.setAttribute("aria-expanded", "true");
  }

  async function findNames(query, controller) {
    try {
      const response = await fetch(`/api/public-portal/${encodeURIComponent(token)}/search?q=${encodeURIComponent(query)}`, {
        signal: controller.signal,
        headers: { Accept: "application/json" }
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Pencarian pemain gagal.");
      if (nameInput.value.trim() === query) showSuggestions(payload.names || []);
    } catch (error) {
      if (error.name !== "AbortError") {
        hideSuggestions();
        showStatus(error.message || "Pencarian pemain gagal.", true);
      }
    }
  }

  nameInput.addEventListener("input", () => {
    const query = nameInput.value.trim();
    hideSuggestions();
    results.hidden = true;
    showStatus("", false);
    window.clearTimeout(searchTimer);
    if (searchController) searchController.abort();
    if (query.length < 3) return;
    searchTimer = window.setTimeout(() => {
      searchController = new AbortController();
      findNames(query, searchController);
    }, 250);
  });

  nameInput.addEventListener("keydown", event => {
    if (event.key === "Escape") hideSuggestions();
    if (event.key === "Enter" && !suggestions.hidden) {
      const firstOption = suggestions.querySelector(".portal-suggestion");
      if (firstOption) {
        event.preventDefault();
        selectName(firstOption.textContent);
      }
    }
  });

  document.addEventListener("click", event => {
    if (!suggestions.contains(event.target) && event.target !== nameInput) hideSuggestions();
  });

  function formatDate(value) {
    const date = new Date(`${value}T00:00:00`);
    return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString("id-ID", {
      day: "numeric", month: "short", year: "numeric"
    });
  }

  function renderStatistics(payload) {
    document.querySelector("#result-name").textContent = payload.player.name;
    document.querySelector("#result-position").textContent = payload.player.position || "Pemain";
    const totals = document.querySelector("#result-totals");
    totals.replaceChildren();
    payload.totals.forEach(item => {
      const card = document.createElement("article");
      card.className = "portal-total-card";
      const label = document.createElement("span");
      label.textContent = item.name;
      const value = document.createElement("strong");
      value.textContent = String(item.success);
      const detail = document.createElement("small");
      detail.textContent = `${item.errors} gagal`;
      card.append(label, value, detail);
      totals.append(card);
    });
    const body = document.querySelector("#result-matches");
    body.replaceChildren();
    if (!payload.matches.length) {
      const row = document.createElement("tr");
      const cell = document.createElement("td");
      cell.colSpan = 5;
      cell.className = "empty";
      cell.textContent = "Belum ada statistik pertandingan.";
      row.append(cell);
      body.append(row);
    } else {
      payload.matches.forEach(match => {
        match.techniques.forEach((technique, index) => {
          const row = document.createElement("tr");
          const matchCell = document.createElement("td");
          const matchName = document.createElement("strong");
          matchName.textContent = match.name || "Pertandingan";
          if (match.opponent) {
            const opponent = document.createElement("span");
            opponent.className = "portal-opponent";
            opponent.textContent = `vs ${match.opponent}`;
            matchCell.append(matchName, opponent);
          } else {
            matchCell.append(matchName);
          }
          const dateCell = document.createElement("td");
          dateCell.textContent = formatDate(match.date);
          if (index > 0) {
            matchCell.textContent = "";
            dateCell.textContent = "";
          }
          const techniqueCell = document.createElement("td");
          techniqueCell.textContent = technique.name;
          const successCell = document.createElement("td");
          successCell.textContent = String(technique.success);
          const errorsCell = document.createElement("td");
          errorsCell.textContent = String(technique.errors);
          row.append(matchCell, dateCell, techniqueCell, successCell, errorsCell);
          body.append(row);
        });
      });
    }
    results.hidden = false;
  }

  form.addEventListener("submit", async event => {
    event.preventDefault();
    hideSuggestions();
    results.hidden = true;
    showStatus("", false);
    const name = nameInput.value.trim();
    const birthDate = birthDateInput.value;
    if (!name || !birthDate) {
      showStatus("Isi nama pemain dan tanggal lahir terlebih dahulu.", true);
      return;
    }
    submitButton.disabled = true;
    submitButton.textContent = "Memeriksa...";
    try {
      const response = await fetch(`/api/public-portal/${encodeURIComponent(token)}/statistics`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ name, birthDate })
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Statistik tidak dapat ditampilkan.");
      renderStatistics(payload);
    } catch (error) {
      showStatus(error.message || "Statistik tidak dapat ditampilkan.", true);
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = "Lihat statistik";
    }
  });

  applyBranding();
})();
