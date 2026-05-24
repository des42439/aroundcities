"use client";

import { useState } from "react";
import Link from "next/link";

export default function DisclaimerPage() {
  const [language, setLanguage] = useState<"en" | "zh" | "bm">("en");

  const content = {
    en: {
      title: "Disclaimer",
      intro:
        "AroundCities is an independent community platform that shares events, local happenings, attractions, and public information around Kuching and other cities.",

      accuracyTitle: "Information Accuracy",
      accuracy:
        "We try our best to ensure all information is accurate and up to date. However, event schedules, venues, prices, operating hours, and other details may change without prior notice.",

      thirdPartyTitle: "Third-Party Content",
      thirdParty:
        "Some content, images, or event information may originate from third-party sources such as public websites, social media pages, event organizers, or community submissions. All rights belong to their respective owners.",

      copyrightTitle: "Copyright & Removal Requests",
      copyright:
        "If you are the owner of any content displayed on AroundCities and would like it removed or corrected, please contact us and we will review your request promptly.",

      liabilityTitle: "Limitation of Liability",
      liability:
        "AroundCities shall not be held responsible for any losses, damages, inconvenience, or misunderstandings caused by inaccurate, outdated, or incomplete information published on this platform.",

      contactTitle: "Contact Us",
      contact:
        "For feedback, corrections, complaints, copyright requests, or business inquiries, please contact:",

      back: "← Back to Home",
    },

    zh: {
      title: "免责声明",
      intro:
        "AroundCities 是一个独立的社区平台，用于分享古晋及其他城市的活动、本地资讯、景点与公共信息。",

      accuracyTitle: "信息准确性",
      accuracy:
        "我们会尽力确保所有资料准确并保持最新状态，但活动时间、地点、价格、营业时间及其他内容可能会在未提前通知的情况下更改。",

      thirdPartyTitle: "第三方内容",
      thirdParty:
        "部分内容、图片或活动资讯可能来自第三方来源，例如公开网站、社交媒体页面、活动主办方或社区投稿。相关版权归原版权所有者所有。",

      copyrightTitle: "版权与移除请求",
      copyright:
        "如果您是 AroundCities 上任何内容的版权所有者，并希望我们移除或更正相关内容，请联系我们，我们会尽快处理。",

      liabilityTitle: "责任限制",
      liability:
        "对于因平台上不准确、过时或不完整的信息所导致的任何损失、不便或误解，AroundCities 概不负责。",

      contactTitle: "联系我们",
      contact:
        "如有反馈、更正、投诉、版权请求或商业合作，请联系：",

      back: "← 返回主页",
    },

    bm: {
      title: "Penafian",
      intro:
        "AroundCities ialah platform komuniti bebas yang berkongsi acara, aktiviti tempatan, tempat menarik, dan maklumat awam sekitar Kuching dan bandar lain.",

      accuracyTitle: "Ketepatan Maklumat",
      accuracy:
        "Kami berusaha memastikan semua maklumat adalah tepat dan terkini. Namun begitu, jadual acara, lokasi, harga, waktu operasi, dan maklumat lain mungkin berubah tanpa notis awal.",

      thirdPartyTitle: "Kandungan Pihak Ketiga",
      thirdParty:
        "Sesetengah kandungan, gambar, atau maklumat acara mungkin berasal daripada pihak ketiga seperti laman web awam, media sosial, penganjur acara, atau kiriman komuniti. Hak milik adalah milik pemilik asal masing-masing.",

      copyrightTitle: "Hak Cipta & Permintaan Pemadaman",
      copyright:
        "Jika anda merupakan pemilik mana-mana kandungan yang dipaparkan di AroundCities dan ingin ia dipadam atau diperbetulkan, sila hubungi kami dan kami akan menyemak permintaan anda secepat mungkin.",

      liabilityTitle: "Had Liabiliti",
      liability:
        "AroundCities tidak bertanggungjawab terhadap sebarang kerugian, kesulitan, atau salah faham yang berpunca daripada maklumat yang tidak tepat, lapuk, atau tidak lengkap di platform ini.",

      contactTitle: "Hubungi Kami",
      contact:
        "Untuk maklum balas, pembetulan, aduan, permintaan hak cipta, atau pertanyaan perniagaan, sila hubungi:",

      back: "← Kembali ke Halaman Utama",
    },
  };

  const t = content[language];

  return (
    <main
      style={{
        background: "#000",
        minHeight: "100vh",
        color: "#fff",
        padding: "40px 24px",
      }}
    >
      <div
        style={{
          maxWidth: "900px",
          margin: "0 auto",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "40px",
            flexWrap: "wrap",
            gap: "16px",
          }}
        >
          <h1
            style={{
              fontSize: "56px",
              fontWeight: 800,
              margin: 0,
            }}
          >
            AroundCities
          </h1>

          <div
            style={{
              display: "flex",
              gap: "12px",
            }}
          >
            <button
              onClick={() => setLanguage("en")}
              style={buttonStyle(language === "en")}
            >
              EN
            </button>

            <button
              onClick={() => setLanguage("zh")}
              style={buttonStyle(language === "zh")}
            >
              中文
            </button>

            <button
              onClick={() => setLanguage("bm")}
              style={buttonStyle(language === "bm")}
            >
              BM
            </button>
          </div>
        </div>

        {/* Card */}
        <div
          style={{
            border: "1px solid #2a2a2a",
            borderRadius: "32px",
            padding: "40px",
            background: "#050505",
          }}
        >
          <h2
            style={{
              fontSize: "42px",
              marginBottom: "24px",
            }}
          >
            {t.title}
          </h2>

          <p style={paragraphStyle}>{t.intro}</p>

          <Section
            title={t.accuracyTitle}
            content={t.accuracy}
          />

          <Section
            title={t.thirdPartyTitle}
            content={t.thirdParty}
          />

          <Section
            title={t.copyrightTitle}
            content={t.copyright}
          />

          <Section
            title={t.liabilityTitle}
            content={t.liability}
          />

          <Section
            title={t.contactTitle}
            content={
              <>
                <p style={paragraphStyle}>{t.contact}</p>

                <a
                  href="mailto:contactus@aroundcities.my"
                  style={{
                    color: "#fff",
                    fontSize: "20px",
                    textDecoration: "underline",
                  }}
                >
                  contactus@aroundcities.my
                </a>
              </>
            }
          />

          <div style={{ marginTop: "48px" }}>
            <Link
              href="/"
              style={{
                display: "inline-block",
                padding: "14px 24px",
                border: "1px solid #444",
                borderRadius: "14px",
                color: "#fff",
                textDecoration: "none",
                background: "#111",
              }}
            >
              {t.back}
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

function Section({
  title,
  content,
}: {
  title: string;
  content: React.ReactNode;
}) {
  return (
    <div
      style={{
        marginTop: "40px",
      }}
    >
      <h3
        style={{
          fontSize: "28px",
          marginBottom: "14px",
        }}
      >
        {title}
      </h3>

      <div>{content}</div>
    </div>
  );
}

function buttonStyle(active: boolean): React.CSSProperties {
  return {
    padding: "14px 26px",
    borderRadius: "18px",
    border: active ? "1px solid #fff" : "1px solid #333",
    background: active ? "#fff" : "#111",
    color: active ? "#000" : "#fff",
    fontSize: "22px",
    cursor: "pointer",
    transition: "0.2s",
  };
}

const paragraphStyle: React.CSSProperties = {
  fontSize: "20px",
  lineHeight: 1.9,
  color: "#d0d0d0",
};