(function (root) {
  function parseISO(value) {
    var parts = String(value || "").split("-");
    if (parts.length !== 3) return null;
    var y = Number(parts[0]);
    var m = Number(parts[1]);
    var d = Number(parts[2]);
    if (!y || !m || !d) return null;
    return new Date(y, m - 1, d);
  }

  function startOfDay(date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  function addDays(date, days) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
  }

  function mondayOf(date) {
    var day = date.getDay();
    var diff = day === 0 ? -6 : 1 - day;
    return addDays(date, diff);
  }

  function sameDay(a, b) {
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  }

  function within(date, start, end) {
    var t = startOfDay(date).getTime();
    return t >= startOfDay(start).getTime() && t <= startOfDay(end).getTime();
  }

  function fmt(date) {
    var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return date.getDate() + " " + months[date.getMonth()] + " " + date.getFullYear();
  }

  function fmtRange(a, b) {
    if (sameDay(a, b)) return fmt(a);
    if (a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth()) {
      var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      return a.getDate() + "–" + b.getDate() + " " + months[a.getMonth()] + " " + a.getFullYear();
    }
    return fmt(a) + " – " + fmt(b);
  }

  function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }

  function topicKey(levelId, subject, strand, sub) {
    return [levelId, subject, strand, sub].join("|").toLowerCase();
  }

  function cleanBreaks(form) {
    return (form.breaks || []).map(function (item) {
      return {
        label: String(item.label || "Break").trim() || "Break",
        start: parseISO(item.start),
        end: parseISO(item.end),
        startIso: item.start,
        endIso: item.end
      };
    }).filter(function (item) {
      return item.start && item.end && item.start.getTime() <= item.end.getTime();
    });
  }

  function buildWeeks(form) {
    var start = parseISO(form.termStart);
    var end = parseISO(form.termEnd);
    if (!start || !end) throw new Error("Enter the date the term opens and the date it closes.");
    if (end.getTime() < start.getTime()) throw new Error("The closing date should be on or after the opening date.");
    var lessonsPerWeek = Math.max(1, Math.min(12, Number(form.lessonsPerWeek) || 1));
    var breaks = cleanBreaks(form);
    var cursor = mondayOf(start);
    var weeks = [];
    var guard = 0;
    while (cursor.getTime() <= end.getTime() && guard < 40) {
      guard += 1;
      var days = [];
      var i;
      for (i = 0; i < 5; i++) {
        var day = addDays(cursor, i);
        if (!within(day, start, end)) continue;
        var found = null;
        breaks.forEach(function (item) {
          if (!found && within(day, item.start, item.end)) found = item;
        });
        days.push({ day: day, br: found });
      }
      if (days.length) {
        var groups = [];
        days.forEach(function (entry) {
          var key = entry.br ? "break:" + entry.br.label + entry.br.startIso : "teach";
          var last = groups[groups.length - 1];
          if (last && last.key === key) last.days.push(entry.day);
          else groups.push({ key: key, br: entry.br, days: [entry.day] });
        });
        var teachCount = days.filter(function (entry) { return !entry.br; }).length;
        var budget = Math.round(lessonsPerWeek * teachCount / 5);
        if (teachCount && budget < 1) budget = 1;
        var teachGroups = groups.filter(function (group) { return !group.br; });
        var remaining = budget;
        teachGroups.forEach(function (group, index) {
          var share = index === teachGroups.length - 1
            ? remaining
            : Math.round(budget * group.days.length / teachCount);
          if (share < 1) share = 1;
          if (share > remaining) share = remaining;
          group.lessons = share;
          remaining -= share;
        });
        if (remaining > 0 && teachGroups.length) teachGroups[teachGroups.length - 1].lessons += remaining;
        weeks.push({ days: days, groups: groups, budget: budget });
      }
      cursor = addDays(cursor, 7);
    }
    return { start: start, end: end, weeks: weeks, lessonsPerWeek: lessonsPerWeek, breaks: breaks };
  }

  function itcCatalog(form) {
    var level = root.itcLevel(form.levelId);
    if (!level) return [];
    var items = [];
    root.itcTopicList(form.levelId, form.subject).forEach(function (topic) {
      items.push({
        id: topicKey(form.levelId, form.subject, topic.strand, topic.sub),
        levelId: form.levelId,
        levelLabel: level.label,
        subject: form.subject,
        strand: topic.strand,
        sub: topic.sub,
        focus: topic.focus,
        bridging: false
      });
    });
    if (form.bridgeLevelId) {
      var bridge = root.itcLevel(form.bridgeLevelId);
      if (bridge) {
        root.itcTopicList(form.bridgeLevelId, form.subject).forEach(function (topic) {
          items.push({
            id: topicKey(form.bridgeLevelId, form.subject, topic.strand, topic.sub),
            levelId: form.bridgeLevelId,
            levelLabel: bridge.label,
            subject: form.subject,
            strand: "Bridging from " + bridge.label + ": " + topic.strand,
            sub: topic.sub,
            focus: topic.focus,
            bridging: true
          });
        });
      }
    }
    (form.customTopics || []).forEach(function (topic, index) {
      var strand = topic.strand || "Teacher topic";
      var sub = topic.sub || "Class focus";
      items.push({
        id: "custom|" + index + "|" + strand + "|" + sub,
        levelId: form.levelId,
        levelLabel: level.label,
        subject: form.subject,
        strand: strand,
        sub: sub,
        focus: topic.focus || ("Explain and practise " + sub),
        bridging: false,
        custom: true
      });
    });
    return items;
  }

  function itcPlanStats(form) {
    try {
      var plan = buildWeeks(form);
      var slots = plan.weeks.reduce(function (sum, week) { return sum + week.budget; }, 0);
      var breakRows = 0;
      plan.weeks.forEach(function (week) {
        week.groups.forEach(function (group) { if (group.br) breakRows += 1; });
      });
      return {
        ok: true,
        weeks: plan.weeks.length,
        slots: slots,
        breakRows: breakRows + 1,
        opening: fmt(plan.start),
        closing: fmt(plan.end),
        recommended: Math.max(4, Math.round(slots / 3))
      };
    } catch (err) {
      return { ok: false, error: err.message, weeks: 0, slots: 0, breakRows: 0, recommended: 4 };
    }
  }

  function strandsInOrder(items) {
    var order = [];
    var map = {};
    items.forEach(function (item) {
      var key = item.strand || "Strand";
      if (!map[key]) { map[key] = []; order.push(key); }
      map[key].push(item);
    });
    return { order: order, map: map };
  }

  function itcRecommendIds(form) {
    var stats = itcPlanStats(form);
    var catalog = itcCatalog(form);
    var room = Math.max(4, stats.recommended || 8);
    var ids = [];
    function take(items, must) {
      var grouped = strandsInOrder(items);
      var added = false;
      grouped.order.forEach(function (name) {
        var kids = grouped.map[name];
        if ((must && !added) || !ids.length || ids.length + kids.length <= room) {
          kids.forEach(function (item) { ids.push(item.id); });
          added = true;
        }
      });
    }
    take(catalog.filter(function (item) { return item.bridging; }), false);
    if (ids.length) room += 4;
    take(catalog.filter(function (item) { return !item.bridging; }), true);
    return ids;
  }

  function isSwahili(subject) {
    return /kiswahili|fasihi/i.test(subject || "");
  }

  function lowerFirst(value) {
    var text = String(value || "");
    return text.charAt(0).toLowerCase() + text.slice(1);
  }

  var VALUES = ["responsibility", "respect", "integrity", "unity", "love", "peace", "patriotism"];
  var PCS = ["communication and collaboration", "critical thinking and problem solving", "citizenship", "digital literacy", "learning to learn", "self-efficacy", "imagination and creativity"];

  function expand(topic, ctx) {
    var sw = isSwahili(ctx.subject);
    var value = VALUES[(ctx.index || 0) % VALUES.length];
    var pc = PCS[(ctx.index || 0) % PCS.length];
    var partNote = ctx.parts > 1 ? " (lesson " + ctx.part + " of " + ctx.parts + " on this sub-strand)" : "";
    var book = ctx.book || "KICD-approved course book";
    var outcomes;
    var experiences;
    var inquiry;
    if (sw) {
      outcomes = [
        "Mwisho wa somo, mwanafunzi aweze " + lowerFirst(topic.focus) + partNote + ".",
        "Kutumia " + topic.sub + " katika mazungumzo na maandishi ya kila siku.",
        ctx.track === "cbe"
          ? "Kuonyesha " + value + " na kukuza " + pc + " wakati wa kujifunza."
          : "Kutumia " + topic.sub + " katika mfano wa darasani na kuhakiki jibu."
      ];
      inquiry = [
        "Je, tunajua nini kuhusu " + topic.sub + "?",
        "Je, " + topic.sub + " inatusaidiaje nyumbani, shuleni au jamii?"
      ];
    } else {
      outcomes = [
        "By the end of the lesson, the learner should be able to " + lowerFirst(topic.focus) + partNote + ".",
        "Use " + topic.sub + " in a familiar example from home, school or the local community.",
        ctx.track === "cbe"
          ? "Show " + value + " and build " + pc + " during the lesson."
          : "Apply " + topic.sub + " to a worked example and check the result."
      ];
      inquiry = [
        "What do we already know about " + topic.sub + "?",
        "How is " + topic.sub + " useful at home, at school or in the community?"
      ];
    }
    if (ctx.parts === 1) {
      experiences = sw ? [
        "Wanafunzi wanaeleza waliyoijua kuhusu " + topic.sub + ".",
        "Kwa jozi, wanafunzi wanasoma sehemu husika katika kitabu cha mwanafunzi cha " + book + " kilichoidhinishwa na KICD, kisha wanafanya mazoezi.",
        "Kikundi kinawasilisha, kinasahihisha makosa, kisha kila mwanafunzi anafanya kazi ya kuondoka."
      ] : [
        "Learners say what they already know about " + topic.sub + ".",
        "In pairs, learners read the matching sub-strand in the KICD-approved " + book + " learner book and work through examples on " + lowerFirst(topic.focus) + ".",
        "Groups present, correct errors, and each learner completes a short exit task."
      ];
    } else if (ctx.part === 1) {
      experiences = sw ? [
        "Mwalimu anaibua somo kwa swali na mfano wa mazingira ya mwanafunzi.",
        "Wanafunzi wanachunguza " + topic.sub + " kwa kutumia kitabu kilichoidhinishwa na KICD (" + book + ") na vifaa vya karibu."
      ] : [
        "The teacher opens with a question and a local example.",
        "Learners explore " + topic.sub + " using the KICD-approved " + book + " learner book and materials from the classroom or compound."
      ];
    } else if (ctx.part === ctx.parts) {
      experiences = sw ? [
        "Wanafunzi wanakumbuka maudhui ya somo lililopita kwa maswali mafupi.",
        "Wanafanya kazi ya mtu mmoja mmoja, kisha wanaangalia majibu na kujitathmini."
      ] : [
        "Learners recall the previous lesson through short questions.",
        "They complete individual practice, mark it together, and say what they can now do."
      ];
    } else {
      experiences = sw ? [
        "Wanafunzi wanakumbuka wazo kuu la " + topic.sub + ".",
        "Kwa mwongozo, wanafanya mazoezi, kisha wanayatumia katika kazi ya kikundi."
      ] : [
        "Learners recall the main idea of " + topic.sub + ".",
        "With guidance they practise, then apply the idea in a group task."
      ];
    }
    var resources = sw ? [
      "Kitabu cha mwanafunzi kilichoidhinishwa na KICD (" + book + ")",
      "Mwongozo wa mwalimu ulioidhinishwa na KICD",
      "Ubao, chati na daftari",
      "Vifaa vya karibu vinavyolingana na " + topic.sub
    ] : [
      "KICD-approved " + book + " learner book (open the sub-strand on " + topic.sub + ")",
      "KICD-approved teacher's guide",
      "Chalkboard or chart, exercise books",
      "Locally available materials linked to " + topic.sub
    ];
    var assessment = sw ? [
      "Maswali ya mdomo",
      "Uangalizi wa kazi ya kikundi",
      "Zoezi la maandishi kuhusu " + topic.sub,
      "Tajiriba fupi ya mwanafunzi"
    ] : [
      "Oral questions",
      "Observation of pair or group work",
      "Written exercise on " + topic.sub,
      "Short learner reflection"
    ];
    return {
      outcomes: outcomes,
      experiences: experiences,
      inquiry: inquiry,
      resources: resources,
      assessment: assessment,
      value: value,
      pc: pc
    };
  }

  function join(list) {
    return list.join("\n");
  }

  function schemeColumns(track) {
    if (track === "cbe") {
      return ["WK", "LSN", "STRAND", "SUB-STRAND", "LESSON LEARNING OUTCOMES", "LEARNING EXPERIENCES", "KEY INQUIRY QUESTIONS", "LEARNING RESOURCES", "ASSESSMENT METHODS", "REFLECTION"];
    }
    return ["WK", "LSN", "TOPIC", "SUB-TOPIC", "OBJECTIVES", "T/L ACTIVITIES", "T/L AIDS", "REFERENCE", "REMARKS"];
  }

  function emptySchemeRow(week, lesson, count) {
    var cells = [];
    var i;
    for (i = 0; i < (count || 9); i++) cells.push("");
    cells[0] = String(week);
    cells[1] = lesson;
    return { kind: "lesson", week: week, cells: cells };
  }

  function lessonBands(count) {
    if (count >= 4) {
      var bands = [[0, 0], [1, 2]];
      var index = 3;
      for (; index < count; index++) bands.push([index, index]);
      return bands;
    }
    if (count === 3) return [[0, 0], [1, 2]];
    var single = [];
    var n;
    for (n = 0; n < count; n++) single.push([n, n]);
    return single;
  }

  function bandLabel(start, end) {
    return start === end ? String(start + 1) : (start + 1) + "-" + (end + 1);
  }

  function uniqueLines(list) {
    var seen = {};
    return list.filter(function (line) {
      var key = String(line || "").trim();
      if (!key || seen[key]) return false;
      seen[key] = true;
      return true;
    });
  }

  function bullet(lines) {
    return lines.map(function (line) { return "- " + String(line).replace(/^-+\s*/, ""); }).join("\n");
  }

  function cbeSchemeRow(week, lessonLabel, entries, form, level) {
    var details = entries.map(function (item, index) {
      return expand(item.topic, {
        subject: form.subject,
        track: level.track,
        book: form.book,
        part: item.part,
        parts: item.parts,
        index: index + 1
      });
    });
    var outcomes = [];
    var activities = [];
    var aids = [];
    var inquiry = [];
    var assessment = [];
    entries.forEach(function (item, index) {
      details[index].outcomes.forEach(function (line) {
        outcomes.push(String(line).replace(/^By the end of the lesson, the learner should be able to:?\s*/i, "").replace(/\.$/, ""));
      });
      details[index].experiences.forEach(function (line) { activities.push(line); });
      details[index].resources.forEach(function (line) { aids.push(line); });
      details[index].inquiry.forEach(function (line) { inquiry.push(line); });
      details[index].assessment.forEach(function (line) { assessment.push(line); });
    });
    return {
      kind: "lesson",
      week: week,
      cells: [
        String(week),
        lessonLabel,
        uniqueLines(entries.map(function (item) { return item.topic.strand; })).join("\n"),
        entries.map(function (item) { return item.topic.sub; }).join("\n"),
        "By the end of the lesson, the learner should be able to:\n" + bullet(uniqueLines(outcomes)),
        "In groups, learners are guided to:\n" + bullet(uniqueLines(activities)),
        uniqueLines(inquiry).join("\n"),
        bullet(uniqueLines(aids)),
        bullet(uniqueLines(assessment).slice(0, 3)),
        ""
      ]
    };
  }

  function schemeRow(week, lessonLabel, entries, form, level) {
    if (level.track === "cbe") return cbeSchemeRow(week, lessonLabel, entries, form, level);
    var sw = isSwahili(form.subject);
    var details = entries.map(function (item, index) {
      return expand(item.topic, {
        subject: form.subject,
        track: level.track,
        book: form.book,
        part: item.part,
        parts: item.parts,
        index: index + 1
      });
    });
    var outcomes = [];
    var activities = [];
    var aids = [];
    entries.forEach(function (item, index) {
      details[index].outcomes.forEach(function (line) {
        outcomes.push(String(line).replace(/^By the end of the lesson, the learner should be able to\s+/i, "").replace(/\.$/, ""));
      });
      details[index].experiences.forEach(function (line) { activities.push(line); });
      details[index].resources.forEach(function (line) { aids.push(line); });
    });
    var lead = sw
      ? "Kufikia mwisho wa somo, mwanafunzi aweze:"
      : "By the end of the lesson, the learner should be able to:";
    var guide = sw
      ? "Wanafunzi wanaongozwa kwa vikundi:"
      : "In groups, learners are guided to:";
    return {
      kind: "lesson",
      week: week,
      cells: [
        String(week),
        lessonLabel,
        uniqueLines(entries.map(function (item) { return item.topic.strand; })).join("\n"),
        entries.map(function (item) { return item.topic.sub; }).join("\n"),
        lead + "\n" + outcomes.join("\n"),
        guide + "\n" + activities.join("\n"),
        uniqueLines(aids).join(", "),
        form.book + " — " + entries.map(function (item) { return item.topic.sub; }).join("; "),
        ""
      ]
    };
  }

  function breakLessonLabel(group) {
    var name = group.br.label || "Break";
    if (/half/i.test(name)) return "HALF-TERM BREAK";
    if (/labour|madaraka|mashujaa|holiday|public/i.test(name)) return "PUBLIC HOLIDAY";
    return String(name).toUpperCase();
  }

  function sequenceTopics(topics, slots) {
    var chosen = topics.slice();
    var warnings = [];
    if (!chosen.length) throw new Error("Select at least one topic or learning area.");
    if (chosen.length > slots) {
      warnings.push("This term has " + slots + " lesson slots. The first " + slots + " selected topics were used. Add lessons per week or drop a topic if you need the rest.");
      chosen = chosen.slice(0, slots);
    }
    var base = Math.floor(slots / chosen.length);
    var extra = slots % chosen.length;
    var sequence = [];
    chosen.forEach(function (topic, index) {
      var count = base + (index < extra ? 1 : 0);
      var part;
      for (part = 1; part <= count; part++) sequence.push({ topic: topic, part: part, parts: count });
    });
    return { sequence: sequence, warnings: warnings };
  }

  function breakLabel(group) {
    var name = group.br.label;
    var dates = fmtRange(group.br.start, group.br.end);
    var title = "BREAK";
    if (/half/i.test(name)) title = "HALF-TERM BREAK";
    else if (/labour|madaraka|mashujaa|holiday|public/i.test(name)) title = "PUBLIC HOLIDAY";
    return {
      label: title + " — " + name,
      dates: dates,
      note: "This duration is left blank. No lessons are planned."
    };
  }

  function coverOf(form, level, typeLabel, opening, closing) {
    return {
      centre: form.school.trim(),
      typeLabel: typeLabel,
      curriculum: level.track === "kcse" ? "KCSE" : "CBE",
      school: form.school.trim(),
      teacher: form.teacher.trim(),
      tsc: String(form.tsc || "").trim(),
      hod: String(form.hod || "").trim(),
      deputy: String(form.deputy || "").trim(),
      principal: String(form.principal || "").trim(),
      grade: level.label,
      band: level.band,
      subject: form.subject,
      term: String(form.term),
      year: String(form.year || new Date().getFullYear()),
      termRoman: { 1: "I", 2: "II", 3: "III" }[Number(form.term)] || String(form.term),
      book: form.book,
      opening: opening,
      closing: closing,
      lessonsPerWeek: Math.max(1, Math.min(12, Number(form.lessonsPerWeek) || 1)),
      prepared: form.preparedDate || "",
      track: level.track
    };
  }

  function buildKcseExam(form, level, selected) {
    var letters = ["(a)", "(b)", "(c)", "(d)"];
    var questions = selected.slice(0, 6).map(function (topic, index) {
      var parts = questionsFor(topic, level.track, form.subject, index).slice(0, 4).map(function (item, partIndex) {
        return { label: letters[partIndex], q: item.q, marks: item.marks || 2, a: item.a };
      });
      var total = parts.reduce(function (sum, part) { return sum + Number(part.marks || 0); }, 0);
      return {
        number: index + 1,
        strand: topic.strand,
        topic: topic.sub,
        parts: parts,
        marks: total,
        q: parts.map(function (part) { return part.label + " " + part.q; }).join("\n"),
        a: parts.map(function (part) { return part.label + " " + part.a; }).join("\n")
      };
    });
    var grand = questions.reduce(function (sum, item) { return sum + item.marks; }, 0);
    var warnings = [];
    if (selected.length > 6) warnings.push("The paper uses the first 6 strands. Prepare another paper for the rest.");
    return {
      id: uid(),
      type: "exam",
      createdAt: new Date().toISOString(),
      title: "ASSESSMENT — " + form.subject + " — " + level.label,
      warnings: warnings,
      cover: coverOf(form, level, "MOCK EXAMINATIONS", "", ""),
      scheme: null,
      plans: [],
      revision: [],
      exam: {
        layout: "kcse",
        duration: "2 Hours",
        paper: "PAPER 2 (Theory)",
        instructions: [
          "Write your name and admission number in the spaces provided.",
          "Sign and write the date of the examination in the spaces provided.",
          "Answer ALL questions in the spaces provided.",
          "Mathematical tables and electronic calculators may be used.",
          "ALL working MUST be shown clearly where necessary.",
          "Check the question paper to ensure that all pages are printed and no question is missing."
        ],
        scoreRows: questions.map(function (item) {
          return { question: String(item.number), max: item.marks };
        }).concat([{ question: "Total", max: grand }]),
        sections: [{ title: "Questions", note: "Answer all the questions.", items: questions }]
      }
    };
  }

  function buildExamDocument(form, level, selected) {
    if (level.track === "kcse") return buildKcseExam(form, level, selected);
    var paper = [];
    selected.slice(0, 8).forEach(function (topic, index) {
      questionsFor(topic, level.track, form.subject, index).forEach(function (item) {
        paper.push({
          strand: topic.strand,
          topic: topic.sub,
          q: item.q,
          a: item.a,
          marks: item.marks || 2
        });
      });
    });
    var sectionA = [];
    var sectionB = [];
    paper.forEach(function (item, index) {
      (index % 2 === 0 ? sectionA : sectionB).push(item);
    });
    var opened = parseISO(form.termStart);
    var closed = parseISO(form.termEnd);
    var warnings = [];
    if (selected.length > 8) warnings.push("The paper uses the first 8 topics. Prepare another paper for the rest.");
    return {
      id: uid(),
      type: "exam",
      createdAt: new Date().toISOString(),
      title: "ASSESSMENT — " + form.subject + " — " + level.label,
      warnings: warnings,
      cover: coverOf(form, level, "ASSESSMENT", opened ? fmt(opened) : "", closed ? fmt(closed) : ""),
      scheme: null,
      plans: [],
      revision: [],
      exam: {
        duration: level.group === "pre" || level.group === "lower" ? "40 minutes" : "1 hour 30 minutes",
        instructions: [
          "Write your name, class and admission number in the spaces above.",
          "Answer all the questions.",
          "Show your working where a calculation is needed."
        ],
        sections: [
          { title: "Section A", note: "Short questions. Answer all.", items: sectionA },
          { title: "Section B", note: "Structured questions. Answer all.", items: sectionB }
        ]
      }
    };
  }

  function itcGenerate(form) {
    var level = root.itcLevel(form.levelId);
    if (!level) throw new Error("Choose a class.");
    if (!form.subject) throw new Error("Choose a subject.");
    if (!String(form.school || "").trim()) throw new Error("Enter the school name for the cover.");
    if (!String(form.teacher || "").trim()) throw new Error("Enter the teacher's name for the cover.");
    if (form.type === "exam") {
      var examCatalog = itcCatalog(form);
      var examTopics = examCatalog.filter(function (item) { return (form.topicIds || []).indexOf(item.id) >= 0; });
      if (!examTopics.length) throw new Error("Select at least one topic or add your own.");
      return buildExamDocument(form, level, examTopics);
    }
    var plan = buildWeeks(form);
    var slots = plan.weeks.reduce(function (sum, week) { return sum + week.budget; }, 0);
    if (!slots) throw new Error("Those dates leave no teaching days. Adjust the term or the breaks.");
    var catalog = itcCatalog(form);
    var selected = catalog.filter(function (item) { return (form.topicIds || []).indexOf(item.id) >= 0; });
    if (!selected.length) throw new Error("Select at least one topic or add your own.");
    var useOpener = plan.weeks.length >= 4;
    var contentWeeks = [];
    plan.weeks.forEach(function (week, weekIndex) {
      var teaches = week.groups.some(function (group) { return !group.br && group.lessons; });
      if (useOpener && weekIndex === 0) return;
      if (teaches) contentWeeks.push(weekIndex);
    });
    var catWeek = contentWeeks.length ? contentWeeks[Math.floor((contentWeeks.length - 1) / 2)] : -1;
    var topicSlots = 0;
    plan.weeks.forEach(function (week, weekIndex) {
      if (useOpener && weekIndex === 0) return;
      var count = week.groups.reduce(function (sum, group) { return sum + (group.br ? 0 : group.lessons); }, 0);
      if (weekIndex === catWeek && count) count -= 1;
      topicSlots += count;
    });
    var packed = sequenceTopics(selected, topicSlots || slots);
    var columns = schemeColumns(level.track);
    var body = [];
    var cursor = 0;
    plan.weeks.forEach(function (week, weekIndex) {
      var weekNo = weekIndex + 1;
      var lessonGroups = week.groups.filter(function (group) { return !group.br && group.lessons; });
      var lastGroup = lessonGroups[lessonGroups.length - 1];
      if (useOpener && weekIndex === 0 && lessonGroups.length) {
        body.push(emptySchemeRow(weekNo, "Opener examination", columns.length));
      }
      week.groups.forEach(function (group) {
        if (group.br) {
          body.push(emptySchemeRow(weekNo, breakLessonLabel(group), columns.length));
          return;
        }
        if (useOpener && weekIndex === 0) return;
        var count = group.lessons;
        var bands = lessonBands(count);
        var markCat = weekIndex === catWeek && group === lastGroup && bands.length;
        if (markCat) bands.pop();
        bands.forEach(function (band) {
          var entries = [];
          var at;
          for (at = band[0]; at <= band[1]; at++) {
            var item = packed.sequence[cursor];
            cursor += 1;
            if (item) entries.push(item);
          }
          if (entries.length) body.push(schemeRow(weekNo, bandLabel(band[0], band[1]), entries, form, level));
        });
        if (markCat) body.push(emptySchemeRow(weekNo, "CONTINUOUS ASSESSMENT TEST", columns.length));
      });
    });
    body.push(emptySchemeRow(plan.weeks.length, "End of term examination and closing of school", columns.length));

    var plans = [];
    if (form.type === "lesson") {
      selected.slice(0, 12).forEach(function (topic, index) {
        var detail = expand(topic, {
          subject: form.subject,
          track: level.track,
          book: form.book,
          part: 1,
          parts: 1,
          index: index + 1
        });
        plans.push(level.track === "cbe"
          ? buildCbePlan(form, level, topic, detail, index + 1, lessonSlot(form, index))
          : buildPlan(form, level, topic, detail, index + 1, lessonSlot(form, index)));
      });
    }

    var revision = [];
    if (form.type === "revision") {
      selected.slice(0, 12).forEach(function (topic, index) {
        revision.push(buildRevision(form, level, topic, index));
      });
    }

    var warnings = packed.warnings.slice();
    if (form.type === "lesson" && selected.length > 12) {
      warnings.push("Full lesson plans were written for the first 12 topics. Generate another document for the rest.");
    }
    if (form.type === "revision" && selected.length > 12) {
      warnings.push("Revision was written for the first 12 topics. Generate another booklet for the rest.");
    }

    var typeLabel = form.type === "lesson" ? "LESSON PLANS" : form.type === "revision" ? "REVISION BOOKLET" : "SCHEME OF WORK";
    return {
      id: uid(),
      type: form.type,
      createdAt: new Date().toISOString(),
      title: typeLabel + " — " + form.subject + " — " + level.label,
      warnings: warnings,
      cover: coverOf(form, level, typeLabel, fmt(plan.start), fmt(plan.end)),
      scheme: form.type === "scheme" ? { columns: columns, body: body } : null,
      plans: form.type === "lesson" ? plans : [],
      revision: form.type === "revision" ? revision : []
    };
  }

  function lessonSlot(form, index) {
    var per = Math.max(1, Number(form.lessonsPerWeek) || 1);
    var startLesson = parseInt(form.lessonNumber, 10);
    var startWeek = parseInt(form.week, 10);
    if (!startWeek || !startLesson) {
      return { week: String(form.week || ""), lesson: String(form.lessonNumber || "") };
    }
    var offset = (startLesson - 1) + index;
    return {
      week: String(startWeek + Math.floor(offset / per)),
      lesson: String((offset % per) + 1)
    };
  }
  function buildCbePlan(form, level, topic, detail, number, slot) {
    var outcome = (detail.outcomes[0] || topic.focus || topic.sub);
    outcome = String(outcome).replace(/^By the end of the lesson, the learner should be able to:?\s*/i, "");
    var steps = detail.experiences.slice(0, 4).map(function (line, index) {
      return "Step " + (index + 1) + ": " + line;
    });
    return {
      layout: "cbe",
      number: number,
      title: level.label.toUpperCase() + " " + String(form.subject).toUpperCase() + " TERM " + form.term + " LESSON PLANS",
      weekTitle: "WEEK " + (slot.week || number) + ": LESSON " + (slot.lesson || number),
      header: {
        school: form.school,
        level: level.label,
        area: form.subject,
        term: "Term " + form.term,
        name: form.teacher,
        date: number === 1 ? String(form.lessonDate || "") : "",
        time: String(form.lessonTime || ""),
        roll: String(form.students || ""),
        year: String(form.year)
      },
      strand: topic.strand,
      substrand: topic.sub,
      outcomesLine: "By the end of the lesson, the learner should be able to " + outcome.replace(/\.$/, "") + ".",
      inquiry: (detail.inquiry && detail.inquiry[0]) || ("How is " + topic.sub + " used in day-to-day activities?"),
      competencies: ["Communication and Collaboration", "Critical Thinking and Problem Solving"],
      values: [detail.value || "Responsibility"],
      pcis: [detail.pc || "Citizenship"],
      resources: detail.resources.slice(0, 4),
      intro: [
        "Review the concept of " + topic.sub + " from earlier work.",
        "Introduce the sub-strand: " + topic.sub + "."
      ],
      development: steps,
      conclusion: [
        "Summarise the main idea of " + topic.sub + ".",
        "Conduct a brief oral quiz (Assessment: oral questions)."
      ],
      extended: "Learners look up one further example of " + topic.sub + " in the course book and write it in their exercise books.",
      evaluation: ""
    };
  }

  function buildPlan(form, level, topic, detail, number, slot) {
    var sw = isSwahili(form.subject);
    var board = sw
      ? "-Ubao.\n-Chaki au kalamu."
      : "-Chalk board/white board.\n-A piece of chalk/ marker pen.";
    var reference = form.book + " — " + topic.sub;
    var outcomes = detail.outcomes.map(function (line) {
      var text = String(line)
        .replace(/^By the end of the lesson, the learner should be able to:?\s*/i, "")
        .replace(/^Kufikia mwisho wa somo, mwanafunzi aweze:?\s*/i, "")
        .replace(/^Mwisho wa somo, mwanafunzi aweze\s*/i, "")
        .replace(/\.\.+$/, ".");
      text = text.replace(/^\s+/, "");
      if (!text) return "";
      return text.charAt(0).toUpperCase() + text.slice(1);
    }).filter(function (line) { return line; });
    var body = detail.experiences.join("\n");
    var guidedBody = detail.experiences.map(function (line) { return lowerFirst(line); }).join("\n");
    var intro = sw
      ? "Kagua somo lililopita kuhusu " + topic.sub + "."
      : "Review the previous lesson on " + topic.sub + ".";
    var talk = sw ? "Majadiliano.\nMaswali na majibu." : "Discussion.\nQuestions and answers.";
    var questions = sw ? "Maswali na majibu." : "Questions and answers.";
    var conclusion = sw ? "Tathmini ya mdomo kuhusu mada ndogo." : "Oral evaluation on the sub-topic.";
    var guided = sw
      ? "Wanafunzi wanaongozwa kwa vikundi:\n" + guidedBody
      : "In groups, learners are guided to:\n" + guidedBody;
    return {
      number: number,
      title: "LESSON PLAN " + number + ": " + topic.sub,
      header: {
        teacher: form.teacher,
        tsc: form.tsc || "",
        school: form.school,
        form: level.label,
        term: String(form.term),
        year: String(form.year),
        students: String(form.students || ""),
        subject: form.subject,
        topic: topic.strand,
        subtopic: topic.sub,
        week: slot.week,
        lesson: slot.lesson,
        date: number === 1 ? String(form.lessonDate || "") : "",
        time: String(form.lessonTime || "")
      },
      objectiveLead: sw
        ? "Kufikia mwisho wa somo, mwanafunzi aweze;"
        : "By the end of the lesson the learner should be able to;",
      objectives: outcomes,
      evaluation: "",
      columns: ["TIME", "CONTENT", "LEARNING ACTIVITIES", "RESOURCES", "REFERENCE"],
      steps: [
        ["5 MINUTES", "INTRODUCTION\n" + intro, talk, board, reference],
        ["30 MINUTES", "BODY DEVELOPMENT\n" + body, guided, detail.resources.join("\n"), reference],
        ["5 MINUTES", "CONCLUSION\n" + conclusion, questions, board, reference]
      ]
    };
  }

  function buildRevision(form, level, topic, index) {
    var sw = isSwahili(form.subject);
    var facts = [
      topic.focus + ".",
      "Key term: " + topic.sub + ".",
      "Link the idea to a Kenyan example from home, school, farm, market or the local environment.",
      "Check the explanation against the KICD-approved " + form.book + " learner book before the lesson."
    ];
    if (sw) {
      facts = [
        topic.focus + ".",
        "Neno kuu: " + topic.sub + ".",
        "Husisha wazo na mfano wa nyumbani, shuleni au jamii.",
        "Hakiki maelezo kwa kitabu cha mwanafunzi kilichoidhinishwa na KICD (" + form.book + ")."
      ];
    }
    var questions = questionsFor(topic, level.track, form.subject, index);
    return {
      topic: topic.sub,
      strand: topic.strand,
      paragraphs: facts,
      questions: questions
    };
  }

  function questionsFor(topic, track, subject, index) {
    var blob = ((topic.sub || "") + " " + (topic.focus || "") + " " + (topic.strand || "") + " " + (subject || "")).toLowerCase();
    var sums = [];
    function add(q, a, marks) { sums.push([q, a, marks]); }
    if (/fraction/.test(blob)) {
      add("Work out 3/4 + 1/8. Show each step.", "3/4 = 6/8. 6/8 + 1/8 = 7/8.", 3);
      add("A rope is 2/5 m long. A learner cuts off 1/10 m. What length remains?", "2/5 = 4/10. 4/10 - 1/10 = 3/10 m.", 3);
    }
    if (/percentage|discount|profit|commission|interest/.test(blob)) {
      add("A book costs KSh 800. The shop gives a 15% discount. How much does the learner pay?", "15% of 800 = 120. Amount paid = 800 - 120 = KSh 680.", 3);
      add("A farmer sells maize for KSh 2,400 after spending KSh 1,800. Find the profit and the percentage profit.", "Profit = 600. Percentage profit = 600/1800 x 100 = 33 1/3%.", 4);
      add("KSh 12,000 is saved at 8% simple interest per year for 3 years. Find the interest and the total amount.", "Interest = 12000 x 8/100 x 3 = KSh 2,880. Amount = 12000 + 2880 = KSh 14,880.", 4);
    }
    if (/perimeter|area|mensuration/.test(blob)) {
      add("A classroom garden is 12 m long and 8 m wide. Find the perimeter and the area.", "Perimeter = 2(12 + 8) = 40 m. Area = 12 x 8 = 96 m2.", 4);
      add("A water tank is a cuboid 2 m by 1.5 m by 1 m. Find its volume in litres. (1 m3 = 1,000 litres.)", "Volume = 2 x 1.5 x 1 = 3 m3 = 3,000 litres.", 4);
    }
    if (/pythagoras|right-angled/.test(blob)) {
      add("A right-angled triangle has shorter sides 6 cm and 8 cm. Find the hypotenuse.", "6 squared + 8 squared = 36 + 64 = 100. Hypotenuse = 10 cm.", 3);
    }
    if (/ratio|proportion/.test(blob)) {
      add("Share KSh 3,600 between two learners in the ratio 2:3.", "Parts = 5. One part = 720. Shares are KSh 1,440 and KSh 2,160.", 3);
    }
    if (/mean|average|median|mode/.test(blob)) {
      add("The scores are 12, 15, 18, 15 and 20. Find the mean and the mode.", "Mean = 80/5 = 16. Mode = 15.", 3);
    }
    if (/speed|velocity|distance/.test(blob) && /physics|science|motion|speed/.test(blob)) {
      add("A bus travels 180 km in 3 hours. Find its average speed.", "Speed = 180/3 = 60 km/h.", 2);
      add("A car moves at 20 m/s for 15 s. How far does it travel?", "Distance = 20 x 15 = 300 m.", 2);
    }
    if (/density|mass|volume/.test(blob) && /physics|science|matter/.test(blob)) {
      add("A stone has mass 240 g and volume 80 cm3. Find its density.", "Density = 240/80 = 3 g/cm3.", 2);
    }
    if (/ohm|resistance|current|voltage/.test(blob)) {
      add("A lamp uses a current of 0.5 A from a 12 V supply. Find the resistance.", "R = V/I = 12/0.5 = 24 ohms.", 3);
    }
    if (/force|weight|newton/.test(blob)) {
      add("A bag of maize has mass 25 kg. Take g = 10 N/kg. Find its weight.", "Weight = 25 x 10 = 250 N.", 2);
    }
    if (/mole|molar/.test(blob)) {
      add("Calculate the number of moles in 36 g of water. (H = 1, O = 16.)", "Molar mass of water = 18 g. Moles = 36/18 = 2 mol.", 3);
      add("What mass of carbon dioxide is produced from 4 mol of the gas? (C = 12, O = 16.)", "Molar mass = 44 g. Mass = 4 x 44 = 176 g.", 3);
    }
    if (/gas law|boyle|charles/.test(blob)) {
      add("A gas has volume 400 cm3 at 100 kPa. The temperature stays the same and the pressure becomes 200 kPa. Find the new volume.", "P1V1 = P2V2. 100 x 400 = 200 x V2. V2 = 200 cm3.", 4);
    }
    if (/algebra|equation|expression/.test(blob)) {
      add("Solve 3x + 5 = 20.", "3x = 15. x = 5.", 2);
      add("Simplify 4a + 7b - a + 2b.", "3a + 9b.", 2);
    }
    if (!sums.length && /math/.test(blob)) {
      add("The marks 18, 22, 16 and 24 were recorded. Find the total and the mean.", "Total = 80. Mean = 80/4 = 20.", 3);
      add("A learner scores 27 out of 45. Express the score as a percentage.", "27/45 x 100 = 60%.", 3);
      add("A rectangle is 15 cm long and 6 cm wide. Find its perimeter.", "Perimeter = 2(15 + 6) = 42 cm.", 2);
    }
    if (sums.length) return numbered(sums, track, topic);
    if (/cell/.test(blob)) {
      return numbered([
        ["Name two parts of a plant cell that are not found in an animal cell, and state one function of each.", "Cell wall: gives the cell a fixed shape. Chloroplast: site of photosynthesis.", 4]
      ], track, topic);
    }
    var name = topic.sub || topic.strand || "this topic";
    return [
      { marks: 2, q: "Define " + name + ".", a: "A clear definition of " + name + " earns the marks." },
      { marks: 3, q: "Give two examples of " + name + " from a Kenyan home, school or farm.", a: "Two correct local examples, one mark each, plus one mark for naming the idea." },
      { marks: 4, q: "A class investigates " + name + ". State the result you expect and give one reason.", a: "The expected result is correct and the reason matches it." }
    ];
  }

  function numbered(pairs, track, topic) {
    var made = pairs.map(function (row) {
      return { marks: row[2], q: row[0], a: row[1] };
    });
    made.push({
      marks: track === "kcse" ? 3 : null,
      q: "Explain one common mistake learners make in " + topic.sub + " and how to correct it.",
      a: "Award marks for a real mistake, the correction, and a short example."
    });
    return made;
  }

  function rubricText() {
    return "Rubric — Exceeds: accurate, complete and clearly explained. Meets: correct main idea with an example. Approaches: partial idea, needs support. Below: idea not yet shown.";
  }

  root.itcBuildWeeks = buildWeeks;
  root.itcCatalog = itcCatalog;
  root.itcPlanStats = itcPlanStats;
  root.itcRecommendIds = itcRecommendIds;
  root.itcGenerate = itcGenerate;
  root.itcFmt = fmt;
})(typeof window !== "undefined" ? window : globalThis);
