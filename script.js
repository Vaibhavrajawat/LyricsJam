// Song Management System
class SongManager {
  constructor() {
    this.songs = this.loadSongs();
    this.currentSong = null;
    this.filteredSongs = [...this.songs];
    this.init();
  }

  init() {
    this.bindEvents();
    this.renderSongs();
    this.updateSongCount();
  }

  bindEvents() {
    // Search functionality
    const searchInput = document.getElementById("searchInput");
    const clearSearch = document.getElementById("clearSearch");

    searchInput.addEventListener("input", (e) => {
      this.filterSongs(e.target.value);
    });

    clearSearch.addEventListener("click", () => {
      searchInput.value = "";
      this.filterSongs("");
    });

    // Modal controls
    const modal = document.getElementById("lyricsModal");
    const closeModal = document.getElementById("closeModal");

    closeModal.addEventListener("click", () => {
      this.closeModal();
    });

    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        this.closeModal();
      }
    });

    // Keyboard navigation
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && modal.classList.contains("active")) {
        this.closeModal();
      }
    });
  }

  loadSongs() {
    const stored = localStorage.getItem("jamlyrics-songs");
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error("Error loading songs from localStorage:", e);
        return [];
      }
    }
    return [];
  }

  saveSongs() {
    try {
      localStorage.setItem("jamlyrics-songs", JSON.stringify(this.songs));
    } catch (e) {
      console.error("Error saving songs to localStorage:", e);
      this.showMessage("Error saving songs", "error");
    }
  }

  addSong(song) {
    song.id = this.generateId();
    song.createdAt = new Date().toISOString();
    this.songs.unshift(song);
    this.saveSongs();
    this.filterSongs(document.getElementById("searchInput").value);
    this.updateSongCount();
  }

  deleteSongById(id) {
    this.songs = this.songs.filter((song) => song.id !== id);
    this.saveSongs();
    this.filterSongs(document.getElementById("searchInput").value);
    this.updateSongCount();
    this.showMessage("Song deleted successfully", "success");
  }

  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  filterSongs(query) {
    const searchTerm = query.toLowerCase().trim();

    if (searchTerm === "") {
      this.filteredSongs = [...this.songs];
    } else {
      this.filteredSongs = this.songs.filter(
        (song) =>
          song.title.toLowerCase().includes(searchTerm) ||
          song.artist.toLowerCase().includes(searchTerm) ||
          (song.album && song.album.toLowerCase().includes(searchTerm)) ||
          song.lyrics.toLowerCase().includes(searchTerm)
      );
    }

    this.renderSongs();
    this.updateSongCount();
  }

  renderSongs() {
    const grid = document.getElementById("songsGrid");

    if (this.filteredSongs.length === 0) {
      grid.innerHTML = this.getEmptyState();
      return;
    }

    grid.innerHTML = this.filteredSongs
      .map((song) => this.createSongCard(song))
      .join("");

    // Bind click events to song cards
    grid.querySelectorAll(".song-card").forEach((card, index) => {
      card.addEventListener("click", () => {
        this.openModal(this.filteredSongs[index]);
      });
    });
  }

  createSongCard(song) {
    const lyricsPreview = this.truncateText(song.lyrics, 100);

    return `
            <div class="song-card" data-song-id="${song.id}">
                <h3>${this.escapeHtml(song.title)}</h3>
                <p class="artist">by ${this.escapeHtml(song.artist)}</p>
                ${
                  song.album
                    ? `<p class="album">${this.escapeHtml(song.album)}</p>`
                    : ""
                }
                <div class="lyrics-preview">${this.escapeHtml(
                  lyricsPreview
                )}...</div>
            </div>
        `;
  }

  getEmptyState() {
    const searchTerm = document.getElementById("searchInput").value;

    if (searchTerm) {
      return `
            <div class="empty-state">
                <i class="fas fa-search"></i>
                <h3>No songs found</h3>
                <p>No songs match "${this.escapeHtml(searchTerm)}"</p>
                <button onclick="document.getElementById('searchInput').value = ''; songManager.filterSongs('')" class="btn btn-secondary">Clear Search</button>
            </div>
        `;
    }

    return `
        <div class="empty-state">
            <i class="fas fa-music"></i>
            <h3>No songs available</h3>
            <p>Songs will appear here when they're added by the organizer</p>
        </div>
    `;
  }

  openModal(song) {
    this.currentSong = song;

    document.getElementById("modalSongTitle").textContent = song.title;
    document.getElementById("modalArtist").textContent = `by ${song.artist}${
      song.album ? ` • ${song.album}` : ""
    }`;
    document.getElementById("modalLyrics").textContent = song.lyrics;

    const modal = document.getElementById("lyricsModal");
    modal.classList.add("active");
    document.body.style.overflow = "hidden";
  }

  closeModal() {
    const modal = document.getElementById("lyricsModal");
    modal.classList.remove("active");
    document.body.style.overflow = "";
    this.currentSong = null;
  }

  updateSongCount() {
    const countElement = document.getElementById("songCount");
    const total = this.songs.length;
    const filtered = this.filteredSongs.length;

    if (total === filtered) {
      countElement.textContent = `${total} song${total !== 1 ? "s" : ""}`;
    } else {
      countElement.textContent = `${filtered} of ${total} song${
        total !== 1 ? "s" : ""
      }`;
    }
  }

  truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength).trim();
  }

  escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  showMessage(message, type = "success") {
    const container =
      document.getElementById("messageContainer") ||
      this.createMessageContainer();

    const messageEl = document.createElement("div");
    messageEl.className = `message ${type}`;
    messageEl.textContent = message;

    container.appendChild(messageEl);

    // Trigger animation
    setTimeout(() => messageEl.classList.add("show"), 100);

    // Auto remove
    setTimeout(() => {
      messageEl.classList.remove("show");
      setTimeout(() => {
        if (messageEl.parentNode) {
          messageEl.parentNode.removeChild(messageEl);
        }
      }, 300);
    }, 3000);
  }

  createMessageContainer() {
    const container = document.createElement("div");
    container.id = "messageContainer";
    container.className = "message-container";
    document.body.appendChild(container);
    return container;
  }
}

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  window.songManager = new SongManager();
});

// Handle routing for add page
if (
  window.location.pathname === "/add" ||
  window.location.pathname.includes("add.html")
) {
  // This page should load add-script.js instead
  console.log("Add page detected - should load add-script.js");
}
