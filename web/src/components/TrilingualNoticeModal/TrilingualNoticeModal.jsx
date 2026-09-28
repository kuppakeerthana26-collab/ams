import React from "react";
import "./TrilingualNoticeModal.css";

export const TrilingualNoticeModal = ({
  noticeData,
  onClose,
  onCopyNotice,
}) => {
  if (!noticeData) return null;

  const { student, english, telugu, tamil } = noticeData;
  const whatsappPhone = (student?.parentPhone || "").replace(/\+/g, "").replace(/\s/g, "");
  const fullNoticeText = `${english}\n\n${telugu}\n\n${tamil}`;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-dialog trilingual-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">
            <i className="fa-brands fa-whatsapp" style={{ color: "#25D366", marginRight: "8px" }}></i>
            Trilingual Parent Absence Notice
          </span>
          <button className="modal-close-btn" onClick={onClose}>
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div className="modal-body">
          <p className="notice-intro-text">
            Standardized multilingual notification for{" "}
            <strong>{student.name}</strong> (Roll No: <strong>{student.rollNo}</strong>):
          </p>

          {/* 1. English */}
          <div className="language-notice-box">
            <div className="lang-box-header">
              <strong className="lang-title english-title">
                🇬🇧 English Official Notice
              </strong>
              <button
                className="btn btn-outline btn-xs"
                onClick={() => onCopyNotice && onCopyNotice(english, "English")}
              >
                <i className="fa-solid fa-copy"></i> Copy
              </button>
            </div>
            <p className="lang-message-text">{english}</p>
          </div>

          {/* 2. Telugu */}
          <div className="language-notice-box">
            <div className="lang-box-header">
              <strong className="lang-title telugu-title">
                🇮🇳 Telugu (తెలుగు)
              </strong>
              <button
                className="btn btn-outline btn-xs"
                onClick={() => onCopyNotice && onCopyNotice(telugu, "Telugu")}
              >
                <i className="fa-solid fa-copy"></i> Copy
              </button>
            </div>
            <p className="lang-message-text">{telugu}</p>
          </div>

          {/* 3. Tamil */}
          <div className="language-notice-box">
            <div className="lang-box-header">
              <strong className="lang-title tamil-title">
                🇮🇳 Tamil (தமிழ்)
              </strong>
              <button
                className="btn btn-outline btn-xs"
                onClick={() => onCopyNotice && onCopyNotice(tamil, "Tamil")}
              >
                <i className="fa-solid fa-copy"></i> Copy
              </button>
            </div>
            <p className="lang-message-text">{tamil}</p>
          </div>
        </div>

        <div className="modal-footer">
          <a
            className="btn btn-success"
            href={`https://wa.me/${whatsappPhone}?text=${encodeURIComponent(fullNoticeText)}`}
            target="_blank"
            rel="noreferrer"
          >
            <i className="fa-brands fa-whatsapp"></i> Open in WhatsApp
          </a>
          <button className="btn btn-primary" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
export default TrilingualNoticeModal;
