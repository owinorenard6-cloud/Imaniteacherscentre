(function (root) {
  function itcAiBrief(form) {
    var level = root.itcLevel(form.levelId);
    var stats = root.itcPlanStats(form);
    var subject = form.subject || "the learning area";
    var tips = [];
    if (!stats.ok) {
      tips.push(stats.error);
      return { headline: "Check the term dates.", tips: tips };
    }
    tips.push(level.label + " " + subject + " has about " + stats.slots + " teaching lessons across " + stats.weeks + " weeks, from " + stats.opening + " to " + stats.closing + ".");
    tips.push(stats.breakRows + " blank row" + (stats.breakRows === 1 ? "" : "s") + " will be labelled and left empty, including half-term and the close of term.");
    tips.push("A comfortable fit is about " + stats.recommended + " sub-strands, so each one can be taught properly.");
    if (form.book) tips.push("Drafts point learners to the KICD-approved " + form.book + " learner book. Match each sub-strand to the pages in your copy.");
    if (form.bridgeLevelId) {
      var bridge = root.itcLevel(form.bridgeLevelId);
      if (bridge) tips.push("You can bring content from " + bridge.label + " and teach it as bridging at the start of the term.");
    }
    var headline = form.type === "lesson"
      ? "Lesson plan for " + level.label + " " + subject + ": introduction, body development and conclusion."
      : form.type === "exam"
        ? "Exam for " + level.label + " " + subject + ", with a marking guide."
        : form.type === "revision"
          ? "Revision for " + level.label + " " + subject + "."
          : "Scheme for " + level.label + " " + subject + ".";
    return { headline: headline, tips: tips, stats: stats };
  }

  function itcAiReply(message, form) {
    var text = String(message || "").trim();
    var lower = text.toLowerCase();
    var level = root.itcLevel(form.levelId);
    var brief = itcAiBrief(form);
    var subject = form.subject || "this learning area";
    if (!text) return brief.tips.join(" ");
    if (/break|half|holiday|blank/.test(lower)) {
      return "Any half-term, public holiday, custom break or end-of-term day is written as a labelled blank row. The dates stay visible and the lesson columns stay empty, so the duration is clearly a break.";
    }
    if (/activit|experience|teach/.test(lower)) {
      return "For " + subject + " in " + level.label + ", open with what learners already know, then use the KICD-approved " + (form.book || "course book") + " for a short reading or worked example. Move to pair practice, a local Kenyan example, and a short exit task. Keep group talk respectful and check the quiet learners before you close.";
    }
    if (/assess|question|quiz|exam|kcse|rubric/.test(lower)) {
      if (level.track === "kcse") {
        return "For KCSE-style revision in " + subject + ", mix short state questions, an explain question, a local application, and one longer item with marks. Show working where the topic is numerical. These are original practice items, so check facts against the syllabus and the approved course book.";
      }
      return "For CBE assessment in " + subject + ", use oral questions, a look at group work, a written exit task, and a four-level rubric: exceeds, meets, approaches, below. Record who needs another example before the next lesson.";
    }
    if (/different|mixed|slow|support|advanced/.test(lower)) {
      return "Offer the same " + subject + " outcome at three depths: a worked example with prompts, the class task, and an extra challenge. Seat learners so they can explain to a partner. For anyone still stuck, keep one concrete object or drawing on the desk and revisit it at the start of the next lesson.";
    }
    if (/previous|bridg|last grade|last class/.test(lower)) {
      var prev = form.bridgeLevelId ? root.itcLevel(form.bridgeLevelId) : root.itcPreviousLevel(form.levelId);
      if (!prev) return "This is the first level in the track, so there is no earlier class to bridge from. You can still add a custom topic called revision of prior knowledge.";
      return "Bring two short topics from " + prev.label + " into week 1. Label them as bridging, check the skill quickly, and only reteach the part this class still needs before the new " + level.label + " work.";
    }
    if (/book|kicd|klb|oxford|longhorn/.test(lower)) {
      return "Choose the KICD-approved series your class actually has. The plan names that book in the resources and asks learners to open the sub-strand. It does not copy the publisher's pages. Write the page numbers from your own copy into the reflection column after you check them.";
    }
    if (/lesson per|how many|week/.test(lower)) {
      return level.label + " " + subject + " is set to " + (form.lessonsPerWeek || root.itcDefaultLessons(subject)) + " lessons a week. " + (brief.tips[0] || "");
    }
    if (/cover|tsc|sign|principal|hod|deputy/.test(lower)) {
      return "The cover carries the school, your name, TSC number if you add it, and signature lines for the subject teacher, Head of Department, deputy principal and principal. Sign in with the matching role if you want your name placed on that line.";
    }
    return brief.headline + " " + brief.tips.join(" ") + " Ask me for activities, assessment, mixed-ability support, breaks, or the previous class.";
  }

  root.itcAiBrief = itcAiBrief;
  root.itcAiReply = itcAiReply;
})(typeof window !== "undefined" ? window : globalThis);
