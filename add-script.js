// Initialize Supabase Client
const SUPABASE_URL = "YOUR_SUPABASE_URL";
const SUPABASE_ANON_KEY = "YOUR_SUPABASE_ANON_KEY";
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Add/Edit Song Form Management
class AddSongManager {
  constructor() {
    this.isEditing = false;
    this.editingSongId = null;
    this.songs = this.loadSongs();
    this.init();
  }

  init() {
    this.bindEvents();
    this.checkEditMode();
  }

  bindEvents() {
    const form = document.getElementById("songForm");
    const autoFetchBtn = document.getElementById("autoFetchBtn");
    const clearFormBtn = document.getElementById("clearFormBtn");
    const cancelBtn = document.getElementById("cancelBtn");

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      this.handleSubmit();
    });

    autoFetchBtn.addEventListener("click", () => {
      this.autoFetchLyrics();
    });

    clearFormBtn.addEventListener("click", () => {
      this.clearForm();
    });

    cancelBtn.addEventListener("click", () => {
      window.location.href = "/";
    });

    // Real-time validation
    const inputs = form.querySelectorAll("input, textarea");
    inputs.forEach((input) => {
      input.addEventListener("blur", () => {
        this.validateField(input);
      });

      input.addEventListener("input", () => {
        this.clearFieldError(input);
      });
    });
  }

  checkEditMode() {
    const urlParams = new URLSearchParams(window.location.search);
    const editId = urlParams.get("edit");

    if (editId) {
      this.loadSongForEdit(editId);
    }
  }

  loadSongForEdit(songId) {
    const song = this.songs.find((s) => s.id === songId);

    if (!song) {
      this.showMessage("Song not found", "error");
      window.location.href = "index.html";
      return;
    }

    this.isEditing = true;
    this.editingSongId = songId;

    // Update form title
    document.getElementById("formTitle").textContent = "Edit Song";
    document.getElementById("submitText").textContent = "Update Song";

    // Populate form
    document.getElementById("songTitle").value = song.title;
    document.getElementById("artistName").value = song.artist;
    document.getElementById("albumName").value = song.album || "";
    document.getElementById("songLyrics").value = song.lyrics;
  }

  async handleSubmit() {
    if (!this.validateForm()) {
      return;
    }

    const formData = new FormData(document.getElementById("songForm"));
    const songData = {
      title: formData.get("title").trim(),
      artist: formData.get("artist").trim(),
      album: formData.get("album").trim() || null,
      lyrics: formData.get("lyrics").trim(),
      created_at: new Date().toISOString(),
    };

    if (this.isEditing) {
      this.updateSong(songData);
    } else {
      this.addSong(songData);
    }
  }

  addSong(songData) {
    this.showLoading(true);

    supabase
      .from("songs")
      .insert([songData])
      .select()
      .single()
      .then(({ data, error }) => {
        if (error) {
          console.error("Error adding song:", error);
          this.showMessage("Failed to add song. Please try again.", "error");
        } else {
          this.showMessage("Song added successfully!", "success");
          this.clearForm();
          setTimeout(() => {
            window.location.href = "index.html";
          }, 1500);
        }
      })
      .catch((error) => {
        console.error("Error adding song:", error);
        this.showMessage("Failed to add song. Please try again.", "error");
      })
      .finally(() => {
        this.showLoading(false);
      });
  }

  updateSong(songData) {
    const songIndex = this.songs.findIndex((s) => s.id === this.editingSongId);

    if (songIndex === -1) {
      this.showMessage("Error updating song", "error");
      return;
    }

    this.songs[songIndex] = {
      ...this.songs[songIndex],
      ...songData,
      updatedAt: new Date().toISOString(),
    };

    this.saveSongs();

    this.showMessage("Song updated successfully!", "success");

    setTimeout(() => {
      window.location.href = "index.html";
    }, 1500);
  }

  async autoFetchLyrics() {
    const title = document.getElementById("songTitle").value.trim();
    const artist = document.getElementById("artistName").value.trim();

    if (!title || !artist) {
      this.showMessage(
        "Please enter both song title and artist name",
        "warning"
      );
      return;
    }

    this.showLoading(true);

    try {
      const response = await fetch(
        `https://api.lyrics.ovh/v1/${encodeURIComponent(
          artist
        )}/${encodeURIComponent(title)}`
      );
      const data = await response.json();

      if (data.lyrics) {
        document.getElementById("songLyrics").value = data.lyrics;
        this.showMessage("Lyrics fetched successfully!", "success");
      } else {
        throw new Error("No lyrics found");
      }
    } catch (error) {
      console.error("Error fetching lyrics:", error);
      this.showMessage(
        "Could not fetch lyrics. Please enter them manually.",
        "error"
      );
    } finally {
      this.showLoading(false);
    }
  }

  validateForm() {
    const form = document.getElementById("songForm");
    const inputs = form.querySelectorAll("input[required], textarea[required]");
    let isValid = true;

    inputs.forEach((input) => {
      if (!this.validateField(input)) {
        isValid = false;
      }
    });

    return isValid;
  }

  validateField(field) {
    const value = field.value.trim();
    const fieldName = field.name;
    let isValid = true;
    let errorMessage = "";

    // Clear previous error
    this.clearFieldError(field);

    // Required field validation
    if (field.hasAttribute("required") && !value) {
      errorMessage = `${this.getFieldLabel(fieldName)} is required`;
      isValid = false;
    }

    // Specific validations
    switch (fieldName) {
      case "title":
        if (value && value.length < 1) {
          errorMessage = "Song title must not be empty";
          isValid = false;
        } else if (value && value.length > 200) {
          errorMessage = "Song title is too long (max 200 characters)";
          isValid = false;
        }
        break;

      case "artist":
        if (value && value.length < 1) {
          errorMessage = "Artist name must not be empty";
          isValid = false;
        } else if (value && value.length > 100) {
          errorMessage = "Artist name is too long (max 100 characters)";
          isValid = false;
        }
        break;

      case "lyrics":
        if (value && value.length < 10) {
          errorMessage = "Lyrics seem too short (minimum 10 characters)";
          isValid = false;
        } else if (value && value.length > 50000) {
          errorMessage = "Lyrics are too long (max 50,000 characters)";
          isValid = false;
        }
        break;
    }

    if (!isValid) {
      this.showFieldError(field, errorMessage);
    }

    return isValid;
  }

  showFieldError(field, message) {
    const errorElement = document.getElementById(`${field.name}Error`);
    if (errorElement) {
      errorElement.textContent = message;
      errorElement.classList.add("show");
    }
    field.style.borderColor = "var(--danger-color)";
  }

  clearFieldError(field) {
    const errorElement = document.getElementById(`${field.name}Error`);
    if (errorElement) {
      errorElement.classList.remove("show");
    }
    field.style.borderColor = "";
  }

  getFieldLabel(fieldName) {
    const labels = {
      title: "Song title",
      artist: "Artist name",
      album: "Album",
      lyrics: "Lyrics",
    };
    return labels[fieldName] || fieldName;
  }

  clearForm() {
    if (confirm("Are you sure you want to clear all fields?")) {
      document.getElementById("songForm").reset();

      // Clear all error messages
      const errorElements = document.querySelectorAll(".error-message");
      errorElements.forEach((el) => el.classList.remove("show"));

      // Reset field styles
      const inputs = document.querySelectorAll("input, textarea");
      inputs.forEach((input) => (input.style.borderColor = ""));

      this.showMessage("Form cleared", "success");
    }
  }

  showLoading(show) {
    const spinner = document.getElementById("loadingSpinner");
    const spinnerText = spinner.querySelector("p");

    if (show) {
      spinnerText.textContent = "Processing...";
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

  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  window.addSongManager = new AddSongManager();
});
