(function (root) {
  function xml(value) {
    return String(value == null ? "" : value)
      .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function pdfText(value) {
    return String(value == null ? "" : value)
      .replace(/\u2013|\u2014/g, "-")
      .replace(/\u2018|\u2019/g, "'")
      .replace(/\u201c|\u201d/g, "\"")
      .replace(/\u2022/g, "-")
      .replace(/[^\x0A\x20-\x7E]/g, "");
  }

  function pdfStr(value) {
    return "(" + pdfText(value).replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)") + ")";
  }

  function linesOf(value) {
    var text = String(value == null ? "" : value);
    if (!text) return [""];
    return text.split("\n");
  }

  function rPr(opts) {
    opts = opts || {};
    return "<w:rPr>" +
      (opts.font ? "<w:rFonts w:ascii=\"" + opts.font + "\" w:hAnsi=\"" + opts.font + "\"/>" : "") +
      (opts.b ? "<w:b/>" : "") +
      (opts.i ? "<w:i/>" : "") +
      (opts.color ? "<w:color w:val=\"" + opts.color + "\"/>" : "") +
      (opts.size ? "<w:sz w:val=\"" + opts.size + "\"/><w:szCs w:val=\"" + opts.size + "\"/>" : "") +
      "</w:rPr>";
  }

  function wp(text, opts) {
    opts = opts || {};
    var align = opts.align ? "<w:jc w:val=\"" + opts.align + "\"/>" : "";
    var spacing = "<w:spacing w:before=\"" + (opts.before || 0) + "\" w:after=\"" + (opts.after == null ? 80 : opts.after) + "\"/>";
    return "<w:p><w:pPr>" + align + spacing + "</w:pPr><w:r>" + rPr(opts) + "<w:t xml:space=\"preserve\">" + xml(text) + "</w:t></w:r></w:p>";
  }

  function tc(text, opts) {
    opts = opts || {};
    var fill = opts.fill ? "<w:shd w:val=\"clear\" w:color=\"auto\" w:fill=\"" + opts.fill + "\"/>" : "";
    var span = opts.span ? "<w:gridSpan w:val=\"" + opts.span + "\"/>" : "";
    var width = opts.width ? "<w:tcW w:w=\"" + opts.width + "\" w:type=\"dxa\"/>" : "";
    var paras = linesOf(text).map(function (line) { return wp(line, opts); }).join("");
    return "<w:tc><w:tcPr>" + width + span + fill + "<w:vAlign w:val=\"top\"/></w:tcPr>" + paras + "</w:tc>";
  }

  function table(columns, rows, widths) {
    var fixed = widths && widths.length === columns.length;
    var total = fixed ? widths.reduce(function (sum, width) { return sum + width; }, 0) : 5000;
    var grid = fixed ? "<w:tblGrid>" + widths.map(function (width) { return "<w:gridCol w:w=\"" + width + "\"/>"; }).join("") + "</w:tblGrid>" : "";
    var header = "<w:tr><w:trPr><w:tblHeader/></w:trPr>" + columns.map(function (col, index) {
      return tc(col, { b: true, color: "FFFFFF", fill: "1B4F8A", size: 16, after: 20, width: fixed ? widths[index] : 0 });
    }).join("") + "</w:tr>";
    var body = rows.map(function (row) {
      if (row.kind === "break") {
        var banner = row.label + "  ·  " + row.dates + "  ·  " + row.note;
        return "<w:tr><w:trPr><w:cantSplit/></w:trPr>" + tc(banner, { b: true, fill: "D6E4F5", size: 16, span: columns.length, after: 20, width: fixed ? total : 0 }) + "</w:tr>";
      }
      return "<w:tr><w:trPr><w:cantSplit/></w:trPr>" + row.cells.map(function (cell, index) {
        return tc(cell, { size: 18, after: 20, width: fixed ? widths[index] : 0 });
      }).join("") + "</w:tr>";
    }).join("");
    return "<w:tbl><w:tblPr><w:tblW w:w=\"" + total + "\" w:type=\"" + (fixed ? "dxa" : "pct") + "\"/>" +
      (fixed ? "<w:tblLayout w:type=\"fixed\"/>" : "") +
      "<w:tblBorders>" +
      ["top", "left", "bottom", "right", "insideH", "insideV"].map(function (edge) {
        return "<w:" + edge + " w:val=\"single\" w:sz=\"4\" w:space=\"0\" w:color=\"C8BEA8\"/>";
      }).join("") +
      "</w:tblBorders><w:tblCellMar><w:top w:w=\"40\" w:type=\"dxa\"/><w:left w:w=\"50\" w:type=\"dxa\"/><w:bottom w:w=\"40\" w:type=\"dxa\"/><w:right w:w=\"50\" w:type=\"dxa\"/></w:tblCellMar></w:tblPr>" +
      grid + header + body + "</w:tbl>";
  }

  function schemeHeadline(cover) {
    return [
      "SCHEME OF WORK",
      String(cover.subject || "").toUpperCase(),
      (String(cover.grade || "").toUpperCase() + " " + (cover.year || "")).trim(),
      "TERM " + (cover.termRoman || cover.term || ""),
      String(cover.school || "").toUpperCase()
    ];
  }
  function schemeDots() {
    return "................................................";
  }
  function schemeCoverXml(doc) {
    var lines = schemeHeadline(doc.cover);
    var html = "";
    lines.forEach(function (line, index) {
      html += wp(line, { align: "center", size: 28, before: index ? 60 : 1200, after: 20 });
    });
    html += wp("H. O. D  " + schemeDots(), { align: "center", size: 24, before: 400, after: 40 });
    html += wp("Sign  " + schemeDots(), { align: "center", size: 24, after: 280 });
    html += wp("Principal / D. Principal  " + schemeDots(), { align: "center", size: 24, before: 200, after: 40 });
    html += wp("Sign  " + schemeDots(), { align: "center", size: 24, after: 40 });
    return html;
  }
  function coverXml(doc) {
    if (doc.type === "scheme") return schemeCoverXml(doc);
    var c = doc.cover;
    var blocks = [];
    blocks.push(wp("REPUBLIC OF KENYA", { align: "center", b: true, size: 22, color: "1B4F8A", after: 40 }));
    blocks.push(wp("MINISTRY OF EDUCATION", { align: "center", size: 20, color: "5E584E", after: 160 }));
    blocks.push(wp(c.school, { align: "center", b: true, size: 48, font: "Georgia", color: "163A5F", after: 40 }));
    blocks.push(wp(c.typeLabel, { align: "center", b: true, size: 32, color: "A8843D", after: 40 }));
    blocks.push(wp(c.subject, { align: "center", b: true, size: 28, after: 20 }));
    blocks.push(wp(c.grade + "  " + c.year, { align: "center", b: true, size: 28, after: 20 }));
    blocks.push(wp("TERM " + (c.termRoman || c.term), { align: "center", b: true, size: 28, after: 160 }));
    var facts = [
      ["School", c.school],
      ["Teacher", c.teacher],
      ["TSC number", c.tsc || "____________________"],
      ["Class", c.grade + " (" + c.band + ")"],
      ["Learning area / subject", c.subject],
      ["Curriculum", c.curriculum],
      ["Term", "Term " + c.term + ", " + c.year],
      ["Term opens", c.opening],
      ["Term closes", c.closing],
      ["Lessons per week", String(c.lessonsPerWeek)],
      ["KICD-approved course book", c.book],
      ["Date prepared", c.prepared || "____________________"]
    ];
    facts.forEach(function (pair) {
      blocks.push(wp(pair[0] + ":  " + pair[1], { size: 22, after: 60 }));
    });
    blocks.push(wp("Sign-off", { b: true, size: 24, before: 200, after: 80 }));
    blocks.push(wp("Subject teacher: " + c.teacher, { size: 20, after: 40 }));
    blocks.push(wp("Signature: ______________________________    Date: ______________", { size: 20, after: 120 }));
    blocks.push(wp("Head of Department: " + (c.hod || "______________________________"), { size: 20, after: 40 }));
    blocks.push(wp("Signature: ______________________________    Date: ______________", { size: 20, after: 120 }));
    blocks.push(wp("Deputy Principal: " + (c.deputy || "______________________________"), { size: 20, after: 40 }));
    blocks.push(wp("Signature: ______________________________    Date: ______________", { size: 20, after: 120 }));
    blocks.push(wp("Principal: " + (c.principal || "______________________________"), { size: 20, after: 40 }));
    blocks.push(wp("Signature: ______________________________    Date: ______________", { size: 20, after: 160 }));
    if (doc.type === "exam") {
      blocks.push(wp("This assessment is original practice for the class named above. It is not a KNEC past paper.", { i: true, size: 18, after: 40 }));
    } else {
      blocks.push(wp("Breaks, half-term and the end of term are left blank and labelled. No lessons are written into those days.", { i: true, size: 18, after: 40 }));
      blocks.push(wp("Activities are original planning notes for use with the KICD-approved course book named above. Match them to the pages in your copy.", { i: true, size: 18, after: 40 }));
    }
    blocks.push(wp("Page numbers appear at the foot of every page.", { i: true, size: 18, after: 40 }));
    return blocks.join("");
  }

  function boxed(rowsXml) {
    return "<w:tbl><w:tblPr><w:tblW w:w=\"5000\" w:type=\"pct\"/>" +
      "<w:tblBorders>" +
      ["top", "left", "bottom", "right", "insideH", "insideV"].map(function (edge) {
        return "<w:" + edge + " w:val=\"single\" w:sz=\"4\" w:space=\"0\" w:color=\"8A8175\"/>";
      }).join("") +
      "</w:tblBorders><w:tblCellMar><w:top w:w=\"40\" w:type=\"dxa\"/><w:left w:w=\"60\" w:type=\"dxa\"/><w:bottom w:w=\"40\" w:type=\"dxa\"/><w:right w:w=\"60\" w:type=\"dxa\"/></w:tblCellMar></w:tblPr>" +
      rowsXml + "</w:tbl>";
  }

  function dotted(value) {
    var text = String(value || "").trim();
    return text || "............";
  }

  function labelValue(rows, label) {
    var found = "";
    (rows || []).forEach(function (row) {
      var i;
      for (i = 0; i < row.length - 1; i += 2) {
        if (String(row[i] || "").replace(/\.$/, "").toLowerCase() === label.toLowerCase()) found = row[i + 1] || "";
      }
    });
    return found;
  }
  function filled(value) {
    var text = String(value || "").trim();
    if (!text || text.indexOf("____") >= 0) return "";
    return text;
  }
  function minuteLabel(value) {
    var match = String(value || "").match(/(\d+)/);
    return match ? match[1] + " MINUTES" : String(value || "").toUpperCase();
  }
  function stageLabel(value) {
    var name = String(value || "").trim().toLowerCase();
    if (name === "introduction") return "INTRODUCTION";
    if (name === "development" || name === "body" || name === "body development") return "BODY DEVELOPMENT";
    if (name === "conclusion") return "CONCLUSION";
    return String(value || "").toUpperCase();
  }
  function upgradeLessonPlan(plan, cover) {
    if (plan.layout === "cbe") return false;
    if (plan.header && plan.columns && plan.columns[1] === "CONTENT") return false;
    cover = cover || {};
    var topic = labelValue(plan.rows, "Topic");
    var sub = labelValue(plan.rows, "Sub-topic");
    if (!sub && plan.title && String(plan.title).indexOf(":") >= 0) sub = String(plan.title).split(":").slice(1).join(":").trim();
    var book = filled(labelValue(plan.rows, "Course book")) || cover.book || "";
    var reference = book ? book + " — " + (sub || topic) : "";
    var board = "-Chalk board/white board.\n-A piece of chalk/ marker pen.";
    var resources = String(plan.resources || "").trim();
    var objectives = String(plan.outcomes || "").split("\n").map(function (line) {
      return String(line)
        .replace(/^By the end of the lesson,?\s*the learner should be able to:?\s*/i, "")
        .replace(/^-\s*/, "")
        .trim();
    }).filter(Boolean).map(function (line) {
      return line.charAt(0).toUpperCase() + line.slice(1);
    });
    var steps = (plan.steps || []).map(function (step) {
      var stage = stageLabel(step[1]);
      return [
        minuteLabel(step[0]),
        stage + (step[2] ? "\n" + step[2] : ""),
        step[3] || "",
        stage === "BODY DEVELOPMENT" ? resources : board,
        reference
      ];
    });
    plan.header = {
      teacher: filled(plan.teacher) || filled(labelValue(plan.rows, "Teacher")) || cover.teacher || "",
      tsc: filled(plan.tsc) || filled(labelValue(plan.rows, "TSC No")) || cover.tsc || "",
      school: filled(labelValue(plan.rows, "School")) || cover.school || "",
      form: filled(labelValue(plan.rows, "Class")) || cover.grade || "",
      term: String(cover.term || ""),
      year: String(cover.year || ""),
      students: "",
      subject: filled(labelValue(plan.rows, "Subject")) || cover.subject || "",
      topic: topic,
      subtopic: sub,
      week: "",
      lesson: plan.number ? String(plan.number) : "",
      date: filled(labelValue(plan.rows, "Date")),
      time: filled(labelValue(plan.rows, "Time"))
    };
    plan.objectiveLead = "By the end of the lesson the learner should be able to;";
    plan.objectives = objectives;
    plan.evaluation = "";
    plan.columns = ["TIME", "CONTENT", "LEARNING ACTIVITIES", "RESOURCES", "REFERENCE"];
    plan.steps = steps;
    plan.title = "LESSON PLAN " + (plan.number || "") + ": " + (sub || topic);
    return true;
  }
  function lessonSampleXml(plan) {
    var h = plan.header;
    var html = wp("LESSON PLAN", { b: true, size: 28, color: "1B4F8A", after: 80 });
    html += wp("TEACHER'S NAME: " + dotted(h.teacher) + "      TSC NO: " + dotted(h.tsc), { size: 18, after: 30 });
    html += wp("SCHOOL / INSTITUTION: " + dotted(h.school), { size: 18, after: 30 });
    html += wp("FORM: " + h.form + "      TERM: " + h.term + "      YEAR: " + h.year, { size: 18, after: 30 });
    html += wp("NUMBER OF STUDENTS: " + dotted(h.students) + "      SUBJECT: " + h.subject, { size: 18, after: 30 });
    html += wp("TOPIC: " + h.topic, { b: true, size: 18, after: 20 });
    html += wp("SUB-TOPIC: " + h.subtopic, { b: true, size: 18, after: 20 });
    html += wp("WEEK: " + dotted(h.week) + "      LESSON NUMBER: " + dotted(h.lesson), { size: 18, after: 20 });
    html += wp("DATE: " + dotted(h.date) + "      TIME: " + dotted(h.time), { size: 18, after: 60 });
    html += wp("OBJECTIVES: " + plan.objectiveLead, { size: 18, after: 20 });
    (plan.objectives || []).forEach(function (line) {
      html += wp("- " + line, { size: 18, after: 8 });
    });
    html += wp("LESSON PRESENTATION", { b: true, size: 20, color: "163A5F", before: 140, after: 40 });
    html += table(plan.columns, plan.steps.map(function (step) { return { cells: step }; }));
    html += wp("SELF-EVALUATION:", { b: true, size: 18, before: 160, after: 40 });
    if (String(plan.evaluation || "").trim()) {
      linesOf(plan.evaluation).forEach(function (line) { html += wp(line || " ", { size: 18, after: 20 }); });
    } else {
      html += wp("________________________________________________________________", { size: 18, after: 20 });
      html += wp("________________________________________________________________", { size: 18, after: 20 });
    }
    return html;
  }

  function cbeLessonXml(plan) {
    var h = plan.header || {};
    var html = wp(plan.title, { align: "center", b: true, size: 28, after: 40 });
    html += wp(plan.weekTitle || "", { align: "center", b: true, size: 24, after: 80 });
    html += table(
      ["SCHOOL", "LEVEL", "LEARNING AREA", "TERM", "NAME", "DATE", "TIME", "ROLL", "YEAR"],
      [{ cells: [h.school || "", h.level || "", h.area || "", h.term || "", h.name || "", h.date || "", h.time || "", h.roll || "", h.year || ""] }]
    );
    html += wp("Strand: " + (plan.strand || ""), { b: true, size: 22, before: 120, after: 20 });
    html += wp("Sub Strand: " + (plan.substrand || ""), { b: true, size: 22, after: 40 });
    html += wp("Specific Learning Outcomes:", { b: true, size: 22, after: 20 });
    html += wp(plan.outcomesLine || "", { size: 22, after: 40 });
    html += wp("Key Inquiry Question(s):", { b: true, size: 22, after: 20 });
    html += wp(plan.inquiry || "", { size: 22, after: 60 });
    html += table(
      ["Core Competencies", "Values", "PCIs"],
      [{ cells: [(plan.competencies || []).join(", "), (plan.values || []).join(", "), (plan.pcis || []).join(", ")] }]
    );
    html += wp("Learning Resources:", { b: true, size: 22, before: 120, after: 20 });
    (plan.resources || []).forEach(function (line) { html += wp(line, { size: 22, after: 12 }); });
    html += wp("Organization of Learning:", { b: true, size: 22, before: 80, after: 20 });
    html += wp("Introduction (5 minutes):", { b: true, size: 22, after: 12 });
    (plan.intro || []).forEach(function (line) { html += wp(line, { size: 22, after: 12 }); });
    html += wp("Lesson Development (30 minutes):", { b: true, size: 22, before: 40, after: 12 });
    (plan.development || []).forEach(function (line) { html += wp(line, { size: 22, after: 12 }); });
    html += wp("Conclusion (5 minutes):", { b: true, size: 22, before: 40, after: 12 });
    (plan.conclusion || []).forEach(function (line) { html += wp(line, { size: 22, after: 12 }); });
    html += wp("Extended Activities:", { b: true, size: 22, before: 80, after: 12 });
    html += wp(plan.extended || "", { size: 22, after: 40 });
    html += wp("Teacher Self-Evaluation:", { b: true, size: 22, before: 40, after: 20 });
    html += wp(String(plan.evaluation || "").trim() || "________________________________________________________________", { size: 22, after: 20 });
    return html;
  }

  function lessonXml(plan, cover) {
    upgradeLessonPlan(plan, cover);
    if (plan.layout === "cbe") return cbeLessonXml(plan);
    if (plan.header) return lessonSampleXml(plan);
    var info = plan.rows.map(function (row) {
      return "<w:tr>" + row.map(function (cell, index) {
        return tc(cell || " ", { b: index % 2 === 0, fill: index % 2 === 0 ? "E7F0FA" : "FFFFFF", size: 16, after: 20 });
      }).join("") + "</w:tr>";
    }).join("");
    var html = wp(plan.title, { b: true, size: 28, color: "1B4F8A", before: 40, after: 80 });
    html += boxed(info);
    [["Specific learning outcomes", plan.outcomes], ["Key inquiry questions", plan.inquiry], ["Learning resources", plan.resources]].forEach(function (pair) {
      if (!pair[1]) return;
      html += wp(pair[0], { b: true, size: 20, color: "163A5F", before: 120, after: 40 });
      linesOf(pair[1]).forEach(function (line) { html += wp(line || " ", { size: 18, after: 20 }); });
    });
    html += wp("Organisation of learning", { b: true, size: 20, color: "163A5F", before: 140, after: 60 });
    html += table(
      ["Time", "Step", "Teacher's activity", "Learner's activity", "Assessment"],
      plan.steps.map(function (step) { return { cells: step }; })
    );
    html += wp("Extended activity", { b: true, size: 20, before: 120, after: 40 });
    html += wp(plan.extended || " ", { size: 18, after: 40 });
    html += wp("Teacher's reflection", { b: true, size: 20, before: 80, after: 40 });
    linesOf(plan.reflection).forEach(function (line) { html += wp(line || " ", { size: 18, after: 20 }); });
    html += wp("Sign-off", { b: true, size: 20, before: 120, after: 40 });
    html += boxed(
      "<w:tr>" + tc("Teacher: " + (plan.teacher || ""), { size: 16, after: 20 }) + tc("TSC No: " + (plan.tsc || "______________"), { size: 16, after: 20 }) + tc("Signature: ____________________", { size: 16, after: 20 }) + tc("Date: __________", { size: 16, after: 20 }) + "</w:tr>" +
      "<w:tr>" + tc("Head of Department: " + (plan.hod || "____________________"), { size: 16, after: 20, span: 2 }) + tc("Signature: ____________________", { size: 16, after: 20 }) + tc("Date: __________", { size: 16, after: 20 }) + "</w:tr>"
    );
    return html;
  }

  function kcseFrontXml(doc) {
    var c = doc.cover;
    var exam = doc.exam;
    var html = wp(c.school, { align: "center", b: true, size: 36, after: 40 });
    html += wp("MOCK EXAMINATIONS", { align: "center", b: true, size: 28, after: 20 });
    html += wp(c.grade.toUpperCase() + " - " + c.year, { align: "center", b: true, size: 26, after: 20 });
    html += wp(String(c.subject).toUpperCase(), { align: "center", b: true, size: 28, after: 20 });
    html += wp(exam.paper || "PAPER 2 (Theory)", { align: "center", b: true, size: 26, after: 20 });
    html += wp("Time: " + (exam.duration || "2 Hours"), { align: "center", b: true, size: 24, after: 160 });
    html += wp("Name .............................................  Adm Number ........................", { size: 22, after: 40 });
    html += wp("Candidate's Signature ..............................  Date ........................", { size: 22, after: 120 });
    html += wp("INSTRUCTIONS TO CANDIDATES", { align: "center", b: true, size: 24, after: 60 });
    var letters = ["a", "b", "c", "d", "e", "f"];
    (exam.instructions || []).forEach(function (line, index) {
      html += wp(letters[index] + ")  " + line, { size: 22, after: 30 });
    });
    html += wp("FOR EXAMINER'S USE ONLY", { align: "center", b: true, size: 24, before: 160, after: 60 });
    html += table(["QUESTION", "MAXIMUM SCORE", "CANDIDATE'S SCORES"], (exam.scoreRows || []).map(function (row) {
      return { cells: [row.question, String(row.max), ""] };
    }));
    return html;
  }

  function examXml(doc, page) {
    if (doc.exam && doc.exam.layout === "kcse") {
      var html = "";
      page.section.items.forEach(function (item) {
        html += wp(item.number + ".", { b: true, size: 24, before: 80, after: 40 });
        (item.parts || []).forEach(function (part) {
          html += wp(part.label + "  " + part.q, { size: 22, after: 20 });
          html += wp("(" + part.marks + " marks)", { align: "right", size: 20, after: 60 });
        });
      });
      return html;
    }
    var html = wp(doc.cover.school + "  ·  " + doc.cover.grade + "  ·  " + doc.cover.subject, { b: true, size: 24, color: "1B4F8A", after: 40 });
    html += wp(page.section.title + "  ·  " + page.duration, { b: true, size: 24, after: 40 });
    html += wp(page.section.note, { i: true, size: 18, after: 60 });
    if (page.instructions) {
      page.instructions.forEach(function (line) { html += wp("•  " + line, { size: 18, after: 20 }); });
    }
    page.section.items.forEach(function (item, index) {
      var marks = item.marks ? " (" + item.marks + " marks)" : "";
      html += wp((index + 1) + ".  " + item.q + marks, { size: 22, before: 80, after: 40 });
      html += wp("Working:", { size: 20, after: 160 });
    });
    return html;
  }

  function markingXml(doc) {
    var html = wp("Marking guide — not for the learner", { b: true, size: 26, color: "1B4F8A", after: 80 });
    var number = 1;
    doc.exam.sections.forEach(function (section) {
      html += wp(section.title, { b: true, size: 22, before: 80, after: 40 });
      section.items.forEach(function (item) {
        var marks = item.marks ? " (" + item.marks + " marks)" : "";
        html += wp(number + ".  " + item.a + marks, { size: 20, after: 50 });
        number += 1;
      });
    });
    return html;
  }

  function fieldBlocks(title, fields) {
    var html = wp(title, { b: true, size: 28, color: "1B4F8A", before: 80, after: 120 });
    fields.forEach(function (field) {
      html += wp(field[0], { b: true, size: 18, color: "163A5F", after: 20 });
      linesOf(field[1]).forEach(function (line) {
        html += wp(line || " ", { size: 18, after: 40 });
      });
    });
    return html;
  }

  function revisionBlocks(doc, item) {
    var c = doc.cover;
    var html = wp(c.school + "  ·  " + c.grade + "  ·  " + c.subject + "  ·  TERM " + (c.termRoman || c.term) + " " + c.year, { b: true, size: 18, color: "1B4F8A", after: 20 });
    html += wp("Teacher: " + c.teacher + "      TSC No: " + (c.tsc || "__________"), { size: 16, after: 80 });
    html += wp(item.strand + " — " + item.topic, { b: true, size: 26, color: "1B4F8A", before: 40, after: 80 });
    item.paragraphs.forEach(function (line) { html += wp(line, { size: 20, after: 40 }); });
    html += wp("Practice", { b: true, size: 22, before: 80, after: 60 });
    item.questions.forEach(function (q, index) {
      var mark = q.marks ? " (" + q.marks + " marks)" : "";
      html += wp((index + 1) + ". " + q.q + mark, { size: 20, after: 30 });
      html += wp("Guide: " + q.a, { i: true, size: 18, after: 70 });
    });
    return html;
  }

  function chunk(list, size) {
    var out = [];
    var i;
    for (i = 0; i < list.length; i += size) out.push(list.slice(i, i + size));
    return out;
  }

  function itcPaginate(doc) {
    var landscape = doc.type === "scheme";
    var pages = [{ kind: "cover", layout: "portrait" }];
    if (doc.scheme) {
      var spec = schemeWidths(841.89, (doc.scheme.columns || []).length || 9);
      var budget = 460;
      var units = [];
      var bucket = [];
      var used = 0;
      doc.scheme.body.forEach(function (row) {
        var hgt = schemeRowPx(row, spec.widths);
        if (bucket.length && used + hgt > budget) {
          units.push(bucket);
          bucket = [];
          used = 0;
        }
        bucket.push(row);
        used += hgt;
      });
      if (bucket.length) units.push(bucket);
      units.forEach(function (rows, index) {
        pages.push({ kind: "scheme", layout: "landscape", rows: rows, columns: doc.scheme.columns, signOff: index === units.length - 1 });
      });
    }
    (doc.plans || []).forEach(function (plan) {
      if (plan.steps || plan.layout === "cbe") {
        pages.push({ kind: "plan", layout: "portrait", title: plan.title, plan: plan });
        return;
      }
      chunk(plan.fields || [], 8).forEach(function (fields, index) {
        pages.push({
          kind: "plan",
          layout: "portrait",
          title: plan.title + (index ? " (continued)" : ""),
          fields: fields
        });
      });
    });
    if (doc.exam && doc.exam.layout === "kcse") {
      pages.push({ kind: "exam-front", layout: "portrait" });
      chunk((doc.exam.sections[0] && doc.exam.sections[0].items) || [], 2).forEach(function (items) {
        pages.push({
          kind: "exam",
          layout: "portrait",
          section: { title: "Questions", note: "", items: items },
          duration: doc.exam.duration,
          instructions: null
        });
      });
      pages.push({ kind: "marking", layout: "portrait" });
    } else if (doc.exam) {
      doc.exam.sections.forEach(function (section, index) {
        pages.push({
          kind: "exam",
          layout: "portrait",
          section: section,
          duration: doc.exam.duration,
          instructions: index === 0 ? doc.exam.instructions : null
        });
      });
      pages.push({ kind: "marking", layout: "portrait" });
    }
    (doc.revision || []).forEach(function (item) {
      pages.push({ kind: "revision", layout: "portrait", item: item });
    });
    if (doc.type === "revision" && pages.length === 1) {
      pages.push({ kind: "note", layout: "portrait", text: "Select topics to build the revision booklet." });
    }
    pages.forEach(function (page, index) {
      page.number = index + 1;
      page.total = pages.length;
    });
    return pages;
  }

  function schemeSignXml(doc) {
    var c = doc.cover;
    return wp("Sign-off", { b: true, size: 18, color: "163A5F", before: 160, after: 60 }) +
      wp("Head of Department: " + (c.hod || "______________________________") + "      Signature: ________________    Date: __________", { size: 16, after: 40 }) +
      wp("Principal: " + (c.principal || "______________________________") + "      Signature: ________________    Date: __________", { size: 16, after: 40 }) +
      wp(c.track === "cbe"
        ? "The reflection column is left blank for the teacher to fill after the lesson."
        : "Remarks are left blank for the teacher to fill after the lesson.", { i: true, size: 18, after: 40 });
  }

  function documentXml(doc) {
    var pages = itcPaginate(doc);
    var landscape = doc.type === "scheme";
    var parts = [];
    var schemeSection = false;
    pages.forEach(function (page, index) {
      if (doc.type === "scheme" && page.kind === "scheme" && !schemeSection) {
        parts.push("<w:p><w:pPr>" + pageSetup("portrait") + "</w:pPr></w:p>");
        schemeSection = true;
      } else if (index) parts.push("<w:p><w:r><w:br w:type=\"page\"/></w:r></w:p>");
      if (page.kind === "cover") parts.push(coverXml(doc));
      if (page.kind === "scheme") {
        parts.push(table(page.columns, page.rows, schemeTwips(page.columns.length)));
      }
      if (page.kind === "plan") parts.push(page.plan ? lessonXml(page.plan, doc.cover) : fieldBlocks(page.title, page.fields));
      if (page.kind === "exam-front") parts.push(kcseFrontXml(doc));
      if (page.kind === "exam") parts.push(examXml(doc, page));
      if (page.kind === "marking") parts.push(markingXml(doc));
      if (page.kind === "revision") parts.push(revisionBlocks(doc, page.item));
      if (page.kind === "note") parts.push(wp(page.text, { size: 22 }));
    });
    return "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?>" +
      "<w:document xmlns:w=\"http://schemas.openxmlformats.org/wordprocessingml/2006/main\" xmlns:r=\"http://schemas.openxmlformats.org/officeDocument/2006/relationships\">" +
      "<w:body>" + parts.join("") +
      pageSetup(landscape ? "landscape" : "portrait") + "</w:body></w:document>";
  }

  function pageSetup(orient) {
    var pg = orient === "landscape"
      ? "<w:pgSz w:w=\"16838\" w:h=\"11906\" w:orient=\"landscape\"/>"
      : "<w:pgSz w:w=\"11906\" w:h=\"16838\"/>";
    return "<w:sectPr><w:headerReference w:type=\"default\" r:id=\"rId3\"/><w:footerReference w:type=\"default\" r:id=\"rId4\"/>" +
      pg +
      "<w:pgMar w:top=\"720\" w:right=\"560\" w:bottom=\"780\" w:left=\"560\" w:header=\"200\" w:footer=\"400\"/></w:sectPr>";
  }

  function headerXml(doc) {
    var line = doc.type === "scheme"
      ? wp(" ", { size: 2, after: 0 })
      : wp(doc.cover.school, { align: "center", b: true, size: 18, color: "1B4F8A", after: 40 });
    return "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?>" +
      "<w:hdr xmlns:w=\"http://schemas.openxmlformats.org/wordprocessingml/2006/main\">" +
      line +
      "</w:hdr>";
  }

  function footerXml() {
    return "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?>" +
      "<w:ftr xmlns:w=\"http://schemas.openxmlformats.org/wordprocessingml/2006/main\">" +
      "<w:p><w:pPr><w:jc w:val=\"center\"/></w:pPr>" +
      "<w:r><w:rPr><w:sz w:val=\"16\"/></w:rPr><w:t xml:space=\"preserve\">Page </w:t></w:r>" +
      "<w:r><w:fldChar w:fldCharType=\"begin\"/></w:r>" +
      "<w:r><w:instrText xml:space=\"preserve\"> PAGE </w:instrText></w:r>" +
      "<w:r><w:fldChar w:fldCharType=\"separate\"/></w:r>" +
      "<w:r><w:t>1</w:t></w:r>" +
      "<w:r><w:fldChar w:fldCharType=\"end\"/></w:r>" +
      "<w:r><w:rPr><w:sz w:val=\"16\"/></w:rPr><w:t xml:space=\"preserve\"> of </w:t></w:r>" +
      "<w:r><w:fldChar w:fldCharType=\"begin\"/></w:r>" +
      "<w:r><w:instrText xml:space=\"preserve\"> NUMPAGES </w:instrText></w:r>" +
      "<w:r><w:fldChar w:fldCharType=\"separate\"/></w:r>" +
      "<w:r><w:t>1</w:t></w:r>" +
      "<w:r><w:fldChar w:fldCharType=\"end\"/></w:r>" +
      "</w:p></w:ftr>";
  }

  function crc32(bytes) {
    if (!crc32.table) {
      var table = new Uint32Array(256);
      var i;
      for (i = 0; i < 256; i++) {
        var c = i;
        var k;
        for (k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
        table[i] = c >>> 0;
      }
      crc32.table = table;
    }
    var crc = 0xFFFFFFFF;
    var n;
    for (n = 0; n < bytes.length; n++) crc = crc32.table[(crc ^ bytes[n]) & 255] ^ (crc >>> 8);
    return (crc ^ 0xFFFFFFFF) >>> 0;
  }

  function le(n, size) {
    var out = new Uint8Array(size);
    var i;
    var value = n >>> 0;
    for (i = 0; i < size; i++) out[i] = (value >>> (8 * i)) & 255;
    return out;
  }

  function concat(parts) {
    var len = 0;
    parts.forEach(function (part) { len += part.length; });
    var out = new Uint8Array(len);
    var offset = 0;
    parts.forEach(function (part) { out.set(part, offset); offset += part.length; });
    return out;
  }

  function zipStore(files) {
    var encoder = new TextEncoder();
    var now = new Date();
    var time = ((now.getHours() & 31) << 11) | ((now.getMinutes() & 63) << 5) | ((Math.floor(now.getSeconds() / 2)) & 31);
    var date = (((now.getFullYear() - 1980) & 127) << 9) | (((now.getMonth() + 1) & 15) << 5) | (now.getDate() & 31);
    var locals = [];
    var centrals = [];
    var offset = 0;
    files.forEach(function (file) {
      var name = encoder.encode(file.name);
      var data = file.data;
      var crc = crc32(data);
      var local = concat([
        le(0x04034b50, 4), le(20, 2), le(0, 2), le(0, 2), le(time, 2), le(date, 2),
        le(crc, 4), le(data.length, 4), le(data.length, 4), le(name.length, 2), le(0, 2),
        name, data
      ]);
      locals.push(local);
      var central = concat([
        le(0x02014b50, 4), le(20, 2), le(20, 2), le(0, 2), le(0, 2), le(time, 2), le(date, 2),
        le(crc, 4), le(data.length, 4), le(data.length, 4), le(name.length, 2), le(0, 2), le(0, 2),
        le(0, 2), le(0, 2), le(0, 4), le(offset, 4), name
      ]);
      centrals.push(central);
      offset += local.length;
    });
    var centralStart = offset;
    var centralSize = 0;
    centrals.forEach(function (part) { centralSize += part.length; });
    var eocd = concat([
      le(0x06054b50, 4), le(0, 2), le(0, 2), le(files.length, 2), le(files.length, 2),
      le(centralSize, 4), le(centralStart, 4), le(0, 2)
    ]);
    return concat(locals.concat(centrals, [eocd]));
  }

  function utf8(text) {
    return new TextEncoder().encode(text);
  }

  function itcDocxBytes(doc) {
    var safeTitle = xml(doc.title);
    var files = [
      { name: "[Content_Types].xml", data: utf8("<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?>" +
        "<Types xmlns=\"http://schemas.openxmlformats.org/package/2006/content-types\">" +
        "<Default Extension=\"rels\" ContentType=\"application/vnd.openxmlformats-package.relationships+xml\"/>" +
        "<Default Extension=\"xml\" ContentType=\"application/xml\"/>" +
        "<Override PartName=\"/word/document.xml\" ContentType=\"application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml\"/>" +
        "<Override PartName=\"/word/styles.xml\" ContentType=\"application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml\"/>" +
        "<Override PartName=\"/word/settings.xml\" ContentType=\"application/vnd.openxmlformats-officedocument.wordprocessingml.settings+xml\"/>" +
        "<Override PartName=\"/word/header1.xml\" ContentType=\"application/vnd.openxmlformats-officedocument.wordprocessingml.header+xml\"/>" +
        "<Override PartName=\"/word/footer1.xml\" ContentType=\"application/vnd.openxmlformats-officedocument.wordprocessingml.footer+xml\"/>" +
        "<Override PartName=\"/docProps/core.xml\" ContentType=\"application/vnd.openxmlformats-package.core-properties+xml\"/>" +
        "</Types>") },
      { name: "_rels/.rels", data: utf8("<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?>" +
        "<Relationships xmlns=\"http://schemas.openxmlformats.org/package/2006/relationships\">" +
        "<Relationship Id=\"rId1\" Type=\"http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument\" Target=\"word/document.xml\"/>" +
        "<Relationship Id=\"rId2\" Type=\"http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties\" Target=\"docProps/core.xml\"/>" +
        "</Relationships>") },
      { name: "docProps/core.xml", data: utf8("<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?>" +
        "<cp:coreProperties xmlns:cp=\"http://schemas.openxmlformats.org/package/2006/metadata/core-properties\" xmlns:dc=\"http://purl.org/dc/elements/1.1/\">" +
        "<dc:title>" + safeTitle + "</dc:title><dc:creator>" + xml(doc.cover.school || "") + "</dc:creator></cp:coreProperties>") },
      { name: "word/_rels/document.xml.rels", data: utf8("<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?>" +
        "<Relationships xmlns=\"http://schemas.openxmlformats.org/package/2006/relationships\">" +
        "<Relationship Id=\"rId1\" Type=\"http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles\" Target=\"styles.xml\"/>" +
        "<Relationship Id=\"rId2\" Type=\"http://schemas.openxmlformats.org/officeDocument/2006/relationships/settings\" Target=\"settings.xml\"/>" +
        "<Relationship Id=\"rId3\" Type=\"http://schemas.openxmlformats.org/officeDocument/2006/relationships/header\" Target=\"header1.xml\"/>" +
        "<Relationship Id=\"rId4\" Type=\"http://schemas.openxmlformats.org/officeDocument/2006/relationships/footer\" Target=\"footer1.xml\"/>" +
        "</Relationships>") },
      { name: "word/styles.xml", data: utf8("<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?>" +
        "<w:styles xmlns:w=\"http://schemas.openxmlformats.org/wordprocessingml/2006/main\">" +
        "<w:style w:type=\"paragraph\" w:default=\"1\" w:styleId=\"Normal\"><w:name w:val=\"Normal\"/>" +
        "<w:rPr><w:rFonts w:ascii=\"Calibri\" w:hAnsi=\"Calibri\"/><w:sz w:val=\"20\"/></w:rPr></w:style></w:styles>") },
      { name: "word/settings.xml", data: utf8("<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?>" +
        "<w:settings xmlns:w=\"http://schemas.openxmlformats.org/wordprocessingml/2006/main\"><w:updateFields w:val=\"true\"/></w:settings>") },
      { name: "word/header1.xml", data: utf8(headerXml(doc)) },
      { name: "word/footer1.xml", data: utf8(footerXml()) },
      { name: "word/document.xml", data: utf8(documentXml(doc)) }
    ];
    return zipStore(files);
  }

  function wrap(text, width, size) {
    var clean = pdfText(text).replace(/\s+/g, " ").trim();
    if (!clean) return [""];
    var max = Math.max(8, Math.floor(width / (size * 0.48)));
    var words = clean.split(" ");
    var lines = [];
    var line = "";
    words.forEach(function (word) {
      var next = line ? line + " " + word : word;
      if (next.length > max && line) {
        lines.push(line);
        line = word;
      } else line = next;
    });
    if (line) lines.push(line);
    return lines;
  }

  function drawSchemeCoverPdf(w, h, doc) {
    var cmds = [];
    var y = h * 0.72;
    function center(str, size, gap) {
      var clean = pdfText(str);
      var x = (w - glyphWidth(clean, size)) / 2;
      cmds.push("0 0 0 rg\nBT /F1 " + size + " Tf 1 0 0 1 " + x.toFixed(1) + " " + y.toFixed(1) + " Tm " + pdfStr(clean) + " Tj ET\n");
      y -= size + (gap || 10);
    }
    schemeHeadline(doc.cover).forEach(function (line) { center(line, 16, 12); });
    y -= 26;
    center("H. O. D  " + schemeDots(), 13, 16);
    center("Sign  " + schemeDots(), 13, 16);
    y -= 18;
    center("Principal / D. Principal  " + schemeDots(), 13, 16);
    center("Sign  " + schemeDots(), 13, 16);
    return cmds.join("");
  }

  function drawCoverPdf(w, h, doc, page) {
    if (doc.type === "scheme") return drawSchemeCoverPdf(w, h, doc);
    var y = h - 64;
    var cmds = [];
    function text(str, x, yy, size, font, color) {
      cmds.push((color || "0.09 0.21 0.36") + " rg\n");
      cmds.push("BT /" + font + " " + size + " Tf 1 0 0 1 " + x.toFixed(1) + " " + yy.toFixed(1) + " Tm " + pdfStr(str) + " Tj ET\n");
    }
    cmds.push("0.11 0.31 0.54 rg\n36 " + (h - 28) + " " + (w - 72) + " 6 re f\n");
    text("REPUBLIC OF KENYA", 36, y, 11, "F2"); y -= 18;
    text("MINISTRY OF EDUCATION", 36, y, 10, "F1", "0.37 0.35 0.31"); y -= 28;
    text(pdfText(doc.cover.school), 36, y, 18, "F2"); y -= 22;
    text(pdfText(doc.cover.subject + "   " + doc.cover.grade + " " + doc.cover.year), 36, y, 12, "F2"); y -= 16;
    text("TERM " + (doc.cover.termRoman || doc.cover.term), 36, y, 12, "F2"); y -= 22;
    text(doc.cover.typeLabel, 36, y, 14, "F2", "0.55 0.42 0.18"); y -= 28;
    var facts = [
      ["School", doc.cover.school],
      ["Teacher", doc.cover.teacher],
      ["TSC number", doc.cover.tsc || "____________________"],
      ["Class", doc.cover.grade + " (" + doc.cover.band + ")"],
      ["Subject", doc.cover.subject],
      ["Curriculum", doc.cover.curriculum],
      ["Term", "Term " + doc.cover.term + ", " + doc.cover.year],
      ["Opens", doc.cover.opening],
      ["Closes", doc.cover.closing],
      ["Lessons per week", String(doc.cover.lessonsPerWeek)],
      ["Course book", doc.cover.book],
      ["Prepared", doc.cover.prepared || "____________________"]
    ];
    facts.forEach(function (pair) {
      text(pair[0], 36, y, 10, "F2");
      wrap(pair[1], w - 220, 10).forEach(function (line, index) {
        text(line, 170, y, 10, "F1", "0 0 0");
        if (index < wrap(pair[1], w - 220, 10).length - 1) y -= 13;
      });
      y -= 16;
    });
    y -= 8;
    text("Sign-off", 36, y, 12, "F2"); y -= 18;
    [
      "Subject teacher: " + doc.cover.teacher + "      Signature: ____________________",
      "Head of Department: " + (doc.cover.hod || "____________________") + "      Signature: ____________________",
      "Deputy Principal: " + (doc.cover.deputy || "____________________") + "      Signature: ____________________",
      "Principal: " + (doc.cover.principal || "____________________") + "      Signature: ____________________"
    ].forEach(function (line) {
      text(line, 36, y, 10, "F1", "0 0 0");
      y -= 18;
    });
    y -= 6;
    wrap("Breaks, half-term and the end of term are left blank and labelled. Activities are original notes for the KICD-approved course book named above.", w - 72, 9).forEach(function (line) {
      text(line, 36, y, 9, "F1", "0.25 0.25 0.22");
      y -= 12;
    });
    return cmds.join("");
  }

  function drawFooter(w, page, doc) {
    var num = "Page " + page.number + " of " + page.total;
    var scheme = doc && doc.type === "scheme";
    var label = scheme ? "" : pdfText((doc && doc.cover && doc.cover.school) || "");
    var numX = scheme ? (w - glyphWidth(num, 9)) / 2 : w - 120;
    return (label ? "0.09 0.21 0.36 rg\nBT /F1 9 Tf 1 0 0 1 36 22 Tm " + pdfStr(label) + " Tj ET\n" : "") +
      "0.09 0.21 0.36 rg\nBT /F1 9 Tf 1 0 0 1 " + numX.toFixed(1) + " 22 Tm " + pdfStr(num) + " Tj ET\n" +
      "0.75 0.72 0.66 RG\n36 34 m " + (w - 36) + " 34 l S\n";
  }

  function schemeWeights(count) {
    if (count === 10) return [0.04, 0.05, 0.09, 0.11, 0.16, 0.16, 0.10, 0.12, 0.10, 0.07];
    if (count === 9) return [0.05, 0.07, 0.11, 0.12, 0.17, 0.16, 0.13, 0.11, 0.08];
    var each = 1 / Math.max(1, count);
    var weights = [];
    var i;
    for (i = 0; i < count; i++) weights.push(each);
    return weights;
  }
  function schemeWidths(pageWidth, count) {
    var margin = 22;
    var usable = pageWidth - margin * 2;
    return {
      margin: margin,
      usable: usable,
      widths: schemeWeights(count).map(function (weight) { return usable * weight; })
    };
  }
  function schemeTwips(count) {
    var total = 15718;
    return schemeWeights(count || 9).map(function (weight) { return Math.round(total * weight); });
  }
  function schemeRowPx(row, widths) {
    if (row.kind === "break") return 26;
    var size = 8;
    var maxLines = 1;
    (row.cells || []).forEach(function (cell, index) {
      maxLines = Math.max(maxLines, lessonLines(String(cell || ""), widths[index] || 40, size).length);
    });
    return maxLines * (size + 2.2) + 6;
  }
  function drawSchemePdf(w, h, doc, page) {
    var size = 8;
    var layout = schemeWidths(w, page.columns.length);
    var widths = layout.widths;
    var margin = layout.margin;
    var cmds = [];
    cmds.push("0.09 0.21 0.36 rg\nBT /F2 11 Tf 1 0 0 1 " + margin + " " + (h - 26) + " Tm " + pdfStr("SCHEME OF WORK") + " Tj ET\n");
    cmds.push("0.11 0.31 0.54 rg\nBT /F1 8 Tf 1 0 0 1 " + (margin + 148) + " " + (h - 24) + " Tm " + pdfStr(pdfText(doc.cover.school + " | " + doc.cover.subject + " | " + doc.cover.grade + " | TERM " + (doc.cover.termRoman || doc.cover.term) + " " + doc.cover.year)) + " Tj ET\n");
    function paint(cells, yTop, bold, fill) {
      var counts = cells.map(function (cell, index) {
        return lessonLines(String(cell || ""), widths[index], size);
      });
      var lines = counts.reduce(function (max, list) { return Math.max(max, list.length); }, 1);
      var height = lines * (size + 2.2) + 6;
      var x = margin;
      cells.forEach(function (cell, index) {
        var width = widths[index];
        cmds.push("q\n");
        if (fill) cmds.push(fill + " rg\n" + x.toFixed(1) + " " + (yTop - height).toFixed(1) + " " + width.toFixed(1) + " " + height.toFixed(1) + " re f\n");
        cmds.push(x.toFixed(1) + " " + (yTop - height).toFixed(1) + " " + width.toFixed(1) + " " + height.toFixed(1) + " re W n\n");
        cmds.push("0.45 0.55 0.68 RG\n" + x.toFixed(1) + " " + (yTop - height).toFixed(1) + " " + width.toFixed(1) + " " + height.toFixed(1) + " re S\n");
        var cursor = yTop - size - 2;
        counts[index].forEach(function (line) {
          cmds.push((bold ? "1 1 1" : "0.1 0.14 0.2") + " rg\nBT /" + (bold ? "F2" : "F1") + " " + size + " Tf 1 0 0 1 " + (x + 2).toFixed(1) + " " + cursor.toFixed(1) + " Tm " + pdfStr(line) + " Tj ET\n");
          cursor -= size + 2.2;
        });
        cmds.push("Q\n");
        x += width;
      });
      return height;
    }
    var y = h - 40;
    y -= paint(page.columns, y, true, "0.11 0.31 0.54");
    page.rows.forEach(function (row) {
      if (y < 48) return;
      if (row.kind === "break") {
        var hgt = 22;
        var banner = pdfText((row.label || "") + " | " + (row.dates || "") + " | " + (row.note || ""));
        cmds.push("q\n" + margin.toFixed(1) + " " + (y - hgt).toFixed(1) + " " + layout.usable.toFixed(1) + " " + hgt + " re W n\n");
        cmds.push("0.84 0.90 0.96 rg\n" + margin.toFixed(1) + " " + (y - hgt).toFixed(1) + " " + layout.usable.toFixed(1) + " " + hgt + " re f\n");
        cmds.push("0.45 0.55 0.68 RG\n" + margin.toFixed(1) + " " + (y - hgt).toFixed(1) + " " + layout.usable.toFixed(1) + " " + hgt + " re S\n");
        cmds.push("0.09 0.21 0.36 rg\nBT /F2 7 Tf 1 0 0 1 " + (margin + 3).toFixed(1) + " " + (y - 14).toFixed(1) + " Tm " + pdfStr(banner) + " Tj ET\nQ\n");
        y -= hgt;
        return;
      }
      y -= paint(row.cells || [], y, false, null);
    });
    return cmds.join("");
  }

  function drawFlow(w, h, blocks) {
    var cmds = [];
    var y = h - 42;
    blocks.forEach(function (block) {
      var size = block.size || 10;
      var font = block.bold ? "F2" : "F1";
      var color = block.color || "0 0 0";
      linesOf(block.text).forEach(function (part) {
        wrap(part, w - 72, size).forEach(function (line) {
          if (y < 48) return;
          cmds.push(color + " rg\nBT /" + font + " " + size + " Tf 1 0 0 1 36 " + y.toFixed(1) + " Tm " + pdfStr(line) + " Tj ET\n");
          y -= size + 3;
        });
      });
      y -= block.gap || 4;
    });
    return cmds.join("");
  }

  function drawGridPdf(x, y, widths, rows, size, header) {
    var cmds = [];
    function heightOf(cells) {
      var maxLines = 1;
      cells.forEach(function (cell, index) {
        var count = wrap(String(cell || " "), widths[index] - 6, size).length;
        if (count > maxLines) maxLines = count;
      });
      return Math.min(86, maxLines * (size + 2) + 8);
    }
    function paint(cells, top, height, fill, bold) {
      var cursorX = x;
      cells.forEach(function (cell, index) {
        if (fill) cmds.push(fill + " rg\n" + cursorX.toFixed(1) + " " + (top - height).toFixed(1) + " " + widths[index].toFixed(1) + " " + height.toFixed(1) + " re f\n");
        cmds.push("0.45 0.42 0.36 RG\n" + cursorX.toFixed(1) + " " + (top - height).toFixed(1) + " " + widths[index].toFixed(1) + " " + height.toFixed(1) + " re S\n");
        var cursor = top - size - 1;
        wrap(String(cell || " "), widths[index] - 6, size).slice(0, 6).forEach(function (line) {
          if (cursor > top - height + 2) {
            cmds.push((bold ? "1 1 1" : "0 0 0") + " rg\nBT /" + (bold ? "F2" : "F1") + " " + size + " Tf 1 0 0 1 " + (cursorX + 3).toFixed(1) + " " + cursor.toFixed(1) + " Tm " + pdfStr(line) + " Tj ET\n");
            cursor -= size + 2;
          }
        });
        cursorX += widths[index];
      });
    }
    if (header) {
      var headH = size + 10;
      paint(header, y, headH, "0.09 0.21 0.36", true);
      y -= headH;
    }
    rows.forEach(function (cells) {
      var hgt = heightOf(cells);
      if (y - hgt < 40) return;
      paint(cells, y, hgt, null, false);
      y -= hgt;
    });
    return { cmds: cmds.join(""), y: y };
  }

  function drawCbeLessonPdf(w, h, plan) {
    var head = plan.header || {};
    var blocks = [
      { text: plan.title, size: 13, bold: true, gap: 2 },
      { text: plan.weekTitle || "", size: 12, bold: true, gap: 6 },
      { text: "SCHOOL: " + (head.school || "") + "    LEVEL: " + (head.level || "") + "    LEARNING AREA: " + (head.area || ""), size: 11, gap: 2 },
      { text: "TERM: " + (head.term || "") + "    NAME: " + (head.name || "") + "    DATE: " + (head.date || "") + "    TIME: " + (head.time || ""), size: 11, gap: 2 },
      { text: "ROLL: " + (head.roll || "") + "    YEAR: " + (head.year || ""), size: 11, gap: 6 },
      { text: "Strand: " + (plan.strand || ""), size: 12, bold: true, gap: 2 },
      { text: "Sub Strand: " + (plan.substrand || ""), size: 12, bold: true, gap: 4 },
      { text: "Specific Learning Outcomes:", size: 12, bold: true, gap: 1 },
      { text: plan.outcomesLine || "", size: 11, gap: 4 },
      { text: "Key Inquiry Question(s):", size: 12, bold: true, gap: 1 },
      { text: plan.inquiry || "", size: 11, gap: 4 },
      { text: "Core Competencies: " + (plan.competencies || []).join(", "), size: 11, gap: 1 },
      { text: "Values: " + (plan.values || []).join(", "), size: 11, gap: 1 },
      { text: "PCIs: " + (plan.pcis || []).join(", "), size: 11, gap: 4 },
      { text: "Learning Resources:", size: 12, bold: true, gap: 1 }
    ];
    (plan.resources || []).forEach(function (line) { blocks.push({ text: line, size: 11, gap: 1 }); });
    blocks.push({ text: "Organization of Learning:", size: 12, bold: true, gap: 2 });
    blocks.push({ text: "Introduction (5 minutes):", size: 11, bold: true, gap: 1 });
    (plan.intro || []).forEach(function (line) { blocks.push({ text: line, size: 11, gap: 1 }); });
    blocks.push({ text: "Lesson Development (30 minutes):", size: 11, bold: true, gap: 1 });
    (plan.development || []).forEach(function (line) { blocks.push({ text: line, size: 11, gap: 1 }); });
    blocks.push({ text: "Conclusion (5 minutes):", size: 11, bold: true, gap: 1 });
    (plan.conclusion || []).forEach(function (line) { blocks.push({ text: line, size: 11, gap: 1 }); });
    blocks.push({ text: "Extended Activities:", size: 12, bold: true, gap: 1 });
    blocks.push({ text: plan.extended || "", size: 11, gap: 4 });
    blocks.push({ text: "Teacher Self-Evaluation:", size: 12, bold: true, gap: 1 });
    blocks.push({ text: String(plan.evaluation || "").trim() || "________________________________________________________________", size: 11, gap: 2 });
    return drawFlow(w, h, blocks);
  }

  function drawLessonPdf(w, h, plan, cover) {
    upgradeLessonPlan(plan, cover);
    if (plan.layout === "cbe") return drawCbeLessonPdf(w, h, plan);
    if (plan.header) return drawLessonSamplePdf(w, h, plan);
    var cmds = [];
    cmds.push("0.11 0.31 0.54 rg\nBT /F2 12 Tf 1 0 0 1 36 " + (h - 40) + " Tm " + pdfStr(pdfText(plan.title)) + " Tj ET\n");
    var usable = w - 72;
    var info = drawGridPdf(36, h - 56, [usable * 0.18, usable * 0.32, usable * 0.18, usable * 0.32], plan.rows, 8, null);
    cmds.push(info.cmds);
    var y = info.y - 14;
    function heading(text) {
      if (y < 70) return;
      cmds.push("0.09 0.21 0.36 rg\nBT /F2 10 Tf 1 0 0 1 36 " + y.toFixed(1) + " Tm " + pdfStr(text) + " Tj ET\n");
      y -= 13;
    }
    function paragraph(text) {
      wrap(text, usable, 8).slice(0, 4).forEach(function (line) {
        if (y < 60) return;
        cmds.push("0 0 0 rg\nBT /F1 8 Tf 1 0 0 1 36 " + y.toFixed(1) + " Tm " + pdfStr(line) + " Tj ET\n");
        y -= 11;
      });
    }
    if (plan.outcomes) { heading("Specific learning outcomes"); paragraph(plan.outcomes); }
    if (plan.inquiry) { heading("Key inquiry questions"); paragraph(plan.inquiry); }
    if (plan.resources) { heading("Learning resources"); paragraph(plan.resources); }
    y -= 4;
    heading("Organisation of learning");
    var steps = drawGridPdf(36, y, [usable * 0.1, usable * 0.14, usable * 0.28, usable * 0.28, usable * 0.2], plan.steps, 7, ["Time", "Step", "Teacher's activity", "Learner's activity", "Assessment"]);
    cmds.push(steps.cmds);
    y = steps.y - 12;
    heading("Extended activity");
    paragraph(plan.extended || "");
    heading("Teacher's reflection");
    paragraph(plan.reflection || "");
    heading("Sign-off");
    paragraph("Teacher: " + (plan.teacher || "") + "    TSC: " + (plan.tsc || "__________") + "    Sign: __________    Date: ______");
    paragraph("HoD: " + (plan.hod || "____________________") + "    Sign: __________    Date: ______");
    return cmds.join("");
  }

  function glyphWidth(text, size) {
    var width = 0;
    var i;
    for (i = 0; i < text.length; i++) {
      var ch = text.charAt(i);
      if (ch === " ") width += size * 0.28;
      else if (ch >= "A" && ch <= "Z") width += size * 0.67;
      else if (ch >= "0" && ch <= "9") width += size * 0.56;
      else width += size * 0.5;
    }
    return width;
  }

  function lessonLines(text, width, size) {
    var limit = Math.max(18, width - 8);
    var lines = [];
    pdfText(text).split("\n").forEach(function (part) {
      var words = part.replace(/\s+/g, " ").trim().split(" ").filter(Boolean);
      if (!words.length) return;
      var line = "";
      words.forEach(function (word) {
        while (glyphWidth(word, size) > limit && word.length > 1) {
          var cut = word.length;
          while (cut > 1 && glyphWidth(word.slice(0, cut), size) > limit) cut -= 1;
          if (line) {
            lines.push(line);
            line = "";
          }
          lines.push(word.slice(0, cut));
          word = word.slice(cut);
        }
        var next = line ? line + " " + word : word;
        if (line && glyphWidth(next, size) > limit) {
          lines.push(line);
          line = word;
        } else line = next;
      });
      if (line) lines.push(line);
    });
    return lines.length ? lines : [""];
  }

  function drawLessonTable(x, top, widths, rows, size, header) {
    var cmds = [];
    function rowHeight(lines) {
      return lines * (size + 2.2) + 8;
    }
    function paint(cells, yTop, bold, fill, maxHeight) {
      var counts = cells.map(function (cell, index) {
        return lessonLines(cell, widths[index], size);
      });
      var height = rowHeight(counts.reduce(function (max, lines) {
        return Math.max(max, lines.length);
      }, 1));
      if (maxHeight && height > maxHeight) height = maxHeight;
      var cursorX = x;
      cells.forEach(function (cell, index) {
        var width = widths[index];
        cmds.push("q\n");
        if (fill) cmds.push(fill + " rg\n" + cursorX.toFixed(1) + " " + (yTop - height).toFixed(1) + " " + width.toFixed(1) + " " + height.toFixed(1) + " re f\n");
        cmds.push(cursorX.toFixed(1) + " " + (yTop - height).toFixed(1) + " " + width.toFixed(1) + " " + height.toFixed(1) + " re W n\n");
        cmds.push("0.45 0.55 0.68 RG\n" + cursorX.toFixed(1) + " " + (yTop - height).toFixed(1) + " " + width.toFixed(1) + " " + height.toFixed(1) + " re S\n");
        var cursor = yTop - size - 3;
        counts[index].forEach(function (line) {
          if (cursor > yTop - height + 2) {
            cmds.push((bold ? "1 1 1" : "0.1 0.14 0.2") + " rg\nBT /" + (bold ? "F2" : "F1") + " " + size + " Tf 1 0 0 1 " + (cursorX + 3).toFixed(1) + " " + cursor.toFixed(1) + " Tm " + pdfStr(line) + " Tj ET\n");
            cursor -= size + 2.2;
          }
        });
        cmds.push("Q\n");
        cursorX += width;
      });
      return yTop - height;
    }
    var y = top;
    if (header) y = paint(header, y, true, "0.09 0.21 0.36");
    rows.forEach(function (cells) {
      if (y < 72) return;
      y = paint(cells, y, false, null, y - 48);
    });
    return { cmds: cmds.join(""), y: y };
  }

  function drawLessonSamplePdf(w, h, plan) {
    var head = plan.header;
    var usable = w - 72;
    var cmds = [];
    var y = h - 40;
    function line(text, size, bold, color, gap) {
      var font = bold ? "F2" : "F1";
      linesOf(text).forEach(function (part) {
        wrap(part, usable, size).forEach(function (row) {
          if (y < 48) return;
          cmds.push((color || "0 0 0") + " rg\nBT /" + font + " " + size + " Tf 1 0 0 1 36 " + y.toFixed(1) + " Tm " + pdfStr(row) + " Tj ET\n");
          y -= size + 3;
        });
      });
      y -= gap || 1;
    }
    line("LESSON PLAN", 16, true, "0.11 0.31 0.54", 4);
    line("TEACHER'S NAME: " + dotted(head.teacher) + "    TSC NO: " + dotted(head.tsc), 12, false);
    line("SCHOOL / INSTITUTION: " + dotted(head.school), 12, false);
    line("FORM: " + head.form + "    TERM: " + head.term + "    YEAR: " + head.year, 12, false);
    line("NUMBER OF STUDENTS: " + dotted(head.students) + "    SUBJECT: " + head.subject, 12, false, null, 2);
    line("TOPIC: " + head.topic, 13, true);
    line("SUB-TOPIC: " + head.subtopic, 13, true);
    line("WEEK: " + dotted(head.week) + "    LESSON NUMBER: " + dotted(head.lesson), 12, false);
    line("DATE: " + dotted(head.date) + "    TIME: " + dotted(head.time), 12, false, null, 3);
    line("OBJECTIVES: " + plan.objectiveLead, 12, false);
    (plan.objectives || []).forEach(function (item) { line("- " + item, 11, false); });
    y -= 6;
    line("LESSON PRESENTATION", 13, true, "0.09 0.21 0.36", 4);
    var grid = drawLessonTable(36, y, [usable * 0.13, usable * 0.24, usable * 0.27, usable * 0.2, usable * 0.16], plan.steps, 10, plan.columns);
    cmds.push(grid.cmds);
    var tailY = grid.y - 16;
    cmds.push("0.09 0.21 0.36 rg\nBT /F2 9 Tf 1 0 0 1 36 " + tailY.toFixed(1) + " Tm " + pdfStr("SELF-EVALUATION:") + " Tj ET\n");
    var evaluation = String(plan.evaluation || "").trim();
    if (evaluation) {
      var evalY = tailY - 14;
      linesOf(evaluation).forEach(function (part) {
        wrap(part, usable, 9).forEach(function (row) {
          cmds.push("0 0 0 rg\nBT /F1 9 Tf 1 0 0 1 36 " + evalY.toFixed(1) + " Tm " + pdfStr(row) + " Tj ET\n");
          evalY -= 12;
        });
      });
    } else {
      cmds.push("0 0 0 rg\nBT /F1 9 Tf 1 0 0 1 36 " + (tailY - 14).toFixed(1) + " Tm " + pdfStr("________________________________________________________________") + " Tj ET\n");
    }
    return cmds.join("");
  }

  function drawKcseFrontPdf(w, h, doc) {
    var c = doc.cover;
    var exam = doc.exam;
    var blocks = [
      { text: c.school, size: 16, bold: true, gap: 3 },
      { text: "MOCK EXAMINATIONS", size: 14, bold: true, gap: 2 },
      { text: String(c.grade).toUpperCase() + " - " + c.year, size: 13, bold: true, gap: 2 },
      { text: String(c.subject).toUpperCase(), size: 14, bold: true, gap: 2 },
      { text: exam.paper || "PAPER 2 (Theory)", size: 13, bold: true, gap: 2 },
      { text: "Time: " + (exam.duration || "2 Hours"), size: 12, bold: true, gap: 10 },
      { text: "Name .............................................  Adm Number ........................", size: 11, gap: 3 },
      { text: "Candidate's Signature ..............................  Date ........................", size: 11, gap: 8 },
      { text: "INSTRUCTIONS TO CANDIDATES", size: 12, bold: true, gap: 4 }
    ];
    var letters = ["a", "b", "c", "d", "e", "f"];
    (exam.instructions || []).forEach(function (line, index) {
      blocks.push({ text: letters[index] + ")  " + line, size: 11, gap: 2 });
    });
    blocks.push({ text: "FOR EXAMINER'S USE ONLY", size: 12, bold: true, gap: 4 });
    blocks.push({ text: "QUESTION          MAXIMUM SCORE          CANDIDATE'S SCORES", size: 11, bold: true, gap: 2 });
    (exam.scoreRows || []).forEach(function (row) {
      blocks.push({ text: row.question + "                    " + row.max, size: 11, gap: 2 });
    });
    return drawFlow(w, h, blocks);
  }

  function drawExamPdf(w, h, doc, page) {
    if (doc.exam && doc.exam.layout === "kcse") {
      var blocks = [];
      page.section.items.forEach(function (item) {
        blocks.push({ text: item.number + ".", size: 13, bold: true, gap: 3 });
        (item.parts || []).forEach(function (part) {
          blocks.push({ text: part.label + "  " + part.q, size: 12, gap: 1 });
          blocks.push({ text: "(" + part.marks + " marks)", size: 11, gap: 5 });
        });
      });
      return drawFlow(w, h, blocks);
    }
    var blocks = [
      { text: doc.cover.school + " | " + doc.cover.grade + " | " + doc.cover.subject + " | TERM " + (doc.cover.termRoman || doc.cover.term) + " " + doc.cover.year, size: 11, bold: true, color: "0.11 0.31 0.54", gap: 2 },
      { text: "Teacher: " + doc.cover.teacher + "   TSC No: " + (doc.cover.tsc || "__________"), size: 9, gap: 4 },
      { text: page.section.title + "  (" + page.duration + ")", size: 13, bold: true, gap: 3 },
      { text: page.section.note, size: 10, gap: 6 }
    ];
    (page.instructions || []).forEach(function (line) { blocks.push({ text: "- " + line, size: 9, gap: 2 }); });
    page.section.items.forEach(function (item, index) {
      var marks = item.marks ? " (" + item.marks + " marks)" : "";
      blocks.push({ text: (index + 1) + ". " + item.q + marks, size: 11, gap: 2 });
      blocks.push({ text: "Working:", size: 10, gap: 10 });
    });
    return drawFlow(w, h, blocks);
  }

  function drawMarkingPdf(w, h, doc) {
    var blocks = [{ text: "Marking guide - not for the learner", size: 13, bold: true, color: "0.11 0.31 0.54", gap: 8 }];
    var number = 1;
    doc.exam.sections.forEach(function (section) {
      blocks.push({ text: section.title, size: 11, bold: true, gap: 4 });
      section.items.forEach(function (item) {
        var marks = item.marks ? " (" + item.marks + " marks)" : "";
        blocks.push({ text: number + ". " + item.a + marks, size: 10, gap: 4 });
        number += 1;
      });
    });
    return drawFlow(w, h, blocks);
  }

  function pageStream(doc, page) {
    var landscape = page.layout === "landscape";
    var w = landscape ? 841.89 : 595.28;
    var h = landscape ? 595.28 : 841.89;
    var body = "";
    if (page.kind === "cover") body = drawCoverPdf(w, h, doc, page);
    else if (page.kind === "scheme") body = drawSchemePdf(w, h, doc, page);
    else if (page.kind === "plan" && page.plan) body = drawLessonPdf(w, h, page.plan, doc.cover);
    else if (page.kind === "plan") {
      var blocks = [{ text: page.title, size: 14, bold: true, color: "0.11 0.31 0.54", gap: 8 }];
      page.fields.forEach(function (field) {
        blocks.push({ text: field[0], size: 10, bold: true, color: "0.09 0.21 0.36", gap: 1 });
        blocks.push({ text: field[1] || " ", size: 10, gap: 6 });
      });
      body = drawFlow(w, h, blocks);
    } else if (page.kind === "exam-front") body = drawKcseFrontPdf(w, h, doc);
    else if (page.kind === "exam") body = drawExamPdf(w, h, doc, page);
    else if (page.kind === "marking") body = drawMarkingPdf(w, h, doc);
    else if (page.kind === "revision") {
      var item = page.item;
      var rev = [
        { text: doc.cover.school + " | " + doc.cover.grade + " | " + doc.cover.subject + " | TERM " + (doc.cover.termRoman || doc.cover.term) + " " + doc.cover.year, size: 10, bold: true, color: "0.11 0.31 0.54", gap: 2 },
        { text: "Teacher: " + doc.cover.teacher + "   TSC No: " + (doc.cover.tsc || "__________"), size: 9, gap: 6 },
        { text: item.strand + " - " + item.topic, size: 13, bold: true, color: "0.11 0.31 0.54", gap: 6 }
      ];
      item.paragraphs.forEach(function (line) { rev.push({ text: line, size: 10, gap: 2 }); });
      rev.push({ text: "Practice", size: 11, bold: true, gap: 4 });
      item.questions.forEach(function (q, index) {
        rev.push({ text: (index + 1) + ". " + q.q + (q.marks ? " (" + q.marks + " marks)" : ""), size: 10, gap: 1 });
        rev.push({ text: "Guide: " + q.a, size: 9, color: "0.25 0.25 0.22", gap: 5 });
      });
      body = drawFlow(w, h, rev);
    } else body = drawFlow(w, h, [{ text: page.text || "", size: 12 }]);
    var content = body + drawFooter(w, page, doc);
    if (content.charAt(content.length - 1) !== "\n") content += "\n";
    return { w: w, h: h, content: content };
  }

  function itcPdfBytes(doc) {
    var rendered = itcPaginate(doc).map(function (page) { return pageStream(doc, page); });
    var n = rendered.length;
    var objects = new Array(4 + n * 2);
    objects[2] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>";
    objects[3] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>";
    var kids = [];
    rendered.forEach(function (page, index) {
      var contentId = 5 + index;
      var pageId = 5 + n + index;
      objects[contentId - 1] = "<< /Length " + page.content.length + " >>\nstream\n" + page.content + "endstream";
      objects[pageId - 1] = "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 " + page.w.toFixed(2) + " " + page.h.toFixed(2) + "] /Contents " + contentId + " 0 R /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> >>";
      kids.push(pageId + " 0 R");
    });
    objects[0] = "<< /Type /Catalog /Pages 2 0 R >>";
    objects[1] = "<< /Type /Pages /Count " + n + " /Kids [" + kids.join(" ") + "] >>";
    var out = "%PDF-1.4\n";
    var offsets = [0];
    objects.forEach(function (body, index) {
      offsets.push(out.length);
      out += (index + 1) + " 0 obj\n" + body + "\nendobj\n";
    });
    var xref = out.length;
    out += "xref\n0 " + (objects.length + 1) + "\n";
    out += "0000000000 65535 f \n";
    var i;
    for (i = 1; i <= objects.length; i++) out += String(offsets[i]).padStart(10, "0") + " 00000 n \n";
    out += "trailer\n<< /Size " + (objects.length + 1) + " /Root 1 0 R >>\nstartxref\n" + xref + "\n%%EOF";
    return new TextEncoder().encode(out);
  }

  function esc(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  function escBr(value) {
    return esc(value).replace(/\n/g, "<br>");
  }

  function lessonSamplePreview(plan) {
    var h = plan.header;
    var meta = [
      "TEACHER'S NAME: " + dotted(h.teacher) + "      TSC NO: " + dotted(h.tsc),
      "SCHOOL / INSTITUTION: " + dotted(h.school),
      "FORM: " + h.form + "      TERM: " + h.term + "      YEAR: " + h.year,
      "NUMBER OF STUDENTS: " + dotted(h.students) + "      SUBJECT: " + h.subject,
      "TOPIC: " + h.topic,
      "SUB-TOPIC: " + h.subtopic,
      "WEEK: " + dotted(h.week) + "      LESSON NUMBER: " + dotted(h.lesson),
      "DATE: " + dotted(h.date) + "      TIME: " + dotted(h.time)
    ].map(function (line) { return "<p>" + esc(line) + "</p>"; }).join("");
    var objectives = "<h4>OBJECTIVES: " + esc(plan.objectiveLead) + "</h4>" +
      (plan.objectives || []).map(function (line) { return "<p>-" + esc(line) + "</p>"; }).join("");
    var steps = "<h4>LESSON PRESENTATION</h4><table class=\"lesson-table lesson-present\"><colgroup><col style=\"width:13%\"><col style=\"width:24%\"><col style=\"width:27%\"><col style=\"width:20%\"><col style=\"width:16%\"></colgroup><thead><tr>" +
      plan.columns.map(function (col) { return "<th>" + esc(col) + "</th>"; }).join("") +
      "</tr></thead><tbody>" + plan.steps.map(function (step) {
        return "<tr>" + step.map(function (cell) { return "<td>" + escBr(cell) + "</td>"; }).join("") + "</tr>";
      }).join("") + "</tbody></table>";
    var written = String(plan.evaluation || "").trim();
    var tail = "<h4>SELF-EVALUATION:</h4>" + (written
      ? "<p>" + escBr(written) + "</p>"
      : "<p>________________________________________________________________</p><p>________________________________________________________________</p>");
    return "<h3 class=\"plan-title\">" + esc(plan.title) + "</h3>" + meta + objectives + steps + tail;
  }

  function cbeLessonPreview(plan) {
    var h = plan.header || {};
    var head = "<table class=\"lesson-table\"><thead><tr>" +
      ["SCHOOL", "LEVEL", "LEARNING AREA", "TERM", "NAME", "DATE", "TIME", "ROLL", "YEAR"].map(function (col) { return "<th>" + col + "</th>"; }).join("") +
      "</tr></thead><tbody><tr>" +
      [h.school, h.level, h.area, h.term, h.name, h.date, h.time, h.roll, h.year].map(function (cell) { return "<td>" + esc(cell || "") + "</td>"; }).join("") +
      "</tr></tbody></table>";
    var traits = "<table class=\"lesson-table\"><thead><tr><th>Core Competencies</th><th>Values</th><th>PCIs</th></tr></thead><tbody><tr><td>" +
      esc((plan.competencies || []).join(", ")) + "</td><td>" + esc((plan.values || []).join(", ")) + "</td><td>" + esc((plan.pcis || []).join(", ")) + "</td></tr></tbody></table>";
    function lines(list) {
      return (list || []).map(function (line) { return "<p>" + esc(line) + "</p>"; }).join("");
    }
    return "<h3 class=\"plan-title\">" + esc(plan.title) + "</h3><h4>" + esc(plan.weekTitle || "") + "</h4>" + head +
      "<p><strong>Strand:</strong> " + esc(plan.strand || "") + "</p>" +
      "<p><strong>Sub Strand:</strong> " + esc(plan.substrand || "") + "</p>" +
      "<h4>Specific Learning Outcomes:</h4><p>" + esc(plan.outcomesLine || "") + "</p>" +
      "<h4>Key Inquiry Question(s):</h4><p>" + esc(plan.inquiry || "") + "</p>" + traits +
      "<h4>Learning Resources:</h4>" + lines(plan.resources) +
      "<h4>Organization of Learning:</h4><p><strong>Introduction (5 minutes):</strong></p>" + lines(plan.intro) +
      "<p><strong>Lesson Development (30 minutes):</strong></p>" + lines(plan.development) +
      "<p><strong>Conclusion (5 minutes):</strong></p>" + lines(plan.conclusion) +
      "<h4>Extended Activities:</h4><p>" + esc(plan.extended || "") + "</p>" +
      "<h4>Teacher Self-Evaluation:</h4><p>" + esc(String(plan.evaluation || "").trim() || "________________________________________________________________") + "</p>";
  }

  function lessonPreview(plan, cover) {
    upgradeLessonPlan(plan, cover);
    if (plan.layout === "cbe") return cbeLessonPreview(plan);
    if (plan.header) return lessonSamplePreview(plan);
    var info = "<table class=\"lesson-table\">" + plan.rows.map(function (row) {
      return "<tr>" + row.map(function (cell, index) {
        return "<td class=\"" + (index % 2 === 0 ? "lab" : "") + "\">" + escBr(cell || " ") + "</td>";
      }).join("") + "</tr>";
    }).join("") + "</table>";
    var notes = [["Specific learning outcomes", plan.outcomes], ["Key inquiry questions", plan.inquiry], ["Learning resources", plan.resources]].filter(function (pair) {
      return pair[1];
    }).map(function (pair) {
      return "<h4>" + esc(pair[0]) + "</h4><p>" + escBr(pair[1]) + "</p>";
    }).join("");
    var steps = "<h4>Organisation of learning</h4><table class=\"lesson-table\"><thead><tr>" +
      ["Time", "Step", "Teacher's activity", "Learner's activity", "Assessment"].map(function (col) { return "<th>" + col + "</th>"; }).join("") +
      "</tr></thead><tbody>" + plan.steps.map(function (step) {
        return "<tr>" + step.map(function (cell) { return "<td>" + escBr(cell) + "</td>"; }).join("") + "</tr>";
      }).join("") + "</tbody></table>";
    var tail = "<h4>Extended activity</h4><p>" + esc(plan.extended || "") + "</p>" +
      "<h4>Teacher's reflection</h4><p>" + escBr(plan.reflection || "") + "</p>" +
      "<table class=\"lesson-table\"><tbody><tr><td class=\"lab\">Teacher</td><td>" + esc(plan.teacher || "") + "</td><td class=\"lab\">TSC No.</td><td>" + esc(plan.tsc || "______________") + "</td></tr>" +
      "<tr><td class=\"lab\">Signature</td><td>____________________</td><td class=\"lab\">Date</td><td>__________</td></tr>" +
      "<tr><td class=\"lab\">Head of Department</td><td>" + esc(plan.hod || "____________________") + "</td><td class=\"lab\">Signature / date</td><td>____________________</td></tr></tbody></table>";
    return "<h3 class=\"plan-title\">" + esc(plan.title) + "</h3>" + info + notes + steps + tail;
  }

  function itcPreviewHtml(doc) {
    var pages = itcPaginate(doc);
    return pages.map(function (page) {
      var inner = "";
      if (page.kind === "cover" && doc.type === "scheme") {
        var lines = schemeHeadline(doc.cover);
        inner = "<div class=\"scheme-cover\">" +
          lines.map(function (line) { return "<p>" + esc(line) + "</p>"; }).join("") +
          "<p class=\"scheme-sign\">H. O. D  " + esc(schemeDots()) + "</p>" +
          "<p>Sign  " + esc(schemeDots()) + "</p>" +
          "<p class=\"scheme-sign\">Principal / D. Principal  " + esc(schemeDots()) + "</p>" +
          "<p>Sign  " + esc(schemeDots()) + "</p></div>";
      } else if (page.kind === "cover") {
        var c = doc.cover;
        inner = "<div class=\"cover\">" +
          "<p class=\"cover-kicker\">Republic of Kenya · Ministry of Education</p>" +
          "<h2>" + esc(c.school) + "</h2>" +
          "<p class=\"cover-type\">" + esc(c.subject) + " · " + esc(c.grade) + " " + esc(c.year) + " · TERM " + esc(c.termRoman || c.term) + "</p>" +
          "<p class=\"cover-type\">" + esc(c.typeLabel) + "</p>" +
          "<dl class=\"cover-dl\">" +
          [["School", c.school], ["Teacher", c.teacher], ["TSC number", c.tsc || "____________________"], ["Class", c.grade + " (" + c.band + ")"], ["Subject", c.subject], ["Curriculum", c.curriculum], ["Term", "Term " + c.term + ", " + c.year], ["Opens", c.opening], ["Closes", c.closing], ["Lessons per week", c.lessonsPerWeek], ["Course book", c.book], ["Prepared", c.prepared || "____________________"]].map(function (pair) {
            return "<div><dt>" + esc(pair[0]) + "</dt><dd>" + esc(pair[1]) + "</dd></div>";
          }).join("") +
          "</dl><h3>Sign-off</h3><div class=\"sign-grid\">" +
          [["Subject teacher", c.teacher], ["Head of Department", c.hod], ["Deputy Principal", c.deputy], ["Principal", c.principal]].map(function (pair) {
            return "<div><strong>" + esc(pair[0]) + "</strong><p>" + esc(pair[1] || "Name: ____________________") + "</p><p class=\"sign-line\">Signature</p><p>Date: ______________</p></div>";
          }).join("") +
          "</div><p class=\"cover-note\">Breaks, half-term and the end of term are left blank and labelled. Activities are original planning notes for the KICD-approved " + esc(c.book) + " course book. Page numbers appear on every page.</p></div>";
      }
      if (page.kind === "scheme") {
        inner = "<table class=\"doc-table\"><thead><tr>" +
          page.columns.map(function (col) { return "<th>" + esc(col) + "</th>"; }).join("") +
          "</tr></thead><tbody>" + page.rows.map(function (row) {
            if (row.kind === "break") {
              return "<tr class=\"break-row\"><td colspan=\"" + page.columns.length + "\">" + esc(row.label) + " · " + esc(row.dates) + " · " + esc(row.note) + "</td></tr>";
            }
            return "<tr>" + row.cells.map(function (cell) { return "<td>" + (cell ? escBr(cell) : "") + "</td>"; }).join("") + "</tr>";
          }).join("") + "</tbody></table>";
      }
      if (page.kind === "plan" && page.plan) inner = lessonPreview(page.plan, doc.cover);
      else if (page.kind === "plan") {
        inner = "<h3 class=\"plan-title\">" + esc(page.title) + "</h3>" + page.fields.map(function (field) {
          return "<section class=\"plan-field\"><h4>" + esc(field[0]) + "</h4><p>" + escBr(field[1] || " ") + "</p></section>";
        }).join("");
      }
      if (page.kind === "exam-front") {
        var exam = doc.exam;
        inner = "<div class=\"exam-mast\"><h2>" + esc(doc.cover.school) + "</h2>" +
          "<p>MOCK EXAMINATIONS</p><p>" + esc(String(doc.cover.grade).toUpperCase()) + " - " + esc(doc.cover.year) + "</p>" +
          "<p><strong>" + esc(String(doc.cover.subject).toUpperCase()) + "</strong></p>" +
          "<p>" + esc(exam.paper || "PAPER 2 (Theory)") + "</p><p>Time: " + esc(exam.duration || "2 Hours") + "</p></div>" +
          "<p>Name ............................................. Adm Number ........................</p>" +
          "<p>Candidate's Signature .............................. Date ........................</p>" +
          "<h3>INSTRUCTIONS TO CANDIDATES</h3><ol type=\"a\">" +
          (exam.instructions || []).map(function (line, index) { return "<li value=\"" + (index + 1) + "\">" + esc(line) + "</li>"; }).join("") +
          "</ol><h3>FOR EXAMINER'S USE ONLY</h3><table class=\"lesson-table\"><thead><tr><th>QUESTION</th><th>MAXIMUM SCORE</th><th>CANDIDATE'S SCORES</th></tr></thead><tbody>" +
          (exam.scoreRows || []).map(function (row) { return "<tr><td>" + esc(row.question) + "</td><td>" + esc(row.max) + "</td><td></td></tr>"; }).join("") +
          "</tbody></table>";
      }
      if (page.kind === "exam" && doc.exam && doc.exam.layout === "kcse") {
        inner = page.section.items.map(function (item) {
          return "<h3>" + esc(item.number) + ".</h3>" + (item.parts || []).map(function (part) {
            return "<p class=\"exam-part\"><span>" + esc(part.label) + " " + esc(part.q) + "</span><em>(" + esc(part.marks) + " marks)</em></p>";
          }).join("");
        }).join("");
      } else if (page.kind === "exam") {
        var section = page.section;
        inner = "<p class=\"run-head\">" + esc(doc.cover.school) + " · " + esc(doc.cover.grade) + " · " + esc(doc.cover.subject) + " · TERM " + esc(doc.cover.termRoman || doc.cover.term) + " " + esc(doc.cover.year) + " · " + esc(page.duration) + "<br>Teacher: " + esc(doc.cover.teacher) + " · TSC No: " + esc(doc.cover.tsc || "__________") + "</p>" +
          "<h3 class=\"plan-title\">" + esc(section.title) + "</h3><p>" + esc(section.note) + "</p>" +
          (page.instructions ? "<ul>" + page.instructions.map(function (line) { return "<li>" + esc(line) + "</li>"; }).join("") + "</ul>" : "") +
          "<ol class=\"exam-questions\">" +
          section.items.map(function (item) {
            var marks = item.marks ? " <em>(" + esc(item.marks) + " marks)</em>" : "";
            return "<li><p>" + esc(item.q) + marks + "</p><p class=\"guide\">Working:</p></li>";
          }).join("") + "</ol>";
      }
      if (page.kind === "marking") {
        var n = 1;
        inner = "<h3 class=\"plan-title\">Marking guide</h3><p>Keep this page with the teacher.</p>" +
          doc.exam.sections.map(function (section) {
            var start = n;
            var rows = section.items.map(function (item) {
              var marks = item.marks ? " (" + esc(item.marks) + " marks)" : "";
              n += 1;
              return "<li><p>" + escBr(item.a) + marks + "</p></li>";
            }).join("");
            return "<h4>" + esc(section.title) + "</h4><ol start=\"" + start + "\">" + rows + "</ol>";
          }).join("");
      }
      if (page.kind === "revision") {
        var item = page.item;
        inner = "<p class=\"run-head\">" + esc(doc.cover.school) + " · " + esc(doc.cover.grade) + " · " + esc(doc.cover.subject) + " · TERM " + esc(doc.cover.termRoman || doc.cover.term) + " " + esc(doc.cover.year) + "<br>Teacher: " + esc(doc.cover.teacher) + " · TSC No: " + esc(doc.cover.tsc || "__________") + "</p><h3 class=\"plan-title\">" + esc(item.strand) + " — " + esc(item.topic) + "</h3><ul>" +
          item.paragraphs.map(function (line) { return "<li>" + esc(line) + "</li>"; }).join("") +
          "</ul><h4>Practice</h4><ol>" + item.questions.map(function (q) {
            return "<li><p>" + esc(q.q) + (q.marks ? " <em>(" + q.marks + " marks)</em>" : "") + "</p><p class=\"guide\">Guide: " + esc(q.a) + "</p></li>";
          }).join("") + "</ol>";
      }
      return "<article class=\"sheet " + page.layout + "\"><div class=\"sheet-body\">" + inner + "</div><p class=\"pageno\">Page " + page.number + " of " + page.total + "</p></article>";
    }).join("");
  }

  function itcFileBase(doc) {
    return [doc.cover.school, doc.cover.typeLabel, doc.cover.grade, doc.cover.subject, "Term" + doc.cover.term, doc.cover.year]
      .join("-")
      .replace(/[^A-Za-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  }

  root.itcPaginate = itcPaginate;
  root.itcPreviewHtml = itcPreviewHtml;
  root.itcDocxBytes = itcDocxBytes;
  root.itcPdfBytes = itcPdfBytes;
  root.itcFileBase = itcFileBase;
  root.itcUpgradeLesson = upgradeLessonPlan;
})(typeof window !== "undefined" ? window : globalThis);
