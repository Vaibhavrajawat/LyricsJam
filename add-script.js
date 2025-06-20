// Add/Edit Song Form Management
class AddSongManager {
  constructor() {
    this.isEditing = false;
    this.editingSongId = null;
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

  async checkEditMode() {
    const urlParams = new URLSearchParams(window.location.search);
    const editId = urlParams.get("edit");

    if (editId) {
      await this.loadSongForEdit(editId);
    }
  }

  async loadSongForEdit(songId) {
    try {
      const { data: song, error } = await supabase
        .from("songs")
        .select("*")
        .eq("id", songId)
        .single();

      if (error || !song) {
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
    } catch (error) {
      console.error("Error loading song for edit:", error);
      this.showMessage("Error loading song", "error");
      window.location.href = "index.html";
    }
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
    };

    if (this.isEditing) {
      await this.updateSong(songData);
    } else {
      await this.addSong(songData);
    }
  }

  async addSong(songData) {
    this.showLoading(true);

    try {
      const { data, error } = await supabase
        .from("songs")
        .insert([songData])
        .select()
        .single();

      if (error) throw error;

      this.showMessage("Song added successfully!", "success");
      this.clearForm();
      setTimeout(() => {
        window.location.href = "index.html";
      }, 1500);
    } catch (error) {
      console.error("Error adding song:", error);
      this.showMessage("Failed to add song. Please try again.", "error");
    } finally {
      this.showLoading(false);
    }
  }

  async updateSong(songData) {
    this.showLoading(true);

    try {
      const { error } = await supabase
        .from("songs")
        .update(songData)
        .eq("id", this.editingSongId);

      if (error) throw error;

      this.showMessage("Song updated successfully!", "success");
      setTimeout(() => {
        window.location.href = "index.html";
      }, 1500);
    } catch (error) {
      console.error("Error updating song:", error);
      this.showMessage("Failed to update song. Please try again.", "error");
    } finally {
      this.showLoading(false);
    }
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
}

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  window.addSongManager = new AddSongManager();
});
