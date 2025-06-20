// Remove songs management
class RemoveSongsManager {
  constructor() {
    this.songs = [];
    this.filteredSongs = [];
    this.selectedSongs = new Set();
    this.currentDeletingSongs = [];
    this.init();
  }

  async init() {
    await this.loadSongs();
    this.bindEvents();
    this.setupRealtime();
  }

  bindEvents() {
    // Search functionality
    const searchInput = document.getElementById("adminSearchInput");
    const clearSearch = document.getElementById("clearAdminSearch");

    searchInput.addEventListener("input", (e) => {
      this.filterSongs(e.target.value);
    });

    clearSearch.addEventListener("click", () => {
      searchInput.value = "";
      this.filterSongs("");
    });

    // Bulk actions
    const selectAllBtn = document.getElementById("selectAllBtn");
    const deleteSelectedBtn = document.getElementById("deleteSelectedBtn");

    selectAllBtn.addEventListener("click", () => {
      this.toggleSelectAll();
    });

    deleteSelectedBtn.addEventListener("click", () => {
      this.deleteSelected();
    });

    // Confirmation modal
    const confirmModal = document.getElementById("confirmModal");
    const closeConfirmModal = document.getElementById("closeConfirmModal");
    const cancelDelete = document.getElementById("cancelDelete");
    const confirmDelete = document.getElementById("confirmDelete");

    closeConfirmModal.addEventListener("click", () => {
      this.closeConfirmModal();
    });

    cancelDelete.addEventListener("click", () => {
      this.closeConfirmModal();
    });

    confirmDelete.addEventListener("click", () => {
      this.executeDelete();
    });

    confirmModal.addEventListener("click", (e) => {
      if (e.target === confirmModal) {
        this.closeConfirmModal();
      }
    });

    // Keyboard navigation
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && confirmModal.classList.contains("active")) {
        this.closeConfirmModal();
      }
    });
  }

  setupRealtime() {
    // Subscribe to realtime changes
    supabase
      .channel("songs")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "songs" },
        async () => {
          await this.loadSongs();
          this.filterSongs(document.getElementById("adminSearchInput").value);
        }
      )
      .subscribe();
  }

  async loadSongs() {
    this.showLoading(true);
    try {
      const { data, error } = await supabase
        .from("songs")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      this.songs = data || [];
      this.filteredSongs = [...this.songs];
      this.renderSongs();
      this.updateDisplay();
    } catch (error) {
      console.error("Error loading songs:", error);
      this.showMessage("Failed to load songs", "error");
    } finally {
      this.showLoading(false);
    }
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
          (song.album && song.album.toLowerCase().includes(searchTerm))
      );
    }

    this.selectedSongs.clear();
    this.renderSongs();
    this.updateDisplay();
  }

  renderSongs() {
    const grid = document.getElementById("managementGrid");

    if (this.filteredSongs.length === 0) {
      grid.innerHTML = this.getEmptyState();
      return;
    }

    grid.innerHTML = this.filteredSongs
      .map((song) => this.createSongManagementCard(song))
      .join("");

    // Bind events to checkboxes and delete buttons
    this.bindCardEvents();
  }

  createSongManagementCard(song) {
    const isSelected = this.selectedSongs.has(song.id);
    const lyricsPreview = this.truncateText(song.lyrics, 80);

    return `
            <div class="management-card" data-song-id="${song.id}">
                <div class="card-header">
                    <div class="checkbox-container">
                        <input type="checkbox" 
                               id="song-${song.id}" 
                               class="song-checkbox" 
                               ${isSelected ? "checked" : ""}>
                        <label for="song-${
                          song.id
                        }" class="checkbox-label"></label>
                    </div>
                    <button class="delete-single-btn" data-song-id="${
                      song.id
                    }" title="Delete this song">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
                <div class="card-content">
                    <h4>${this.escapeHtml(song.title)}</h4>
                    <p class="artist">by ${this.escapeHtml(song.artist)}</p>
                    ${
                      song.album
                        ? `<p class="album">${this.escapeHtml(song.album)}</p>`
                        : ""
                    }
                    <div class="lyrics-preview">${this.escapeHtml(
                      lyricsPreview
                    )}...</div>
                    <div class="song-meta">
                        <span class="created-date">
                            <i class="fas fa-calendar"></i>
                            ${this.formatDate(song.created_at)}
                        </span>
                    </div>
                </div>
            </div>
        `;
  }

  bindCardEvents() {
    // Checkbox events
    document.querySelectorAll(".song-checkbox").forEach((checkbox) => {
      checkbox.addEventListener("change", (e) => {
        const songId = e.target.id.replace("song-", "");
        this.toggleSongSelection(songId);
      });
    });

    // Single delete button events
    document.querySelectorAll(".delete-single-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const songId = btn.dataset.songId;
        this.deleteSingleSong(songId);
      });
    });
  }

  toggleSongSelection(songId) {
    if (this.selectedSongs.has(songId)) {
      this.selectedSongs.delete(songId);
    } else {
      this.selectedSongs.add(songId);
    }
    this.updateSelectedCount();
  }

  toggleSelectAll() {
    const allSelected = this.selectedSongs.size === this.filteredSongs.length;

    if (allSelected) {
      this.selectedSongs.clear();
    } else {
      this.filteredSongs.forEach((song) => {
        this.selectedSongs.add(song.id);
      });
    }

    this.renderSongs();
    this.updateSelectedCount();
  }

  updateSelectedCount() {
    const count = this.selectedSongs.size;
    document.getElementById("selectedCount").textContent = count;
    document.getElementById("deleteSelectedBtn").disabled = count === 0;

    const selectAllBtn = document.getElementById("selectAllBtn");
    const allSelected =
      count === this.filteredSongs.length && this.filteredSongs.length > 0;
    selectAllBtn.innerHTML = allSelected
      ? '<i class="fas fa-square"></i> Deselect All'
      : '<i class="fas fa-check-square"></i> Select All';
  }

  deleteSingleSong(songId) {
    const song = this.songs.find((s) => s.id === songId);
    if (!song) return;

    this.currentDeletingSongs = [song];
    this.showConfirmModal(`"${song.title}" by ${song.artist}`, 1);
  }

  deleteSelected() {
    if (this.selectedSongs.size === 0) return;

    // Map selected IDs to actual song objects
    this.currentDeletingSongs = this.songs.filter((song) =>
      this.selectedSongs.has(song.id)
    );

    const count = this.selectedSongs.size;
    const songText = count === 1 ? `${count} song` : `${count} songs`;

    this.showConfirmModal(songText, count);
  }

  showConfirmModal(songText, count) {
    const modal = document.getElementById("confirmModal");
    const title = document.getElementById("confirmTitle");
    const message = document.getElementById("confirmMessage");

    title.textContent = count === 1 ? "Delete Song?" : "Delete Songs?";
    message.textContent =
      count === 1
        ? `Are you sure you want to delete ${songText}?`
        : `Are you sure you want to delete ${songText}?`;

    modal.classList.add("active");
    document.body.style.overflow = "hidden";
  }

  closeConfirmModal() {
    const modal = document.getElementById("confirmModal");
    modal.classList.remove("active");
    document.body.style.overflow = "";
    this.currentDeletingSongs = [];
  }

  async executeDelete() {
    this.showLoading(true);
    this.closeConfirmModal();

    try {
      const { error } = await supabase
        .from("songs")
        .delete()
        .in(
          "id",
          this.currentDeletingSongs.map((song) => song.id)
        );

      if (error) throw error;

      const count = this.currentDeletingSongs.length;
      this.showMessage(
        `Successfully deleted ${count} song${count !== 1 ? "s" : ""}`,
        "success"
      );

      // Clear selections and reload
      this.selectedSongs.clear();
      await this.loadSongs();
      this.updateDisplay();
    } catch (error) {
      console.error("Error deleting songs:", error);
      this.showMessage("Failed to delete songs. Please try again.", "error");
    } finally {
      this.showLoading(false);
      this.currentDeletingSongs = [];
    }
  }

  updateDisplay() {
    const countDisplay = document.getElementById("songsCountDisplay");
    const total = this.songs.length;
    const filtered = this.filteredSongs.length;

    if (total === 0) {
      countDisplay.textContent = "No songs to manage";
    } else if (total === filtered) {
      countDisplay.textContent = `${total} song${
        total !== 1 ? "s" : ""
      } available`;
    } else {
      countDisplay.textContent = `${filtered} of ${total} song${
        total !== 1 ? "s" : ""
      }`;
    }

    this.updateSelectedCount();
  }

  getEmptyState() {
    const searchTerm = document.getElementById("adminSearchInput").value;

    if (searchTerm) {
      return `
                <div class="empty-state">
                    <i class="fas fa-search"></i>
                    <h3>No songs found</h3>
                    <p>No songs match "${this.escapeHtml(searchTerm)}"</p>
                    <button onclick="document.getElementById('adminSearchInput').value = ''; removeSongsManager.filterSongs('')" class="btn btn-secondary">Clear Search</button>
                </div>
            `;
    }

    if (this.songs.length === 0) {
      return `
                <div class="empty-state">
                    <i class="fas fa-music"></i>
                    <h3>No songs to remove</h3>
                    <p>Add some songs first to manage them here</p>
                    <a href="add.html" class="btn btn-primary">Add Songs</a>
                </div>
            `;
    }

    return `
            <div class="empty-state">
                <i class="fas fa-filter"></i>
                <h3>No songs match your search</h3>
                <p>Try a different search term</p>
            </div>
        `;
  }

  showLoading(show) {
    const spinner = document.getElementById("loadingSpinner");
    if (show) {
      spinner.classList.add("active");
    } else {
      spinner.classList.remove("active");
    }
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

  truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength).trim();
  }

  escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }
}

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  window.removeSongsManager = new RemoveSongsManager();
});
