(function (root) {
  var KEY = "imani-teachers-center-v1";

  function empty() {
    return {
      users: [],
      session: null,
      documents: [],
      payments: [],
      posts: [],
      chats: {},
      drafts: {},
      settings: { theme: "light" }
    };
  }

  function load() {
    var base = empty();
    try {
      var raw = localStorage.getItem(KEY);
      if (!raw) return base;
      var parsed = JSON.parse(raw);
      return {
        users: parsed.users || [],
        session: parsed.session || null,
        documents: parsed.documents || [],
        payments: parsed.payments || [],
        posts: parsed.posts || [],
        chats: parsed.chats || {},
        drafts: parsed.drafts || {},
        settings: Object.assign({ theme: "light" }, parsed.settings || {})
      };
    } catch (err) {
      return base;
    }
  }

  function save(db) {
    localStorage.setItem(KEY, JSON.stringify(db));
  }

  root.itcLoad = load;
  root.itcSave = save;
  root.itcStorageKey = KEY;
})(typeof window !== "undefined" ? window : globalThis);
