export class SaveManager {
  constructor(prefix = "mysticFarmSlot") {
    this.prefix = prefix;
  }

  key(slot = 1) {
    return `${this.prefix}${slot}`;
  }

  backupKey(slot = 1) {
    return `${this.key(slot)}Backup`;
  }

  save(slot, state) {
    try {
      const key = this.key(slot);
      const oldSave = localStorage.getItem(key);

      if (oldSave) {
        localStorage.setItem(this.backupKey(slot), oldSave);
      }

      localStorage.setItem(key, JSON.stringify({
        ...state,
        meta: {
          version: "1.0",
          savedAt: new Date().toISOString()
        }
      }));
      return true;
    } catch (error) {
      console.warn("Save failed", error);
      return false;
    }
  }

  load(slot) {
    const saved = localStorage.getItem(this.key(slot));

    if (!saved) {
      return null;
    }

    try {
      return JSON.parse(saved);
    } catch (error) {
      return this.loadBackup(slot, error);
    }
  }

  loadBackup(slot, originalError = null) {
    const backup = localStorage.getItem(this.backupKey(slot));

    if (!backup) {
      localStorage.removeItem(this.key(slot));
      if (originalError) throw originalError;
      return null;
    }

    try {
      return JSON.parse(backup);
    } catch (backupError) {
      localStorage.removeItem(this.key(slot));
      localStorage.removeItem(this.backupKey(slot));
      throw backupError;
    }
  }
}
