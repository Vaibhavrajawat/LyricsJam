// Main song display and management
class SongManager {
  constructor() {
    this.songs = [];
    this.filteredSongs = [];
    // Small delay to ensure supabase is initialized
    setTimeout(() => this.init(), 100);
  }

  async init() {
    // Check if supabase is available
    if (typeof supabase === "undefined" || !supabase) {
      console.error("Supabase client not initialized");
      this.showError("Database connection failed");
      return;
    }
    console.log("Supabase client ready:", supabase);

    await this.loadSongs();
    this.bindEvents();
    this.setupRealtime();
  }

  bindEvents() {
    const searchInput = document.getElementById("searchInput");
    const clearSearch = document.getElementById("clearSearch");
    const modal = document.getElementById("lyricsModal");
    const closeModal = document.getElementById("closeModal");

    searchInput.addEventListener("input", (e) =>
      this.filterSongs(e.target.value)
    );
    clearSearch.addEventListener("click", () => {
      searchInput.value = "";
      this.filterSongs("");
    });

    closeModal.addEventListener("click", () => this.closeModal());
    modal.addEventListener("click", (e) => {
      if (e.target === modal) this.closeModal();
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && modal.classList.contains("active")) {
        this.closeModal();
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
          this.filterSongs(document.getElementById("searchInput").value);
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
      this.updateSongCount();
    } catch (error) {
      console.error("Error loading songs:", error);
      this.showError("Failed to load songs");
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

    // Add click listeners to cards
    document.querySelectorAll(".song-card").forEach((card) => {
      card.addEventListener("click", () => {
        const songId = card.dataset.songId;
        const song = this.songs.find((s) => s.id === songId);
        if (song) this.showLyrics(song);
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
        <div class="lyrics-preview">${this.escapeHtml(lyricsPreview)}...</div>
      </div>
    `;
  }

  showLyrics(song) {
    const modal = document.getElementById("lyricsModal");
    const title = document.getElementById("modalSongTitle");
    const artist = document.getElementById("modalArtist");
    const lyrics = document.getElementById("modalLyrics");

    title.textContent = song.title;
    artist.textContent = `by ${song.artist}${
      song.album ? ` • ${song.album}` : ""
    }`;
    lyrics.textContent = song.lyrics;

    modal.classList.add("active");
    document.body.style.overflow = "hidden";
  }

  closeModal() {
    const modal = document.getElementById("lyricsModal");
    modal.classList.remove("active");
    document.body.style.overflow = "";
  }

  updateSongCount() {
    const countDisplay = document.getElementById("songCount");
    const total = this.songs.length;
    const filtered = this.filteredSongs.length;

    if (total === filtered) {
      countDisplay.textContent = `${total} song${total !== 1 ? "s" : ""}`;
    } else {
      countDisplay.textContent = `${filtered} of ${total} song${
        total !== 1 ? "s" : ""
      }`;
    }
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
        <a href="admin.html" class="btn btn-primary">Go to Admin</a>
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

  showError(message) {
    // Implement error toast/notification here
    console.error(message);
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
