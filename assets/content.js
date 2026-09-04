/* ==========================================================================
   髙橋研究室 サイトの中身
   --------------------------------------------------------------------------
   サイトの更新は、このファイルだけを編集します。
   他のファイル（style.css / site.js / orcid.js / *.html）は触りません。

   書き方のルール
     ・{ ja:"日本語", en:"English" } は両言語ぶんの文章です。
       片方を "" にすれば、その言語ではもう片方が表示されます。
     ・行末のカンマ , と、囲みの { } [ ] " " を消さないでください。
     ・日付は "YYYY-MM-DD" の形。並び順は自動です。

   ※ 研究内容・募集・お知らせの文章は下書きです。ご自身の言葉に直してください。
   ========================================================================== */

const CONTENT = {

  /* ------------------------------------------------------------------
     1. 表示の設定
     ------------------------------------------------------------------ */
  settings: {
    topNewsCount:  3,     // トップページに出すお知らせの件数
    topNewsMaxAge: 365,   // これより古いお知らせはトップに出さない（日数／0で無制限）
    defaultLang:   "ja"   // 最初に表示する言語（"ja" または "en"）
  },


  /* ------------------------------------------------------------------
     1-2. アクセス解析
     --------------------------------------------------------------------
     provider に入れる値と、そのとき id に入れるもの

       "none"         解析を入れない（初期値）
       "ga4"          Google Analytics 4 … id は "G-XXXXXXXXXX"
       "cloudflare"   Cloudflare Web Analytics … id はトークン
       "goatcounter"  GoatCounter … id は "https://○○.goatcounter.com/count"

     ga4 は Cookie を使うため、プライバシーポリシーの掲示と、
     EU圏からの訪問者への同意取得が実質的に必要になります。
     それ以外の3つは Cookie を使わないため、同意バナーは不要です。
     ------------------------------------------------------------------ */
  analytics: {
    provider:   "goatcounter",
    id:         "https://takahashimichio.goatcounter.com/count",
    respectDNT: true  // ブラウザが Do Not Track を送っていたら解析しない
  },


  /* ------------------------------------------------------------------
     2. 研究室の基本情報
     ------------------------------------------------------------------ */
  lab: {
    name: { ja:"髙橋研究室", en:"Takahashi Lab" },

    // ▼ 学系名（学校教育系・人間科学系など）が確定したら足してください
    //    例: ja:"金沢大学 人間社会研究域 学校教育系"
    //        en:"Faculty of Teacher Education, Institute of Human and Social Sciences, Kanazawa University"
    affiliation: {
      ja:"金沢大学 人間社会研究域",
      en:"Institute of Human and Social Sciences, Kanazawa University"
    },

    tagline: {
      ja:"子どものこころを、科学でとらえ、社会で支える。",
      en:"Understanding children's minds through science, and supporting them through society."
    },

    intro: {
      ja:"臨床発達心理学と学校心理学を軸に、子どものメンタルヘルスに関わる問題を研究しています。学校や地域の現場と協力しながら、支援につながる知見を積み上げることを目指しています。",
      en:"We work at the intersection of clinical developmental psychology and school psychology, studying the mental health of children and adolescents. We aim to produce findings that translate into support, working alongside schools and communities."
    },

    email:   "takahashi-psy@staff.kanazawa-u.ac.jp",
    address: { ja:"角間キャンパス", en:"Kakuma Campus" },

    // フッターにだけ表示する詳しい所在地（郵便番号つき）
    postalAddress: { ja:"〒920-1192 石川県金沢市角間町", en:"Kakuma-machi, Kanazawa, Ishikawa 920-1192, Japan" },

    // ▼ 部屋番号が分かりしだい書き換えてください（不要なら "" に）
    room: { ja:"", en:"" }
  },


  /* ------------------------------------------------------------------
     3. お知らせ
     ▼ 以下はサンプルです。実際の内容に差し替えてください。
     新しい項目はどこに足しても構いません（自動で新しい順に並びます）。

     ・text.en を空にしておくと、英語ページでも text.ja がそのまま出ます。
     ・eventDate（"YYYY-MM-DD"）は、説明会や講演などイベントの告知にだけ
       つけてください。つけると、その日までは「開催予定」、
       過ぎると「終了しました」の表示が自動で付きます。
       イベントでないお知らせにはつけないでください（何も表示されません）。
     ・url は参考リンクがあるときだけ付けてください。本文の下に
       「参考URL」として別行で表示されます。不要なら書かなくて構いません。
     ------------------------------------------------------------------ */
  news: [
    { date:"2026-01-01",
      text:{ ja:"髙橋芳雄が金沢大学人間社会研究域人文学系に着任しました。",
             en:"Michio Takahashi joined the Faculty of Humanities, Institute of Human and Social Sciences, Kanazawa University." } },
    { date:"2026-08-25",
      text:{ ja:"コハツWEBに髙橋准教授のインタビュー記事が掲載されました。子どものネット利用について、「我慢する力」よりも「やるべきことに向かう力」が鍵になるという研究知見をもとに、保護者が気をつけるべき点を話しました。",
             en:"Prof. Takahashi was interviewed by Kohatsu WEB on children's internet use, discussing why the ability to start what needs doing matters more than the ability to resist temptation, and what parents should keep in mind." },
      url: "https://web.kohatsu.org/26_017-1/" },
    { date:"2026-09-13", eventDate:"2026-09-13",
      text:{ ja:"オンラインセミナー「ネット依存解消は子どもの『やる気スイッチ』がカギ！」に登壇します。子どもの発達科学研究所主催の無料オンラインセミナーで、ネット依存の背景にあるメカニズムについて最新の研究結果をお話しします。9月13日（日）14:00〜15:15、Zoom開催、参加無料・事前申込制です。",
             en:"Prof. Takahashi will speak at a free online seminar hosted by the Research Institute for Child Development and Education, presenting recent findings on the mechanisms behind children's problematic internet use. Sunday 13 September, 14:00-15:15 JST, held on Zoom. Free to attend; registration required." },
      url: "https://web.kohatsu.org/20260817-2/" }
  ],


  /* ------------------------------------------------------------------
     4. 研究内容
     lead = トップページに出る1行 / body = research.html に出る本文
     ▼ 文章は下書きです。ご自身の研究に合わせて書き直してください。
     ------------------------------------------------------------------ */
  projects: [
    {
      title: { ja:"臨床発達心理学", en:"Clinical Developmental Psychology" },
      lead:  { ja:"発達のつまずきを、その子が置かれた文脈のなかで理解する。",
               en:"Understanding developmental difficulty in the context a child actually lives in." },
      image: "",
      body: {
        ja: [
          "発達の遅れや偏りは、子ども個人の特性だけでは説明できません。家庭や園、学校といった環境との相互作用のなかで、同じ特性が困難として現れることも、そうでないこともあります。",
          "アセスメントの結果を「状態を分類するため」ではなく「次にどう関わるかを決めるため」に使うにはどうすればよいか。発達の経過を追いながら、支援の判断に結びつく情報の取り方を検討しています。"
        ],
        en: [
          "Delays and atypical developmental trajectories cannot be explained by a child's characteristics alone. The same characteristic may or may not become a difficulty, depending on how it interacts with the home, the preschool, or the school.",
          "How can assessment be used to decide what to do next, rather than to classify a state? Following developmental trajectories over time, we examine what kinds of information actually inform decisions about support."
        ]
      }
    },
    {
      title: { ja:"学校心理学", en:"School Psychology" },
      lead:  { ja:"学校という場そのものを、支援の単位として捉える。",
               en:"Treating the school itself as a unit of intervention." },
      image: "",
      body: {
        ja: [
          "個別の子どもへの支援と並行して、学級や学校の仕組みを変えることで防げる困難があります。個人に手を入れるだけでは追いつかない問題も少なくありません。",
          "教師、スクールカウンセラー、保護者が同じ情報を見て動けるようにするには、どういう形で情報を渡せばよいのか。学校現場の実務に載る形での枠組みづくりに関心があります。"
        ],
        en: [
          "Alongside support directed at individual children, some difficulties can be prevented by changing how a classroom or a school works. Intervening only at the level of the individual is often not enough.",
          "What form does information need to take for teachers, school counsellors and families to act on the same picture? We are interested in frameworks that fit within the working realities of schools."
        ]
      }
    },
    {
      title: { ja:"子どものメンタルヘルス", en:"Child and Adolescent Mental Health" },
      lead:  { ja:"支援が届く前の段階で何が起きているかを捉える。",
               en:"Looking at what happens before children reach any kind of support." },
      image: "",
      body: {
        ja: [
          "不安や抑うつは、相談や受診に至るずっと前から続いていることが多く、把握された時点ではすでに長い経過をたどっています。気づかれないまま過ぎる期間をどう短くするかが課題です。",
          "学校や地域で得られるデータをもとに、早い段階での変化を捉える方法を検討しています。同時に、把握すること自体が子どもや家庭の負担にならない進め方も重要だと考えています。"
        ],
        en: [
          "Anxiety and depression in children often persist long before anyone seeks help, so that by the time a difficulty is recognised it already has a long history. Shortening that unrecognised period is the problem we care about.",
          "Using data available within schools and communities, we examine ways of detecting change at an earlier stage — while ensuring that monitoring does not itself become a burden on children and families."
        ]
      }
    }
  ],


  /* ------------------------------------------------------------------
     5. 論文
     --------------------------------------------------------------------
     ORCID からの自動取得がオンになっています。
     下の publications は「ORCIDに載らないもの」を足すための欄です。
     （DOIのない学会発表、紀要、書籍の章など）
     両方に同じ論文があるときは、DOIで判定して手動側が優先されます。
     ------------------------------------------------------------------ */

  orcid: {
    enabled: true,
    id:      "0000-0002-7151-1364",
    since:   0,       // この年以降のものだけ取り込む（0 なら全部）
    exclude: []       // 別人の論文が混ざったとき、そのDOIをここに並べます
                      // 例: exclude: ["10.1234/abcd"]
  },

  /* 著者リストの中で太字にする名前。Crossrefの表記に合わせて「姓 + イニシャル」で。
     学生が共著に入ったら、その名前もここに足してください。 */
  highlight: ["Takahashi M"],

  /* 手動で足す論文。ORCIDだけで足りている間は空のままで構いません。
     足すときは [ ] の中に、この形で書きます。
       { year:2026,
         authors:"Takahashi M, ○○ ○",
         title:"タイトル",
         venue:"雑誌名 12:345-356",
         note:{ ja:"", en:"" },
         doi:"", pdf:"" },                                              */
  publications: [],


  /* ------------------------------------------------------------------
     6. メンバー
     photo は "images/takahashi.jpg" のように。"" なら頭文字が入ります。
     使わないリンクは "" にしておけば表示されません。
     links の各URLは、言語で行き先が変わるものだけ { ja, en } の形にします
     （変わらないもの・言語別ページがないものは、ORCIDのように文字列のままで構いません）。
     ------------------------------------------------------------------ */
  members: [
    {
      name:  { ja:"髙橋 芳雄", en:"Michio Takahashi" },
      role:  { ja:"准教授", en:"Associate Professor" },
      bio:   { ja:"", en:"" },   // ← 経歴を載せる場合はここに
      photo: "images/takahashi.jpg",
      links: {
        scholar: { ja:"https://scholar.google.co.jp/citations?user=9L55hMEAAAAJ&hl=ja",
                   en:"https://scholar.google.co.jp/citations?user=9L55hMEAAAAJ&hl=en" },
        orcid:   "https://orcid.org/0000-0002-7151-1364",
        kaken:   { ja:"https://nrid.nii.ac.jp/ja/nrid/1000070760891/",
                   en:"https://nrid.nii.ac.jp/en/nrid/1000070760891/" },
        researchmap: { ja:"https://researchmap.jp/takahashi_psy/?lang=japanese",
                       en:"https://researchmap.jp/takahashi_psy/?lang=english" },
        email:   "takahashi-psy@staff.kanazawa-u.ac.jp"
      }
    }

    /* メンバーが増えたら、上の } の後ろにカンマを足して以下を続けます。
    ,{
      name:  { ja:"○○ ○○", en:"Given Family" },
      role:  { ja:"博士前期課程 1年", en:"MSc student, 1st year" },
      bio:   { ja:"", en:"" },
      photo: "",
      links: { scholar:"", orcid:"", kaken:"", researchmap:"", email:"" }
    }
    */
  ],

  /* 卒業生・修了生。人が抜けたら members からここに移してください。
     空のままなら「卒業生」欄は表示されません。 */
  alumni: [],


  /* ------------------------------------------------------------------
     8. プライバシーポリシー
     --------------------------------------------------------------------
     本文はアクセス解析の設定に合わせて自動で切り替わります。
     provider を変えたら、ポリシーの記述も自動で追従します。

     ▼ 公開前に、大学の広報担当または事務にご確認ください。
        私は法律の専門家ではありません。以下は下書きです。
     ------------------------------------------------------------------ */
  privacy: {
    // 大学の上位規程。金沢大学アプリも同じページを参照しています。
    universityPolicyUrl: "https://www.kanazawa-u.ac.jp/university/jyouhoukoukai/document/",
    updated: "2026-04-01"
  },


  /* ------------------------------------------------------------------
     9. 募集
     ▼ 文章は下書きです。受け入れ方針に合わせて書き直してください。
     ------------------------------------------------------------------ */
  join: {
    /* トップページの「募集」ブロック用。2項目に絞った短い誘導文で、
       詳しい内容は positions（join.html側）に委ねます。 */
    homeItems: [
      {
        title:{ ja:"大学院生・ポスドク（学振PD）", en:"Graduate students & postdocs (JSPS PD)" },
        body: {
          ja:"大学院進学を考えている方、ポスドクとして研究を進めたい方を歓迎します。研究テーマや進学の相談は随時受け付けていますので、まだ具体的に決まっていない段階でも気軽にご連絡ください。",
          en:"We welcome prospective graduate students and postdoctoral researchers. Feel free to get in touch at any time to discuss research topics or admissions, even if your plans are still taking shape."
        }
      },
      {
        title:{ ja:"卒業研究を希望する学生へ", en:"For undergraduates considering a thesis project" },
        body: {
          ja:"心理学プログラムに所属する学生であれば、学年を問わずいつでも歓迎します。興味があれば早い段階から研究室で研究を進めることも可能です。テーマが決まっていなくても、まずは気軽に相談に来てください。",
          en:"Students enrolled in the Psychology Program are welcome to join at any stage, regardless of year. If you are interested, you can start taking part in research early on. Come and talk with us even if you have not settled on a thesis topic yet."
        }
      }
    ],

    positions: [
      {
        title:{ ja:"大学院生（博士前期・後期課程）", en:"Graduate students (MSc / PhD)" },
        body: {
          ja:[
            "心理学以外の背景から来る方も歓迎します。教育学、社会学、統計、あるいは学校現場での経験。子どもに関わる問いを持っていることのほうが、出身分野より重要だと考えています。",
            "現職の教員やスクールカウンセラーの方からのご相談にも応じます。現場を持ちながら研究を進める場合の進め方についても、一度お話しさせてください。",
            "見学はいつでも歓迎します。進路を決めていない段階でも構いません。メールで都合の良い日をいくつかお送りください。"
          ],
          en:[
            "We welcome applicants from outside psychology — education, sociology, statistics, or experience working in schools. Having a question about children matters more than the field you come from.",
            "We are also glad to talk with practising teachers and school counsellors about combining research with work in the field.",
            "Visits are welcome at any time, including before you have decided anything. Email a few dates that suit you."
          ]
        }
      },
      {
        title:{ ja:"博士研究員（ポスドク）", en:"Postdoctoral researchers" },
        body: {
          ja:[
            "自分のプロジェクトを立ち上げたい方を歓迎します。研究室の関心と重なる部分があれば、テーマは持ち込みで構いません。",
            "学振PDや各種フェローシップの申請についても相談に応じます。CVと1ページ程度の研究計画をメールでお送りください。"
          ],
          en:[
            "We especially welcome people who want to establish their own project. If there is overlap with the interests of the lab, you are welcome to bring your own topic.",
            "We are happy to support JSPS and other fellowship applications. Please email a CV and a one-page statement of research interests."
          ]
        }
      },
      {
        title:{ ja:"学部生（卒業研究）", en:"Undergraduate research students" },
        body: {
          ja:[
            "配属前の見学を歓迎します。どんなテーマがあるのか、実際にどんな作業をするのかを見てもらうのが一番早いと思います。気軽に声をかけてください。"
          ],
          en:[
            "Visits before assignment are welcome. Seeing what the projects actually involve tends to be more useful than any description — please just get in touch."
          ]
        }
      }
    ],

    cta:  { ja:"メールで問い合わせる", en:"Get in touch" },
    note: { ja:"返信は数日いただくことがあります。1週間経っても返信がない場合は、お手数ですが再送してください。",
            en:"Replies may take a few days. If you have not heard back within a week, please do send a reminder." }
  }
};
