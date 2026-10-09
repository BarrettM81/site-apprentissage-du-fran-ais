(() => {
  const DATABASE_NAME = "francais-apprentissage";
  const DATABASE_VERSION = 1;
  const STORE_NAME = "progress";
  const RECORD_ID = "learning-state";
  const STORAGE_KEY = "french_verbs_practice_v1";

  const main = document.querySelector("main");
  const status = document.createElement("p");
  status.className = "muted";
  status.setAttribute("role", "status");
  status.textContent = "正在打开本地学习数据库…";
  main.prepend(status);
  main.inert = true;
  main.setAttribute("aria-busy", "true");

  const nativeGetItem = Storage.prototype.getItem;
  const nativeSetItem = Storage.prototype.setItem;
  let database;
  let databaseReady = false;
  let writeQueue = Promise.resolve();

  function showError(message) {
    status.setAttribute("role", "alert");
    status.textContent = message;
    main.inert = false;
    main.setAttribute("aria-busy", "false");
  }

  function putRecord(value) {
    return new Promise((resolve, reject) => {
      const transaction = database.transaction(STORE_NAME, "readwrite");
      transaction.objectStore(STORE_NAME).put({ id: RECORD_ID, value });
      transaction.oncomplete = resolve;
      transaction.onerror = () => reject(transaction.error);
      transaction.onabort = () => reject(transaction.error);
    });
  }

  function reportWriteError(error) {
    showError(
      `IndexedDB 保存失败；当前页面仍会运行，但学习记录可能无法持久保存。${error.message}`,
    );
  }

  Storage.prototype.setItem = function (key, value) {
    nativeSetItem.call(this, key, value);

    if (this !== localStorage || key !== STORAGE_KEY || !databaseReady) {
      return;
    }

    let parsed;
    try {
      parsed = JSON.parse(value);
    } catch (error) {
      reportWriteError(error);
      return;
    }

    writeQueue = writeQueue
      .then(() => putRecord(parsed))
      .catch(reportWriteError);
  };

  function openDatabase() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);
      request.onupgradeneeded = () => {
        const storeDatabase = request.result;
        if (!storeDatabase.objectStoreNames.contains(STORE_NAME)) {
          storeDatabase.createObjectStore(STORE_NAME, { keyPath: "id" });
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
      request.onblocked = () =>
        reject(new Error("数据库升级被其他页面阻止，请关闭其他练习页面后重试。"));
    });
  }

  function readRecord() {
    return new Promise((resolve, reject) => {
      const transaction = database.transaction(STORE_NAME, "readonly");
      const request = transaction.objectStore(STORE_NAME).get(RECORD_ID);
      request.onsuccess = () => resolve(request.result?.value ?? null);
      request.onerror = () => reject(request.error);
    });
  }

  async function initialize() {
    if (!("indexedDB" in window)) {
      throw new Error("此浏览器不支持 IndexedDB。");
    }

    database = await openDatabase();
    let value = await readRecord();

    if (value === null) {
      const legacyValue = nativeGetItem.call(localStorage, STORAGE_KEY);
      if (legacyValue !== null) {
        value = JSON.parse(legacyValue);
      } else {
        value = {
          total: 0,
          correct: 0,
          days: {},
          mistakes: {},
          seen: {},
          session: null,
        };
      }
      await putRecord(value);
    }

    nativeSetItem.call(localStorage, STORAGE_KEY, JSON.stringify(value));
    databaseReady = true;
    status.remove();
    main.inert = false;
    main.setAttribute("aria-busy", "false");
    window.dispatchEvent(new CustomEvent("french-db-ready", { detail: value }));
  }

  initialize().catch((error) => {
    showError(
      `本地学习数据库无法启动：${error.message}。请通过 localhost 或 HTTPS 打开页面；浏览器本地存储仍可作为临时记录。`,
    );
    window.dispatchEvent(new CustomEvent("french-db-error", { detail: error }));
  });
})();
