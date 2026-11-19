(function (root) {
  var LEVELS = [
    { id: "pp1", label: "PP1", band: "Pre-Primary", track: "cbe", group: "pre", number: 1 },
    { id: "pp2", label: "PP2", band: "Pre-Primary", track: "cbe", group: "pre", number: 2 },
    { id: "g1", label: "Grade 1", band: "Lower Primary", track: "cbe", group: "lower", number: 1 },
    { id: "g2", label: "Grade 2", band: "Lower Primary", track: "cbe", group: "lower", number: 2 },
    { id: "g3", label: "Grade 3", band: "Lower Primary", track: "cbe", group: "lower", number: 3 },
    { id: "g4", label: "Grade 4", band: "Upper Primary", track: "cbe", group: "upper", number: 4 },
    { id: "g5", label: "Grade 5", band: "Upper Primary", track: "cbe", group: "upper", number: 5 },
    { id: "g6", label: "Grade 6", band: "Upper Primary", track: "cbe", group: "upper", number: 6 },
    { id: "g7", label: "Grade 7", band: "Junior School", track: "cbe", group: "junior", number: 7 },
    { id: "g8", label: "Grade 8", band: "Junior School", track: "cbe", group: "junior", number: 8 },
    { id: "g9", label: "Grade 9", band: "Junior School", track: "cbe", group: "junior", number: 9 },
    { id: "g10", label: "Grade 10", band: "Senior School", track: "cbe", group: "senior", number: 10 },
    { id: "g11", label: "Grade 11", band: "Senior School", track: "cbe", group: "senior", number: 11 },
    { id: "g12", label: "Grade 12", band: "Senior School", track: "cbe", group: "senior", number: 12 },
    { id: "f1", label: "Form 1", band: "Secondary", track: "kcse", group: "kcse", number: 1 },
    { id: "f2", label: "Form 2", band: "Secondary", track: "kcse", group: "kcse", number: 2 },
    { id: "f3", label: "Form 3", band: "Secondary", track: "kcse", group: "kcse", number: 3 },
    { id: "f4", label: "Form 4", band: "Secondary", track: "kcse", group: "kcse", number: 4 }
  ];

  var SUBJECTS = {
    pre: [
      "Language Activities",
      "Mathematical Activities",
      "Environmental Activities",
      "Psychomotor and Creative Activities",
      "Christian Religious Education Activities",
      "Islamic Religious Education Activities",
      "Hindu Religious Education Activities"
    ],
    lower: [
      "English Language Activities",
      "Kiswahili Language Activities",
      "Indigenous Language Activities",
      "Mathematical Activities",
      "Environmental Activities",
      "Hygiene and Nutrition Activities",
      "Movement and Creative Activities",
      "Christian Religious Education",
      "Islamic Religious Education",
      "Hindu Religious Education"
    ],
    upper: [
      "English",
      "Kiswahili",
      "Mathematics",
      "Science and Technology",
      "Agriculture and Nutrition",
      "Social Studies",
      "Creative Arts",
      "Physical and Health Education",
      "Christian Religious Education",
      "Islamic Religious Education",
      "Hindu Religious Education",
      "French",
      "Arabic",
      "German",
      "Indigenous Language"
    ],
    junior: [
      "English",
      "Kiswahili",
      "Mathematics",
      "Integrated Science",
      "Social Studies",
      "Pre-Technical Studies",
      "Agriculture",
      "Business Studies",
      "Computer Science",
      "Home Science",
      "Creative Arts and Sports",
      "Physical Education and Sports",
      "Christian Religious Education",
      "Islamic Religious Education",
      "Hindu Religious Education",
      "French",
      "Arabic",
      "German",
      "Mandarin Chinese",
      "Indigenous Language"
    ],
    senior: [
      "English",
      "Kiswahili",
      "Core Mathematics",
      "Essential Mathematics",
      "Community Service Learning",
      "Physical Education",
      "ICT Skills",
      "Biology",
      "Chemistry",
      "Physics",
      "General Science",
      "Agriculture",
      "Computer Studies",
      "Home Science",
      "Aviation",
      "Building and Construction",
      "Electricity",
      "Metalwork",
      "Power Mechanics",
      "Woodwork",
      "Media Technology",
      "Marine and Fisheries Technology",
      "Literature in English",
      "Fasihi ya Kiswahili",
      "History and Citizenship",
      "Geography",
      "Business Studies",
      "Christian Religious Education",
      "Islamic Religious Education",
      "Hindu Religious Education",
      "French",
      "German",
      "Arabic",
      "Mandarin Chinese",
      "Sign Language",
      "Indigenous Languages",
      "Sports and Recreation",
      "Music and Dance",
      "Theatre and Film",
      "Fine Arts"
    ],
    kcse: [
      "English",
      "Kiswahili",
      "Mathematics",
      "Biology",
      "Chemistry",
      "Physics",
      "History and Government",
      "Geography",
      "Christian Religious Education",
      "Islamic Religious Education",
      "Hindu Religious Education",
      "Business Studies",
      "Agriculture",
      "Computer Studies",
      "Home Science",
      "French",
      "German",
      "Arabic",
      "Music",
      "Art and Design",
      "Electricity",
      "Drawing and Design",
      "Building Construction",
      "Power Mechanics",
      "Metalwork",
      "Woodwork"
    ]
  };

  var BOOKS = [
    "Kenya Literature Bureau (KLB)",
    "Oxford University Press",
    "Longhorn Publishers",
    "Spotlight Publishers",
    "Moran Publishers",
    "Mentor Publishers",
    "Queenex Publishers",
    "Access Publishers",
    "JKF Publishers",
    "Phoenix Publishers",
    "Other KICD-approved course book"
  ];

  var TERMS = {
    "1": {
      start: "2026-01-06",
      end: "2026-04-02",
      breaks: [{ label: "Half-term break", start: "2026-02-25", end: "2026-03-01" }]
    },
    "2": {
      start: "2026-04-27",
      end: "2026-07-31",
      breaks: [{ label: "Half-term break", start: "2026-06-24", end: "2026-06-28" }]
    },
    "3": {
      start: "2026-08-24",
      end: "2026-10-23",
      breaks: []
    }
  };

  var HOLIDAYS = [
    { label: "Labour Day", start: "2026-05-01", end: "2026-05-01" },
    { label: "Madaraka Day", start: "2026-06-01", end: "2026-06-01" },
    { label: "Mashujaa Day", start: "2026-10-20", end: "2026-10-20" }
  ];

  var EXAMS = [
    { label: "KPSEA", start: "2026-10-26", end: "2026-10-29" },
    { label: "KILEA", start: "2026-10-26", end: "2026-10-30" },
    { label: "KJSEA and KPLEA", start: "2026-10-26", end: "2026-11-05" },
    { label: "KCSE", start: "2026-11-02", end: "2026-11-20" }
  ];

  function T(list) {
    return list.map(function (row) {
      return { strand: row[0], sub: row[1], focus: row[2] };
    });
  }

  var BANKS = {
    "pre-language": {
      pre: T([
        ["Listening", "Environmental sounds", "Identify and respond to sounds in the immediate environment"],
        ["Listening", "Simple instructions", "Follow one-step and two-step instructions during play"],
        ["Speaking", "Greetings and courtesy", "Use polite greetings and simple courtesy words"],
        ["Speaking", "News telling", "Tell simple news about home and school"],
        ["Reading readiness", "Print awareness", "Show that print carries meaning and is tracked from left to right"],
        ["Reading readiness", "Letter sounds", "Recognise some letter sounds and matching letter shapes"],
        ["Writing readiness", "Patterns and letter forms", "Make controlled patterns and letter-like forms"],
        ["Vocabulary", "Naming the world", "Name people, objects, colours and actions around them"]
      ])
    },
    "pre-math": {
      pre: T([
        ["Classification", "Sorting", "Sort objects by colour, size and shape"],
        ["Matching", "One-to-one matching", "Match objects that belong together"],
        ["Numbers", "Rote counting", "Count aloud within the class number range"],
        ["Numbers", "Number symbols", "Recognise and trace numerals used in class"],
        ["Measurement", "Comparing", "Compare objects using big, small, long, short, heavy and light"],
        ["Geometry", "Shapes in the environment", "Identify circles, triangles and rectangles in the compound"],
        ["Patterns", "Repeating patterns", "Copy and continue a simple repeating pattern"],
        ["Time", "Daily routine", "Talk about morning, afternoon and evening activities"]
      ])
    },
    environment: {
      pre: T([
        ["Myself", "My body", "Name the main parts of the body and how to care for them"],
        ["Home", "People at home", "Talk about family members and how they help one another"],
        ["School", "My school", "Identify places and people at school and the rules that keep learners safe"],
        ["Neighbourhood", "Places near school", "Name familiar places such as the market, road, church, mosque or clinic"],
        ["Plants", "Plants around us", "Observe plants in the compound and say what they need"],
        ["Animals", "Animals around us", "Name domestic and wild animals and how to treat them kindly"],
        ["Weather", "Sunny and rainy days", "Describe sunny, cloudy and rainy weather and suitable clothing"],
        ["Care", "Keeping the environment clean", "Take part in a simple clean-up and explain why litter is harmful"]
      ]),
      lower: T([
        ["Social environment", "Family and school", "Describe roles and interdependence in the family and at school"],
        ["Natural environment", "Living and non-living things", "Group things in the locality as living or non-living"],
        ["Resources", "Uses of water and soil", "Explain careful use of water, soil and plants"],
        ["Health", "Personal hygiene", "Practise habits that keep the body and the classroom clean"],
        ["Safety", "Safe movement", "Follow safety rules at home, on the road and at school"],
        ["Culture", "Celebrations", "Describe a local celebration and the values it teaches"],
        ["Maps", "Direction", "Use left, right, near and far to talk about position"],
        ["Enterprise", "Needs and wants", "Distinguish needs from wants using examples from home"]
      ])
    },
    hygiene: {
      lower: T([
        ["Health practices", "Personal hygiene", "Practise handwashing, oral care and clean dressing"],
        ["Foods", "Healthy eating", "Group foods and plan a simple balanced meal from local foods"],
        ["Care of the home", "Cleanliness", "Keep utensils, clothes and the learning space clean"],
        ["Safety", "Common accidents", "Identify dangers at home and say how to avoid them"],
        ["Illness", "Seeking help", "Tell an adult when they feel unwell and name people who help"],
        ["Environment", "Waste", "Sort waste and explain why a clean compound matters"]
      ])
    },
    creative: {
      pre: T([
        ["Movement", "Walking, running and balancing", "Move safely in space using basic locomotor skills"],
        ["Play", "Group games", "Join simple games and follow the rules of turn-taking"],
        ["Music", "Songs and rhythm", "Sing a familiar song and keep a steady beat"],
        ["Art", "Colour and drawing", "Use crayons or paint to express an idea from the immediate environment"],
        ["Modelling", "Clay and dough", "Model a simple object and talk about its shape"],
        ["Drama", "Role play", "Act a short home or market scene with courtesy"]
      ]),
      lower: T([
        ["Movement", "Skills and games", "Practise running, jumping, throwing and a simple local game"],
        ["Music", "Singing", "Sing in pitch and keep rhythm with body percussion"],
        ["Art", "Drawing and colour", "Draw a scene and apply colour with care for materials"],
        ["Craft", "Pattern and collage", "Make a pattern or collage from locally available materials"],
        ["Drama", "Story dramatisation", "Dramatise a short story and take a role respectfully"]
      ]),
      upper: T([
        ["Drawing", "Observation drawing", "Draw an object from observation using line and proportion"],
        ["Colour", "Mixing and contrast", "Mix colours and use contrast to show mood"],
        ["Pattern", "Motifs from Kenya", "Create a repeat pattern inspired by local crafts"],
        ["Music", "Melody and rhythm", "Perform a song and identify beat, tempo and dynamics"],
        ["Dance", "Folk and creative dance", "Learn a folk dance and create a short movement phrase"],
        ["Drama", "Voice and character", "Use voice and gesture to present a short scene"],
        ["Sports skills", "Ball skills", "Practise sending, receiving and simple game tactics"]
      ]),
      junior: T([
        ["Elements of art", "Line, shape and space", "Use the elements of art in a planned composition"],
        ["Design", "Poster design", "Design a poster with a clear message for the school community"],
        ["Music", "Notation and ensemble", "Read simple rhythm and perform in a small ensemble"],
        ["Drama", "Script and performance", "Rehearse a short script and respond to audience feedback"],
        ["Sports", "Fitness and rules", "Apply rules, fair play and a basic fitness plan"],
        ["Careers", "Arts and sports pathways", "Describe study and career paths linked to arts and sports"]
      ])
    },
    english: {
      lower: T([
        ["Listening", "Sounds and instructions", "Listen to a short text and follow classroom instructions"],
        ["Speaking", "Conversations", "Take turns in a short conversation using polite language"],
        ["Reading", "Phonics and word recognition", "Read decodable words and simple sentences"],
        ["Reading", "Shared story", "Retell a short story in the correct order"],
        ["Writing", "Handwriting and sentences", "Write legible words and a simple sentence"],
        ["Language use", "Vocabulary", "Use new words about home and school in speech and writing"]
      ]),
      upper: T([
        ["Listening and speaking", "Pronunciation and oral reports", "Use stress and intonation and give a short oral report"],
        ["Reading", "Comprehension", "Read a grade-level passage and answer literal and inferential questions"],
        ["Grammar", "Parts of speech", "Identify and use nouns, verbs, adjectives and tenses in sentences"],
        ["Writing", "Guided composition", "Write a paragraph with a clear opening, details and a closing sentence"],
        ["Writing", "Functional writing", "Write a short notice, message or friendly letter"],
        ["Literature", "Oral narratives and poems", "Identify the moral of a narrative and the mood of a short poem"]
      ]),
      junior: T([
        ["Listening and speaking", "Discussions and presentations", "Contribute to a discussion and deliver a short presentation"],
        ["Reading", "Extensive reading", "Read a variety of texts and summarise the main ideas"],
        ["Grammar", "Sentences and paragraphs", "Construct varied sentences and link them into coherent paragraphs"],
        ["Writing", "Imaginative composition", "Write a composition with setting, characters and a clear plot"],
        ["Writing", "Functional writing", "Write formal and informal texts for school and community purposes"],
        ["Literature", "Poetry, oral literature and short prose", "Comment on language, message and character in a short text"],
        ["Media literacy", "Reading media texts", "Question the purpose and audience of an advertisement or news item"]
      ]),
      senior: T([
        ["Listening and speaking", "Academic talk", "Present an argument and respond respectfully to questions"],
        ["Reading", "Critical comprehension", "Analyse a text for purpose, bias, evidence and audience"],
        ["Grammar in use", "Accuracy and style", "Edit writing for agreement, tense, punctuation and tone"],
        ["Writing", "Essays and reports", "Plan and write an essay or report with a clear line of thought"],
        ["Functional writing", "Official communication", "Write minutes, a curriculum vitae, an email or a formal letter"],
        ["Oral literature", "Narratives, songs and proverbs", "Interpret oral forms and relate them to community values"],
        ["Written literature", "Poetry, drama and prose", "Discuss style, character and themes in a set or class text"],
        ["Media", "Critical media literacy", "Evaluate digital and print media and create a short responsible text"]
      ]),
      forms: {
        1: T([
          ["Listening and speaking", "Pronunciation and etiquette", "Use acceptable pronunciation and polite conversational habits"],
          ["Reading", "Study skills and comprehension", "Skim, scan and answer questions on a short passage"],
          ["Grammar", "Parts of speech", "Identify nouns, pronouns, verbs, adjectives and adverbs in context"],
          ["Writing", "Paragraphing", "Write unified paragraphs with topic sentences"],
          ["Functional writing", "Packing lists and messages", "Write a packing list, a telephone message and a simple notice"],
          ["Oral literature", "Narratives", "Tell the features of a narrative and explain its moral"],
          ["Poetry", "Introduction to poetry", "Identify persona, stanza and a simple figure of speech"]
        ]),
        2: T([
          ["Reading", "Comprehension strategies", "Answer direct and inferential questions and give reasons"],
          ["Grammar", "Phrases and clauses", "Distinguish phrases from clauses and use them in sentences"],
          ["Writing", "Composition", "Write a narrative composition with a clear sequence"],
          ["Functional writing", "Informal letters", "Write an informal letter with the correct format"],
          ["Oral literature", "Songs and proverbs", "Explain the message of a song and a proverb"],
          ["Poetry", "Imagery and tone", "Comment on imagery and tone in a short poem"],
          ["Set text skills", "Introduction to the class reader", "Describe characters and setting in the class reader"]
        ]),
        3: T([
          ["Reading", "Summary skills", "Write a summary that keeps the main ideas and the required length"],
          ["Grammar", "Clauses and sentence variety", "Join ideas using suitable conjunctions and relative clauses"],
          ["Writing", "Imaginative compositions", "Write an imaginative composition with convincing detail"],
          ["Functional writing", "Formal letters and reports", "Write a formal letter and a short report"],
          ["Oral literature", "Oral forms in society", "Analyse the functions of oral literature in a community"],
          ["Poetry", "Style", "Comment on diction, mood and structure in a poem"],
          ["Set texts", "The prescribed text", "Discuss character, plot and themes in the prescribed KNEC text"]
        ]),
        4: T([
          ["Exam skills", "Paper structure", "Plan time across comprehension, grammar, oral skills and composition"],
          ["Reading", "Comprehension and cloze", "Answer a comprehension and complete a cloze passage accurately"],
          ["Grammar", "Consolidation", "Correct common errors of agreement, tense, spelling and punctuation"],
          ["Writing", "Composition mastery", "Write a relevant composition with mature language and a sound plot"],
          ["Summary", "Note form and prose summary", "Make notes and write a concise summary"],
          ["Oral literature", "Revision", "Revise features, styles and functions of the oral forms studied"],
          ["Set texts", "KCSE set text revision", "Revise the prescribed texts with evidence for character and theme"]
        ])
      }
    },
    kiswahili: {
      lower: T([
        ["Kusikiliza", "Maagizo", "Kusikiliza na kufuata maagizo mafupi darasani"],
        ["Kuzungumza", "Mazungumzo", "Kuzungumza kwa heshima na kuchukua zamu"],
        ["Kusoma", "Kusoma maneno", "Kusoma maneno na sentensi fupi kwa ufasaha"],
        ["Kusoma", "Hadithi", "Kueleza hadithi fupi kwa mpangilio sahihi"],
        ["Kuandika", "Hati na sentensi", "Kuandika maneno na sentensi fupi kwa hati nadhifu"],
        ["Msamiati", "Msamiati wa shule", "Kutumia msamiati wa nyumbani na shuleni"]
      ]),
      upper: T([
        ["Kusikiliza na kuzungumza", "Matamshi", "Kutamka maneno kwa ufasaha na kutoa taarifa fupi"],
        ["Kusoma", "Ufahamu", "Kusoma kifungu na kujibu maswali"],
        ["Sarufi", "Aina za maneno", "Kutambua nomino, vitenzi na vivumishi katika sentensi"],
        ["Kuandika", "Insha fupi", "Kuandika aya yenye wazo kuu na maelezo"],
        ["Kuandika", "Uandishi rasmi", "Kuandika ujumbe, tangazo au barua fupi"],
        ["Fasihi simulizi", "Hadithi na methali", "Kueleza ujumbe wa hadithi na methali"]
      ]),
      junior: T([
        ["Kusikiliza na kuzungumza", "Mjadala", "Kushiriki mjadala na kutoa hotuba fupi"],
        ["Kusoma", "Ufahamu wa kina", "Kusoma makala na kufupisha maoni makuu"],
        ["Sarufi", "Uundaji wa sentensi", "Kuunda sentensi sahihi na kuunganisha aya"],
        ["Kuandika", "Insha ya kubuni", "Kuandika insha yenye utangulizi, maudhui na hitimisho"],
        ["Kuandika", "Barua na ripoti", "Kuandika barua na ripoti fupi kwa muundo sahihi"],
        ["Fasihi", "Ushairi na fasihi andishi", "Kuchambua ujumbe, wahusika na lugha katika kazi fupi"],
        ["Isimu jamii", "Lugha na jamii", "Kueleza nafasi ya Kiswahili katika mawasiliano nchini Kenya"]
      ]),
      senior: T([
        ["Kusikiliza na kuzungumza", "Hotuba na mjadala", "Kuwasilisha hoja na kujibu maswali kwa heshima"],
        ["Kusoma", "Ufahamu tathmini", "Kutathmini madhumuni, ushahidi na hadhira ya kifungu"],
        ["Sarufi", "Usahihi wa lugha", "Kuhariri kazi kwa kuzingatia sarufi, uakifishaji na mtindo"],
        ["Uandishi", "Insha na ripoti", "Kupanga na kuandika insha au ripoti yenye mpangilio thabiti"],
        ["Uandishi rasmi", "Mawasiliano rasmi", "Kuandika kumbukumbu, barua rasmi na wasifu"],
        ["Fasihi simulizi", "Tanzu za fasihi simulizi", "Kuchambua tanzu simulizi na kuzihusisha na maadili"],
        ["Fasihi andishi", "Ushairi, tamthilia na riwaya", "Kujadili mtindo, wahusika na maudhui"],
        ["Media", "Ujuzi wa media", "Kutathmini ujumbe wa media na kuunda maandishi yenye uwajibikaji"]
      ]),
      forms: {
        1: T([
          ["Kusikiliza na kuzungumza", "Matamshi na adabu", "Kutamka ipasavyo na kuzungumza kwa adabu"],
          ["Kusoma", "Ufahamu", "Kusoma kifungu na kujibu maswali ya moja kwa moja"],
          ["Sarufi", "Nomino na vitenzi", "Kutambua nomino na vitenzi na kuvitumia katika sentensi"],
          ["Uandishi", "Aya", "Kuandika aya yenye wazo moja kuu"],
          ["Uandishi rasmi", "Ujumbe na tangazo", "Kuandika ujumbe na tangazo kwa muundo sahihi"],
          ["Fasihi simulizi", "Hadithi", "Kueleza sifa na ujumbe wa hadithi"]
        ]),
        2: T([
          ["Kusoma", "Ufahamu wa kiwango cha pili", "Kujibu maswali ya ufahamu na kutoa sababu"],
          ["Sarufi", "Viwakilishi na vielezi", "Kutumia viwakilishi na vielezi ipasavyo"],
          ["Uandishi", "Insha ya masimulizi", "Kuandika insha yenye mpangilio wa matukio"],
          ["Barua", "Barua ya kirafiki", "Kuandika barua ya kirafiki kwa muundo sahihi"],
          ["Fasihi simulizi", "Nyimbo na methali", "Kueleza ujumbe wa wimbo na methali"],
          ["Ushairi", "Taswira", "Kutambua taswira na toni katika shairi fupi"]
        ]),
        3: T([
          ["Kusoma", "Ufupisho", "Kufupisha kifungu kwa maneno yaliyopangwa"],
          ["Sarufi", "Vishazi na virai", "Kutofautisha vishazi na virai na kuviunganisha"],
          ["Uandishi", "Insha ya kubuni", "Kuandika insha ya kubuni yenye maelezo thabiti"],
          ["Uandishi rasmi", "Barua rasmi na ripoti", "Kuandika barua rasmi na ripoti fupi"],
          ["Fasihi simulizi", "Dhima za fasihi simulizi", "Kuchambua dhima za fasihi simulizi katika jamii"],
          ["Fasihi andishi", "Kazi andishi", "Kujadili wahusika na maudhui ya kazi iliyosomwa"]
        ]),
        4: T([
          ["Mitihani", "Muundo wa karatasi", "Kupanga muda wa karatasi ya Kiswahili"],
          ["Ufahamu", "Ufahamu na kujaza nafasi", "Kujibu ufahamu na kujaza nafasi kwa usahihi"],
          ["Sarufi", "Marudio", "Kusahihisha makosa ya sarufi, tahajia na uakifishaji"],
          ["Insha", "Umahiri wa insha", "Kuandika insha yanayolingana na kichwa na yenye lugha bora"],
          ["Ufupisho", "Ufupisho wa nathari", "Kuandika ufupisho mfupi unaohifadhi maana"],
          ["Fasihi", "Marudio ya fasihi", "Kujirejelea tanzu, wahusika na maudhui yaliyosomwa"]
        ])
      }
    },
    math: {
      lower: T([
        ["Numbers", "Counting and numerals", "Count, read and write numbers up to {range}"],
        ["Numbers", "Place value", "Identify the place value of digits in numbers up to {range}"],
        ["Operations", "Addition and subtraction", "Add and subtract numbers within {range} using suitable strategies"],
        ["Operations", "Multiplication and division", "Multiply and divide small whole numbers in practical situations"],
        ["Fractions", "Halves and quarters", "Identify and use simple fractions in sharing activities"],
        ["Measurement", "Length, mass and capacity", "Measure and compare length, mass and capacity with informal and standard units"],
        ["Geometry", "Shapes and position", "Name common shapes and describe position"],
        ["Data", "Simple records", "Collect and record data using marks, pictures or a table"]
      ]),
      upper: T([
        ["Numbers", "Whole numbers", "Read, write, order and round numbers within the grade range"],
        ["Operations", "The four operations", "Apply addition, subtraction, multiplication and division to word problems"],
        ["Fractions", "Fractions and decimals", "Compare fractions and decimals and use them in measurement and money"],
        ["Patterns", "Number patterns", "Continue and describe number patterns and simple sequences"],
        ["Measurement", "Perimeter and area", "Find the perimeter and area of rectangles in familiar contexts"],
        ["Geometry", "Angles and constructions", "Identify angles and construct simple shapes with care"],
        ["Data", "Tables and graphs", "Represent data in tables and bar graphs and comment on the results"],
        ["Everyday maths", "Money and time", "Solve problems involving Kenyan currency, time and simple timetables"]
      ]),
      junior: T([
        ["Numbers", "Integers and indices", "Use integers and index notation in calculations"],
        ["Algebra", "Expressions and equations", "Form and solve simple linear expressions and equations"],
        ["Ratio", "Ratio, proportion and percentages", "Solve problems on ratio, proportion, percentage and simple interest"],
        ["Geometry", "Angles, similarity and scale", "Apply angle facts, scale drawing and similarity"],
        ["Measurement", "Area and volume", "Calculate area and volume of common shapes and solids"],
        ["Graphs", "Linear graphs", "Plot and interpret linear graphs in real situations"],
        ["Statistics", "Data handling", "Collect, represent and interpret data using suitable graphs"],
        ["Probability", "Simple probability", "Find the probability of simple events and relate it to fairness"]
      ]),
      senior: T([
        ["Numbers and algebra", "Expressions and equations", "Manipulate algebraic expressions and solve linear and simple quadratic equations"],
        ["Commercial mathematics", "Money mathematics", "Solve problems on profit, loss, discount, commission and simple interest"],
        ["Graphs", "Linear and quadratic graphs", "Draw and interpret graphs and use them to solve problems"],
        ["Geometry", "Mensuration", "Apply perimeter, area, surface area and volume in design tasks"],
        ["Trigonometry", "Right-angled triangles", "Use sine, cosine and tangent in right-angled triangles"],
        ["Statistics", "Data and averages", "Analyse data using mean, median, mode and suitable charts"],
        ["Probability", "Combined events", "Calculate probabilities of single and simple combined events"],
        ["Modelling", "Mathematical modelling", "Model a local problem and justify the calculation used"]
      ]),
      forms: {
        1: T([
          ["Numbers", "Natural numbers", "Use factors, multiples, GCD and LCM in problems"],
          ["Numbers", "Fractions and decimals", "Carry out operations on fractions and decimals"],
          ["Algebra", "Algebraic expressions", "Form and simplify algebraic expressions"],
          ["Ratio", "Ratio, rates and percentages", "Solve problems on ratio, rates and percentages"],
          ["Commercial arithmetic", "Profit and discount", "Calculate profit, loss, discount and percentage change"],
          ["Geometry", "Angles and scale drawing", "Apply angle properties and draw to scale"],
          ["Solids", "Common solids", "Identify faces, edges and vertices and draw nets"],
          ["Coordinates", "The Cartesian plane", "Plot and read points on the Cartesian plane"]
        ]),
        2: T([
          ["Numbers", "Cubes, roots and reciprocals", "Find cubes, cube roots and reciprocals of numbers"],
          ["Indices", "Indices and logarithms", "Apply the laws of indices and read simple logarithms"],
          ["Algebra", "Equations of straight lines", "Find the equation of a straight line and interpret gradient"],
          ["Algebra", "Linear inequalities", "Solve and represent linear inequalities"],
          ["Algebra", "Quadratic expressions", "Expand and factorise quadratic expressions"],
          ["Geometry", "Pythagoras theorem", "Apply Pythagoras theorem in plane figures"],
          ["Trigonometry", "Right-angled triangles", "Use sine, cosine and tangent for lengths and angles"],
          ["Statistics", "Data representation", "Draw frequency tables, bar graphs and pie charts"]
        ]),
        3: T([
          ["Algebra", "Quadratic equations", "Solve quadratic equations by factorisation and formula"],
          ["Algebra", "Linear programming", "Formulate and solve a simple linear programming problem"],
          ["Graphs", "Graphical solutions", "Use graphs to solve equations and estimate area"],
          ["Trigonometry", "Sine and cosine rules", "Apply the sine and cosine rules in triangles"],
          ["Geometry", "Circles and chords", "Apply circle theorems in calculations"],
          ["Commercial arithmetic", "Compound interest and appreciation", "Calculate compound interest, appreciation and depreciation"],
          ["Statistics", "Measures of central tendency", "Calculate mean, median and mode for grouped and ungrouped data"],
          ["Probability", "Probability rules", "Apply probability laws to independent and mutually exclusive events"]
        ]),
        4: T([
          ["Algebra", "Matrices and transformations", "Use matrices to describe transformations"],
          ["Graphs", "Revision of functions", "Sketch and interpret linear, quadratic and cubic graphs"],
          ["Calculus ideas", "Rates of change", "Estimate rate of change from a graph and a table"],
          ["Trigonometry", "Three-dimensional problems", "Solve trigonometry problems in three dimensions"],
          ["Vectors", "Vectors in two dimensions", "Add vectors and use them in geometry"],
          ["Statistics", "Cumulative frequency", "Draw a cumulative frequency curve and estimate quartiles"],
          ["Probability", "Tree diagrams", "Use tree diagrams for successive events"],
          ["Revision", "KCSE mixed practice", "Solve mixed examination-style questions and check working"]
        ])
      }
    },
    "essential-math": {
      senior: T([
        ["Everyday numbers", "Calculation", "Carry out the four operations accurately in workplace and home contexts"],
        ["Fractions", "Fractions, decimals and percentages", "Use fractions, decimals and percentages in prices and measures"],
        ["Money", "Budgets", "Prepare a simple budget and check a receipt or invoice"],
        ["Measurement", "Practical measurement", "Measure length, mass, capacity and time for a real task"],
        ["Space", "Shapes in construction", "Use shapes, area and volume in a practical design"],
        ["Data", "Charts at work", "Read tables, bills and simple charts and explain what they show"],
        ["Ratio", "Recipes and maps", "Apply ratio in recipes, mixtures and simple map scales"],
        ["Chance", "Everyday probability", "Judge simple chances and explain a fair outcome"]
      ])
    },
    science: {
      upper: T([
        ["Living things", "Plants and animals", "Classify living things and describe what they need to stay alive"],
        ["Human body", "Health", "Explain habits that keep the body healthy"],
        ["Environment", "Conservation", "Describe ways of caring for water, soil, plants and animals"],
        ["Matter", "Materials", "Group materials by properties and suggest suitable uses"],
        ["Energy", "Light, heat and sound", "Investigate light, heat and sound in daily life"],
        ["Force", "Pushes and pulls", "Investigate how forces move, stop or change the shape of objects"],
        ["Earth and space", "Weather", "Observe and record weather and relate it to human activity"],
        ["Digital devices", "Safe use", "Use a digital device safely to record an observation"]
      ]),
      junior: T([
        ["Scientific inquiry", "Investigations", "Plan a fair investigation, record results and draw a conclusion"],
        ["Living things", "Cells and classification", "Describe the cell as the basic unit of life and classify organisms"],
        ["Human body", "Body systems", "Outline the roles of selected body systems in health"],
        ["Environment", "Interdependence", "Explain food chains and the effect of human activity on habitats"],
        ["Matter", "Mixtures and separation", "Separate mixtures using methods suited to the materials"],
        ["Energy", "Forms and changes", "Trace energy changes in simple devices and household tasks"],
        ["Force and motion", "Speed and machines", "Describe speed and the usefulness of simple machines"],
        ["Earth", "Resources of the Earth", "Relate rocks, soil, air and water to responsible use"]
      ]),
      senior: T([
        ["Inquiry", "Laboratory practice", "Follow laboratory safety and write a clear investigation report"],
        ["Life", "Organisation of life", "Relate cells, tissues, organs and systems"],
        ["Environment", "Ecosystems", "Analyse an ecosystem and suggest a conservation action"],
        ["Matter", "Particles and change", "Explain physical and chemical change using particle ideas"],
        ["Chemical behaviour", "Acids, bases and salts in life", "Test household substances and record observations safely"],
        ["Energy", "Electricity and heat", "Investigate simple circuits and heat transfer"],
        ["Earth and space", "Earth systems", "Explain weather, climate and a responsible response to environmental change"],
        ["Applications", "Science in Kenya", "Apply a science idea to agriculture, health or local industry"]
      ])
    },
    biology: {
      forms: {
        1: T([
          ["Introduction", "Introduction to Biology", "Explain the meaning, branches and importance of Biology and follow laboratory safety"],
          ["Classification", "Classification I", "Use observable features to classify living things into major groups"],
          ["The cell", "Cell structure", "Identify plant and animal cell structures and state their functions"],
          ["The cell", "Cell physiology", "Explain diffusion, osmosis and active transport in cells"],
          ["Nutrition", "Nutrition in plants", "Describe photosynthesis and factors that affect it"],
          ["Nutrition", "Nutrition in animals", "Describe modes of nutrition and the role of enzymes and a balanced diet"],
          ["Transport", "Transport in plants", "Explain absorption and movement of water and mineral salts"],
          ["Transport", "Transport in animals", "Describe blood, the heart and blood vessels and relate them to health"]
        ]),
        2: T([
          ["Gaseous exchange", "Gaseous exchange in plants and animals", "Compare gaseous exchange surfaces and explain breathing"],
          ["Respiration", "Aerobic and anaerobic respiration", "Distinguish aerobic from anaerobic respiration and their products"],
          ["Excretion", "Excretion and homeostasis", "Explain excretion and the control of internal conditions"],
          ["Ecology", "Habitat studies", "Study a habitat and record abiotic and biotic factors"],
          ["Nutrition", "Dentition and digestion", "Relate dentition and the alimentary canal to diet"],
          ["Transport", "Transpiration", "Investigate transpiration and the factors that affect it"]
        ]),
        3: T([
          ["Classification", "Classification II", "Use a simple key and binomial names"],
          ["Ecology", "Populations and adaptations", "Explain adaptations, energy flow and human effects on ecosystems"],
          ["Reproduction", "Reproduction in plants", "Describe pollination, fertilisation and fruit formation"],
          ["Reproduction", "Reproduction in animals", "Outline reproduction in humans and the care of a pregnancy"],
          ["Growth", "Growth and development", "Describe growth patterns and the role of hormones in development"],
          ["Health", "Some human diseases", "Relate selected diseases to cause, transmission and prevention"]
        ]),
        4: T([
          ["Genetics", "Genetics", "Use genetic terms and solve monohybrid crosses"],
          ["Evolution", "Evolution", "Explain natural selection using evidence discussed in class"],
          ["Response", "Reception, response and coordination", "Describe the roles of the nervous and endocrine systems"],
          ["Support", "Support and movement", "Relate the skeleton and muscles to movement"],
          ["Health", "Immunity", "Distinguish types of immunity and the value of vaccination"],
          ["Revision", "KCSE Biology revision", "Answer structured Biology questions with labelled diagrams where needed"]
        ])
      }
    },
    chemistry: {
      forms: {
        1: T([
          ["Introduction", "Introduction to Chemistry", "Explain what Chemistry studies and follow laboratory safety"],
          ["Classification", "Simple classification of substances", "Distinguish elements, compounds and mixtures and separate mixtures"],
          ["Acids", "Acids, bases and indicators", "Test acids and bases with indicators and name common examples"],
          ["Air", "Air and combustion", "State the composition of air and explain combustion and rusting"],
          ["Water", "Water and hydrogen", "Describe water treatment and laboratory preparation of hydrogen"],
          ["Matter", "Particulate nature of matter", "Explain the particle arrangement in solids, liquids and gases"]
        ]),
        2: T([
          ["Atomic structure", "The atom and the periodic table", "Describe atomic structure and use the periodic table"],
          ["Families", "Chemical families", "Compare alkali metals, halogens and noble gases"],
          ["Bonding", "Structure and bonding", "Explain ionic, covalent and metallic bonding"],
          ["Salts", "Salts", "Prepare a named salt by a suitable method"],
          ["Electricity", "Effect of an electric current on substances", "Distinguish conductors from non-conductors and describe electrolysis in simple terms"],
          ["Carbon", "Carbon and its compounds", "Describe allotropes of carbon and tests for carbon dioxide"]
        ]),
        3: T([
          ["Gas laws", "Gas laws", "State Boyle's and Charles's laws and carry out simple calculations"],
          ["The mole", "The mole concept", "Calculate moles, molar mass and empirical formulae"],
          ["Organic", "Organic chemistry I", "Name simple hydrocarbons and describe their reactions"],
          ["Nitrogen", "Nitrogen and its compounds", "Describe the preparation and uses of ammonia and nitric acid in outline"],
          ["Sulphur", "Sulphur and its compounds", "Describe the contact process in outline and the uses of sulphuric acid"],
          ["Chlorine", "Chlorine and its compounds", "Describe laboratory preparation of chlorine and its bleaching action"]
        ]),
        4: T([
          ["Organic", "Organic chemistry II", "Describe alkanols, alkanoic acids and soaps in outline"],
          ["Energy", "Energy changes", "Distinguish exothermic from endothermic changes and draw energy diagrams"],
          ["Rates", "Rates and reversible reactions", "Explain factors that affect rate and equilibrium"],
          ["Electrochemistry", "Electrochemistry", "Describe electrolysis and simple electrochemical cells"],
          ["Metals", "Metals", "Compare reactivity and methods of extracting metals"],
          ["Radioactivity", "Radioactivity", "Distinguish types of radiation and state peaceful uses and precautions"]
        ])
      }
    },
    physics: {
      forms: {
        1: T([
          ["Introduction", "Introduction to Physics", "Explain what Physics studies and follow laboratory rules"],
          ["Measurement", "Measurement I", "Measure length, area, volume, mass and density"],
          ["Force", "Force", "Describe effects of force and calculate weight"],
          ["Pressure", "Pressure", "Calculate pressure in solids and explain pressure in fluids"],
          ["Matter", "Particulate nature of matter", "Explain Brownian motion and states of matter"],
          ["Heat", "Thermal expansion and heat transfer", "Describe expansion and conduction, convection and radiation"],
          ["Light", "Rectilinear propagation", "Explain shadows, eclipses and pinhole images"]
        ]),
        2: T([
          ["Magnetism", "Magnetism", "Describe magnetic fields and methods of magnetisation"],
          ["Turning effect", "Moments and centre of gravity", "Apply the principle of moments and find centre of gravity"],
          ["Light", "Reflection at curved mirrors", "Locate images formed by curved mirrors using ray diagrams"],
          ["Electricity", "Magnetic effect of a current", "Describe the field around a conductor and a simple electromagnet"],
          ["Hooke", "Hooke's law", "Verify Hooke's law and calculate the spring constant"],
          ["Waves", "Waves and sound", "Distinguish transverse and longitudinal waves and explain echo"],
          ["Fluids", "Fluid flow", "Explain streamline flow and Bernoulli's effect in simple terms"]
        ]),
        3: T([
          ["Measurement", "Measurement II", "Use vernier callipers and a micrometer screw gauge"],
          ["Light", "Refraction and lenses", "Apply the laws of refraction and locate images in lenses"],
          ["Waves", "Waves II", "Use the wave equation and describe electromagnetic waves"],
          ["Electricity", "Current electricity", "Apply Ohm's law and calculate resistance in simple circuits"],
          ["Electrostatics", "Electrostatics", "Explain charging and the electric field in simple cases"],
          ["Heating", "Heating effect of a current", "Calculate electrical energy and power"],
          ["Cells", "Cells and simple circuits", "Describe primary and secondary cells and their care"]
        ]),
        4: T([
          ["Magnetism", "Electromagnetic induction", "State Faraday's and Lenz's laws and describe a simple generator"],
          ["Mains", "Mains electricity", "Describe the wiring of a plug, fuses and safety devices"],
          ["Electronics", "Electronics", "Explain a diode and a simple rectifier circuit"],
          ["Radioactivity", "Radioactivity", "Describe detection of radiation and safety precautions"],
          ["X-rays", "X-rays and the cathode ray tube", "Outline production and uses of X-rays and cathode rays"],
          ["Revision", "KCSE Physics practical skills", "Plan tables, graphs and error comments for practical questions"]
        ])
      }
    },
    social: {
      upper: T([
        ["Environment", "Maps and physical features", "Read a simple map and locate physical features of Kenya"],
        ["People", "Population", "Describe family, clan and population distribution in the locality"],
        ["Culture", "Cultural heritage", "Appreciate cultural practices that promote cohesion"],
        ["Resources", "Economic activities", "Identify farming, trade, fishing and other local economic activities"],
        ["Governance", "Leadership and rules", "Explain good leadership, rules and the importance of the Constitution in simple terms"],
        ["Citizenship", "Rights and responsibilities", "State the rights and responsibilities of a Kenyan child"]
      ]),
      junior: T([
        ["Map work", "Maps and fieldwork", "Use scale, direction and a simple field sketch"],
        ["People", "Population and settlement", "Explain factors that influence settlement and population change"],
        ["History", "Early communities in Kenya", "Describe the migration and settlement of selected communities"],
        ["Governance", "The Constitution of Kenya", "Outline the structure of government and the Bill of Rights in simple terms"],
        ["Citizenship", "National unity", "Explain patriotism, peace and the value of diversity"],
        ["Resources", "Development", "Relate resources and economic activities to sustainable development"]
      ])
    },
    history: {
      forms: {
        1: T([
          ["Introduction", "Introduction to History and Government", "Explain the meaning of history and government and the sources of information"],
          ["Early man", "Early man", "Describe the evolution and culture of early man"],
          ["Development", "Early agriculture and metal use", "Explain the development of agriculture and the use of metals"],
          ["Civilisation", "Early civilisations", "Outline the contributions of an early civilisation studied in class"],
          ["Kenya", "Peopling of Kenya", "Describe the migration and settlement of selected Kenyan communities"],
          ["Citizenship", "Citizenship", "Explain ways of becoming a Kenyan citizen and the duties of a citizen"]
        ]),
        2: T([
          ["Trade", "Trade", "Describe the development of local, regional and international trade"],
          ["Transport", "Transport and communication", "Explain developments in transport and communication"],
          ["Industry", "Industrialisation", "Outline the industrial revolution and its effects"],
          ["Urbanisation", "Urbanisation", "Explain the rise of towns and related challenges"],
          ["Constitution", "The Constitution", "Describe the constitution-making process and key provisions"],
          ["Democracy", "Democracy and human rights", "Explain democracy, human rights and their protection"]
        ]),
        3: T([
          ["Colonialism", "European invasion of Africa", "Explain the scramble for and partition of Africa"],
          ["Kenya", "Establishment of colonial rule in Kenya", "Describe the establishment of colonial rule and African reactions"],
          ["Economy", "Colonial economy", "Explain colonial economic policies and their effects"],
          ["Social", "Colonial social services", "Describe colonial education, health and mission work"],
          ["Politics", "Political developments", "Trace early political organisations in Kenya"],
          ["Government", "Arms of government", "Explain the legislature, executive and judiciary"]
        ]),
        4: T([
          ["World wars", "World wars", "Outline the causes and effects of the world wars studied"],
          ["Cooperation", "International cooperation", "Explain the work of the United Nations and regional bodies"],
          ["Kenya", "The road to independence", "Describe the struggle for independence and the Lancaster House process in outline"],
          ["Kenya", "Kenya after independence", "Explain political, social and economic developments since independence"],
          ["Government", "Public revenue and devolved government", "Explain sources of public revenue and the role of county governments"],
          ["Revision", "KCSE History revision", "Answer evidence-based essay and structured questions"]
        ])
      },
      senior: T([
        ["Sources", "Studying the past", "Use oral, written and archaeological sources with care"],
        ["Peopling", "Peoples of Kenya", "Describe migration, settlement and interaction of Kenyan communities"],
        ["Citizenship", "Rights and duties", "Apply the ideas of rights, duties and national values"],
        ["Governance", "How Kenya is governed", "Explain national and county government in outline"],
        ["Heritage", "Heritage and cohesion", "Show how heritage can build peace and shared identity"],
        ["Change", "Kenya in the world", "Relate a national event to regional or global links"]
      ])
    },
    geography: {
      forms: {
        1: T([
          ["Introduction", "Introduction to Geography", "Explain the branches of Geography and the importance of the subject"],
          ["Earth", "The Earth and the solar system", "Describe the shape of the Earth and the solar system"],
          ["Statistics", "Statistical methods", "Present data using tables, graphs and simple statistics"],
          ["Maps", "Map work", "Use direction, scale, location and representation of relief"],
          ["Fieldwork", "Fieldwork", "Plan and carry out a simple field study"],
          ["Minerals", "Minerals and rocks", "Classify rocks and explain their importance"]
        ]),
        2: T([
          ["Internal processes", "Earth movements", "Explain folding, faulting and earthquakes in outline"],
          ["Vulcanicity", "Vulcanicity", "Describe features formed by vulcanicity and their effects"],
          ["Climate", "Weather and climate", "Distinguish weather from climate and read simple instruments"],
          ["Vegetation", "Vegetation", "Describe vegetation types and factors that influence them"],
          ["Forestry", "Forestry", "Explain the importance of forests and conservation measures"],
          ["Maps", "Map interpretation", "Interpret relief, drainage and human features on a topographical map"]
        ]),
        3: T([
          ["Statistics", "Statistical mapping", "Use age-sex pyramids, dot maps and choropleth maps"],
          ["External processes", "Action of rivers, ice and wind", "Describe erosion and deposition features"],
          ["Oceans", "Oceans, coasts and lakes", "Explain coastal and lake features and their uses"],
          ["Glaciation", "Glaciation in East Africa", "Describe glacial features on East African mountains"],
          ["Soils", "Soils", "Explain soil formation, profile and conservation"],
          ["Agriculture", "Agriculture", "Compare farming systems studied in Kenya and Africa"]
        ]),
        4: T([
          ["Industry", "Industry", "Explain types of industry and factors influencing location"],
          ["Transport", "Transport and communication", "Analyse transport networks and their problems"],
          ["Trade", "Trade", "Distinguish domestic from international trade and regional blocs"],
          ["Population", "Population", "Explain population structure, migration and related policies"],
          ["Settlement", "Settlement", "Compare rural and urban settlement patterns"],
          ["Management", "Environmental management", "Propose responses to selected environmental hazards"]
        ])
      },
      senior: T([
        ["Skills", "Maps and fieldwork", "Use map skills and a field study to answer a geographical question"],
        ["Physical", "Landforms and climate", "Explain a landform or climate pattern using evidence"],
        ["Human", "Population and settlement", "Analyse a population or settlement issue in Kenya"],
        ["Economic", "Resources and development", "Relate a resource to livelihoods and sustainability"],
        ["Environment", "Hazards and care", "Assess a local environmental challenge and a practical response"],
        ["Application", "Geography in careers", "Connect geographical skills to further study and work"]
      ])
    },
    cre: {
      pre: T([
        ["God", "God the creator", "Talk about God as the giver of life and the things around them"],
        ["Prayer", "Simple prayer", "Say a short prayer of thanks"],
        ["Jesus", "The childhood of Jesus", "Retell a simple event from the childhood of Jesus"],
        ["Values", "Sharing and kindness", "Show kindness and sharing during play"],
        ["Church", "The church family", "Name people who serve in the church and how learners take part"],
        ["Care", "Caring for creation", "Take part in caring for plants, animals or the compound"]
      ]),
      upper: T([
        ["Creation", "Creation and the fall", "Retell the creation account and the call to care for the environment"],
        ["Bible", "Using the Bible", "Find a passage and read it with respect"],
        ["Jesus", "The life of Jesus", "Describe a teaching or miracle of Jesus and its lesson"],
        ["Church", "The early church", "Explain how the early church shared and served"],
        ["Values", "Christian values", "Apply honesty, respect and responsibility at school"],
        ["Community", "Service", "Plan a small act of service in the school or at home"]
      ]),
      junior: T([
        ["Bible", "The Bible as a guide", "Explain how selected Bible teachings guide daily choices"],
        ["Jesus", "Teachings of Jesus", "Apply a parable to life in school and the community"],
        ["Church", "The church in Kenya", "Describe the work of the church in education, health and peace"],
        ["Values", "Moral decision making", "Use Christian values to respond to a moral dilemma"],
        ["Worship", "Worship and festivals", "Explain the meaning of a Christian festival"],
        ["Service", "Vocation", "Describe ways young people can serve God and neighbour"]
      ]),
      senior: T([
        ["Scripture", "Interpreting a text", "Read a Bible text in context and draw a responsible lesson"],
        ["Ethics", "Christian ethics", "Apply Christian ethics to family, work, media and the environment"],
        ["Church", "Church history in Africa", "Outline the coming and growth of the church in Kenya"],
        ["Society", "Christians in society", "Discuss the Christian response to justice, peace and integrity"],
        ["Faith", "Belief and practice", "Explain a Christian belief and how it is lived"],
        ["Service", "Leadership and service", "Describe servant leadership in school and community"]
      ]),
      forms: {
        1: T([
          ["Introduction", "Introduction to CRE", "Explain why Christian Religious Education is studied"],
          ["Bible", "The Bible", "Describe the divisions of the Bible and how it reached East Africa"],
          ["Creation", "Creation and the fall", "Explain the teachings of Genesis on creation, sin and the environment"],
          ["Faith", "Abraham and selected patriarchs", "Describe the call of Abraham and lessons on faith"],
          ["Exodus", "Moses and the covenant", "Explain the Sinai covenant and the Ten Commandments"],
          ["Leadership", "Leadership in Israel", "Describe qualities of a leader using a selected figure"]
        ]),
        2: T([
          ["Old Testament", "Prophets", "Explain the message of a selected prophet on justice and worship"],
          ["New Testament", "The infancy and ministry of Jesus", "Describe the birth of Jesus and the start of his ministry"],
          ["Teachings", "Teachings of Jesus", "Apply selected teachings of Jesus to daily life"],
          ["Miracles", "Miracles of Jesus", "Explain the significance of selected miracles"],
          ["Church", "The early church", "Describe Pentecost and life in the early church"],
          ["Values", "Christian values", "Apply love, forgiveness and responsibility in school life"]
        ]),
        3: T([
          ["Gifts", "The Holy Spirit", "Explain the gifts and fruit of the Holy Spirit"],
          ["Church", "The church in East Africa", "Trace the establishment of Christian missions in Kenya"],
          ["Unity", "Christian unity", "Explain efforts towards unity among Christians"],
          ["Ethics", "Human sexuality and family", "Discuss Christian teaching on family life with respect"],
          ["Work", "Work and wealth", "Explain Christian attitudes to work, leisure and wealth"],
          ["Law", "Law, order and justice", "Relate Christian teaching to justice and good citizenship"]
        ]),
        4: T([
          ["Ethics", "Selected moral issues", "Discuss a Christian response to selected social issues"],
          ["Life", "The value of life", "Explain Christian teaching on the dignity of human life"],
          ["Society", "Christians and the state", "Describe the relationship between church and state"],
          ["Vocation", "Vocation and career", "Explain gifts, talents and career choice"],
          ["Revision", "Gospel and epistle revision", "Revise the prescribed Gospel and epistle with chapter references from class notes"],
          ["Revision", "KCSE CRE revision", "Answer structured CRE questions with biblical evidence"]
        ])
      }
    },
    ire: {
      upper: T([
        ["Quran", "Selected short surahs", "Recite a short surah correctly and state its meaning in simple words"],
        ["Faith", "Pillars of Iman", "Name the pillars of Iman and explain one of them"],
        ["Worship", "Pillars of Islam", "Describe the five pillars and how a learner practises them"],
        ["Sirah", "The early life of the Prophet", "Retell an event from the early life of Prophet Muhammad (peace be upon him)"],
        ["Character", "Akhlaq", "Practise honesty, cleanliness and respect"],
        ["Community", "Living with others", "Show kindness to parents, neighbours and classmates"]
      ]),
      junior: T([
        ["Quran", "Recitation and meaning", "Recite selected verses and explain the lesson"],
        ["Hadith", "Selected hadith", "Explain a hadith on character and apply it at school"],
        ["Fiqh", "Taharah and swalah", "Describe purification and the movements of swalah"],
        ["Sirah", "The Prophet at Makkah and Madinah", "Outline a key event of the Sirah and its lesson"],
        ["Akhlaq", "Moral values", "Apply trustworthiness and care for public property"],
        ["Muamalat", "Fair dealing", "Explain honesty in trade and in keeping promises"]
      ]),
      forms: {
        1: T([
          ["Quran", "Ulumul Quran", "Explain how the Quran was revealed, recorded and preserved"],
          ["Hadith", "Introduction to Hadith", "Explain the place of Hadith and a selected teaching"],
          ["Faith", "Pillars of Iman", "Explain Tawhid, angels, books, prophets, the Last Day and divine decree in age-appropriate terms"],
          ["Fiqh", "Purification", "Describe taharah, wudhu and situations that require ghusl in outline"],
          ["Sirah", "Life before prophethood", "Describe Arabia before Islam and the birth and youth of the Prophet"],
          ["Akhlaq", "Moral values", "Apply selected virtues in school life"]
        ]),
        2: T([
          ["Quran", "Selected passages", "Read selected passages and explain their teachings"],
          ["Swalah", "Swalah", "Describe the types of swalah and conditions for valid prayer"],
          ["Zakat", "Zakat and sadaqah", "Distinguish zakat from sadaqah and state those who may receive zakat"],
          ["Sirah", "The Makkan period", "Describe the call, opposition and patience of the early Muslims"],
          ["History", "The rightly guided caliphs", "Outline the leadership of Abu Bakr and Umar"],
          ["Character", "Duties to parents and neighbours", "Explain Islamic teaching on parents, neighbours and the vulnerable"]
        ]),
        3: T([
          ["Sawm", "Fasting", "Explain the rules and benefits of sawm"],
          ["Hajj", "Hajj and umrah", "Describe the main rites of Hajj"],
          ["Sirah", "The Madinan period", "Describe the Hijrah and the establishment of the community in Madinah"],
          ["History", "Caliphs Uthman and Ali", "Outline the challenges and contributions of their caliphates"],
          ["Muamalat", "Trade and contracts", "Explain honesty, riba and fair contracts in simple terms"],
          ["Family", "Family life", "Describe rights and duties in the family with respect"]
        ]),
        4: T([
          ["Quran", "Revision of selected surahs", "Revise recitation, translation and lessons of the set passages"],
          ["Hadith", "Revision of selected hadith", "Apply selected hadith to contemporary life"],
          ["Fiqh", "Revision of ibadat", "Revise the pillars of Islam with conditions and common errors"],
          ["History", "Islam in East Africa", "Describe the coming and growth of Islam on the East African coast"],
          ["Ethics", "Contemporary issues", "Discuss an Islamic perspective on a selected social issue"],
          ["Revision", "KCSE IRE revision", "Answer structured questions with evidence from Quran or Hadith"]
        ])
      }
    },
    hre: {
      upper: T([
        ["Faith", "Belief in God", "Talk about God in Hindu teaching with respect"],
        ["Scripture", "A simple story", "Retell a story from Hindu scripture and its lesson"],
        ["Values", "Dharma", "Practise truthfulness, respect and care"],
        ["Worship", "Places of worship", "Describe respectful behaviour in a place of worship"],
        ["Festivals", "A festival", "Explain the meaning of a Hindu festival celebrated in Kenya"],
        ["Care", "Care for life", "Show kindness to people, animals and the environment"]
      ]),
      forms: {
        1: T([
          ["Introduction", "Introduction to Hindu Religious Education", "Explain the place of Hindu faith in Kenya"],
          ["Scriptures", "Hindu scriptures", "Name major scriptures and how they guide life"],
          ["Beliefs", "Basic beliefs", "Explain dharma, karma and the idea of many paths of worship with respect"],
          ["Worship", "Worship at home and in the mandir", "Describe daily worship and respectful conduct"],
          ["Values", "Moral values", "Apply truth, non-violence and respect at school"],
          ["Festivals", "Festivals", "Explain the meaning of a selected festival"]
        ]),
        2: T([
          ["Attributes", "Attributes of God", "Describe selected attributes of God in Hindu teaching"],
          ["Yoga", "Paths of yoga", "Explain the idea of different spiritual paths in simple terms"],
          ["Scriptures", "Selected teachings", "Discuss a selected teaching and its application"],
          ["Samskaras", "Rites of passage", "Describe a rite of passage and its meaning"],
          ["Society", "The family", "Explain duties in the family"],
          ["Environment", "Respect for nature", "Relate Hindu teaching to care of the environment"]
        ]),
        3: T([
          ["Ethics", "Hindu ethics", "Apply yamas and niyamas to daily choices"],
          ["Society", "Hindus in East Africa", "Describe the contribution of the Hindu community in Kenya"],
          ["Service", "Seva", "Plan an act of service"],
          ["Scriptures", "Epics", "Retell an episode from the Ramayana or Mahabharata and its lesson"],
          ["Leadership", "Exemplary lives", "Describe the example of a Hindu figure studied in class"],
          ["Interfaith", "Living with others", "Explain respect among people of different faiths"]
        ]),
        4: T([
          ["Philosophy", "Selected philosophical ideas", "Explain a selected idea such as the aims of life"],
          ["Ethics", "Contemporary life", "Discuss a Hindu response to a modern social issue"],
          ["Worship", "Festivals and pilgrimage", "Explain the meaning of pilgrimage and a major festival"],
          ["Revision", "Scripture revision", "Revise set texts using class notes"],
          ["Values", "Character and career", "Relate Hindu values to study and work"],
          ["Revision", "KCSE HRE revision", "Answer structured questions with accurate religious language"]
        ])
      }
    },
    agriculture: {
      upper: T([
        ["Soil", "Soil and compost", "Prepare compost and explain how soil supports crops"],
        ["Crops", "A food crop", "Plant, weed and record the growth of a food crop"],
        ["Animals", "Domestic animals", "Describe the needs of a domestic animal kept locally"],
        ["Water", "Water conservation", "Practise a simple water-saving method in the garden"],
        ["Tools", "Farm tools", "Name tools, use them safely and clean them after work"],
        ["Food", "From garden to table", "Explain how a harvested crop becomes a meal"]
      ]),
      junior: T([
        ["Soil", "Soil fertility", "Test and improve soil using organic methods"],
        ["Crops", "Crop production", "Grow a crop through land preparation, planting, care and harvest"],
        ["Livestock", "Livestock husbandry", "Describe housing, feeding and health of a selected animal"],
        ["Tools", "Tools and safety", "Maintain tools and follow farm safety rules"],
        ["Agribusiness", "Records and marketing", "Keep simple records and price a farm product"],
        ["Conservation", "Sustainable farming", "Apply soil, water and biodiversity conservation"]
      ]),
      senior: T([
        ["Production", "Crop enterprise", "Plan a crop enterprise from inputs to market"],
        ["Livestock", "Livestock enterprise", "Plan feeding, health and housing for a livestock enterprise"],
        ["Soil and water", "Conservation agriculture", "Apply conservation methods and justify them"],
        ["Protection", "Pests and diseases", "Identify a pest or disease and choose a safe control"],
        ["Business", "Farm records and finance", "Prepare a simple gross margin and a cash record"],
        ["Innovation", "Value addition", "Propose a value-added product from a local raw material"]
      ]),
      forms: {
        1: T([
          ["Introduction", "Introduction to Agriculture", "Explain the importance of agriculture to Kenya"],
          ["Factors", "Factors influencing agriculture", "Describe human and natural factors that influence farming"],
          ["Tools", "Farm tools and equipment", "Identify tools and practise their care and safe use"],
          ["Crops", "Crop production I", "Prepare a seedbed and establish a crop"],
          ["Livestock", "Livestock production I", "Describe breeds and the basic needs of livestock"],
          ["Soil", "Soil constituents", "Describe soil constituents and take a soil sample"]
        ]),
        2: T([
          ["Soil", "Soil fertility", "Explain how organic and inorganic manures are used"],
          ["Crops", "Crop production II", "Carry out crop management practices"],
          ["Livestock", "Livestock production II", "Describe rearing practices for a selected animal"],
          ["Water", "Water supply and irrigation", "Explain sources of water and a simple irrigation method"],
          ["Farm structures", "Farm structures", "Describe a farm structure and its maintenance"],
          ["Records", "Agricultural economics I", "Keep basic farm records"]
        ]),
        3: T([
          ["Crops", "Crop production III", "Explain field practices for a named cash or food crop"],
          ["Livestock", "Livestock production III", "Describe parasite and disease control"],
          ["Soil", "Soil and water conservation", "Apply conservation structures in outline"],
          ["Farm power", "Farm power and machinery", "Describe sources of farm power and safety"],
          ["Economics", "Agricultural economics II", "Prepare a simple budget and explain marketing"],
          ["Agroforestry", "Agroforestry", "Explain the benefits of trees on the farm"]
        ]),
        4: T([
          ["Crops", "Crop production IV", "Revise production of major crops and related accounts"],
          ["Livestock", "Livestock production IV", "Revise selected livestock enterprises"],
          ["Economics", "Farm accounts", "Prepare a profit and loss account and a balance sheet in simple form"],
          ["Marketing", "Agricultural marketing", "Explain marketing functions and challenges"],
          ["Settlement", "Land tenure and settlement", "Describe land tenure systems in Kenya"],
          ["Revision", "KCSE Agriculture revision", "Answer structured questions with practical examples"]
        ])
      }
    },
    business: {
      junior: T([
        ["Enterprise", "Needs, wants and goods", "Distinguish needs from wants and goods from services"],
        ["Business", "Starting a simple business", "Describe a simple school or home business idea"],
        ["Money", "Money and records", "Keep a cash record and explain saving"],
        ["Trade", "Buying and selling", "Role-play an honest sale and issue a simple receipt"],
        ["Consumer", "Wise buying", "Compare prices and quality before buying"],
        ["Communication", "Business communication", "Write a short business message"]
      ]),
      senior: T([
        ["Entrepreneurship", "Opportunity", "Identify a business opportunity in the locality"],
        ["Planning", "A simple business plan", "Prepare a one-page plan with costs and customers"],
        ["Records", "Books of original entry", "Record cash and credit transactions"],
        ["Finance", "Sources of finance", "Compare personal savings, loans and group funding"],
        ["Marketing", "Marketing mix", "Apply product, price, place and promotion to a case"],
        ["Ethics", "Business ethics", "Explain honesty, tax and fair treatment of customers"]
      ]),
      forms: {
        1: T([
          ["Introduction", "Introduction to Business Studies", "Explain the purpose of business activity"],
          ["Enterprise", "Entrepreneurship", "Describe characteristics of an entrepreneur"],
          ["Business", "Forms of business units", "Distinguish sole proprietorship, partnership and companies in outline"],
          ["Office", "The office", "Describe office functions, layout and equipment"],
          ["Communication", "Business communication", "Choose a suitable means of communication"],
          ["Home trade", "Home trade", "Explain the role of retailers and wholesalers"]
        ]),
        2: T([
          ["Documents", "Trade documents", "Prepare an inquiry, order, invoice and receipt"],
          ["Payments", "Means of payment", "Compare cash, cheque, mobile money and electronic transfer"],
          ["Finance", "Source of business capital", "Explain personal, borrowed and group sources of capital"],
          ["Ledger", "The ledger", "Post simple cash transactions to ledger accounts"],
          ["Demand", "Demand and supply", "Explain factors that influence demand and supply"],
          ["Transport", "Transport", "Choose a means of transport for a given product"]
        ]),
        3: T([
          ["Accounts", "Trial balance and simple statements", "Extract a trial balance from ledger balances"],
          ["Warehousing", "Warehousing", "Explain the functions of a warehouse"],
          ["Insurance", "Insurance", "Explain pooling of risks and principles of insurance"],
          ["Product", "Product markets", "Describe product promotion and distribution"],
          ["Size", "Size and location of firms", "Explain factors that influence location"],
          ["Public", "Public finance", "Explain sources of government revenue and public expenditure"]
        ]),
        4: T([
          ["Accounts", "Final accounts", "Prepare a simple trading, profit and loss account and balance sheet"],
          ["Money", "Money and banking", "Explain functions of money and commercial banks"],
          ["Inflation", "Inflation", "Explain causes and effects of inflation"],
          ["International", "International trade", "Distinguish balance of trade from balance of payments in outline"],
          ["Development", "Economic development", "Explain indicators of development and the role of enterprise"],
          ["Revision", "KCSE Business Studies revision", "Answer case and structured questions with workings shown"]
        ])
      }
    },
    computer: {
      junior: T([
        ["Concepts", "Computer systems", "Identify hardware, software and the parts of a computer system"],
        ["Safety", "Health and data safety", "Follow posture, electrical and password safety"],
        ["Packages", "Word processing", "Create, edit and save a short document"],
        ["Packages", "Spreadsheets", "Enter data and use a simple formula"],
        ["Internet", "Online safety", "Search for information and recognise unsafe links"],
        ["Coding", "Sequences", "Write a short sequence of instructions to solve a task"]
      ]),
      senior: T([
        ["Systems", "Computer organisation", "Explain input, processing, storage and output"],
        ["Applications", "Productivity tools", "Produce a document, a spreadsheet and a short presentation"],
        ["Data", "Data and files", "Organise files and explain backup"],
        ["Networks", "Networks and the internet", "Describe a network and practise responsible online behaviour"],
        ["Programming", "Problem solving", "Break a problem into steps and express them as a simple program"],
        ["Impact", "Computing and society", "Discuss opportunities and risks of computing in Kenya"]
      ]),
      forms: {
        1: T([
          ["Introduction", "Introduction to computers", "Describe the generations and classification of computers in outline"],
          ["Hardware", "Computer hardware", "Identify input, output, processing and storage devices"],
          ["Software", "Computer software", "Distinguish system software from application software"],
          ["Operating", "Operating systems", "Perform basic file management"],
          ["Word", "Word processing", "Format a document with headings, lists and a table"],
          ["Safety", "Computer laboratory safety", "Follow laboratory rules and care of equipment"]
        ]),
        2: T([
          ["Spreadsheets", "Spreadsheets", "Use formulas, functions and a chart"],
          ["Databases", "Databases", "Create a table, enter records and run a simple query"],
          ["Desktop", "Desktop publishing", "Produce a publication with text and a graphic"],
          ["Internet", "Internet and email", "Use a browser and email responsibly"],
          ["Data", "Data security", "Explain passwords, malware and backup"],
          ["Careers", "Computer careers", "Describe careers that use computing skills"]
        ]),
        3: T([
          ["Programming", "Programming concepts", "Use variables, sequence, selection and iteration"],
          ["Data", "Data representation", "Explain binary, units of storage and simple coding of data"],
          ["Systems", "System development", "Describe the stages of developing a simple system"],
          ["Networks", "Data communication", "Describe network devices and transmission media"],
          ["Impact", "ICT and society", "Discuss the effects of ICT on work, learning and privacy"],
          ["Web", "Introduction to websites", "Describe the parts of a web page and good design"]
        ]),
        4: T([
          ["Programming", "Program development", "Write and test a program for a stated problem"],
          ["Systems", "System implementation", "Explain testing, documentation and maintenance"],
          ["Networks", "Network services", "Describe internet services and network security"],
          ["Impact", "Emerging trends", "Discuss a current computing trend and its effect in Kenya"],
          ["Project", "Project documentation", "Present a small project with a user guide"],
          ["Revision", "KCSE Computer Studies revision", "Revise theory and practical papers with timed tasks"]
        ])
      }
    },
    pretechnical: {
      junior: T([
        ["Safety", "Safety and first aid", "Follow workshop safety and describe basic first aid"],
        ["Drawing", "Technical drawing", "Draw simple shapes using drawing instruments"],
        ["Materials", "Materials", "Classify wood, metal and plastic and suggest uses"],
        ["Tools", "Hand tools", "Name, use and care for common hand tools"],
        ["Energy", "Energy resources", "Compare sources of energy used in the home and in workshops"],
        ["Machines", "Simple machines", "Explain how a lever, pulley or inclined plane makes work easier"],
        ["ICT", "Digital tools for design", "Use a digital tool to present a simple design"],
        ["Enterprise", "A mini project", "Plan a small product, list materials and estimate cost"]
      ])
    },
    homescience: {
      junior: T([
        ["Safety", "Safety in the home", "Prevent common accidents in the kitchen and the home"],
        ["Foods", "Food and nutrition", "Plan a balanced meal from local foods"],
        ["Cookery", "Basic cookery", "Prepare a simple dish and observe hygiene"],
        ["Clothing", "Clothes care", "Wash, dry and store clothes correctly"],
        ["Needlework", "Stitches", "Work basic stitches and mend a small tear"],
        ["Consumer", "Consumer awareness", "Read a label and make a wise purchase"]
      ]),
      senior: T([
        ["Nutrition", "Meal planning", "Plan meals for a stated group and justify the choices"],
        ["Foods", "Food preparation", "Prepare a dish and evaluate texture, taste and hygiene"],
        ["Clothing", "Garment construction", "Follow a simple pattern and finish a seam"],
        ["Home", "Home management", "Prepare a household work plan and a budget"],
        ["Health", "Maternal and child care", "Describe care practices studied in class with respect"],
        ["Consumer", "Consumer education", "Compare products and explain consumer rights"]
      ]),
      forms: {
        1: T([
          ["Introduction", "Introduction to Home Science", "Explain the areas of Home Science and their value"],
          ["Safety", "Safety and first aid", "Prevent accidents and describe simple first aid"],
          ["Hygiene", "Personal hygiene", "Practise routines that prevent illness"],
          ["Housing", "The family house", "Describe housing needs and cleanliness"],
          ["Foods", "Food nutrients", "Classify foods and plan a balanced plate"],
          ["Textiles", "Textile fibres", "Identify natural and synthetic fibres"]
        ]),
        2: T([
          ["Cookery", "Methods of cooking", "Use a suitable method and explain the change in food"],
          ["Equipment", "Kitchen equipment", "Choose, use and care for equipment"],
          ["Laundry", "Laundry work", "Wash and finish a named article"],
          ["Sewing", "Sewing tools and stitches", "Use a seam and a neatening stitch"],
          ["Child", "Child care", "Describe the needs of a young child"],
          ["Consumer", "Consumer education", "Read labels and advertisements critically"]
        ]),
        3: T([
          ["Nutrition", "Meal management", "Plan, cost and prepare a meal"],
          ["Clothing", "Garment construction", "Lay a pattern and construct part of a garment"],
          ["Home", "Home management", "Prepare a time plan and a family budget"],
          ["Health", "Communicable diseases", "Explain prevention of selected diseases"],
          ["Consumer", "Wise buying", "Compare quality, price and need"],
          ["Furnishing", "Soft furnishings", "Describe a soft furnishing article and its care"]
        ]),
        4: T([
          ["Nutrition", "Special diets", "Adjust a meal for a stated dietary need using class guidelines"],
          ["Clothing", "Advanced construction", "Finish a garment process studied in class"],
          ["Mother", "Maternal care", "Outline care during pregnancy using respectful, age-appropriate language"],
          ["Consumer", "Consumer protection", "Explain consumer rights and redress"],
          ["Project", "Home Science project", "Present a project with cost and evaluation"],
          ["Revision", "KCSE Home Science revision", "Revise theory and practical planning questions"]
        ])
      }
    },
    csl: {
      senior: T([
        ["Service", "Identifying a need", "Identify a real need in the school or neighbourhood"],
        ["Planning", "A service plan", "Plan goals, tasks, time and safety for a service activity"],
        ["Action", "Carrying out service", "Take part in a service activity and record what was done"],
        ["Skills", "Working with people", "Listen, share tasks and show respect during service"],
        ["Reflection", "Learning from service", "Reflect on what changed and what could improve"],
        ["Showcase", "Reporting service", "Present the service story to the class or community"]
      ])
    },
    phe: {
      upper: T([
        ["Fitness", "Healthy habits", "Describe exercise, rest and hygiene for good health"],
        ["Skills", "Locomotor skills", "Practise running, jumping and landing safely"],
        ["Games", "Ball games", "Send, receive and keep the rules of a simple game"],
        ["Athletics", "Track and field basics", "Practise a start, a jump or a throw"],
        ["Safety", "Safe play", "Warm up, use space safely and report an injury"],
        ["Values", "Fair play", "Show teamwork and respect for officials"]
      ]),
      junior: T([
        ["Fitness", "Components of fitness", "Test a fitness component and set a personal goal"],
        ["Games", "Invasion or net games", "Apply a tactic and the rules of a named game"],
        ["Athletics", "Techniques", "Refine a run, jump or throw and measure the result"],
        ["Gymnastics", "Floor skills", "Perform a short sequence with control"],
        ["Health", "Lifestyle diseases", "Relate physical activity to the prevention of lifestyle disease"],
        ["Leadership", "Officiating", "Officiate a class game fairly"]
      ]),
      senior: T([
        ["Fitness", "Personal fitness plan", "Design and follow a short fitness plan"],
        ["Skills", "Sport skills", "Perform and analyse a skill in a chosen sport"],
        ["Health", "Wellbeing", "Connect exercise, nutrition, sleep and mental wellbeing"],
        ["Leadership", "Coaching and officiating", "Lead a warm-up and apply rules"],
        ["Safety", "Injury prevention", "Use safe progressions and basic first response"],
        ["Pathways", "Sport and recreation pathways", "Describe study and career options in sport and health"]
      ])
    },
    ict: {
      senior: T([
        ["Devices", "Using devices", "Set up and care for a digital device"],
        ["Files", "Files and folders", "Organise, name and back up files"],
        ["Documents", "Creating content", "Produce a short document or slides for learning"],
        ["Data", "Spreadsheets for life", "Enter data and use a simple calculation"],
        ["Online", "Digital citizenship", "Search, cite and behave safely and kindly online"],
        ["Tools", "Choosing a tool", "Choose a suitable digital tool for a school task"]
      ])
    },
    literature: {
      senior: T([
        ["Oral literature", "Narratives and songs", "Analyse features and functions of an oral form"],
        ["Poetry", "Reading poetry", "Comment on persona, imagery, tone and message"],
        ["Prose", "The novel and short story", "Discuss character, plot and style with evidence"],
        ["Drama", "Reading and performance", "Interpret a scene and performance choices"],
        ["Language", "Literary language", "Explain how diction and figures of speech shape meaning"],
        ["Criticism", "A critical response", "Write a critical paragraph with a clear claim and evidence"]
      ])
    },
    fasihi: {
      senior: T([
        ["Fasihi simulizi", "Tanzu simulizi", "Kuchambua sifa na dhima za tanzu simulizi"],
        ["Ushairi", "Uchambuzi wa shairi", "Kujadili dhamira, lugha na muundo wa shairi"],
        ["Fasihi andishi", "Riwaya na hadithi fupi", "Kujadili wahusika, ploti na mtindo kwa ushahidi"],
        ["Tamthilia", "Tamthilia", "Kuchambua mgogoro na ujumbe wa tamthilia"],
        ["Lugha", "Lugha ya kifasihi", "Kueleza jinsi tamathali za semi zinavyojenga maana"],
        ["Uhakiki", "Uhakiki", "Kuandika aya ya uhakiki yenye dai na ushahidi"]
      ])
    },
    foreign: {
      upper: T([
        ["Greetings", "Greetings and courtesy", "Greet, thank and take leave in {language}"],
        ["Identity", "Myself and my family", "Give a simple introduction and name family members"],
        ["School", "Classroom language", "Use classroom objects and simple instructions"],
        ["Numbers", "Numbers and time", "Say numbers, days and the time"],
        ["Food", "Food and the market", "Name foods and ask for a price"],
        ["Culture", "A cultural note", "Compare a custom in the language community with life in Kenya"]
      ])
    },
    indigenous: {
      lower: T([
        ["Listening", "Stories and instructions", "Listen to a short text in the language and respond"],
        ["Speaking", "Greetings and family", "Greet elders and talk about the family with respect"],
        ["Vocabulary", "Home and school", "Name objects and actions in the language"],
        ["Oral tradition", "A story or song", "Retell a short traditional story or sing a verse"],
        ["Reading", "Words and sentences", "Read familiar words and a simple sentence"],
        ["Writing", "Words", "Write familiar words legibly"]
      ]),
      upper: T([
        ["Oral skills", "Conversation", "Hold a short respectful conversation"],
        ["Reading", "A short text", "Read a short text and answer questions"],
        ["Writing", "A paragraph", "Write a short paragraph about home or school"],
        ["Grammar", "Sentence building", "Build correct simple sentences"],
        ["Culture", "Customs and values", "Describe a custom and the value it teaches"],
        ["Literature", "Oral literature", "Explain the message of a proverb, story or song"]
      ])
    },
    sports: {
      senior: T([
        ["Safety", "Safe participation", "Warm up, use equipment safely and follow a code of conduct"],
        ["Skills", "Technical skills", "Practise and correct a skill in a chosen sport or recreation"],
        ["Fitness", "Conditioning", "Plan fitness work matched to the activity"],
        ["Rules", "Rules and tactics", "Apply rules and a simple tactic in a conditioned game"],
        ["Leadership", "Leading activity", "Lead a small group session"],
        ["Pathways", "Careers in sport", "Describe roles such as coach, official, journalist and therapist"]
      ])
    }
  };

  var SPECIALS = {
    aviation: T([
      ["Safety", "Aviation safety", "Follow basic safety rules around aircraft, tools and the airfield environment"],
      ["Aircraft", "Aircraft familiarisation", "Name the main parts of an aircraft and their purposes"],
      ["Flight", "Ideas of flight", "Explain lift, weight, thrust and drag in simple terms"],
      ["Navigation", "Direction and maps", "Use direction, a simple chart and the idea of a route"],
      ["Weather", "Weather for flyers", "Relate wind, cloud and visibility to safe decisions"],
      ["Careers", "Aviation pathways", "Describe training paths and careers in Kenyan aviation"]
    ]),
    building: T([
      ["Safety", "Site safety", "Follow site safety rules and use protective gear"],
      ["Drawing", "Building drawings", "Read a simple plan, elevation and measurement"],
      ["Materials", "Building materials", "Compare local building materials and their care"],
      ["Tools", "Site tools", "Use and maintain common building tools"],
      ["Practice", "Walls and finishes", "Describe a basic wall, joint or finish studied in class"],
      ["Project", "A small build task", "Plan materials, steps and cost for a small task"]
    ]),
    electricity: T([
      ["Safety", "Electrical safety", "Follow rules that prevent shock, fire and damage"],
      ["Circuits", "Simple circuits", "Build a simple circuit and explain current, voltage and resistance in words"],
      ["Tools", "Electrical tools", "Identify tools and measuring instruments and use them safely"],
      ["Installation", "Domestic installation ideas", "Describe a socket, switch, fuse and earthing in outline"],
      ["Maintenance", "Fault finding", "Use a careful checklist to look for a simple fault"],
      ["Project", "A safe project", "Plan a low-voltage project and record the test"]
    ]),
    metalwork: T([
      ["Safety", "Workshop safety", "Follow metalwork safety and care of the workshop"],
      ["Materials", "Metals", "Classify common metals and their uses"],
      ["Measuring", "Marking out", "Mark out a piece accurately"],
      ["Cutting", "Cutting and joining", "Describe cutting, filing and a joining method"],
      ["Finishing", "Finishing", "Prepare a surface and apply a suitable finish"],
      ["Project", "A metal project", "Plan and evaluate a small metalwork project"]
    ]),
    woodwork: T([
      ["Safety", "Workshop safety", "Follow woodwork safety rules"],
      ["Timber", "Timber", "Identify timber, defects and seasoning in outline"],
      ["Tools", "Hand tools", "Use measuring, sawing and planning tools safely"],
      ["Joints", "Joints", "Mark out and describe a basic wood joint"],
      ["Finishing", "Surface finish", "Prepare and finish a wooden surface"],
      ["Project", "A wood project", "Plan materials and steps for a small project"]
    ]),
    power: T([
      ["Safety", "Workshop safety", "Follow safety rules for tools, fuels and moving parts"],
      ["Engines", "Engine basics", "Name the main parts of a small engine and their jobs"],
      ["Tools", "Mechanic's tools", "Identify tools and use them correctly"],
      ["Maintenance", "Routine maintenance", "Describe service checks such as oil, filters and fasteners"],
      ["Systems", "Fuel and ignition ideas", "Explain the path of fuel and the idea of ignition in simple terms"],
      ["Project", "A maintenance task", "Plan and record a supervised maintenance task"]
    ]),
    marine: T([
      ["Safety", "Safety near water", "Follow safety rules for boats, weather and the shore"],
      ["Resources", "Fisheries resources", "Describe a local fishery and why it must be conserved"],
      ["Handling", "Fish handling", "Explain hygienic handling from catch to market"],
      ["Boats", "Boat basics", "Name parts of a small boat and basic care"],
      ["Environment", "Aquatic conservation", "Propose a practice that protects fish stocks and water"],
      ["Enterprise", "A fisheries enterprise", "Outline costs and customers for a small fisheries product"]
    ]),
    media: T([
      ["Literacy", "Reading media", "Identify purpose, audience and message in a media text"],
      ["Planning", "A media plan", "Plan a short story, shot list or article"],
      ["Production", "Image and sound", "Capture or describe image and sound with care for consent"],
      ["Ethics", "Media ethics", "Apply honesty, consent and respect in a media task"],
      ["Audience", "Reaching an audience", "Match a message to a school or community audience"],
      ["Publishing", "Sharing work", "Prepare a media piece for responsible sharing"]
    ]),
    music: T([
      ["Rhythm", "Beat and rhythm", "Keep a beat and clap a written or spoken rhythm"],
      ["Melody", "Melody", "Sing or play a short melody in tune"],
      ["Songs", "Kenyan songs", "Perform a Kenyan song and explain its occasion"],
      ["Instruments", "Instruments", "Classify instruments and care for one of them"],
      ["Dance", "Dance and music", "Match movement to music in a short phrase"],
      ["Performance", "Class performance", "Rehearse and present a short item"]
    ]),
    theatre: T([
      ["Voice", "Voice and speech", "Use breath, pace and clarity in a short text"],
      ["Movement", "Stage movement", "Use space, gesture and still moments"],
      ["Story", "Building a scene", "Shape a scene with a beginning, conflict and end"],
      ["Performance", "Rehearsal", "Rehearse a scene and respond to notes"],
      ["Film", "Film basics", "Describe shot, frame and a simple storyboard"],
      ["Audience", "Sharing work", "Present work and reflect on audience response"]
    ]),
    fineart: T([
      ["Elements", "Elements of art", "Use line, tone, shape and space with intention"],
      ["Drawing", "Drawing", "Draw from observation and correct proportion"],
      ["Colour", "Colour", "Mix colour and explain a colour choice"],
      ["Design", "Design process", "Research, sketch and refine a design"],
      ["Craft", "Local crafts", "Study a Kenyan craft and practise a related technique"],
      ["Exhibition", "Presenting work", "Mount work and write a short artist statement"]
    ]),
    drawing: T([
      ["Instruments", "Drawing instruments", "Use drawing instruments accurately"],
      ["Lines", "Lines and lettering", "Draw line types and neat lettering"],
      ["Geometry", "Geometric construction", "Construct angles, polygons and tangents studied in class"],
      ["Orthographic", "Orthographic projection", "Draw simple orthographic views"],
      ["Pictorial", "Pictorial drawing", "Draw a simple isometric or oblique view"],
      ["Design", "A design drawing", "Produce a measured drawing for a small object"]
    ])
  };

  function itcLevel(id) {
    return LEVELS.filter(function (level) { return level.id === id; })[0] || null;
  }

  function itcSubjects(levelId) {
    var level = itcLevel(levelId);
    if (!level) return [];
    return SUBJECTS[level.group].slice();
  }

  function itcPreviousLevel(id) {
    var level = itcLevel(id);
    if (!level) return null;
    var same = LEVELS.filter(function (item) { return item.track === level.track; });
    var index = -1;
    same.forEach(function (item, i) { if (item.id === id) index = i; });
    return index > 0 ? same[index - 1] : null;
  }

  function itcBridgeChoices(levelId) {
    var level = itcLevel(levelId);
    if (!level) return [];
    var index = LEVELS.indexOf(level);
    var earlier = LEVELS.filter(function (item, i) {
      return item.track === level.track && i < index;
    }).reverse();
    if (level.id === "f1") earlier.push(itcLevel("g9"));
    return earlier;
  }

  function itcBankKey(subject, level) {
    var s = subject.toLowerCase();
    if (level.group === "pre" && s.indexOf("language") >= 0) return "pre-language";
    if (level.group === "pre" && s.indexOf("mathematical") >= 0) return "pre-math";
    if (s.indexOf("environmental") >= 0) return "environment";
    if (s.indexOf("hygiene") >= 0) return "hygiene";
    if (s.indexOf("psychomotor") >= 0 || s.indexOf("movement and creative") >= 0 || s.indexOf("creative arts") >= 0) return "creative";
    if (s.indexOf("essential mathematics") >= 0) return "essential-math";
    if (s.indexOf("mathematics") >= 0 || s.indexOf("mathematical") >= 0) return "math";
    if (s.indexOf("fasihi") >= 0) return "fasihi";
    if (s.indexOf("kiswahili") >= 0) return "kiswahili";
    if (s.indexOf("literature") >= 0) return "literature";
    if (s.indexOf("english") >= 0 || s.indexOf("language activities") >= 0) return "english";
    if (s.indexOf("sign language") >= 0 || s.indexOf("indigenous") >= 0) return "indigenous";
    if (s.indexOf("french") >= 0 || s.indexOf("german") >= 0 || s.indexOf("arabic") >= 0 || s.indexOf("mandarin") >= 0 || s.indexOf("chinese") >= 0) return "foreign";
    if (s.indexOf("integrated science") >= 0 || s.indexOf("science and technology") >= 0 || s.indexOf("general science") >= 0) return "science";
    if (s.indexOf("biology") >= 0) return "biology";
    if (s.indexOf("chemistry") >= 0) return "chemistry";
    if (s.indexOf("physics") >= 0) return "physics";
    if (s.indexOf("history") >= 0) return "history";
    if (s.indexOf("geography") >= 0) return "geography";
    if (s.indexOf("islamic") >= 0) return "ire";
    if (s.indexOf("hindu") >= 0) return "hre";
    if (s.indexOf("christian") >= 0 || s.indexOf("religious") >= 0) return "cre";
    if (s.indexOf("agriculture") >= 0) return "agriculture";
    if (s.indexOf("business") >= 0) return "business";
    if (s.indexOf("computer") >= 0) return "computer";
    if (s.indexOf("pre-technical") >= 0) return "pretechnical";
    if (s.indexOf("home science") >= 0) return "homescience";
    if (s.indexOf("community service") >= 0) return "csl";
    if (s.indexOf("physical") >= 0 || s === "physical education") return "phe";
    if (s.indexOf("ict") >= 0) return "ict";
    if (s.indexOf("aviation") >= 0) return "aviation";
    if (s.indexOf("building") >= 0) return "building";
    if (s.indexOf("electricity") >= 0) return "electricity";
    if (s.indexOf("metalwork") >= 0) return "metalwork";
    if (s.indexOf("woodwork") >= 0) return "woodwork";
    if (s.indexOf("power mechanics") >= 0) return "power";
    if (s.indexOf("marine") >= 0 || s.indexOf("fisheries") >= 0) return "marine";
    if (s.indexOf("media") >= 0) return "media";
    if (s.indexOf("music") >= 0) return "music";
    if (s.indexOf("theatre") >= 0 || s.indexOf("film") >= 0) return "theatre";
    if (s.indexOf("fine art") >= 0 || s.indexOf("art and design") >= 0) return "fineart";
    if (s.indexOf("drawing") >= 0) return "drawing";
    if (s.indexOf("sports") >= 0) return "sports";
    if (s.indexOf("performing") >= 0 || s.indexOf("visual arts") >= 0) return "creative";
    return "generic";
  }

  function genericTopics(subject, level) {
    var grade = level ? level.label : "this class";
    return T([
      ["Foundations", "Introduction to " + subject, "Explain what " + subject + " is for " + grade + " and why it matters in Kenya"],
      ["Safety", "Safe practice in " + subject, "Follow the safety rules expected of " + grade + " while learning " + subject],
      ["Skills", "Skills for " + grade, "Practise the " + grade + " skills in " + subject + " with the right amount of support"],
      ["Tools", "Tools and materials", "Identify and care for the tools " + grade + " uses in " + subject],
      ["Application", subject + " in the community", "Apply " + subject + " to a task suited to " + grade],
      ["Communication", "Sharing work", "Present " + grade + " work using the language of " + subject],
      ["Project", "Class project", "Plan and complete a short " + grade + " project in " + subject],
      ["Review", "Progress review", "Check " + grade + " progress and set the next goal in " + subject]
    ]);
  }

  function pickList(bank, level) {
    if (!bank) return { list: null, exact: false };
    if (level.group === "kcse" && bank.forms && bank.forms[level.number]) {
      return { list: bank.forms[level.number].slice(), single: true };
    }
    if (level.group === "senior" && bank.forms && !bank.senior) {
      var formNo = level.number === 10 ? 1 : level.number === 11 ? 2 : 3;
      if (bank.forms[formNo]) return { list: bank.forms[formNo].slice(), single: true };
    }
    var order = ["pre", "lower", "upper", "junior", "senior"];
    var start = order.indexOf(level.group);
    if (start < 0) start = order.length - 1;
    var i;
    for (i = start; i >= 0; i--) {
      if (bank[order[i]]) return { list: bank[order[i]].slice(), single: false };
    }
    return { list: null, single: false };
  }

  function sliceForClass(topics, level, exactForm) {
    if (exactForm || !topics || topics.length < 5) return topics;
    var mates = {
      pre: ["pp1", "pp2"],
      lower: ["g1", "g2", "g3"],
      upper: ["g4", "g5", "g6"],
      junior: ["g7", "g8", "g9"],
      senior: ["g10", "g11", "g12"],
      kcse: ["f1", "f2", "f3", "f4"]
    }[level.group] || [];
    var slot = mates.indexOf(level.id);
    if (slot < 0 || mates.length < 2) return topics;
    var size = Math.max(4, Math.round(topics.length * 0.6));
    var start = Math.round((topics.length - size) * (slot / (mates.length - 1)));
    return topics.slice(start, start + size);
  }

  function flavour(topics, level) {
    var ranges = {
      pp1: "5", pp2: "10",
      g1: "100", g2: "1,000", g3: "10,000",
      g4: "100,000", g5: "1,000,000", g6: "1,000,000 and beyond"
    };
    var stage = {
      pp1: "PP1, with the teacher showing the step first",
      pp2: "PP2, with less help than in PP1",
      g1: "Grade 1, using objects, pictures and numbers up to 100",
      g2: "Grade 2, using numbers up to 1,000",
      g3: "Grade 3",
      g4: "Grade 4",
      g5: "Grade 5",
      g6: "Grade 6",
      g7: "Grade 7",
      g8: "Grade 8",
      g9: "Grade 9",
      g10: "Grade 10",
      g11: "Grade 11",
      g12: "Grade 12",
      f1: "Form 1",
      f2: "Form 2",
      f3: "Form 3",
      f4: "Form 4, to KCSE standard"
    }[level.id] || level.label;
    return topics.map(function (topic) {
      var focus = String(topic.focus || "").replace("{range}", ranges[level.id] || "the class range");
      focus = focus.replace(/\s+with adult support\.?$/i, "").replace(/\s+with growing independence\.?$/i, "");
      if (focus.toLowerCase().indexOf(level.label.toLowerCase()) < 0 && focus.indexOf("KCSE") < 0) {
        focus = focus.replace(/\.\s*$/, "") + " — for " + stage + ".";
      }
      return { strand: topic.strand, sub: topic.sub, focus: focus };
    });
  }

  function swahiliTopic(topic) {
    return /kusikiliza|kuzungumza|kusoma|sarufi|uandishi|fasihi|methali|insha|barua|ufahamu|nomino|vitenzi|ushairi|hadithi|nyimbo|mitihani|ufupisho/i.test((topic.strand || "") + " " + (topic.sub || ""));
  }

  function derivedSubstrands(topic) {
    var name = topic.sub || topic.strand || "This strand";
    var focus = topic.focus || ("Explain and practise " + name);
    if (swahiliTopic(topic)) {
      return [
        [name + " - maana", "Kueleza maana ya " + name + " na umuhimu wake katika darasa hili"],
        [name + " - mambo makuu", focus],
        [name + " - mazoezi", "Kufanya mazoezi ya " + name + " kwa jozi na kusahihisha kazi"],
        [name + " - matumizi", "Kutumia " + name + " nyumbani, shuleni au katika jamii"]
      ];
    }
    return [
      [name + " - meaning", "Explain what " + name + " means and why it is taught in this class"],
      [name + " - key ideas", focus],
      [name + " - practice", "Practise " + name + " and check the work"],
      [name + " - application", "Apply " + name + " at home, at school or in the community"]
    ];
  }

  var SUBSTRANDS = {
    "Introduction to Chemistry": [
      ["What chemistry is", "Explain what chemistry studies and name work that uses it"],
      ["Laboratory apparatus", "Identify common laboratory apparatus and state their uses"],
      ["Laboratory safety", "Follow laboratory safety rules and describe how to deal with a simple accident"],
      ["Scientific procedure", "State the steps of a simple scientific investigation"]
    ],
    "Simple classification of substances": [
      ["Elements, compounds and mixtures", "Distinguish elements, compounds and mixtures with local examples"],
      ["Filtration and evaporation", "Separate a mixture by filtration and by evaporation"],
      ["Distillation and chromatography", "Describe distillation and paper chromatography in outline"],
      ["Criteria of purity", "Use melting point and boiling point as simple tests of purity"]
    ],
    "Acids, bases and indicators": [
      ["Common acids and bases", "Name acids and bases used at home and in the laboratory"],
      ["Indicators", "Test acids and bases with plant and commercial indicators"],
      ["The pH scale", "Read a pH value and classify a solution as acidic, neutral or basic"],
      ["Uses of acids and bases", "State uses and simple precautions for acids and bases"]
    ],
    "Air and combustion": [
      ["Composition of air", "State the main gases in air and a test for oxygen"],
      ["Combustion", "Explain combustion and the conditions it needs"],
      ["Rusting", "State the conditions for rusting and a method of prevention"],
      ["Air pollution", "Name sources of air pollution and a way to reduce them"]
    ],
    "Water and hydrogen": [
      ["Sources and uses of water", "Identify sources of water and uses at home and school"],
      ["Water treatment", "Describe the main stages of treating water for drinking"],
      ["Preparation of hydrogen", "Describe a laboratory preparation of hydrogen"],
      ["Test for hydrogen", "Carry out the pop test and state a use of hydrogen"]
    ],
    "Particulate nature of matter": [
      ["Solids, liquids and gases", "Compare the properties of solids, liquids and gases"],
      ["Particle arrangement", "Describe how particles are arranged in the three states"],
      ["Change of state", "Explain melting, evaporation and condensation using particles"],
      ["Diffusion", "Explain diffusion with a simple classroom example"]
    ],
    "The atom and the periodic table": [
      ["Atomic structure", "State the charges and locations of protons, neutrons and electrons"],
      ["Atomic number and mass number", "Work out the number of each particle from the atomic and mass numbers"],
      ["The periodic table", "Locate a named element and state its group and period"],
      ["Electron arrangement", "Write the electron arrangement of the first twenty elements"]
    ],
    "Chemical families": [
      ["Alkali metals", "Describe the trend in reactivity of the alkali metals"],
      ["Halogens", "Compare the physical properties and reactivity of the halogens"],
      ["Noble gases", "Explain why the noble gases are unreactive"],
      ["Patterns in the table", "Use group and period trends to predict a simple property"]
    ],
    "Structure and bonding": [
      ["Ionic bonding", "Explain how an ionic bond forms and name an ionic compound"],
      ["Covalent bonding", "Draw a simple covalent molecule and state its properties"],
      ["Metallic bonding", "Explain electrical conductivity in metals using metallic bonding"],
      ["Structure and properties", "Relate bonding to melting point and conductivity"]
    ],
    "Salts": [
      ["Meaning of a salt", "Define a salt and name the acid it comes from"],
      ["Methods of preparation", "Choose a suitable method to prepare a named salt"],
      ["Solubility", "Use a solubility guide to decide whether a salt is soluble"],
      ["Crystallisation", "Describe how to obtain crystals from a salt solution"]
    ],
    "Effect of an electric current on substances": [
      ["Conductors and non-conductors", "Distinguish conductors from non-conductors with examples"],
      ["Electrolysis in outline", "Describe what happens at the electrodes in a simple case"],
      ["Products of electrolysis", "State the products of electrolysing a named molten or aqueous compound"],
      ["Uses of electrolysis", "State a use of electrolysis in industry or daily life"]
    ],
    "Carbon and its compounds": [
      ["Allotropes of carbon", "Compare diamond, graphite and charcoal"],
      ["Carbon dioxide", "Describe a laboratory preparation and the test for carbon dioxide"],
      ["Carbon cycle in outline", "Trace carbon through burning, respiration and photosynthesis"],
      ["Uses of carbon compounds", "State uses of carbon dioxide, charcoal and a carbonate"]
    ]
  };

  function expandSubstrands(list) {
    var out = [];
    (list || []).forEach(function (topic) {
      var rows = SUBSTRANDS[topic.sub] || derivedSubstrands(topic);
      rows.forEach(function (row) {
        out.push({ strand: topic.strand, sub: row[0], focus: row[1] });
      });
    });
    return out;
  }

  var topicCache = {};

  function itcTopicList(levelId, subject) {
    var key = levelId + "|" + subject;
    if (topicCache[key]) return topicCache[key];
    var level = itcLevel(levelId);
    var bankKey = itcBankKey(subject, level);
    var list = null;
    var exactForm = false;
    if (SPECIALS[bankKey]) list = SPECIALS[bankKey].slice();
    else if (bankKey === "foreign") {
      var foreign = pickList(BANKS.foreign, level);
      exactForm = !!foreign.single;
      list = (foreign.list || []).map(function (topic) {
        return {
          strand: topic.strand,
          sub: topic.sub,
          focus: topic.focus.replace("{language}", subject)
        };
      });
    } else if (BANKS[bankKey]) {
      var picked = pickList(BANKS[bankKey], level);
      exactForm = !!picked.single;
      list = picked.list;
    }
    if (!list || !list.length) list = genericTopics(subject, level);
    list = sliceForClass(list, level, exactForm);
    list = expandSubstrands(list);
    var result = flavour(list, level);
    topicCache[key] = result;
    return result;
  }

  function itcDefaultLessons(subject) {
    var s = subject.toLowerCase();
    if (/(english|kiswahili|mathematics|mathematical)/.test(s)) return 5;
    if (/(biology|chemistry|physics|integrated science|science and technology)/.test(s)) return 4;
    if (s.indexOf("community service") >= 0) return 3;
    if (s.indexOf("physical") >= 0 || s.indexOf("sports") >= 0) return 3;
    if (s.indexOf("ict") >= 0) return 2;
    return 4;
  }

  function itcTermDefaults(term) {
    var data = TERMS[String(term)] || TERMS["1"];
    return {
      start: data.start,
      end: data.end,
      breaks: data.breaks.map(function (item) {
        return { label: item.label, start: item.start, end: item.end };
      })
    };
  }

  root.itcLevels = LEVELS;
  root.itcBooks = BOOKS;
  root.itcHolidays = HOLIDAYS;
  root.itcExams = EXAMS;
  root.itcLevel = itcLevel;
  root.itcSubjects = itcSubjects;
  root.itcPreviousLevel = itcPreviousLevel;
  root.itcBridgeChoices = itcBridgeChoices;
  root.itcTopicList = itcTopicList;
  root.itcDefaultLessons = itcDefaultLessons;
  root.itcTermDefaults = itcTermDefaults;
  root.itcBankKey = itcBankKey;
})(typeof window !== "undefined" ? window : globalThis);
