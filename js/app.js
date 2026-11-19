(function () {
  var PAY_AMOUNT = 15;
  var devPreview = new URLSearchParams(location.search).get("dev") === "1"
    && /(^|\/)(?:alternate|index)\.html$/i.test(location.pathname)
    && (location.protocol === "file:" || location.hostname === "localhost" || location.hostname === "127.0.0.1");

  var state = {
    db: { users: [], session: null, documents: [], payments: [], posts: [], chats: {}, drafts: {}, settings: { theme: "light" } },
    ready: false,
    saveTimer: null,
    form: null,
    appView: "dashboard",
    previewId: null,
    cal: null,
    selectedDay: "",
    pay: null,
    userEdit: null,
    highlightRef: "",
    finance: { range: "month", q: "", status: "all", page: 1 },
    examFilter: { level: "", term: "" },
    resetToken: ""
  };

  function $(id) { return document.getElementById(id); }
  function esc(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 8); }
  function iso(date) {
    return date.getFullYear() + "-" + String(date.getMonth() + 1).padStart(2, "0") + "-" + String(date.getDate()).padStart(2, "0");
  }
  function pretty(value) {
    var parts = String(value || "").split("-");
    if (parts.length !== 3) return value || "";
    var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return Number(parts[2]) + " " + months[Number(parts[1]) - 1] + " " + parts[0];
  }
  function toast(message, tone) {
    var text = String(message || "");
    var kind = tone || (/not |could not|cannot|Enter |Use a |do not match|Check the|did not|is not|no longer/i.test(text) ? "warn" : "ok");
    var node = document.createElement("div");
    node.className = "sweet sweet-" + kind;
    node.setAttribute("role", "status");
    node.innerHTML = "<span class=\"sweet-mark\" aria-hidden=\"true\"></span><p></p>";
    node.querySelector("p").textContent = text;
    $("toast-root").appendChild(node);
    setTimeout(function () {
      node.classList.add("sweet-out");
      setTimeout(function () { if (node.parentNode) node.remove(); }, 200);
    }, 2400);
  }
  function persist(immediate) {
    if (!state.ready || !currentUser()) return;
    if (state.saveTimer) clearTimeout(state.saveTimer);
    if (immediate) { pushState(); return; }
    state.saveTimer = setTimeout(pushState, 400);
  }
  function pushState() {
    if (devPreview) return;
    var user = currentUser();
    if (!user) return;
    fetch("api/state.php", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        documents: state.db.documents,
        posts: state.db.posts.filter(function (post) { return post.ownerId === user.id; }),
        payments: state.db.payments,
        draft: state.db.drafts[user.id] || null,
        chats: (state.db.chats && state.db.chats[user.id]) || [],
        phone: user.phone || ""
      })
    }).then(function (response) {
      if (!response.ok) toast("The school database did not save that change.");
    }).catch(function () {
      toast("The school database did not save that change.");
    });
  }
  function applyState(data) {
    var person = data.user;
    state.db.users = data.users && data.users.length ? data.users : [person];
    state.db.session = { userId: person.id };
    state.db.documents = data.documents || [];
    state.db.posts = data.posts || [];
    state.db.payments = data.payments || [];
    state.db.drafts = {};
    state.db.chats = {};
    if (data.draft) state.db.drafts[person.id] = data.draft;
    state.db.chats[person.id] = data.chats || [];
  }
  async function loadState() {
    if (devPreview) {
      var previewUser = {
        id: "dev-preview-user",
        name: "Development User",
        email: "dev@example.test",
        school: "Development School",
        role: "Admin",
        tsc: "",
        phone: ""
      };
      state.db.users = [previewUser];
      state.db.session = { userId: previewUser.id };
      state.db.documents = [];
      state.db.payments = [];
      state.db.posts = [];
      state.db.chats = {};
      state.db.drafts = {};
      state.ready = true;
      return true;
    }
    var response = await fetch("api/state.php", { credentials: "same-origin" });
    if (!response.ok) {
      state.db.session = null;
      state.db.users = [];
      state.ready = false;
      return false;
    }
    var data = await response.json();
    if (!data || !data.ok || !data.user) {
      state.db.session = null;
      state.ready = false;
      return false;
    }
    applyState(data);
    state.ready = true;
    if (upgradeSavedLessons()) persist(true);
    return true;
  }
  function upgradeSavedLessons() {
    var changed = false;
    (state.db.documents || []).forEach(function (doc) {
      if (!doc || doc.type !== "lesson") return;
      (doc.plans || []).forEach(function (plan) {
        if (window.itcUpgradeLesson && window.itcUpgradeLesson(plan, doc.cover)) changed = true;
      });
    });
    return changed;
  }
  function currentUser() {
    if (!state.db.session) return null;
    var id = state.db.session.userId;
    return state.db.users.filter(function (user) { return user.id === id; })[0] || null;
  }
  async function hashPassword(password) {
    var data = new TextEncoder().encode("imani-teachers-center::" + password);
    if (crypto && crypto.subtle) {
      var buf = await crypto.subtle.digest("SHA-256", data);
      return Array.from(new Uint8Array(buf)).map(function (b) { return b.toString(16).padStart(2, "0"); }).join("");
    }
    var h = 2166136261;
    var text = "imani-teachers-center::" + password;
    var i;
    for (i = 0; i < text.length; i++) { h ^= text.charCodeAt(i); h = Math.imul(h, 16777619); }
    return "fb:" + (h >>> 0).toString(16);
  }
  function chats() {
    var user = currentUser();
    if (!user) return [];
    if (!state.db.chats[user.id]) state.db.chats[user.id] = [];
    return state.db.chats[user.id];
  }
  function defaultForm(user) {
    var term = itcTermDefaults("1");
    var levelId = "g5";
    var subject = "Mathematics";
    var previous = itcPreviousLevel(levelId);
    var form = {
      type: "scheme",
      track: "cbe",
      levelId: levelId,
      subject: subject,
      topicIds: [],
      customTopics: [],
      bridgeLevelId: previous ? previous.id : "",
      lessonsPerWeek: itcDefaultLessons(subject),
      term: "1",
      year: "2026",
      termStart: term.start,
      termEnd: term.end,
      breaks: term.breaks,
      book: itcBooks[0],
      school: user ? user.school : "",
      teacher: user ? user.name : "",
      tsc: user ? (user.tsc || "") : "",
      hod: user && user.role === "Head of Department" ? user.name : "",
      deputy: user && user.role === "Deputy Principal" ? user.name : "",
      principal: user && user.role === "Principal" ? user.name : "",
      preparedDate: iso(new Date()),
      students: "",
      week: "",
      lessonNumber: "",
      lessonDate: "",
      lessonTime: ""
    };
    form.topicIds = itcRecommendIds(form);
    return form;
  }
  function ensureForm() {
    var user = currentUser();
    if (!user) return;
    if (!state.form) {
      var draft = state.db.drafts[user.id];
      state.form = draft ? JSON.parse(JSON.stringify(draft)) : defaultForm(user);
      state.form.breaks = state.form.breaks || [];
      state.form.customTopics = state.form.customTopics || [];
      state.form.topicIds = state.form.topicIds || [];
      ["students", "week", "lessonNumber", "lessonDate", "lessonTime"].forEach(function (key) {
        if (state.form[key] == null) state.form[key] = "";
      });
      var known = itcCatalog(state.form).map(function (item) { return item.id; });
      state.form.topicIds = (state.form.topicIds || []).filter(function (id) { return known.indexOf(id) >= 0; });
      if (!state.form.topicIds.length) state.form.topicIds = itcRecommendIds(state.form);
    }
  }

  function route() {
    var search = new URLSearchParams(location.search);
    var returned = search.get("reference") || search.get("trxref") || search.get("payref");
    if (returned && (location.hash || "").indexOf("#/paid/") !== 0) {
      history.replaceState(null, "", location.pathname);
      location.hash = "#/paid/" + encodeURIComponent(returned);
      return;
    }
    var hash = location.hash || "#/";
    var user = currentUser();
    if (user && (hash === "#exams" || hash === "#research")) {
      location.hash = hash === "#exams" ? "#/exams" : "#/research";
      return;
    }
    if (hash === "#/" || hash === "#" || hash === "#research" || hash === "#exams" || hash.indexOf("#how") === 0 || hash.indexOf("#pricing") === 0 || hash.indexOf("#sample") === 0 || hash.indexOf("#calendar") === 0 || hash.indexOf("#levels") === 0) {
      show("public");
      return;
    }
    if (hash === "#/signin" || hash === "#/register" || hash === "#/forgot") {
      show("auth");
      setAuthMode(hash === "#/register" ? "register" : hash === "#/forgot" ? "forgot" : "login");
      return;
    }
    var early = hash.replace("#/", "").split("/");
    if (early[0] === "reset" && early[1]) {
      state.resetToken = decodeURIComponent(early[1]);
      show("auth");
      setAuthMode("newpass");
      return;
    }
    if (!user) {
      if (location.hash !== "#/register") location.hash = "#/register";
      return;
    }
    var parts = hash.replace("#/", "").split("/");
    if (parts[0] === "paid" && parts[1]) {
      state.appView = "account";
      state.settling = true;
      show("app");
      var main = $("main");
      if (main) main.innerHTML = "<section class=\"card\"><h2>Confirming the payment</h2><p>You will land on Transaction history when Paystack reports the result.</p></section>";
      settlePayment(decodeURIComponent(parts[1]));
      return;
    }
    state.settling = false;
    var view = parts[0] || "dashboard";
    if (view === "transaction") view = "transactions";
    if (["dashboard", "generate", "documents", "transactions", "schemes", "lessons", "calendar", "schedule", "exams", "research", "account", "users", "finance"].indexOf(view) === -1 && view !== "preview" && view !== "edit") view = "dashboard";
    if ((view === "users" || view === "finance") && user.role !== "Admin") view = "dashboard";
    state.appView = view;
    state.previewId = view === "preview" ? parts[1] : null;
    state.editId = view === "edit" ? parts[1] : null;
    show("app");
  }
  function show(which) {
    $("public").hidden = which !== "public";
    $("auth-view").hidden = which !== "auth";
    $("workspace").hidden = which !== "app";
    document.body.classList.toggle("print-preview", which === "app" && state.appView === "preview");
    if (which === "app" || which === "auth") ensureBackendTheme(which === "app");
    else dropBackendTheme();
    if (which === "app") {
      try {
        ensureForm();
        paintApp();
      } catch (err) {
        var main = $("main");
        if (main) main.innerHTML = "<section class=\"card\"><h2>This page did not open.</h2><p>" + esc(err && err.message ? err.message : "Refresh the page and try again.") + "</p><p><button class=\"btn btn-sm\" type=\"button\" onclick=\"location.reload()\"><i class=\"fas fa-sync-alt\"></i> Refresh</button></p></section>";
      }
    }
  }
  function setAuthMode(mode) {
    var login = mode === "login" || mode === "forgot" || mode === "newpass";
    var view = $("auth-view");
    var box = $("auth-box");
    var logo = $("auth-logo");
    var cardBody = $("auth-card-body");
    view.setAttribute("data-mode", mode);
    view.classList.toggle("login-page", login);
    view.classList.toggle("register-page", !login);
    box.classList.toggle("login-box", login);
    box.classList.toggle("register-box", !login);
    logo.classList.toggle("login-logo", login);
    logo.classList.toggle("register-logo", !login);
    cardBody.classList.toggle("login-card-body", login);
    cardBody.classList.toggle("register-card-body", !login);
    var titles = { login: "Sign in to your account", register: "Create an account", forgot: "Reset your password", newpass: "Choose a new password" };
    var leads = {
      login: "Use the email and password for your school account.",
      register: "These details go on the cover.",
      forgot: "Enter the email on the account. A reset link is sent if outgoing mail is connected.",
      newpass: "Choose a password of at least 6 characters."
    };
    var buttons = { login: "Sign in", register: "Create account", forgot: "Send reset link", newpass: "Save password" };
    if (devPreview) {
      titles.login = "Explore the workspace";
      titles.register = "Explore the workspace";
      leads.login = "Development preview only. No account or password will be saved.";
      leads.register = leads.login;
      buttons.login = "Open workspace";
      buttons.register = "Open workspace";
    }
    $("auth-title").textContent = titles[mode] || titles.login;
    $("auth-lead").textContent = leads[mode] || leads.login;
    $("auth-submit").textContent = buttons[mode] || buttons.login;
    $("auth-switch").innerHTML = mode === "register"
      ? "<a href=\"#/signin\" onclick=\"itcOpenAuth('login'); return false;\">I already have an account</a>"
      : mode === "login"
        ? "<a href=\"#/forgot\">Forgot password</a><br><a href=\"#/register\" onclick=\"itcOpenAuth('register'); return false;\">Create an account</a>"
        : "<a href=\"#/signin\" onclick=\"itcOpenAuth('login'); return false;\">Back to sign in</a>";
    $("auth-error").textContent = "";
    Array.prototype.forEach.call(document.querySelectorAll("#auth-form .reg-only input, #auth-form .reg-only select"), function (el) {
      el.disabled = mode !== "register";
    });
    Array.prototype.forEach.call(document.querySelectorAll("#auth-form .pass-only"), function (el) {
      el.hidden = mode === "forgot";
    });
    Array.prototype.forEach.call(document.querySelectorAll("#auth-form .pass-only input"), function (el) {
      el.disabled = mode === "forgot";
      el.required = mode !== "forgot";
      el.placeholder = mode === "newpass" ? "New password" : "Password";
      el.autocomplete = mode === "register" || mode === "newpass" ? "new-password" : "current-password";
    });
    var passwordInput = $("auth-password");
    var passwordToggle = document.querySelector("[data-password-toggle]");
    if (passwordInput) passwordInput.type = "password";
    if (passwordToggle) {
      passwordToggle.textContent = "Show";
      passwordToggle.setAttribute("aria-label", "Show password");
      passwordToggle.setAttribute("aria-pressed", "false");
    }
    var previewButton = $("auth-preview-access");
    var previewNote = $("auth-preview-note");
    var localPreviewAvailable = location.protocol === "file:" || location.hostname === "localhost" || location.hostname === "127.0.0.1";
    if (previewButton) previewButton.hidden = !localPreviewAvailable || mode !== "login" || devPreview;
    if (previewNote) previewNote.hidden = !localPreviewAvailable || mode !== "login" || devPreview;
    Array.prototype.forEach.call(document.querySelectorAll("#auth-form .email-only"), function (el) {
      el.hidden = mode === "newpass";
    });
    Array.prototype.forEach.call(document.querySelectorAll("#auth-form .email-only input"), function (el) {
      el.disabled = mode === "newpass";
      el.required = mode !== "newpass";
    });
    window.scrollTo(0, 0);
  }

  function paintApp() {
    var user = currentUser();
    $("side-school").textContent = user.school || "Teachers Center";
    $("user-chip").textContent = user.name + " · " + user.role;
    var usersItem = $("side-users-item");
    if (usersItem) usersItem.hidden = user.role !== "Admin";
    var financeItem = $("side-finance-item");
    if (financeItem) financeItem.hidden = user.role !== "Admin";
    document.querySelectorAll(".side-link").forEach(function (link) {
      var key = link.getAttribute("href").replace("#/", "");
      var on = key === state.appView;
      if (on) link.setAttribute("aria-current", "page");
      else link.removeAttribute("aria-current");
      link.classList.toggle("active", on);
    });
    var main = $("main");
    if (state.appView === "dashboard") main.innerHTML = viewDashboard();
    if (state.appView === "generate") renderGenerate();
    if (state.appView === "documents") main.innerHTML = viewDocuments();
    if (state.appView === "transactions") main.innerHTML = viewTransactions();
    if (state.appView === "schemes") main.innerHTML = viewHistory("scheme");
    if (state.appView === "lessons") main.innerHTML = viewHistory("lesson");
    if (state.appView === "preview") main.innerHTML = viewPreview();
    if (state.appView === "edit") renderEdit();
    if (state.appView === "calendar") main.innerHTML = viewCalendar();
    if (state.appView === "schedule") main.innerHTML = viewSchedule();
    if (state.appView === "exams") main.innerHTML = viewLibrary("exam");
    if (state.appView === "research") main.innerHTML = viewLibrary("research");
    if (state.appView === "account") main.innerHTML = viewAccount();
    if (state.appView === "users") main.innerHTML = viewUsers();
    if (state.appView === "finance") main.innerHTML = viewFinance();
    updateAssist();
    renderChat();
    if (state.appView === "exams") loadLibrary("exam");
    if (state.appView === "research") loadLibrary("research");
    if (state.appView === "account") { loadMpesaReady(); loadMailReady(); }
  }

  function myDocs() {
    var user = currentUser();
    if (user.role === "Admin") return state.db.documents.slice();
    return state.db.documents.filter(function (doc) { return doc.ownerId === user.id; });
  }
  function myPosts() {
    var user = currentUser();
    return state.db.posts.filter(function (post) { return post.ownerId === user.id; })
      .sort(function (a, b) { return a.date < b.date ? -1 : 1; });
  }
  function myPays() {
    var user = currentUser();
    if (user.role === "Admin") return state.db.payments.slice();
    return state.db.payments.filter(function (pay) { return String(pay.ownerId) === String(user.id); });
  }
  function payTotal(list) {
    return (list || []).reduce(function (sum, pay) {
      if (pay.status && pay.status !== "success") return sum;
      return sum + (Number(pay.amount) || 0);
    }, 0);
  }

  function seasonCopy() {
    var key = iso(new Date());
    var exams = itcExams.filter(function (exam) { return key >= exam.start && key <= exam.end; });
    if (exams.length) return exams.map(function (exam) { return exam.label + " runs " + pretty(exam.start) + " to " + pretty(exam.end) + "."; }).join(" ");
    var note = "The 2026 terms are loaded as a starting point. Change the dates when your school circular says otherwise.";
    ["1", "2", "3"].forEach(function (term) {
      var data = itcTermDefaults(term);
      if (key >= data.start && key <= data.end) {
        var half = data.breaks.filter(function (item) { return key >= item.start && key <= item.end; })[0];
        note = half
          ? "Term " + term + " is in " + half.label.toLowerCase() + " from " + pretty(half.start) + " to " + pretty(half.end) + "."
          : "Term " + term + " is in session until " + pretty(data.end) + ".";
      }
    });
    if (key > "2026-10-23" && key < "2027-01-05" && !exams.length) {
      note = "Term 3 of 2026 has closed. Set the next opening date yourself when the new circular is out.";
    }
    return note;
  }

  function viewDashboard() {
    var docs = myDocs();
    var posts = myPosts();
    var pays = myPays();
    var done = posts.filter(function (post) { return post.status === "done"; }).length;
    var pct = posts.length ? Math.round(done / posts.length * 100) : 0;
    var recent = docs.slice(0, 4).map(function (doc) {
      return "<div class=\"list-row\"><div><strong>" + esc(doc.title) + "</strong><div class=\"muted\">" + esc(doc.cover.school) + " · " + pretty(doc.createdAt.slice(0, 10)) + "</div></div><a class=\"btn btn-small\" href=\"#/preview/" + esc(doc.id) + "\">Open</a></div>";
    }).join("") || "<p class=\"muted\">Your first scheme, lesson plan or revision booklet will appear here.</p>";
    var upcoming = posts.filter(function (post) { return post.status !== "done"; }).slice(0, 4).map(function (post) {
      return "<div class=\"list-row\"><div><strong>" + esc(post.title) + "</strong><div class=\"muted\">" + pretty(post.date) + " · " + esc(post.status) + "</div></div></div>";
    }).join("") || "<p class=\"muted\">Schedule a lesson, assessment or scheme review to track it here.</p>";
    var adminPanel = "";
    if (currentUser().role === "Admin") {
      var accounts = state.db.users.map(function (person) {
        return "<div class=\"list-row\"><div><strong>" + esc(person.name) + "</strong><div class=\"muted\">" + esc(person.email) + " · " + esc(person.role) + " · " + esc(person.school || "") + "</div></div></div>";
      }).join("");
      adminPanel = "<div class=\"card\"><div class=\"card-header\"><h3 class=\"card-title\">Centre accounts</h3></div><div class=\"card-body\"><p class=\"text-muted\">Successful payments across every account: KSh " + payTotal(state.db.payments) + ".</p>" + accounts + "</div></div>";
    }
    return "<div class=\"content-header\"><div class=\"container-fluid\"><h1 class=\"m-0\">Karibu, " + esc(currentUser().name.split(" ")[0]) + ".</h1><p class=\"text-muted\">" + esc(seasonCopy()) + "</p></div></div><div class=\"row\">" +
      box("bg-info", docs.length, "Documents", "#/documents", "fas fa-folder-open") +
      box("bg-success", "KSh " + payTotal(pays), "Recorded", "#/transactions", "fas fa-credit-card") +
      box("bg-warning", posts.length, "Posts", "#/schedule", "fas fa-tasks") +
      box("bg-primary", pct + "%", "Progress", "#/schedule", "fas fa-chart-line") +
      "</div><div class=\"row align-items-stretch\"><div class=\"col-lg-7 d-flex\"><div class=\"card\"><div class=\"card-header\"><h3 class=\"card-title\">Recent documents</h3></div><div class=\"card-body\">" + recent +
      "<a class=\"btn btn-primary btn-sm\" href=\"#/generate\">Generate a document</a></div></div></div>" +
      "<div class=\"col-lg-5 d-flex\"><div class=\"card\"><div class=\"card-header\"><h3 class=\"card-title\">Teaching posts</h3></div><div class=\"card-body\">" + upcoming +
      "<a class=\"btn btn-default btn-sm\" href=\"#/schedule\">Open the schedule</a></div></div></div></div>" + adminPanel;
  }
  function box(tone, value, label, href, icon) {
    return "<div class=\"col-lg-3 col-6 d-flex\"><div class=\"small-box " + tone + "\"><div class=\"inner\"><h3>" + esc(value) + "</h3><p>" + esc(label) + "</p></div><div class=\"icon\"><i class=\"" + icon + "\"></i></div><a href=\"" + href + "\" class=\"small-box-footer\">Open <i class=\"fas fa-arrow-circle-right\"></i></a></div></div>";
  }
  function stat(value, label) { return "<article class=\"card stat\"><strong>" + esc(value) + "</strong><span class=\"muted\">" + esc(label) + "</span></article>"; }

  function renderGenerate() {
    var form = state.form;
    var levels = itcLevels.filter(function (level) { return level.track === form.track; });
    var subjects = itcSubjects(form.levelId);
    var bridges = itcBridgeChoices(form.levelId);
    $("main").innerHTML = "<p class=\"kicker\">Generate</p><h2>Build the document.</h2><form id=\"gen-form\">" +
      "<div class=\"panel\"><h3>Document</h3><div class=\"inline\">" +
      radio("type", "scheme", "Scheme of work", form.type) + radio("type", "lesson", "Lesson plans", form.type) + radio("type", "revision", "Revision", form.type) + radio("type", "exam", "Exam", form.type) +
      "</div><p class=\"help\">A scheme of work is a landscape table with WK, LSN, TOPIC, SUB-TOPIC, OBJECTIVES, T/L ACTIVITIES, T/L AIDS, REFERENCE and a blank REMARKS column. Week 1 is the opener, one middle week carries a continuous assessment row, and the close of term is left blank. A lesson plan records the teacher's name, TSC number, school, form, term, year, number of students, subject, topic, sub-topic, week, lesson number, date and time. The presentation table is TIME, CONTENT, LEARNING ACTIVITIES, RESOURCES and REFERENCE: 5 minutes introduction, 30 minutes body development, 5 minutes conclusion. Self-evaluation stays blank until you write it. Revision and exams use the same school, class, term, teacher and TSC number, then download as Word or PDF.</p><div class=\"inline\" style=\"margin-top:10px\">" +
      radio("track", "cbe", "CBE · PP1 to Grade 12", form.track) + radio("track", "kcse", "KCSE · Form 1 to Form 4", form.track) +
      "</div></div>" +
      "<div class=\"form-grid\" style=\"margin-top:12px\">" +
      field("Class", "<select id=\"level\">" + levels.map(function (level) { return option(level.id, level.label + " · " + level.band, form.levelId); }).join("") + "</select>") +
      field("Subject or learning area", "<select id=\"subject\">" + subjects.map(function (subject) { return option(subject, subject, form.subject); }).join("") + "</select>") +
      field("Lessons per week", "<input id=\"lessons\" type=\"number\" min=\"1\" max=\"12\" value=\"" + esc(form.lessonsPerWeek) + "\">") +
      field("Bring topics from", "<select id=\"bridge\"><option value=\"\">This class only</option>" + bridges.map(function (level) { return option(level.id, level.label, form.bridgeLevelId); }).join("") + "</select>") +
      "<div class=\"span-2\"><div class=\"field\"><span>Strands for this class</span><p class=\"help\">Tick a strand to include every sub-strand under it. The scheme or lesson plans are built from all the sub-strands you leave ticked. Clear a sub-strand if this term does not need it.</p><div class=\"row-actions\"><button class=\"btn-line btn-small\" type=\"button\" id=\"fit-topics\">Fit strands to this term</button></div><div id=\"topic-list\" class=\"checks\"></div></div></div>" +
      field("Term", "<select id=\"term\">" + [1, 2, 3].map(function (term) { return option(String(term), "Term " + term, form.term); }).join("") + "</select>") +
      field("Year", "<input id=\"year\" value=\"" + esc(form.year) + "\">") +
      field("Term opened", "<input id=\"term-start\" type=\"date\" value=\"" + esc(form.termStart) + "\">") +
      field("Term closes", "<input id=\"term-end\" type=\"date\" value=\"" + esc(form.termEnd) + "\">") +
      "<div class=\"span-2\"><div class=\"field\"><span>Breaks inside the term</span><p class=\"help\">Half-term and public holidays become a labelled row with the other columns left blank, the same way the opener, the continuous assessment and the end-of-term examination are left blank.</p><div id=\"break-list\"></div><div class=\"row-actions\"><button class=\"btn-line btn-small\" type=\"button\" id=\"add-break\">Add a break</button><button class=\"btn-line btn-small\" type=\"button\" id=\"add-holidays\">Add public holidays in this term</button><button class=\"btn-line btn-small\" type=\"button\" id=\"reset-dates\">Use 2026 Ministry dates</button></div></div></div>" +
      field("KICD-approved course book", "<select id=\"book\">" + itcBooks.map(function (book) { return option(book, book, form.book); }).join("") + "</select>", "span-2") +
      "</div>" +
      "<div class=\"panel\" style=\"margin-top:12px\"><h3>" + (form.type === "lesson" ? "Lesson plan record" : form.type === "scheme" ? "Scheme of work header" : "Cover page") + "</h3><div class=\"form-grid\">" +
      field("School / institution", "<input id=\"school\" value=\"" + esc(form.school) + "\">") +
      field("Teacher's name", "<input id=\"teacher\" value=\"" + esc(form.teacher) + "\">") +
      field("TSC No.", "<input id=\"tsc\" value=\"" + esc(form.tsc) + "\" placeholder=\"Optional\">") +
      field("Date prepared", "<input id=\"prepared\" type=\"date\" value=\"" + esc(form.preparedDate) + "\">") +
      (form.type === "lesson"
        ? field("Number of students", "<input id=\"students\" value=\"" + esc(form.students || "") + "\" placeholder=\"Left blank on the record if empty\">") +
          field("Week", "<input id=\"plan-week\" value=\"" + esc(form.week || "") + "\">") +
          field("Lesson number", "<input id=\"plan-lesson\" value=\"" + esc(form.lessonNumber || "") + "\">") +
          field("Date", "<input id=\"plan-date\" type=\"date\" value=\"" + esc(form.lessonDate || "") + "\">") +
          field("Time", "<input id=\"plan-time\" value=\"" + esc(form.lessonTime || "") + "\" placeholder=\"For example 8:00-8:40\">")
        : "") +
      field("Head of Department", "<input id=\"hod\" value=\"" + esc(form.hod) + "\" placeholder=\"Name for the signature line\">") +
      field("Deputy Principal", "<input id=\"deputy\" value=\"" + esc(form.deputy) + "\">") +
      field("Principal", "<input id=\"principal\" value=\"" + esc(form.principal) + "\">") +
      "</div><p class=\"help\">" + (form.type === "lesson"
        ? "These lines are printed on every lesson plan: teacher's name, TSC number, school, form, term, year, number of students, subject, topic, sub-topic, week, lesson number, date and time. The presentation table is TIME, CONTENT, LEARNING ACTIVITIES, RESOURCES and REFERENCE. You can edit each lesson after it is saved."
        : form.type === "scheme"
          ? "The scheme header prints school, teacher, TSC number, class, subject, term and year. Each row is WK, LSN, TOPIC, SUB-TOPIC, OBJECTIVES, T/L ACTIVITIES, T/L AIDS, REFERENCE and a blank REMARKS column. You can edit the rows after the scheme is saved."
          : "Signature lines for the teacher, HoD, deputy principal and principal are printed even when a name is left open.") + "</p></div>" +
      "<div class=\"live-box\" id=\"live-box\" style=\"margin:12px 0\"></div>" +
      "<button class=\"btn\" type=\"button\" id=\"make-doc\">Generate document</button></form>";
    renderTopicList();
    renderBreaks();
    updateLive();
  }
  function radio(name, value, label, current) {
    return "<label class=\"check\"><input type=\"radio\" name=\"" + name + "\" value=\"" + esc(value) + "\"" + (current === value ? " checked" : "") + "> <span>" + esc(label) + "</span></label>";
  }
  function option(value, label, current) {
    return "<option value=\"" + esc(value) + "\"" + (String(current) === String(value) ? " selected" : "") + ">" + esc(label) + "</option>";
  }
  function field(label, control, extra) {
    return "<label class=\"field " + (extra || "") + "\"><span>" + label + "</span>" + control + "</label>";
  }
  function renderTopicList() {
    var box = $("topic-list");
    if (!box) return;
    var catalog = itcCatalog(state.form);
    var current = catalog.filter(function (item) { return !item.bridging; });
    var bridge = catalog.filter(function (item) { return item.bridging; });
    box.innerHTML = strandGroups("This class", current) + (bridge.length ? strandGroups("From " + bridge[0].levelLabel, bridge) : "");
  }
  function strandGroups(label, items) {
    if (!items.length) return "";
    var order = [];
    var map = {};
    items.forEach(function (item) {
      var key = item.strand || "Strand";
      if (!map[key]) { map[key] = []; order.push(key); }
      map[key].push(item);
    });
    return "<p class=\"group-label\">" + esc(label) + "</p>" + order.map(function (strand) {
      var kids = map[strand];
      var allOn = kids.every(function (item) { return state.form.topicIds.indexOf(item.id) >= 0; });
      return "<fieldset class=\"strand-pick\"><label class=\"check strand-head\"><input class=\"strand-check\" type=\"checkbox\"" + (allOn ? " checked" : "") + "><span><strong>" + esc(strand) + "</strong></span></label>" +
        kids.map(function (item) {
          var checked = state.form.topicIds.indexOf(item.id) >= 0 ? " checked" : "";
          return "<label class=\"check topic-line\"><input class=\"topic-check\" type=\"checkbox\" value=\"" + esc(item.id) + "\"" + checked + "><span>" + esc(item.sub) + "</span></label>";
        }).join("") + "</fieldset>";
    }).join("");
  }
  function renderBreaks() {
    var box = $("break-list");
    if (!box) return;
    if (!state.form.breaks.length) {
      box.innerHTML = "<p class=\"muted\">No break has been added inside the term yet. The closing row is still added.</p>";
      return;
    }
    box.innerHTML = state.form.breaks.map(function (item, index) {
      return "<div class=\"break-editor\"><input class=\"break-label\" data-index=\"" + index + "\" value=\"" + esc(item.label) + "\" aria-label=\"Break name\"><input class=\"break-start\" type=\"date\" data-index=\"" + index + "\" value=\"" + esc(item.start) + "\" aria-label=\"Break starts\"><input class=\"break-end\" type=\"date\" data-index=\"" + index + "\" value=\"" + esc(item.end) + "\" aria-label=\"Break ends\"><button class=\"btn-danger btn-small\" type=\"button\" data-remove-break=\"" + index + "\">Remove</button></div>";
    }).join("");
  }
  function readForm() {
    var root = $("gen-form");
    if (!root || !state.form) return state.form;
    var form = state.form;
    var type = root.querySelector("input[name=type]:checked");
    var track = root.querySelector("input[name=track]:checked");
    if (type) form.type = type.value;
    if (track) form.track = track.value;
    form.levelId = $("level").value;
    form.subject = $("subject").value;
    form.bridgeLevelId = $("bridge").value;
    form.lessonsPerWeek = Number($("lessons").value || 1);
    form.term = $("term").value;
    form.year = $("year").value;
    form.termStart = $("term-start").value;
    form.termEnd = $("term-end").value;
    form.book = $("book").value;
    form.school = $("school").value;
    form.teacher = $("teacher").value;
    form.tsc = $("tsc").value;
    form.hod = $("hod").value;
    form.deputy = $("deputy").value;
    form.principal = $("principal").value;
    form.preparedDate = $("prepared").value;
    if ($("students")) form.students = $("students").value;
    if ($("plan-week")) form.week = $("plan-week").value;
    if ($("plan-lesson")) form.lessonNumber = $("plan-lesson").value;
    if ($("plan-date")) form.lessonDate = $("plan-date").value;
    if ($("plan-time")) form.lessonTime = $("plan-time").value;
    form.topicIds = Array.prototype.map.call(root.querySelectorAll(".topic-check:checked"), function (box) { return box.value; });
    form.breaks = Array.prototype.map.call(root.querySelectorAll(".break-editor"), function (row) {
      return {
        label: row.querySelector(".break-label").value,
        start: row.querySelector(".break-start").value,
        end: row.querySelector(".break-end").value
      };
    });
    return form;
  }
  function saveDraft() {
    var user = currentUser();
    if (!user || !state.form) return;
    state.db.drafts[user.id] = state.form;
    persist();
  }
  function updateLive() {
    var box = $("live-box");
    if (!box || !state.form) return;
    var brief = itcAiBrief(state.form);
    box.innerHTML = "<strong>" + esc(brief.headline) + "</strong><ul>" + brief.tips.map(function (tip) { return "<li>" + esc(tip) + "</li>"; }).join("") + "</ul>";
    var side = $("ai-brief");
    if (side) side.innerHTML = "<strong>" + esc(brief.headline) + "</strong><p>" + esc(brief.tips[0] || "") + "</p>";
  }
  function updateAssist() {
    var side = $("ai-brief");
    if (!side) return;
    if (state.appView === "generate" && state.form) updateLive();
    else side.innerHTML = "<strong>Notes for this class</strong><p>Open Generate and the notes follow the class, book and breaks you set.</p>";
  }
  function refitTopics() {
    state.form.topicIds = itcRecommendIds(state.form);
    renderTopicList();
    updateLive();
    saveDraft();
  }
  function onTrackChange() {
    readForm();
    var levels = itcLevels.filter(function (level) { return level.track === state.form.track; });
    if (!levels.some(function (level) { return level.id === state.form.levelId; })) state.form.levelId = levels[0].id;
    applyClassDefaults();
  }
  function onLevelChange() {
    readForm();
    applyClassDefaults();
  }
  function applyClassDefaults() {
    var subjects = itcSubjects(state.form.levelId);
    if (subjects.indexOf(state.form.subject) < 0) state.form.subject = subjects[0];
    state.form.lessonsPerWeek = itcDefaultLessons(state.form.subject);
    var previous = itcPreviousLevel(state.form.levelId);
    state.form.bridgeLevelId = previous ? previous.id : "";
    state.form.topicIds = itcRecommendIds(state.form);
    renderGenerate();
    saveDraft();
  }
  function onSubjectChange() {
    readForm();
    state.form.lessonsPerWeek = itcDefaultLessons(state.form.subject);
    state.form.topicIds = itcRecommendIds(state.form);
    renderGenerate();
    saveDraft();
  }
  function onTermChange() {
    readForm();
    var defaults = itcTermDefaults(state.form.term);
    state.form.termStart = defaults.start;
    state.form.termEnd = defaults.end;
    state.form.breaks = defaults.breaks;
    renderGenerate();
    saveDraft();
  }

  function makeDocument() {
    readForm();
    try {
      var doc = itcGenerate(state.form);
      doc.ownerId = currentUser().id;
      state.db.documents.unshift(doc);
      var mine = state.db.documents.filter(function (item) { return item.ownerId === doc.ownerId; });
      if (mine.length > 40) {
        var drop = mine.slice(40).map(function (item) { return item.id; });
        state.db.documents = state.db.documents.filter(function (item) { return drop.indexOf(item.id) < 0; });
      }
      persist(true);
      toast(doc.warnings && doc.warnings.length ? doc.warnings[0] : "Document ready. Preview it, then download for KSh 15.");
      location.hash = "#/preview/" + doc.id;
    } catch (err) {
      toast(err.message);
    }
  }

  function findDoc(id) {
    var user = currentUser();
    return state.db.documents.filter(function (doc) {
      return doc.id === id && (doc.ownerId === user.id || user.role === "Admin");
    })[0];
  }
  function docWhen(doc) {
    var raw = doc.updatedAt || doc.createdAt || "";
    return raw ? String(raw).slice(0, 16).replace("T", " ") : "";
  }
  function historyRows(docs) {
    return docs.map(function (doc) {
      var edit = (doc.type === "scheme" || doc.type === "lesson")
        ? "<a class=\"btn btn-small\" href=\"#/edit/" + esc(doc.id) + "\">Edit</a>"
        : "";
      return "<div class=\"list-row\"><div><strong>" + esc(doc.title) + "</strong><div class=\"muted\">" + esc(doc.cover.grade) + " · " + esc(doc.cover.subject) + " · Term " + esc(doc.cover.term) + " · " + esc(docWhen(doc)) + "</div></div><div class=\"row-actions\"><a class=\"btn btn-small\" href=\"#/preview/" + esc(doc.id) + "\">Open</a>" + edit + "<button class=\"btn-danger btn-small\" type=\"button\" data-delete-doc=\"" + esc(doc.id) + "\">Delete</button></div></div>";
    }).join("");
  }
  function viewDocuments() {
    var docs = myDocs();
    return "<p class=\"kicker\">Library</p><h2>My documents</h2>" + (historyRows(docs) || "<p class=\"muted\">Nothing has been generated on this account yet.</p><p><a class=\"btn\" href=\"#/generate\">Generate a document</a></p>");
  }
  function viewHistory(type) {
    var title = type === "scheme" ? "Scheme of work history" : "Lesson plan history";
    var docs = myDocs().filter(function (doc) { return doc.type === type; }).sort(function (a, b) {
      return String(b.updatedAt || b.createdAt || "").localeCompare(String(a.updatedAt || a.createdAt || ""));
    });
    var empty = type === "scheme"
      ? "No scheme of work has been saved on this account yet."
      : "No lesson plan has been saved on this account yet.";
    return "<p class=\"kicker\">History</p><h2>" + title + "</h2><p class=\"muted\">Open a saved document or edit the same fields that appear on the PDF.</p>" +
      (historyRows(docs) || "<p class=\"muted\">" + empty + "</p><p><a class=\"btn\" href=\"#/generate\">Generate a document</a></p>");
  }
  function cbeLessonEditor(doc) {
    var cards = (doc.plans || []).map(function (plan, index) {
      var h = plan.header || {};
      function box(key, label, value, wide) {
        return "<label class=\"field" + (wide ? " span-2" : "") + "\"><span>" + esc(label) + "</span><input data-cbe=\"" + key + "\" value=\"" + esc(value || "") + "\"></label>";
      }
      function area(key, label, value) {
        return "<label class=\"field span-2\"><span>" + esc(label) + "</span><textarea data-cbe=\"" + key + "\" rows=\"3\">" + esc(value || "") + "</textarea></label>";
      }
      return "<section class=\"panel\" data-plan-card=\"" + index + "\" style=\"margin-top:12px\"><h3>" + esc(plan.weekTitle || ("Lesson " + (index + 1))) + "</h3><div class=\"form-grid\">" +
        box("school", "School", h.school) + box("level", "Level", h.level) + box("area", "Learning area", h.area) +
        box("term", "Term", h.term) + box("name", "Name", h.name) + box("date", "Date", h.date) +
        box("time", "Time", h.time) + box("roll", "Roll", h.roll) + box("year", "Year", h.year) +
        box("strand", "Strand", plan.strand, true) + box("substrand", "Sub strand", plan.substrand, true) +
        area("outcomesLine", "Specific learning outcome", plan.outcomesLine) +
        area("inquiry", "Key inquiry question", plan.inquiry) +
        area("competencies", "Core competencies, one on each line", (plan.competencies || []).join("\n")) +
        area("values", "Values, one on each line", (plan.values || []).join("\n")) +
        area("pcis", "PCIs, one on each line", (plan.pcis || []).join("\n")) +
        area("resources", "Learning resources, one on each line", (plan.resources || []).join("\n")) +
        area("intro", "Introduction, one line each", (plan.intro || []).join("\n")) +
        area("development", "Lesson development, one step each line", (plan.development || []).join("\n")) +
        area("conclusion", "Conclusion, one line each", (plan.conclusion || []).join("\n")) +
        area("extended", "Extended activities", plan.extended) +
        area("evaluation", "Teacher self-evaluation", plan.evaluation) +
        "</div></section>";
    }).join("");
    return "<p class=\"kicker\">Edit</p><h2>" + esc(doc.title) + "</h2><p class=\"muted\">These are the CBE lesson fields: school record, strand, sub-strand, learning outcome, inquiry question, competencies, organisation of learning and self-evaluation.</p>" +
      cards + "<div class=\"row-actions\" style=\"margin-top:14px\"><button class=\"btn\" type=\"button\" id=\"save-edit\">Save lesson plans</button><a class=\"btn-line\" href=\"#/preview/" + esc(doc.id) + "\">Cancel</a></div>";
  }
  function lessonEditor(doc) {
    if ((doc.plans || []).some(function (plan) { return plan.layout === "cbe"; })) return cbeLessonEditor(doc);
    var cards = (doc.plans || []).map(function (plan, index) {
      var h = plan.header || {};
      var fields = [
        ["teacher", "Teacher's name", h.teacher],
        ["tsc", "TSC No.", h.tsc],
        ["school", "School / institution", h.school],
        ["form", "Form", h.form],
        ["term", "Term", h.term],
        ["year", "Year", h.year],
        ["students", "Number of students", h.students],
        ["subject", "Subject", h.subject],
        ["topic", "Topic", h.topic],
        ["subtopic", "Sub-topic", h.subtopic],
        ["week", "Week", h.week],
        ["lesson", "Lesson number", h.lesson],
        ["date", "Date", h.date],
        ["time", "Time", h.time]
      ].map(function (item) {
        return "<label class=\"field\"><span>" + esc(item[1]) + "</span><input data-h=\"" + item[0] + "\" value=\"" + esc(item[2] || "") + "\"></label>";
      }).join("");
      var steps = (plan.steps || []).map(function (step, stepIndex) {
        return "<tr>" + step.map(function (cell, cellIndex) {
          return "<td><textarea data-step=\"" + stepIndex + "\" data-cell=\"" + cellIndex + "\">" + esc(cell || "") + "</textarea></td>";
        }).join("") + "</tr>";
      }).join("");
      return "<section class=\"panel\" data-plan-card=\"" + index + "\" style=\"margin-top:12px\"><h3>" + esc(plan.title || ("Lesson " + (index + 1))) + "</h3><div class=\"form-grid\">" + fields +
        "<label class=\"field span-2\"><span>Objectives lead</span><input data-lead value=\"" + esc(plan.objectiveLead || "") + "\"></label>" +
        "<label class=\"field span-2\"><span>Objectives, one on each line</span><textarea data-objectives rows=\"4\">" + esc((plan.objectives || []).join("\n")) + "</textarea></label></div>" +
        "<h4>LESSON PRESENTATION</h4><div class=\"preview-scroll\"><table class=\"lesson-table lesson-present\"><thead><tr>" +
        (plan.columns || ["TIME", "CONTENT", "LEARNING ACTIVITIES", "RESOURCES", "REFERENCE"]).map(function (col) { return "<th>" + esc(col) + "</th>"; }).join("") +
        "</tr></thead><tbody>" + steps + "</tbody></table></div>" +
        "<label class=\"field\"><span>Self-evaluation</span><textarea data-evaluation rows=\"3\">" + esc(plan.evaluation || "") + "</textarea></label></section>";
    }).join("");
    return "<p class=\"kicker\">Edit</p><h2>" + esc(doc.title) + "</h2><p class=\"muted\">Change the lesson record, then save. The preview, Word and PDF use these fields.</p>" +
      cards + "<div class=\"row-actions\" style=\"margin-top:14px\"><button class=\"btn\" type=\"button\" id=\"save-edit\">Save lesson plans</button><a class=\"btn-line\" href=\"#/preview/" + esc(doc.id) + "\">Cancel</a></div>";
  }
  function schemeEditor(doc) {
    var c = doc.cover || {};
    var header = [
      ["school", "School", c.school],
      ["teacher", "Teacher's name", c.teacher],
      ["tsc", "TSC No.", c.tsc],
      ["grade", "Form / class", c.grade],
      ["subject", "Subject", c.subject],
      ["term", "Term", c.term],
      ["year", "Year", c.year],
      ["book", "Course book", c.book]
    ].map(function (item) {
      return "<label class=\"field\"><span>" + esc(item[1]) + "</span><input data-cover=\"" + item[0] + "\" value=\"" + esc(item[2] || "") + "\"></label>";
    }).join("");
    var columns = (doc.scheme && doc.scheme.columns) || [];
    var rows = ((doc.scheme && doc.scheme.body) || []).map(function (row, index) {
      var cells = row.cells || [];
      return "<tr>" + cells.map(function (cell, cellIndex) {
        return "<td><textarea data-row=\"" + index + "\" data-cell=\"" + cellIndex + "\">" + esc(cell || "") + "</textarea></td>";
      }).join("") + "</tr>";
    }).join("");
    return "<p class=\"kicker\">Edit</p><h2>" + esc(doc.title) + "</h2><p class=\"muted\">The header and each WK, LSN, TOPIC, SUB-TOPIC, OBJECTIVES, T/L ACTIVITIES, T/L AIDS, REFERENCE and REMARKS cell can be changed.</p>" +
      "<div class=\"form-grid\">" + header + "</div>" +
      "<div class=\"preview-scroll\" style=\"margin-top:12px\"><table class=\"lesson-table\"><thead><tr>" + columns.map(function (col) { return "<th>" + esc(col) + "</th>"; }).join("") +
      "</tr></thead><tbody>" + rows + "</tbody></table></div>" +
      "<div class=\"row-actions\" style=\"margin-top:14px\"><button class=\"btn\" type=\"button\" id=\"save-edit\">Save scheme</button><a class=\"btn-line\" href=\"#/preview/" + esc(doc.id) + "\">Cancel</a></div>";
  }
  function renderEdit() {
    var doc = findDoc(state.editId);
    var main = $("main");
    if (!doc || (doc.type !== "scheme" && doc.type !== "lesson")) {
      main.innerHTML = "<h2>That document cannot be edited here.</h2><p><a class=\"btn\" href=\"#/documents\">Back to documents</a></p>";
      return;
    }
    main.innerHTML = doc.type === "lesson" ? lessonEditor(doc) : schemeEditor(doc);
  }
  function saveEdit() {
    var doc = findDoc(state.editId);
    if (!doc) return;
    if (doc.type === "lesson") {
      (doc.plans || []).forEach(function (plan, index) {
        var card = document.querySelector("[data-plan-card=\"" + index + "\"]");
        if (!card) return;
        if (plan.layout === "cbe") {
          plan.header = plan.header || {};
          var lines = ["competencies", "values", "pcis", "resources", "intro", "development", "conclusion"];
          Array.prototype.forEach.call(card.querySelectorAll("[data-cbe]"), function (input) {
            var key = input.getAttribute("data-cbe");
            if (["school", "level", "area", "term", "name", "date", "time", "roll", "year"].indexOf(key) >= 0) plan.header[key] = input.value;
            else if (lines.indexOf(key) >= 0) plan[key] = input.value.split("\n").map(function (line) { return line.trim(); }).filter(Boolean);
            else plan[key] = input.value;
          });
          return;
        }
        plan.header = plan.header || {};
        Array.prototype.forEach.call(card.querySelectorAll("[data-h]"), function (input) {
          plan.header[input.getAttribute("data-h")] = input.value;
        });
        var lead = card.querySelector("[data-lead]");
        if (lead) plan.objectiveLead = lead.value;
        var objectives = card.querySelector("[data-objectives]");
        if (objectives) {
          plan.objectives = objectives.value.split("\n").map(function (line) { return line.trim(); }).filter(Boolean);
        }
        (plan.steps || []).forEach(function (step, stepIndex) {
          step.forEach(function (_, cellIndex) {
            var box = card.querySelector("[data-step=\"" + stepIndex + "\"][data-cell=\"" + cellIndex + "\"]");
            if (box) step[cellIndex] = box.value;
          });
        });
        var evaluation = card.querySelector("[data-evaluation]");
        if (evaluation) plan.evaluation = evaluation.value;
        plan.title = "LESSON PLAN " + (index + 1) + ": " + (plan.header.subtopic || "");
      });
      var firstPlan = doc.plans[0];
      var first = firstPlan && firstPlan.header;
      if (first && firstPlan.layout === "cbe") {
        doc.cover.school = first.school;
        doc.cover.teacher = first.name;
        doc.cover.grade = first.level;
        doc.cover.subject = first.area;
        doc.cover.year = first.year;
        doc.title = first.level + " " + first.area + " lesson plans";
      } else if (first) {
        doc.cover.school = first.school;
        doc.cover.teacher = first.teacher;
        doc.cover.tsc = first.tsc;
        doc.cover.grade = first.form;
        doc.cover.subject = first.subject;
        doc.cover.term = first.term;
        doc.cover.year = first.year;
        doc.cover.termRoman = { 1: "I", 2: "II", 3: "III" }[Number(first.term)] || first.term;
        doc.title = "LESSON PLANS — " + first.subject + " — " + first.form;
      }
    } else if (doc.scheme) {
      Array.prototype.forEach.call(document.querySelectorAll("[data-cover]"), function (input) {
        doc.cover[input.getAttribute("data-cover")] = input.value;
      });
      doc.cover.termRoman = { 1: "I", 2: "II", 3: "III" }[Number(doc.cover.term)] || doc.cover.term;
      doc.scheme.body.forEach(function (row, index) {
        (row.cells || []).forEach(function (_, cellIndex) {
          var box = document.querySelector("[data-row=\"" + index + "\"][data-cell=\"" + cellIndex + "\"]");
          if (box) row.cells[cellIndex] = box.value;
        });
      });
      doc.title = "SCHEME OF WORK — " + doc.cover.subject + " — " + doc.cover.grade;
    }
    doc.updatedAt = new Date().toISOString();
    persist(true);
    toast("Saved.");
    location.hash = "#/preview/" + doc.id;
  }
  function viewPreview() {
    var doc = findDoc(state.previewId);
    if (!doc) return "<h2>That document is not on this account.</h2><p><a class=\"btn\" href=\"#/documents\">Back to documents</a></p>";
    if (typeof itcPaginate !== "function" || typeof itcPreviewHtml !== "function") {
      return "<section class=\"card\"><h2>The preview did not load.</h2><p>Refresh the page so the latest preview script can start.</p><p><button class=\"btn btn-sm\" type=\"button\" onclick=\"location.reload()\"><i class=\"fas fa-sync-alt\"></i> Refresh</button></p></section>";
    }
    var pages = itcPaginate(doc).length;
    var warns = (doc.warnings || []).map(function (warning) { return "<p class=\"warn\">" + esc(warning) + "</p>"; }).join("");
    var edit = (doc.type === "scheme" || doc.type === "lesson") ? "<a class=\"btn btn-sm pay-edit\" href=\"#/edit/" + esc(doc.id) + "\"><i class=\"fas fa-pen\"></i> Edit</a>" : "";
    return "<div class=\"preview-stage no-print\"><div class=\"card preview-card\"><div class=\"card-body\">" +
      "<p class=\"preview-kicker\"><i class=\"fas fa-eye\"></i> Preview</p>" +
      "<h3 class=\"card-title\">" + esc(doc.title) + "</h3>" +
      "<p class=\"preview-meta\">" + pages + " pages · KSh " + PAY_AMOUNT + " each</p>" +
      "<div class=\"preview-actions\">" + edit +
      "<button class=\"btn btn-sm pay-word\" type=\"button\" data-pay=\"" + esc(doc.id) + "\" data-format=\"docx\"><i class=\"fas fa-file-word\"></i> Word</button>" +
      "<button class=\"btn btn-sm pay-pdf\" type=\"button\" data-pay=\"" + esc(doc.id) + "\" data-format=\"pdf\"><i class=\"fas fa-file-pdf\"></i> PDF</button>" +
      "<button class=\"btn btn-sm pay-print\" type=\"button\" data-pay=\"" + esc(doc.id) + "\" data-format=\"print\"><i class=\"fas fa-print\"></i> Print</button>" +
      "</div></div></div></div>" + warns + "<div class=\"preview-scroll\">" + itcPreviewHtml(doc) + "</div>";
  }

  function viewCalendar() {
    if (!state.cal) {
      var now = new Date();
      state.cal = { y: now.getFullYear(), m: now.getMonth() };
      state.selectedDay = iso(now);
    }
    var y = state.cal.y;
    var m = state.cal.m;
    var first = new Date(y, m, 1);
    var pad = (first.getDay() + 6) % 7;
    var count = new Date(y, m + 1, 0).getDate();
    var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    var cells = "";
    var i;
    for (i = 0; i < pad; i++) cells += "<div></div>";
    for (i = 1; i <= count; i++) {
      var date = new Date(y, m, i);
      var key = iso(date);
      var cls = "cal-day";
      var notes = [];
      ["1", "2", "3"].forEach(function (term) {
        var data = itcTermDefaults(term);
        if (key >= data.start && key <= data.end) {
          cls += " is-term";
          notes.push("Term " + term);
          data.breaks.forEach(function (item) {
            if (key >= item.start && key <= item.end) { cls += " is-break"; notes.push(item.label); }
          });
        }
      });
      itcExams.forEach(function (exam) { if (key >= exam.start && key <= exam.end) { cls += " is-exam"; notes.push(exam.label); } });
      if (key === iso(new Date())) cls += " is-today";
      var posts = myPosts().filter(function (post) { return post.date === key; });
      if (posts.length) notes.push(posts.length + " post" + (posts.length > 1 ? "s" : ""));
      cells += "<button type=\"button\" class=\"" + cls + "\" data-day=\"" + key + "\"><strong>" + i + "</strong><small>" + esc(notes.slice(0, 2).join(" · ")) + "</small></button>";
    }
    var dayPosts = myPosts().filter(function (post) { return post.date === state.selectedDay; }).map(function (post) {
      return "<div class=\"list-row\"><div><strong>" + esc(post.title) + "</strong><div class=\"muted\">" + esc(post.status) + "</div></div></div>";
    }).join("") || "<p class=\"muted\">No post on " + pretty(state.selectedDay) + ".</p>";
    return "<div class=\"cal-head\"><div><p class=\"kicker\">Calendar</p><h2>" + months[m] + " " + y + "</h2></div><div class=\"row-actions\"><button class=\"btn-line\" type=\"button\" id=\"cal-prev\">Previous</button><button class=\"btn-line\" type=\"button\" id=\"cal-next\">Next</button></div></div>" +
      "<div class=\"cal-grid\">" + ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(function (day) { return "<div class=\"cal-dow\">" + day + "</div>"; }).join("") + cells + "</div>" +
      "<section class=\"panel\" style=\"margin-top:14px\"><h3>" + pretty(state.selectedDay) + "</h3>" + dayPosts +
      "<form id=\"day-post\" class=\"form-grid\" style=\"margin-top:10px\"><label class=\"field span-2\"><span>Schedule a post on this day</span><input name=\"title\" required placeholder=\"Grade 5 Mathematics lesson\"></label><label class=\"field\"><span>Type</span><select name=\"type\"><option>Lesson delivery</option><option>Assessment</option><option>Scheme review</option><option>Parent update</option><option>Staff meeting</option><option>Other</option></select></label><label class=\"field\"><span>Notes</span><input name=\"notes\"></label><div><button class=\"btn btn-small\" type=\"submit\">Add post</button></div></form></section>";
  }
  function viewSchedule() {
    var posts = myPosts();
    var done = posts.filter(function (post) { return post.status === "done"; }).length;
    var pct = posts.length ? Math.round(done / posts.length * 100) : 0;
    var rows = posts.map(function (post) {
      return "<div class=\"list-row\"><div><strong>" + esc(post.title) + "</strong><div class=\"muted\">" + pretty(post.date) + " · " + esc(post.type) + (post.notes ? " · " + esc(post.notes) : "") + "</div></div><div class=\"row-actions\"><select data-status=\"" + esc(post.id) + "\">" + ["planned", "progress", "done"].map(function (status) {
        return "<option value=\"" + status + "\"" + (post.status === status ? " selected" : "") + ">" + status + "</option>";
      }).join("") + "</select><button class=\"btn-danger btn-small\" type=\"button\" data-delete-post=\"" + esc(post.id) + "\">Delete</button></div></div>";
    }).join("");
    return "<p class=\"kicker\">Schedule</p><h2>Posts and progress</h2><p>" + done + " of " + posts.length + " completed.</p><div class=\"progress\"><span style=\"width:" + pct + "%\"></span></div>" +
      "<form id=\"post-form\" class=\"form-grid panel\" style=\"margin-top:14px\"><label class=\"field\"><span>Title</span><input name=\"title\" required></label><label class=\"field\"><span>Date</span><input name=\"date\" type=\"date\" value=\"" + iso(new Date()) + "\" required></label><label class=\"field\"><span>Type</span><select name=\"type\"><option>Lesson delivery</option><option>Assessment</option><option>Scheme review</option><option>Parent update</option><option>Staff meeting</option><option>Other</option></select></label><label class=\"field\"><span>Class</span><input name=\"grade\" placeholder=\"Grade 5\"></label><label class=\"field span-2\"><span>Notes</span><input name=\"notes\"></label><div><button class=\"btn\" type=\"submit\">Schedule post</button></div></form>" +
      "<section class=\"panel\" style=\"margin-top:14px\">" + (rows || "<p class=\"muted\">No posts yet.</p>") + "</section>";
  }
  function addPost(data) {
    state.db.posts.push({
      id: uid(),
      ownerId: currentUser().id,
      title: data.title.trim(),
      date: data.date,
      type: data.type,
      grade: data.grade || "",
      subject: data.subject || "",
      notes: data.notes || "",
      status: "planned",
      createdAt: new Date().toISOString()
    });
    persist(true);
    toast("Post scheduled.");
    paintApp();
  }
  function examLevelOptions(selected) {
    return (window.itcLevels || []).map(function (level) {
      return "<option value=\"" + esc(level.id) + "\"" + (level.id === selected ? " selected" : "") + ">" + esc(level.label) + "</option>";
    }).join("");
  }
  function examLevelLabel(id) {
    var found = (window.itcLevels || []).filter(function (level) { return level.id === id; })[0];
    return found ? found.label : "";
  }
  function examFileRow(item, kind) {
    var user = currentUser();
    var admin = user && user.role === "Admin";
    var mine = user && String(item.uploadedBy) === String(user.id);
    var button = kind === "exam" && !mine
      ? "<button class=\"btn btn-small\" type=\"button\" data-pay=\"" + esc(item.id) + "\" data-format=\"file\" data-file-name=\"" + esc(item.title) + "\">Download</button>"
      : "<a class=\"btn btn-small\" href=\"api/library.php?action=file&id=" + encodeURIComponent(item.id) + "\">Open</a>";
    var remove = (admin || mine) ? "<button class=\"btn-line btn-small\" type=\"button\" data-delete-file=\"" + esc(item.id) + "\">Remove</button>" : "";
    var who = mine ? "Uploaded by you" : "";
    var place = [examLevelLabel(item.levelId), item.term ? "Term " + item.term : "", item.note || item.name || "", who].filter(Boolean).join(" · ");
    return "<div class=\"list-row\"><div><strong>" + esc(item.title) + "</strong><div class=\"muted\">" + esc(place) + "</div></div><div class=\"row-actions\">" + button + remove + "</div></div>";
  }
  function paintExamLibrary(items) {
    var mount = $("library-list");
    if (!mount) return;
    var filter = state.examFilter || { level: "", term: "" };
    var shown = items.filter(function (item) {
      if (filter.level && item.levelId !== filter.level) return false;
      if (filter.term && String(item.term || "") !== String(filter.term)) return false;
      return true;
    });
    var groups = [
      ["opener", "Opener exams"],
      ["midterm", "Mid-term exams"],
      ["endterm", "End-of-term exams"],
      ["", "Other uploaded exams"]
    ];
    mount.innerHTML = groups.map(function (group) {
      var rows = shown.filter(function (item) { return (item.paperType || "") === group[0]; });
      var body = rows.length ? rows.map(function (item) { return examFileRow(item, "exam"); }).join("") : "<p class=\"muted\">No paper in this section yet.</p>";
      return "<section class=\"panel\" style=\"margin-top:14px\"><h3>" + group[1] + "</h3>" + body + "</section>";
    }).join("");
  }
  function viewLibrary(kind) {
    var exam = kind === "exam";
    var admin = currentUser().role === "Admin";
    var upload = "";
    if (exam && admin) {
      upload = "<form id=\"upload-form\" class=\"panel form-grid\" data-kind=\"exam\" style=\"margin-top:14px\"><h3 class=\"span-2\">Upload an opener, mid-term or end-of-term paper</h3>" +
        "<label class=\"field\"><span>Class</span><select name=\"levelId\" required><option value=\"\">Choose a class</option>" + examLevelOptions("") + "</select></label>" +
        "<label class=\"field\"><span>Term</span><select name=\"term\" required><option value=\"1\">Term 1</option><option value=\"2\">Term 2</option><option value=\"3\">Term 3</option></select></label>" +
        "<label class=\"field\"><span>Paper</span><select name=\"paperType\" required><option value=\"opener\">Opener</option><option value=\"midterm\">Mid-term</option><option value=\"endterm\">End of term</option></select></label>" +
        "<label class=\"field\"><span>Title</span><input name=\"title\" required placeholder=\"For example Grade 6 Mathematics opener\"></label>" +
        "<label class=\"field span-2\"><span>Subject or note</span><input name=\"note\" placeholder=\"Subject and a short description\"></label>" +
        "<label class=\"field span-2\"><span>File</span><input name=\"file\" type=\"file\" accept=\".pdf,.doc,.docx,.txt,application/pdf\" required></label>" +
        "<div class=\"span-2\"><button class=\"btn\" type=\"submit\">Upload paper</button></div>" +
        "<p class=\"help span-2\">PDF, Word or text, up to 8 MB. Teachers open a paper you uploaded after paying KSh " + PAY_AMOUNT + ". You can open your own file again.</p></form>";
    } else if (exam) {
      upload = "<form id=\"upload-form\" class=\"panel form-grid\" data-kind=\"exam\" style=\"margin-top:14px\"><h3 class=\"span-2\">Upload an exam or assessment</h3><label class=\"field\"><span>Title</span><input name=\"title\" required placeholder=\"For example Grade 6 Mathematics assessment\"></label><label class=\"field\"><span>Class and subject</span><input name=\"note\" placeholder=\"Class, subject or a short description\"></label><label class=\"field span-2\"><span>File</span><input name=\"file\" type=\"file\" accept=\".pdf,.doc,.docx,.txt,application/pdf\" required></label><div class=\"span-2\"><button class=\"btn\" type=\"submit\">Upload exam or assessment</button></div><p class=\"help span-2\">PDF, Word or text, up to 8 MB. Your own file stays on your account and can be opened again. Another teacher pays KSh " + PAY_AMOUNT + " to download it. Opener, mid-term and end-of-term papers are filed by an administrator.</p></form>";
    } else if (admin) {
      upload = "<form id=\"upload-form\" class=\"panel form-grid\" data-kind=\"research\" style=\"margin-top:14px\"><h3 class=\"span-2\">Upload research</h3><label class=\"field\"><span>Title</span><input name=\"title\" required placeholder=\"Title of the paper\"></label><label class=\"field\"><span>Note</span><input name=\"note\" placeholder=\"A short description\"></label><label class=\"field span-2\"><span>File</span><input name=\"file\" type=\"file\" accept=\".pdf,.doc,.docx,.txt,application/pdf\" required></label><div class=\"span-2\"><button class=\"btn\" type=\"submit\">Upload</button></div><p class=\"help span-2\">PDF, Word or text, up to 8 MB. The file is stored on this school server.</p></form>";
    }
    var planner = exam
      ? "<p style=\"margin-top:14px\"><a class=\"btn\" href=\"#/generate\" id=\"plan-exam\">Prepare an exam with the planner</a></p><p class=\"help\">The planner writes original calculation questions and a marking guide from the strands you tick. It does not copy a past paper. Upload the official paper when you already have the document.</p>"
      : "";
    var filters = exam
      ? "<div class=\"form-grid\" style=\"margin-top:14px\"><label class=\"field\"><span>Class</span><select id=\"exam-level\"><option value=\"\">All classes</option>" + examLevelOptions(state.examFilter.level) + "</select></label><label class=\"field\"><span>Term</span><select id=\"exam-term\"><option value=\"\">All terms</option><option value=\"1\"" + (state.examFilter.term === "1" ? " selected" : "") + ">Term 1</option><option value=\"2\"" + (state.examFilter.term === "2" ? " selected" : "") + ">Term 2</option><option value=\"3\"" + (state.examFilter.term === "3" ? " selected" : "") + ">Term 3</option></select></label></div>"
      : "";
    return "<p class=\"kicker\">" + (exam ? "Exams" : "Research") + "</p><h2>" + (exam ? "Exams and assessments" : "Centre research") + "</h2><p>" +
      (exam
        ? "Opener, mid-term and end-of-term papers are listed by class and term. A file you upload can be opened again. Downloading another teacher's file is KSh " + PAY_AMOUNT + " through Paystack, and a paid file can be downloaded again."
        : "Papers and notes uploaded by the administrator for this centre. University repositories are not listed here.") +
      "</p>" + filters + "<div id=\"library-list\"><p class=\"muted\">Loading the list…</p></div>" + upload + planner;
  }
  function loadLibrary(kind) {
    var mount = $("library-list");
    if (!mount) return;
    fetch("api/library.php?action=list&kind=" + encodeURIComponent(kind)).then(function (response) {
      return response.json();
    }).then(function (data) {
      var items = (data && data.items) || [];
      if (!mount) return;
      if (kind === "exam") {
        state.libraryExam = items;
        paintExamLibrary(items);
        return;
      }
      if (!items.length) {
        mount.innerHTML = "<p class=\"muted\">No research has been uploaded yet.</p>";
        return;
      }
      mount.innerHTML = items.map(function (item) { return examFileRow(item, kind); }).join("");
    }).catch(function () {
      if (mount) mount.innerHTML = "<p class=\"muted\">The file list could not be loaded. On this computer, open the site through WAMP so uploads can be stored.</p>";
    });
  }
  function payState(pay) {
    var status = pay.status || "success";
    if (status === "success") return "paid";
    if (status === "pending") return "pending";
    return "cancelled";
  }
  function viewTransactions() {
    var pays = myPays().slice().sort(function (a, b) {
      return String(b.at || "").localeCompare(String(a.at || ""));
    });
    var rows = pays.map(function (pay) {
      var doc = pay.docId ? findDoc(pay.docId) : null;
      var title = doc ? doc.title : (pay.fileName || "Document");
      var kind = payState(pay);
      var label = kind === "paid" ? "Paid" : kind === "pending" ? "Pending" : "Cancelled";
      var badge = kind === "paid" ? "badge-success" : kind === "pending" ? "badge-warning" : "badge-danger";
      var format = pay.format === "docx" ? "Word" : pay.format === "pdf" ? "PDF" : pay.format === "print" ? "Print" : "File";
      var view = doc ? "<a class=\"btn btn-sm btn-default\" href=\"#/preview/" + esc(doc.id) + "\">View</a>" : "<span class=\"text-muted\">—</span>";
      var edit = doc && (doc.type === "scheme" || doc.type === "lesson") ? "<a class=\"btn btn-sm btn-default\" href=\"#/edit/" + esc(doc.id) + "\">Edit</a>" : "<span class=\"text-muted\">—</span>";
      var action = "<span class=\"text-muted\">—</span>";
      if (kind === "paid" && pay.reference) action = "<button class=\"btn btn-sm btn-primary\" type=\"button\" data-download-ref=\"" + esc(pay.reference) + "\">Download</button>";
      else if (pay.docId) action = "<button class=\"btn btn-sm btn-primary\" type=\"button\" data-pay=\"" + esc(pay.docId) + "\" data-format=\"" + esc(pay.format || "pdf") + "\" data-file-name=\"" + esc(pay.fileName || title) + "\">" + (kind === "pending" ? "Continue" : "Pay again") + "</button>";
      var marked = state.highlightRef && pay.reference === state.highlightRef ? " class=\"table-primary\"" : "";
      return "<tr" + marked + "><td>" + esc(title) + "</td><td>" + format + "</td><td><span class=\"badge " + badge + "\">" + label + "</span></td><td>" + esc(pretty((pay.at || "").slice(0, 10))) + "</td><td>KSh " + esc(pay.amount || PAY_AMOUNT) + "</td><td>" + view + "</td><td>" + edit + "</td><td>" + action + "</td></tr>";
    }).join("") || "<tr><td colspan=\"8\" class=\"text-muted\">No transactions yet. A download from a new document is paid once, then it stays here.</td></tr>";
    return "<div class=\"content-header\"><div class=\"container-fluid\"><h1 class=\"m-0\">Transaction history</h1><p class=\"text-muted\">Paid documents can be downloaded again. A new document is paid for separately. Pending and cancelled payments stay in this list.</p></div></div><div class=\"card\"><div class=\"card-body table-responsive p-0\"><table class=\"table table-striped mb-0\"><thead><tr><th>Document</th><th>Format</th><th>Status</th><th>Date</th><th>Amount</th><th>View</th><th>Edit</th><th>Download</th></tr></thead><tbody>" + rows + "</tbody></table></div></div>";
  }
  function viewAccount() {
    var user = currentUser();
    var roles = ["Teacher", "Head of Department", "Deputy Principal", "Principal"];
    if (user.role === "Admin") roles.push("Admin");
    var mpesa = user.role === "Admin"
      ? "<div class=\"card card-outline card-primary\"><div class=\"card-header\"><h3 class=\"card-title\">M-Pesa prompt</h3></div><div class=\"card-body\"><p id=\"mpesa-ready\" class=\"text-muted\">Checking whether Safaricom is connected…</p><form id=\"mpesa-form\"><div class=\"form-group\"><label>Environment</label><select class=\"form-control\" name=\"env\"><option value=\"sandbox\">Sandbox</option><option value=\"production\">Live</option></select></div><div class=\"form-group\"><label>Till or paybill</label><select class=\"form-control\" name=\"type\"><option value=\"CustomerBuyGoodsOnline\">Buy goods (till)</option><option value=\"CustomerPayBillOnline\">Paybill</option></select></div><div class=\"form-group\"><label>Shortcode</label><input class=\"form-control\" name=\"shortcode\" autocomplete=\"off\"></div><div class=\"form-group\"><label>Party B</label><input class=\"form-control\" name=\"party_b\" placeholder=\"Till or paybill number\" autocomplete=\"off\"></div><div class=\"form-group\"><label>Consumer key</label><input class=\"form-control\" name=\"consumer_key\" autocomplete=\"off\"></div><div class=\"form-group\"><label>Consumer secret</label><input class=\"form-control\" name=\"consumer_secret\" type=\"password\" autocomplete=\"off\"></div><div class=\"form-group\"><label>Passkey</label><input class=\"form-control\" name=\"passkey\" type=\"password\" autocomplete=\"off\"></div><div class=\"form-group\"><label>Callback URL</label><input class=\"form-control\" name=\"callback\" placeholder=\"https://your-domain/callback\"></div><button class=\"btn btn-primary\" type=\"submit\">Save M-Pesa details</button><p class=\"text-muted mt-2\">Safaricom sends the KSh 15 prompt to the phone number the teacher types. These details come from the Daraja app. Keys stay on this server.</p></form></div></div>" +
      "<div class=\"card card-outline card-warning\"><div class=\"card-header\"><h3 class=\"card-title\">Paystack</h3></div><div class=\"card-body\"><p class=\"text-muted\">Teachers pay on the Paystack page. A download opens only after the payment status is success. Paste these addresses into the Paystack test settings.</p><div class=\"form-group\"><label>Test callback URL</label><input class=\"form-control\" readonly value=\"https://imaniteacherscenter.co.ke/\"></div><div class=\"form-group\"><label>Test webhook URL</label><input class=\"form-control\" readonly value=\"https://imaniteacherscenter.co.ke/api/paystack.php?action=webhook\"></div><p class=\"text-muted\">The secret key stays on this server.</p></div></div>" +
      "<div class=\"card card-outline card-info\"><div class=\"card-header\"><h3 class=\"card-title\">Password reset email</h3></div><div class=\"card-body\"><p id=\"mail-ready\" class=\"text-muted\">Checking outgoing mail…</p><form id=\"mail-form\"><div class=\"form-group\"><label>SMTP host</label><input class=\"form-control\" name=\"host\" autocomplete=\"off\"></div><div class=\"form-group\"><label>Port</label><input class=\"form-control\" name=\"port\" value=\"587\" inputmode=\"numeric\"></div><div class=\"form-group\"><label>Encryption</label><select class=\"form-control\" name=\"encryption\"><option value=\"tls\">TLS</option><option value=\"ssl\">SSL</option></select></div><div class=\"form-group\"><label>Username</label><input class=\"form-control\" name=\"username\" autocomplete=\"off\"></div><div class=\"form-group\"><label>Password</label><input class=\"form-control\" name=\"password\" type=\"password\" autocomplete=\"new-password\" placeholder=\"Leave blank to keep the saved password\"></div><div class=\"form-group\"><label>From email</label><input class=\"form-control\" name=\"from\" type=\"email\"></div><div class=\"form-group\"><label>From name</label><input class=\"form-control\" name=\"from_name\" value=\"IMANI TEACHERS CENTER\"></div><button class=\"btn btn-primary\" type=\"submit\">Save outgoing mail</button><p class=\"text-muted mt-2\">Teachers use Forgot password on the sign-in page. The mailbox password stays on this server.</p></form></div></div>" +
      "<div class=\"card card-outline card-secondary\"><div class=\"card-header\"><h3 class=\"card-title\">Test a PDF release</h3></div><form id=\"admin-test-form\"><div class=\"card-body\"><p class=\"text-muted\">This check is for an administrator only. It releases one PDF, or one uploaded exam, without opening Paystack.</p><div class=\"form-group\"><label>Document</label><select class=\"form-control\" name=\"docId\">" + state.db.documents.map(function (doc) { return "<option value=\"" + esc(doc.id) + "\">" + esc(doc.title) + "</option>"; }).join("") + "</select></div><div class=\"form-group\"><label>Or an uploaded exam id</label><input class=\"form-control\" name=\"fileId\" autocomplete=\"off\"></div><div class=\"form-group\"><label>Test code</label><input class=\"form-control\" name=\"code\" autocomplete=\"off\" spellcheck=\"false\"></div><p class=\"text-danger\" id=\"admin-test-error\"></p></div><div class=\"card-footer\"><button class=\"btn btn-primary\" type=\"submit\">Release test PDF</button></div></form></div>"
      : "";
    var people = "";
    if (user.role === "Admin") {
      people = "<div class=\"card\"><div class=\"card-header\"><h3 class=\"card-title\">Centre accounts</h3></div><div class=\"card-body\"><p class=\"text-muted\">" + state.db.users.length + " accounts are on this centre.</p><a class=\"btn btn-default\" href=\"#/users\">Manage users</a></div></div>";
    }
    return "<div class=\"row\"><div class=\"col-lg-7\"><div class=\"card card-primary\"><div class=\"card-header\"><h3 class=\"card-title\">Profile</h3></div><form id=\"profile-form\"><div class=\"card-body\">" +
      "<div class=\"form-group\"><label>Full name</label><input class=\"form-control\" name=\"name\" value=\"" + esc(user.name) + "\" required></div>" +
      "<div class=\"form-group\"><label>School</label><input class=\"form-control\" name=\"school\" value=\"" + esc(user.school) + "\" required></div>" +
      "<div class=\"form-group\"><label>TSC number</label><input class=\"form-control\" name=\"tsc\" value=\"" + esc(user.tsc || "") + "\"></div>" +
      "<div class=\"form-group\"><label>M-Pesa number</label><input class=\"form-control\" name=\"phone\" value=\"" + esc(user.phone || "") + "\" inputmode=\"tel\" placeholder=\"07XXXXXXXX\"></div>" +
      "<div class=\"form-group\"><label>Email</label><input class=\"form-control\" value=\"" + esc(user.email) + "\" disabled></div>" +
      "<div class=\"form-group\"><label>Role</label><select class=\"form-control\" name=\"role\">" + roles.map(function (role) { return option(role, role, user.role); }).join("") + "</select></div>" +
      "<p class=\"text-muted\">Saved in the school database. Email stays with the account that was created.</p></div><div class=\"card-footer\">" +
      "<button class=\"btn btn-primary\" type=\"button\" id=\"save-profile\">Save profile</button> " +
      "<button class=\"btn btn-default\" type=\"button\" id=\"profile-sign-out\">Sign out</button></div></form></div>" + mpesa + "</div><div class=\"col-lg-5\">" +
      "<div class=\"card\"><div class=\"card-header\"><h3 class=\"card-title\">Payments</h3></div><div class=\"card-body\"><p class=\"text-muted\">Paid documents stay available to download again. A new document is paid for separately.</p><a class=\"btn btn-primary btn-sm\" href=\"#/transactions\">Transaction history</a></div></div>" +
      people +
      "<div class=\"card card-outline card-danger\"><div class=\"card-header\"><h3 class=\"card-title\">Delete account</h3></div><div class=\"card-body\"><p>This removes your profile, documents, posts and payment notes from the school database.</p><button class=\"btn btn-danger\" type=\"button\" id=\"delete-account\">Delete my account</button></div></div></div></div>";
  }
  function financeMoment(value) {
    if (!value) return null;
    var date = new Date(String(value).replace(" ", "T"));
    return isNaN(date.getTime()) ? null : date;
  }
  function financePaid(pay) {
    return payState(pay) === "paid";
  }
  function financeBounds(key) {
    var now = new Date();
    var start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    var end = new Date(start);
    end.setHours(23, 59, 59, 999);
    if (key === "week") {
      var back = (start.getDay() + 6) % 7;
      start.setDate(start.getDate() - back);
    } else if (key === "month") {
      start.setDate(1);
    } else if (key === "year") {
      start = new Date(now.getFullYear(), 0, 1);
    }
    return { start: start, end: end };
  }
  function financeInside(date, start, end) {
    return date && date >= start && date <= end;
  }
  function financeBuckets(key) {
    var bounds = financeBounds(key);
    var buckets = [];
    var cursor = new Date(bounds.start);
    var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    var days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    if (key === "today") {
      var hour;
      for (hour = 0; hour < 24; hour++) {
        buckets.push({ label: String(hour).padStart(2, "0"), start: new Date(bounds.start.getFullYear(), bounds.start.getMonth(), bounds.start.getDate(), hour), end: new Date(bounds.start.getFullYear(), bounds.start.getMonth(), bounds.start.getDate(), hour, 59, 59, 999) });
      }
    } else if (key === "year") {
      var month;
      for (month = 0; month < 12; month++) {
        buckets.push({ label: months[month], start: new Date(bounds.start.getFullYear(), month, 1), end: new Date(bounds.start.getFullYear(), month + 1, 0, 23, 59, 59, 999) });
      }
    } else {
      while (cursor <= bounds.end) {
        var label = key === "week" ? days[(cursor.getDay() + 6) % 7] : String(cursor.getDate());
        buckets.push({ label: label, start: new Date(cursor), end: new Date(cursor.getFullYear(), cursor.getMonth(), cursor.getDate(), 23, 59, 59, 999) });
        cursor.setDate(cursor.getDate() + 1);
      }
    }
    return buckets;
  }
  function financeCount(key) {
    var bounds = financeBounds(key);
    var users = state.db.users.filter(function (person) {
      return financeInside(financeMoment(person.createdAt), bounds.start, bounds.end);
    }).length;
    var sales = state.db.payments.reduce(function (sum, pay) {
      if (!financePaid(pay)) return sum;
      return financeInside(financeMoment(pay.at), bounds.start, bounds.end) ? sum + Number(pay.amount || 0) : sum;
    }, 0);
    return { users: users, sales: sales };
  }
  function financeSeries(key) {
    var buckets = financeBuckets(key);
    buckets.forEach(function (bucket) {
      bucket.users = state.db.users.filter(function (person) {
        return financeInside(financeMoment(person.createdAt), bucket.start, bucket.end);
      }).length;
      bucket.payments = state.db.payments.filter(function (pay) {
        return financePaid(pay) && financeInside(financeMoment(pay.at), bucket.start, bucket.end);
      }).length;
    });
    return buckets;
  }
  function financeChart(key) {
    var buckets = financeSeries(key);
    var width = 760;
    var height = 260;
    var left = 36;
    var right = 12;
    var top = 18;
    var bottom = 32;
    var plotW = width - left - right;
    var plotH = height - top - bottom;
    var peak = 1;
    buckets.forEach(function (bucket) { peak = Math.max(peak, bucket.users, bucket.payments); });
    var step = plotW / buckets.length;
    var bars = buckets.map(function (bucket, index) {
      var barH = (bucket.payments / peak) * plotH;
      var x = left + index * step + step * 0.22;
      var y = top + plotH - barH;
      return "<rect x=\"" + x.toFixed(1) + "\" y=\"" + y.toFixed(1) + "\" width=\"" + (step * 0.56).toFixed(1) + "\" height=\"" + Math.max(barH, bucket.payments ? 2 : 0).toFixed(1) + "\" rx=\"3\" fill=\"#4eb6ea\"><title>" + esc(bucket.label) + ": " + bucket.payments + " payments</title></rect>";
    }).join("");
    var points = buckets.map(function (bucket, index) {
      var x = left + index * step + step / 2;
      var y = top + plotH - (bucket.users / peak) * plotH;
      return x.toFixed(1) + "," + y.toFixed(1);
    }).join(" ");
    var dots = buckets.map(function (bucket, index) {
      var x = left + index * step + step / 2;
      var y = top + plotH - (bucket.users / peak) * plotH;
      return "<circle cx=\"" + x.toFixed(1) + "\" cy=\"" + y.toFixed(1) + "\" r=\"3.2\" fill=\"#12263f\"><title>" + esc(bucket.label) + ": " + bucket.users + " new accounts</title></circle>";
    }).join("");
    var labels = buckets.map(function (bucket, index) {
      if (buckets.length > 16 && index % 3 !== 0 && index !== buckets.length - 1) return "";
      var x = left + index * step + step / 2;
      return "<text x=\"" + x.toFixed(1) + "\" y=\"" + (height - 8) + "\" text-anchor=\"middle\">" + esc(bucket.label) + "</text>";
    }).join("");
    var grid = [0, 0.5, 1].map(function (part) {
      var y = top + plotH - part * plotH;
      var value = Math.round(peak * part);
      return "<line x1=\"" + left + "\" y1=\"" + y.toFixed(1) + "\" x2=\"" + (width - right) + "\" y2=\"" + y.toFixed(1) + "\" stroke=\"#d3deea\"/>" +
        "<text x=\"" + (left - 6) + "\" y=\"" + (y + 4).toFixed(1) + "\" text-anchor=\"end\">" + value + "</text>";
    }).join("");
    return "<svg class=\"finance-chart\" viewBox=\"0 0 " + width + " " + height + "\" role=\"img\" aria-label=\"New accounts and successful payments\">" + grid + bars + "<polyline points=\"" + points + "\" fill=\"none\" stroke=\"#12263f\" stroke-width=\"2.4\" stroke-linejoin=\"round\"/>" + dots + labels + "</svg>";
  }
  function financeRows() {
    var query = String(state.finance.q || "").trim().toLowerCase();
    var status = state.finance.status || "all";
    return state.db.payments.filter(function (pay) {
      var kind = payState(pay);
      if (status !== "all" && kind !== status) return false;
      if (!query) return true;
      var person = state.db.users.filter(function (user) { return String(user.id) === String(pay.ownerId); })[0];
      var doc = pay.docId ? findDoc(pay.docId) : null;
      var hay = [pay.reference, pay.email, pay.fileName, pay.format, kind, person && person.name, person && person.email, doc && doc.title].join(" ").toLowerCase();
      return hay.indexOf(query) >= 0;
    }).sort(function (a, b) {
      return String(b.at || "").localeCompare(String(a.at || ""));
    });
  }
  function financeTable() {
    var rows = financeRows();
    var size = 8;
    var pages = Math.max(1, Math.ceil(rows.length / size));
    if (state.finance.page > pages) state.finance.page = pages;
    if (state.finance.page < 1) state.finance.page = 1;
    var start = (state.finance.page - 1) * size;
    var slice = rows.slice(start, start + size);
    var body = slice.map(function (pay) {
      var person = state.db.users.filter(function (user) { return String(user.id) === String(pay.ownerId); })[0];
      var doc = pay.docId ? findDoc(pay.docId) : null;
      var title = doc ? doc.title : (pay.fileName || "Document");
      var kind = payState(pay);
      var label = kind === "paid" ? "Paid" : kind === "pending" ? "Pending" : "Cancelled";
      var badge = kind === "paid" ? "badge-success" : kind === "pending" ? "badge-warning" : "badge-danger";
      var format = pay.format === "docx" ? "Word" : pay.format === "pdf" ? "PDF" : pay.format === "print" ? "Print" : "File";
      return "<tr><td>" + esc(pretty((pay.at || "").slice(0, 10))) + "</td><td>" + esc(person ? person.name : (pay.email || "Account")) + "<div class=\"text-muted\">" + esc(person ? person.email : (pay.email || "")) + "</div></td><td>" + esc(title) + "</td><td>" + format + "</td><td>KSh " + esc(pay.amount || 0) + "</td><td><span class=\"badge " + badge + "\">" + label + "</span></td><td>" + esc(pay.reference || "") + "</td></tr>";
    }).join("") || "<tr><td colspan=\"7\" class=\"text-muted\">No transactions match this search.</td></tr>";
    var pager = "<span class=\"text-muted\">" + (rows.length ? (start + 1) + "–" + Math.min(start + size, rows.length) + " of " + rows.length : "0") + "</span> ";
    pager += "<button class=\"btn btn-sm btn-default\" type=\"button\" data-finance-page=\"" + (state.finance.page - 1) + "\"" + (state.finance.page <= 1 ? " disabled" : "") + ">Previous</button> ";
    pager += "<button class=\"btn btn-sm btn-default\" type=\"button\" data-finance-page=\"" + (state.finance.page + 1) + "\"" + (state.finance.page >= pages ? " disabled" : "") + ">Next</button>";
    return { body: body, pager: pager };
  }
  function financeCard(tone, value, label) {
    return "<div class=\"col-lg-3 col-6\"><div class=\"small-box " + tone + "\"><div class=\"inner\"><h3>" + esc(value) + "</h3><p>" + esc(label) + "</p></div><div class=\"icon\"><i class=\"fas fa-chart-bar\"></i></div></div></div>";
  }
  function viewFinance() {
    var user = currentUser();
    if (!user || user.role !== "Admin") return "";
    var ranges = [["today", "Today"], ["week", "This week"], ["month", "This month"], ["year", "This year"]];
    var users = ranges.map(function (item) {
      return financeCard("bg-info", String(financeCount(item[0]).users), "Users " + item[1].toLowerCase());
    }).join("");
    var sales = ranges.map(function (item) {
      return financeCard("bg-success", "KSh " + financeCount(item[0]).sales, "Sales " + item[1].toLowerCase());
    }).join("");
    var switches = ranges.map(function (item) {
      var on = state.finance.range === item[0] ? " btn-primary" : " btn-default";
      return "<button class=\"btn btn-sm" + on + "\" type=\"button\" data-finance-range=\"" + item[0] + "\">" + item[1] + "</button>";
    }).join(" ");
    var table = financeTable();
    var statuses = [["all", "All statuses"], ["paid", "Paid"], ["pending", "Pending"], ["cancelled", "Cancelled"]];
    return "<div class=\"content-header\"><div class=\"container-fluid\"><h1 class=\"m-0\">Finance</h1><p class=\"text-muted\">New accounts and successful payments for this centre. Only an administrator can open this page.</p></div></div>" +
      "<div class=\"row\">" + users + "</div>" +
      "<div class=\"row\">" + sales + "</div>" +
      "<div class=\"card\"><div class=\"card-header\"><h3 class=\"card-title\">Users and payments</h3><div class=\"card-tools\">" + switches + "</div></div><div class=\"card-body\"><p class=\"text-muted mb-2\"><span class=\"finance-swatch finance-swatch-bar\"></span> Successful payments <span class=\"finance-swatch finance-swatch-line\"></span> New accounts</p>" + financeChart(state.finance.range) + "</div></div>" +
      "<div class=\"card\"><div class=\"card-header\"><h3 class=\"card-title\">All transactions</h3></div><div class=\"card-body\"><div class=\"row\"><div class=\"col-md-6\"><input class=\"form-control\" id=\"finance-q\" value=\"" + esc(state.finance.q) + "\" placeholder=\"Search name, email, document or reference\"></div><div class=\"col-md-3\"><select class=\"form-control\" id=\"finance-status\">" + statuses.map(function (item) { return option(item[0], item[1], state.finance.status); }).join("") + "</select></div></div></div><div class=\"table-responsive\"><table class=\"table table-striped mb-0\"><thead><tr><th>Date</th><th>Account</th><th>Document</th><th>Format</th><th>Amount</th><th>Status</th><th>Reference</th></tr></thead><tbody id=\"finance-rows\">" + table.body + "</tbody></table></div><div class=\"card-footer\" id=\"finance-pager\">" + table.pager + "</div></div>";
  }
  function viewUsers() {
    var user = currentUser();
    if (!user || user.role !== "Admin") return "";
    var roles = ["Teacher", "Head of Department", "Deputy Principal", "Principal", "Admin"];
    var rows = state.db.users.map(function (person) {
      return "<tr><td>" + esc(person.name) + "</td><td>" + esc(person.email) + "</td><td>" + esc(person.school || "") + "</td><td>" + esc(person.role) + "</td><td>" + esc(person.phone || "") + "</td><td class=\"text-nowrap\"><button class=\"btn btn-sm btn-default\" type=\"button\" data-user-edit=\"" + esc(person.id) + "\">Edit</button> <button class=\"btn btn-sm btn-default\" type=\"button\" data-user-reset=\"" + esc(person.id) + "\">Reset password</button></td></tr>";
    }).join("") || "<tr><td colspan=\"6\" class=\"text-muted\">No accounts yet.</td></tr>";
    return "<div class=\"card\"><div class=\"card-header\"><h3 class=\"card-title\">Users</h3><div class=\"card-tools\"><button class=\"btn btn-sm btn-primary\" type=\"button\" id=\"user-create\">Create user</button></div></div><div class=\"card-body table-responsive p-0\"><table class=\"table table-striped mb-0\"><thead><tr><th>Name</th><th>Email</th><th>School</th><th>Role</th><th>Phone</th><th></th></tr></thead><tbody>" + rows + "</tbody></table></div></div>" + userEditorMarkup(roles);
  }
  function userEditorMarkup(roles) {
    var edit = state.userEdit;
    if (!edit) return "";
    if (edit.mode === "create") return userEditorCard("Create user", roles, null, "create");
    var person = state.db.users.filter(function (item) { return String(item.id) === String(edit.id); })[0];
    if (!person) return "";
    if (edit.mode === "reset") {
      return "<div class=\"card card-warning mt-3\"><div class=\"card-header\"><h3 class=\"card-title\">Reset password</h3></div><form id=\"user-editor-form\"><div class=\"card-body\"><p>Set a new password for <strong>" + esc(person.name) + "</strong> (" + esc(person.email) + ").</p><div class=\"form-group\"><label>New password</label><input class=\"form-control\" name=\"password\" type=\"password\" minlength=\"6\" required autocomplete=\"new-password\"></div><div class=\"form-group\"><label>Confirm password</label><input class=\"form-control\" name=\"confirm\" type=\"password\" minlength=\"6\" required autocomplete=\"new-password\"></div></div><div class=\"card-footer\"><button class=\"btn btn-primary\" type=\"button\" id=\"user-editor-save\">Save password</button> <button class=\"btn btn-default\" type=\"button\" id=\"user-editor-cancel\">Cancel</button></div></form></div>";
    }
    return userEditorCard("Edit user", roles, person, "edit");
  }
  function userEditorCard(title, roles, person, mode) {
    person = person || { name: "", email: "", school: "", tsc: "", phone: "", role: "Teacher" };
    var password = mode === "create" ? "<div class=\"form-group\"><label>Password</label><input class=\"form-control\" name=\"password\" type=\"password\" minlength=\"6\" required autocomplete=\"new-password\"></div>" : "";
    return "<div class=\"card card-primary mt-3\"><div class=\"card-header\"><h3 class=\"card-title\">" + title + "</h3></div><form id=\"user-editor-form\"><div class=\"card-body\">" +
      "<div class=\"form-group\"><label>Full name</label><input class=\"form-control\" name=\"name\" value=\"" + esc(person.name) + "\" required></div>" +
      "<div class=\"form-group\"><label>Email</label><input class=\"form-control\" name=\"email\" type=\"email\" value=\"" + esc(person.email) + "\" required></div>" +
      password +
      "<div class=\"form-group\"><label>School</label><input class=\"form-control\" name=\"school\" value=\"" + esc(person.school || "") + "\" required></div>" +
      "<div class=\"form-group\"><label>TSC number</label><input class=\"form-control\" name=\"tsc\" value=\"" + esc(person.tsc || "") + "\"></div>" +
      "<div class=\"form-group\"><label>Phone</label><input class=\"form-control\" name=\"phone\" value=\"" + esc(person.phone || "") + "\" inputmode=\"tel\"></div>" +
      "<div class=\"form-group\"><label>Role</label><select class=\"form-control\" name=\"role\">" + roles.map(function (role) { return option(role, role, person.role); }).join("") + "</select></div>" +
      "</div><div class=\"card-footer\"><button class=\"btn btn-primary\" type=\"button\" id=\"user-editor-save\">Save</button> <button class=\"btn btn-default\" type=\"button\" id=\"user-editor-cancel\">Cancel</button></div></form></div>";
  }
  function loadMailReady() {
    var note = $("mail-ready");
    if (!note) return;
    fetch("api/auth.php?action=mail", { credentials: "same-origin" }).then(function (response) { return response.json(); }).then(function (data) {
      var form = $("mail-form");
      var mail = data && data.mail ? data.mail : null;
      if (note) note.textContent = mail && mail.configured ? "Outgoing mail is connected." : "Outgoing mail is not connected yet. Add the mailbox details below.";
      if (!form || !mail) return;
      ["host", "port", "username", "from", "from_name"].forEach(function (name) {
        if (form.elements[name] && mail[name]) form.elements[name].value = mail[name];
      });
      if (form.elements.encryption && mail.encryption) form.elements.encryption.value = mail.encryption;
    }).catch(function () {
      if (note) note.textContent = "Outgoing mail could not be loaded.";
    });
  }
  function loadMpesaReady() {
    var note = $("mpesa-ready");
    if (!note) return;
    fetch("api/mpesa.php?action=ready").then(function (response) { return response.json(); }).then(function (data) {
      if (!note) return;
      note.textContent = data && data.ready
        ? "The prompt is connected (" + (data.env === "production" ? "live" : "sandbox") + ")."
        : "The prompt is not connected yet. Add the till or paybill details below. Until then, a download cannot be released.";
    }).catch(function () {
      if (note) note.textContent = "The payment service is not reachable. Open the site through WAMP.";
    });
  }

  function renderChat() {
    var log = $("ai-log");
    if (!log || $("workspace").hidden) return;
    var items = chats();
    if (!items.length) {
      items.push({ role: "ai", text: "Notes follow the class, subject, course book and breaks while you prepare a document. Ask about activities, assessment, a mixed-ability class, or the previous grade." });
      persist();
    }
    log.innerHTML = items.slice(-30).map(function (item) {
      return "<div class=\"ai-msg " + (item.role === "user" ? "user" : "") + "\">" + esc(item.text) + "</div>";
    }).join("");
    log.scrollTop = log.scrollHeight;
  }
  function ask(text) {
    var message = String(text || "").trim();
    if (!message) return;
    var thread = chats();
    thread.push({ role: "user", text: message });
    thread.push({ role: "ai", text: "Looking at this class…" });
    renderChat();
    var form = state.form || defaultForm(currentUser());
    setTimeout(function () {
      thread[thread.length - 1].text = itcAiReply(message, form);
      if (thread.length > 40) thread.splice(0, thread.length - 40);
      persist();
      renderChat();
    }, 350);
  }

  function kenyanPhone(value) {
    var digits = String(value || "").replace(/\D/g, "");
    if (/^0(7|1)\d{8}$/.test(digits)) return "254" + digits.slice(1);
    if (/^(7|1)\d{8}$/.test(digits)) return "254" + digits;
    if (/^254(7|1)\d{8}$/.test(digits)) return digits;
    return "";
  }
  function rememberPay(payment) {
    if (!payment || !payment.id) return;
    var index = -1;
    state.db.payments.forEach(function (pay, i) {
      if (pay.id === payment.id || (payment.reference && pay.reference === payment.reference)) index = i;
    });
    if (index === -1) state.db.payments.unshift(payment);
    else state.db.payments[index] = payment;
  }
  function deliverPaid(info) {
    var format = info.format;
    var docId = info.docId;
    if (format === "file") {
      var frame = document.createElement("iframe");
      frame.hidden = true;
      frame.src = "api/library.php?action=file&id=" + encodeURIComponent(docId) + "&reference=" + encodeURIComponent(info.reference || "");
      document.body.appendChild(frame);
      toast("Payment confirmed. The file is downloading.");
      return;
    }
    var doc = findDoc(docId);
    if (!doc) { toast("Payment was confirmed, but that document is no longer on this account."); return; }
    if (format === "docx") saveBytes(itcDocxBytes(doc), itcFileBase(doc) + ".docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
    if (format === "pdf") saveBytes(itcPdfBytes(doc), itcFileBase(doc) + ".pdf", "application/pdf");
    if (format === "print") {
      document.body.classList.add("paid-print");
      window.print();
      setTimeout(function () { document.body.classList.remove("paid-print"); }, 800);
    }
    toast(format === "print" ? "Payment confirmed. The print window is ready." : "Payment confirmed. Your file is downloading.");
  }
  function settlePayment(reference) {
    fetch("api/paystack.php?action=claim", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reference: reference })
    }).then(function (response) { return response.json(); }).then(function (data) {
      state.settling = false;
      if (!data || data.status !== "success") {
        toast((data && data.message) || "The payment is not successful yet.");
        openTransactions();
        return;
      }
      rememberPay(data.payment);
      state.highlightRef = data.reference || reference;
      try { deliverPaid(data); }
      catch (err) { toast(err && err.message ? err.message : "The file could not be prepared."); }
      loadState().then(function () { openTransactions(); }).catch(function () { openTransactions(); });
    }).catch(function () {
      state.settling = false;
      toast("The payment could not be confirmed.");
      openTransactions();
    });
  }
  function openTransactions() {
    if ((location.hash || "") !== "#/transactions") location.hash = "#/transactions";
    else {
      state.appView = "transactions";
      state.settling = false;
      show("app");
    }
  }
  function startPaystack(docId, format, fileName) {
    if (state.paying) return;
    if (format !== "file" && !findDoc(docId)) return;
    state.paying = true;
    toast("Opening Paystack…");
    fetch("api/paystack.php?action=init", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ docId: docId, format: format, fileName: fileName || "" })
    }).then(function (response) { return response.json(); }).then(function (data) {
      state.paying = false;
      if (data && data.status === "paid" && data.reference) {
        settlePayment(data.reference);
        return;
      }
      if (data && data.authorization_url) {
        window.location.href = data.authorization_url;
        return;
      }
      toast((data && data.message) || "Paystack did not open the payment page.");
    }).catch(function () {
      state.paying = false;
      toast("The payment service could not be reached.");
    });
  }
  function releaseTestPdf(form) {
    var error = $("admin-test-error");
    var fields = Object.fromEntries(new FormData(form).entries());
    var docId = (fields.fileId || "").trim() || fields.docId;
    if (!docId) { if (error) error.textContent = "Choose the PDF to release."; return; }
    if (error) error.textContent = "";
    fetch("api/paystack.php?action=test", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ docId: docId, code: fields.code || "" })
    }).then(function (response) { return response.json(); }).then(function (data) {
      if (!data || data.status !== "success") {
        if (error) error.textContent = (data && data.message) || "That test code was not accepted.";
        return;
      }
      rememberPay(data.payment);
      form.reset();
      try { deliverPaid(data); }
      catch (err) { toast(err && err.message ? err.message : "The file could not be prepared."); }
    }).catch(function () {
      if (error) error.textContent = "The payment service could not be reached.";
    });
  }
  function saveBytes(bytes, name, type) {
    var blob = new Blob([bytes], { type: type });
    var link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = name;
    document.body.appendChild(link);
    link.click();
    setTimeout(function () { URL.revokeObjectURL(link.href); link.remove(); }, 1500);
  }

  function runSearch(query) {
    var pop = $("search-pop");
    var q = query.trim().toLowerCase();
    if (q.length < 2) { pop.hidden = true; return; }
    var results = [];
    myDocs().forEach(function (doc) {
      var blob = (doc.title + " " + doc.cover.subject + " " + doc.cover.grade + " " + doc.cover.school).toLowerCase();
      if (blob.indexOf(q) >= 0) results.push({ label: doc.title, href: "#/preview/" + doc.id });
    });
    myPosts().forEach(function (post) {
      if ((post.title + " " + post.notes + " " + post.type).toLowerCase().indexOf(q) >= 0) results.push({ label: post.title + " · " + pretty(post.date), href: "#/schedule" });
    });
    itcLevels.forEach(function (level) {
      itcSubjects(level.id).forEach(function (subject) {
        if ((subject + " " + level.label).toLowerCase().indexOf(q) >= 0 && results.length < 12) {
          results.push({ label: subject + " · " + level.label, go: { levelId: level.id, subject: subject } });
        }
      });
    });
    if (!results.length) {
      pop.innerHTML = "<p class=\"muted\">Nothing matches yet.</p>";
      pop.hidden = false;
      return;
    }
    pop.innerHTML = results.slice(0, 10).map(function (item, index) {
      return "<button type=\"button\" data-search=\"" + index + "\">" + esc(item.label) + "</button>";
    }).join("");
    pop.hidden = false;
    pop._results = results.slice(0, 10);
  }

  function fillPublic() {
    var note = $("today-note");
    if (note) note.textContent = seasonCopy();
    var table = $("term-table");
    if (table) {
      table.innerHTML = ["1", "2", "3"].map(function (term) {
        var data = itcTermDefaults(term);
        var breaks = data.breaks.length ? data.breaks.map(function (item) { return item.label + " (" + pretty(item.start) + " – " + pretty(item.end) + ")"; }).join(", ") : "No half-term on this term’s 2026 calendar";
        return "<tr><td>Term " + term + "</td><td>" + pretty(data.start) + "</td><td>" + pretty(data.end) + "</td><td>" + esc(breaks) + "</td></tr>";
      }).join("");
    }
    var themeButtons = [$("theme-public"), $("theme-app")];
    var dark = document.documentElement.getAttribute("data-theme") === "dark";
    themeButtons.forEach(function (button) { if (button) button.textContent = dark ? "Light mode" : "Dark mode"; });
  }
  function ensureBackendTheme(forApp) {
    document.body.classList.toggle("app-mode", !!forApp);
    document.body.classList.toggle("sidebar-mini", !!forApp);
    document.body.classList.toggle("layout-fixed", !!forApp);
    document.body.classList.add("hold-transition");
    if (forApp && document.documentElement.getAttribute("data-theme") === "dark") document.body.classList.add("dark-mode");
    if (!forApp) document.body.classList.remove("dark-mode", "sidebar-collapse", "sidebar-open");
    if (document.getElementById("lte-css")) return;
    ["assets/vendor/bootstrap.min.css", "assets/vendor/fontawesome/css/all.min.css", "assets/vendor/adminlte.min.css"].forEach(function (href) {
      var link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = href + "?v=20261102g";
      link.className = "lte-css";
      if (href.indexOf("adminlte") >= 0) link.id = "lte-css";
      document.head.appendChild(link);
    });
  }
  function dropBackendTheme() {
    document.body.classList.remove("app-mode", "hold-transition", "sidebar-mini", "layout-fixed", "sidebar-collapse", "sidebar-open", "dark-mode");
    Array.prototype.forEach.call(document.querySelectorAll("link.lte-css"), function (link) { link.remove(); });
  }
  function toggleTheme() {
    var dark = document.documentElement.getAttribute("data-theme") === "dark";
    if (dark) {
      document.documentElement.removeAttribute("data-theme");
      document.body.classList.remove("dark-mode");
      localStorage.setItem("imani-theme", "light");
    } else {
      document.documentElement.setAttribute("data-theme", "dark");
      document.body.classList.add("dark-mode");
      localStorage.setItem("imani-theme", "dark");
    }
    if (state.db.settings) state.db.settings.theme = dark ? "light" : "dark";
    fillPublic();
  }

  document.addEventListener("input", function (event) {
    if (event.target.id !== "finance-q" || state.appView !== "finance") return;
    state.finance.q = event.target.value;
    state.finance.page = 1;
    var table = financeTable();
    var rows = $("finance-rows");
    var pager = $("finance-pager");
    if (rows) rows.innerHTML = table.body;
    if (pager) pager.innerHTML = table.pager;
  });
  document.addEventListener("change", function (event) {
    if (event.target.id !== "finance-status" || state.appView !== "finance") return;
    state.finance.status = event.target.value;
    state.finance.page = 1;
    var table = financeTable();
    var rows = $("finance-rows");
    var pager = $("finance-pager");
    if (rows) rows.innerHTML = table.body;
    if (pager) pager.innerHTML = table.pager;
  });
  document.addEventListener("click", function (event) {
    if (event.target.closest("#auth-preview-access")) {
      devPreview = true;
      loadState().then(function () {
        toast("Temporary workspace preview opened. No account details were saved.");
        enterApp();
      });
      return;
    }
    var passwordToggle = event.target.closest("[data-password-toggle]");
    if (passwordToggle) {
      var passwordInput = $(passwordToggle.getAttribute("aria-controls"));
      if (passwordInput) {
        var revealPassword = passwordInput.type === "password";
        passwordInput.type = revealPassword ? "text" : "password";
        passwordToggle.textContent = revealPassword ? "Hide" : "Show";
        passwordToggle.setAttribute("aria-label", (revealPassword ? "Hide" : "Show") + " password");
        passwordToggle.setAttribute("aria-pressed", String(revealPassword));
      }
      return;
    }
    var financeRange = event.target.closest("[data-finance-range]");
    if (financeRange && state.appView === "finance") {
      state.finance.range = financeRange.getAttribute("data-finance-range");
      paintApp();
      return;
    }
    var financePage = event.target.closest("[data-finance-page]");
    if (financePage && state.appView === "finance" && !financePage.disabled) {
      state.finance.page = Number(financePage.getAttribute("data-finance-page"));
      var table = financeTable();
      var rows = $("finance-rows");
      var pager = $("finance-pager");
      if (rows) rows.innerHTML = table.body;
      if (pager) pager.innerHTML = table.pager;
      return;
    }
    var removeBreak = event.target.closest("[data-remove-break]");
    if (removeBreak && state.form) {
      readForm();
      state.form.breaks.splice(Number(removeBreak.getAttribute("data-remove-break")), 1);
      renderBreaks();
      updateLive();
      saveDraft();
    }
    if (event.target.id === "fit-topics") { readForm(); refitTopics(); }
    if (event.target.id === "add-break") {
      readForm();
      state.form.breaks.push({ label: "Break", start: state.form.termStart, end: state.form.termStart });
      renderBreaks();
      saveDraft();
    }
    if (event.target.id === "add-holidays") {
      readForm();
      itcHolidays.forEach(function (holiday) {
        if (holiday.start >= state.form.termStart && holiday.end <= state.form.termEnd && !state.form.breaks.some(function (item) { return item.start === holiday.start && item.label === holiday.label; })) {
          state.form.breaks.push({ label: holiday.label, start: holiday.start, end: holiday.end });
        }
      });
      renderBreaks();
      updateLive();
      saveDraft();
      toast("Public holidays that fall inside this term were added as blank breaks.");
    }
    if (event.target.id === "reset-dates") onTermChange();
    var strandPick = event.target.closest(".strand-check");
    if (strandPick && $("gen-form") && $("gen-form").contains(strandPick)) {
      var picked = strandPick.closest(".strand-pick");
      Array.prototype.forEach.call(picked.querySelectorAll(".topic-check"), function (box) { box.checked = strandPick.checked; });
      readForm();
      updateLive();
      saveDraft();
      toast(strandPick.checked ? "Strand added." : "Strand removed.");
    }
    if (event.target.id === "make-doc") makeDocument();
    if (event.target.id === "save-edit") saveEdit();
    var again = event.target.closest("[data-download-ref]");
    if (again) { settlePayment(again.getAttribute("data-download-ref")); return; }
    var pay = event.target.closest("[data-pay]");
    if (pay) startPaystack(pay.getAttribute("data-pay"), pay.getAttribute("data-format"), pay.getAttribute("data-file-name"));
    if (event.target.id === "plan-exam") {
      ensureForm();
      state.form.type = "exam";
      saveDraft();
    }
    if (event.target.id === "delete-account") deleteAccount();
    var delFile = event.target.closest("[data-delete-file]");
    if (delFile && currentUser()) {
      var fileId = delFile.getAttribute("data-delete-file");
      fetch("api/library.php?action=delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: fileId })
      }).then(function (response) { return response.json(); }).then(function (data) {
        if (!data || !data.ok) { toast((data && data.message) || "The file was not removed.", "warn"); return; }
        toast("Removed.");
        loadLibrary(state.appView === "research" ? "research" : "exam");
      }).catch(function () { toast("The file was not removed.", "warn"); });
    }
    if (event.target.id === "pay-cancel") $("modal-root").innerHTML = "";
    var delDoc = event.target.closest("[data-delete-doc]");
    if (delDoc) {
      state.db.documents = state.db.documents.filter(function (doc) { return doc.id !== delDoc.getAttribute("data-delete-doc"); });
      persist(true);
      toast("Document removed.");
      paintApp();
    }
    var delPost = event.target.closest("[data-delete-post]");
    if (delPost) {
      state.db.posts = state.db.posts.filter(function (post) { return post.id !== delPost.getAttribute("data-delete-post"); });
      persist(true);
      toast("Post removed.");
      paintApp();
    }
    var day = event.target.closest("[data-day]");
    if (day) { state.selectedDay = day.getAttribute("data-day"); paintApp(); }
    if (event.target.id === "cal-prev") { state.cal.m -= 1; if (state.cal.m < 0) { state.cal.m = 11; state.cal.y -= 1; } paintApp(); }
    if (event.target.id === "cal-next") { state.cal.m += 1; if (state.cal.m > 11) { state.cal.m = 0; state.cal.y += 1; } paintApp(); }
    if (event.target.id === "theme-public" || event.target.id === "theme-app" || event.target.id === "ai-toggle" || event.target.id === "sign-out" || event.target.id === "profile-sign-out") event.preventDefault();
    if (event.target.id === "theme-public" || event.target.id === "theme-app") toggleTheme();
    if (event.target.id === "sign-out" || event.target.id === "profile-sign-out") signOut();
    if (event.target.id === "save-profile") saveProfile();
    if (event.target.id === "user-create") { state.userEdit = { mode: "create" }; paintApp(); }
    var editUser = event.target.closest("[data-user-edit]");
    if (editUser && currentUser() && currentUser().role === "Admin") {
      state.userEdit = { mode: "edit", id: editUser.getAttribute("data-user-edit") };
      paintApp();
    }
    var resetUser = event.target.closest("[data-user-reset]");
    if (resetUser && currentUser() && currentUser().role === "Admin") {
      state.userEdit = { mode: "reset", id: resetUser.getAttribute("data-user-reset") };
      paintApp();
    }
    if (event.target.id === "user-editor-cancel") { state.userEdit = null; paintApp(); }
    if (event.target.id === "user-editor-save") saveUserEditor();
    if (event.target.id === "export-data") {
      saveBytes(new TextEncoder().encode(JSON.stringify(state.db)), "imani-teachers-center-backup.json", "application/json");
    }
    var searchHit = event.target.closest("[data-search]");
    if (searchHit && $("search-pop")._results) {
      var item = $("search-pop")._results[Number(searchHit.getAttribute("data-search"))];
      $("search-pop").hidden = true;
      $("search-input").value = "";
      if (item.href) location.hash = item.href;
      if (item.go) {
        ensureForm();
        state.form.levelId = item.go.levelId;
        state.form.track = itcLevel(item.go.levelId).track;
        state.form.subject = item.go.subject;
        state.form.lessonsPerWeek = itcDefaultLessons(item.go.subject);
        var previous = itcPreviousLevel(item.go.levelId);
        state.form.bridgeLevelId = previous ? previous.id : "";
        state.form.topicIds = itcRecommendIds(state.form);
        saveDraft();
        location.hash = "#/generate";
      }
    }
    var askBtn = event.target.closest("[data-ask]");
    if (askBtn) ask(askBtn.getAttribute("data-ask"));
  });

  document.addEventListener("change", function (event) {
    if (event.target.id === "exam-level" || event.target.id === "exam-term") {
      state.examFilter.level = $("exam-level") ? $("exam-level").value : "";
      state.examFilter.term = $("exam-term") ? $("exam-term").value : "";
      paintExamLibrary(state.libraryExam || []);
      return;
    }
    if (event.target.id === "import-data") {
      var file = event.target.files && event.target.files[0];
      if (!file) return;
      var reader = new FileReader();
      reader.onload = function () {
        try {
          var data = JSON.parse(reader.result);
          if (!data.users || !data.documents) throw new Error("backup");
          state.db = Object.assign({ users: [], session: null, documents: [], payments: [], posts: [], chats: {}, drafts: {}, settings: { theme: "light" } }, data);
          if (state.db.settings.theme === "dark") document.documentElement.setAttribute("data-theme", "dark");
          else document.documentElement.removeAttribute("data-theme");
          persist();
          toast("Backup restored on this browser.");
          state.form = null;
          route();
        } catch (err) { toast("That file is not an Imani Teachers Center backup."); }
      };
      reader.readAsText(file);
      return;
    }
    if (!$("gen-form") || !$("gen-form").contains(event.target)) {
      var status = event.target.closest("[data-status]");
      if (status) {
        var post = state.db.posts.filter(function (item) { return item.id === status.getAttribute("data-status"); })[0];
        if (post) { post.status = status.value; persist(true); paintApp(); }
      }
      return;
    }
    if (event.target.name === "type") {
      readForm();
      renderGenerate();
      updateLive();
      saveDraft();
      return;
    }
    if (event.target.name === "track") return onTrackChange();
    if (event.target.id === "level") return onLevelChange();
    if (event.target.id === "subject") return onSubjectChange();
    if (event.target.id === "term") return onTermChange();
    if (event.target.id === "bridge") {
      readForm();
      var ids = itcCatalog(state.form).map(function (item) { return item.id; });
      state.form.topicIds = state.form.topicIds.filter(function (id) { return ids.indexOf(id) >= 0; });
      if (!state.form.topicIds.length) state.form.topicIds = itcRecommendIds(state.form);
      renderTopicList();
      updateLive();
      saveDraft();
      return;
    }
    readForm();
    updateLive();
    saveDraft();
  });
  document.addEventListener("input", function (event) {
    if ($("gen-form") && $("gen-form").contains(event.target)) {
      if (event.target.classList && event.target.classList.contains("topic-check")) {
        var group = event.target.closest(".strand-pick");
        var head = group && group.querySelector(".strand-check");
        if (head) {
          var boxes = group.querySelectorAll(".topic-check");
          head.checked = Array.prototype.every.call(boxes, function (box) { return box.checked; });
        }
      }
      readForm();
      updateLive();
      saveDraft();
    }
    if (event.target.id === "search-input") runSearch(event.target.value);
  });
  document.addEventListener("submit", function (event) {
    if (event.target.id === "gen-form") { event.preventDefault(); makeDocument(); }
    if (event.target.id === "auth-form") {
      event.preventDefault();
      submitAuth();
    }
    if (event.target.id === "ai-form") { event.preventDefault(); ask($("ai-input").value); $("ai-input").value = ""; }
    if (event.target.id === "admin-test-form") { event.preventDefault(); releaseTestPdf(event.target); }
    if (event.target.id === "post-form") {
      event.preventDefault();
      var data = Object.fromEntries(new FormData(event.target).entries());
      addPost(data);
    }
    if (event.target.id === "day-post") {
      event.preventDefault();
      var dayData = Object.fromEntries(new FormData(event.target).entries());
      dayData.date = state.selectedDay;
      addPost(dayData);
    }
    if (event.target.id === "profile-form") { event.preventDefault(); saveProfile(); }
    if (event.target.id === "upload-form") {
      event.preventDefault();
      var body = new FormData(event.target);
      body.set("kind", event.target.getAttribute("data-kind"));
      fetch("api/library.php?action=upload", { method: "POST", body: body }).then(function (response) {
        return response.json();
      }).then(function (data) {
        if (!data || !data.ok) { toast((data && data.message) || "The file was not saved."); return; }
        event.target.reset();
        toast("Uploaded.");
        loadLibrary(body.get("kind"));
      }).catch(function () { toast("The file was not saved."); });
    }
    if (event.target.id === "mail-form") {
      event.preventDefault();
      var mail = Object.fromEntries(new FormData(event.target).entries());
      fetch("api/auth.php?action=mail", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mail)
      }).then(function (response) { return response.json(); }).then(function (data) {
        if (!data || !data.ok) { toast((data && data.message) || "Outgoing mail was not saved."); return; }
        toast(data.message || "Outgoing mail is saved.");
        if (event.target.elements.password) event.target.elements.password.value = "";
        loadMailReady();
      }).catch(function () { toast("Outgoing mail was not saved."); });
    }
    if (event.target.id === "mpesa-form") {
      event.preventDefault();
      var mpesa = Object.fromEntries(new FormData(event.target).entries());
      fetch("api/mpesa.php?action=save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mpesa)
      }).then(function (response) { return response.json(); }).then(function (data) {
        if (!data || !data.ok) { toast((data && data.message) || "The M-Pesa details were not saved."); return; }
        toast("M-Pesa details saved on this server.");
        loadMpesaReady();
      }).catch(function () { toast("The M-Pesa details were not saved."); });
    }
  });
  async function signOut() {
    try { await fetch("api/auth.php?action=logout", { method: "POST", credentials: "same-origin" }); } catch (err) {}
    state.ready = false;
    state.db.session = null;
    state.db.users = [];
    state.form = null;
    state.userEdit = null;
    if ((location.hash || "") !== "#/") location.hash = "#/";
    else route();
  }
  async function saveProfile() {
    var form = $("profile-form");
    if (!form) return;
    var profile = Object.fromEntries(new FormData(form).entries());
    if (!profile.name || !String(profile.name).trim() || !profile.school || !String(profile.school).trim()) {
      toast("Enter your name and school.");
      return;
    }
    var button = $("save-profile");
    if (button) button.disabled = true;
    try {
      var response = await fetch("api/auth.php?action=profile", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile)
      });
      var data = await response.json();
      if (!data || !data.ok) { toast((data && data.message) || "The profile was not saved."); return; }
      await loadState();
      state.form = null;
      toast("Profile saved.");
      paintApp();
    } catch (err) {
      toast("The profile was not saved.");
    } finally {
      if (button && button.isConnected) button.disabled = false;
    }
  }
  async function saveUserEditor() {
    var user = currentUser();
    if (!user || user.role !== "Admin" || !state.userEdit) return;
    var form = $("user-editor-form");
    if (!form) return;
    var body = Object.fromEntries(new FormData(form).entries());
    var mode = state.userEdit.mode;
    var action = mode === "create" ? "admin-create" : mode === "reset" ? "admin-reset" : "admin-update";
    if (mode === "reset") {
      if (!body.password || String(body.password).length < 6) { toast("Use a password of at least 6 characters."); return; }
      if (body.password !== body.confirm) { toast("The two passwords do not match."); return; }
    } else if (!String(body.name || "").trim() || !String(body.school || "").trim()) {
      toast("Enter the name and school.");
      return;
    }
    if (mode === "create" && (!body.password || String(body.password).length < 6)) {
      toast("Use a password of at least 6 characters.");
      return;
    }
    var button = $("user-editor-save");
    if (button) button.disabled = true;
    try {
      if (mode !== "create") body.id = state.userEdit.id;
      var response = await fetch("api/auth.php?action=" + action, {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      var data = await response.json();
      if (!data || !data.ok) { toast((data && data.message) || "The account was not saved."); return; }
      state.userEdit = null;
      await loadState();
      toast(mode === "reset" ? "Password updated." : mode === "create" ? "Account created." : "Account updated.");
      paintApp();
    } catch (err) {
      toast("The account was not saved.");
    } finally {
      if (button && button.isConnected) button.disabled = false;
    }
  }
  async function deleteAccount() {
    var user = currentUser();
    if (!user) return;
    if (!window.confirm("Delete this account from the school database? Documents and payment notes stored for it will be removed.")) return;
    try {
      var response = await fetch("api/auth.php?action=delete", { method: "POST", credentials: "same-origin" });
      var data = await response.json();
      if (!data || !data.ok) { toast((data && data.message) || "The account was not deleted."); return; }
    } catch (err) {
      toast("The account was not deleted.");
      return;
    }
    toast("Account deleted.");
    state.ready = false;
    state.db.session = null;
    state.db.users = [];
    state.form = null;
    location.hash = "#/";
  }
  var authBusy = false;
  function logClientError(page, status, message) {
    var text = String(message || "").replace(/password[^,\n]*/gi, "password [hidden]").slice(0, 400);
    fetch("api/auth.php?action=client-log", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ page: page, status: status, message: text })
    }).catch(function () {});
  }
  function enterApp() {
    if ((location.hash || "") !== "#/dashboard") location.hash = "#/dashboard";
    else route();
  }
  async function submitAuth() {
    if (authBusy) return false;
    if (devPreview) {
      if (!currentUser()) await loadState();
      enterApp();
      return false;
    }
    authBusy = true;
    var form = $("auth-form");
    var error = $("auth-error");
    var button = $("auth-submit");
    if (button) button.disabled = true;
    try {
      var data = Object.fromEntries(new FormData(form).entries());
      var mode = $("auth-view").getAttribute("data-mode") || "login";
      var email = String(data.email || "").trim().toLowerCase();
      var password = String(data.password || "");
      if (mode === "forgot") {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { error.textContent = "Enter a valid email address."; return false; }
        var forgot = await fetch("api/auth.php?action=forgot", {
          method: "POST",
          credentials: "same-origin",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: email })
        });
        var forgotRaw = await forgot.text();
        var forgotResult = null;
        try { forgotResult = JSON.parse(forgotRaw); } catch (parseErr) { forgotResult = null; }
        if (!forgotResult) {
          logClientError("forgot", forgot.status, forgotRaw);
          error.textContent = "The reset link was not sent. The details are in the error log.";
          return false;
        }
        error.textContent = forgotResult.message || "";
        if (forgotResult.ok) toast(forgotResult.message || "If that email has an account, a reset link is on its way.");
        return false;
      }
      if (mode === "newpass") {
        if (password.length < 6) { error.textContent = "Use a password of at least 6 characters."; return false; }
        var reset = await fetch("api/auth.php?action=reset", {
          method: "POST",
          credentials: "same-origin",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: state.resetToken, password: password })
        });
        var resetRaw = await reset.text();
        var resetResult = null;
        try { resetResult = JSON.parse(resetRaw); } catch (parseErr) { resetResult = null; }
        if (!resetResult) {
          logClientError("reset", reset.status, resetRaw);
          error.textContent = "The password was not saved. The details are in the error log.";
          return false;
        }
        if (!resetResult.ok) { error.textContent = resetResult.message || "That reset link has expired."; return false; }
        toast(resetResult.message || "The password is saved. Sign in with it.");
        location.hash = "#/signin";
        return false;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { error.textContent = "Enter a valid email address."; return false; }
      if (password.length < 6) { error.textContent = "Use a password of at least 6 characters."; return false; }
      if (mode === "register" && (!data.name || !String(data.name).trim() || !data.school || !String(data.school).trim())) {
        error.textContent = "Enter your name and school.";
        return false;
      }
      var response = await fetch("api/auth.php?action=" + (mode === "register" ? "register" : "login"), {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name || "",
          email: email,
          password: password,
          school: data.school || "",
          tsc: data.tsc || "",
          phone: data.phone || "",
          role: data.role || "Teacher"
        })
      });
      var raw = await response.text();
      var result = null;
      try { result = JSON.parse(raw); } catch (parseErr) { result = null; }
      if (!result) {
        logClientError(mode, response.status, raw);
        var responseType = response.headers.get("content-type") || "";
        var apiUnavailable = response.status === 404 || response.status === 405 || /text\/html/i.test(responseType);
        error.textContent = apiUnavailable
          ? "Account access is unavailable in this preview. The site needs its PHP authentication service to create accounts or sign in."
          : mode === "register"
            ? "The account could not be created because the authentication service returned an unreadable response. Please try again later."
            : "Sign-in could not finish because the authentication service returned an unreadable response. Please try again later.";
        return false;
      }
      if (!result.ok) {
        if (response.status >= 500) logClientError(mode, response.status, result.message || "");
        error.textContent = result.message || "Check the email and password.";
        return false;
      }
      state.form = null;
      var ready = await loadState();
      if (!ready) ready = await loadState();
      if (!ready) {
        logClientError(mode, 0, "session did not start after " + mode);
        error.textContent = mode === "register"
          ? "The account was saved, but the session did not start. Sign in with the same email."
          : "Sign-in did not start a session. Refresh and try again.";
        return false;
      }
      if (mode === "register") toast("Account ready.");
      enterApp();
      return false;
    } catch (err) {
      logClientError("auth", 0, err && err.message ? err.message : "request failed");
      error.textContent = "Sign-in could not finish. The details are in the error log.";
      return false;
    } finally {
      authBusy = false;
      if (button && $("auth-view") && !$("auth-view").hidden) {
        button.disabled = false;
        var labels = { login: "Sign in", register: "Create account", forgot: "Send reset link", newpass: "Save password" };
        button.textContent = labels[$("auth-view").getAttribute("data-mode")] || "Sign in";
      }
    }
  }
  window.itcShowAuth = function (mode) {
    var login = mode !== "register";
    var next = login ? "#/signin" : "#/register";
    show("auth");
    setAuthMode(login ? "login" : "register");
    if ((location.hash || "") !== next) location.hash = next;
  };
  window.itcSubmitAuth = function (event) {
    if (event && event.preventDefault) event.preventDefault();
    submitAuth();
    return false;
  };

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") $("modal-root").innerHTML = "";
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
      event.preventDefault();
      var box = $("search-input");
      if (box) box.focus();
    }
  });

  if (localStorage.getItem("imani-theme") === "dark") document.documentElement.setAttribute("data-theme", "dark");
  window.addEventListener("hashchange", route);
  try { fillPublic(); } catch (err) {}
  loadState().then(function () {
    if (devPreview) toast("Development preview: authentication and cloud saving are disabled.");
    try { route(); } catch (err) {}
  }).catch(function () {
    try { route(); } catch (err) {}
  });
})();
