// Google Translate Injection
const gtScript = document.createElement('script');
gtScript.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
document.head.appendChild(gtScript);

window.googleTranslateElementInit = function() {
  new google.translate.TranslateElement({pageLanguage: 'en', includedLanguages: 'en,ru', autoDisplay: false}, 'google_translate_element');
};

// Styles for overlay and hiding Google's top bar
const style = document.createElement('style');
style.innerHTML = `
  #google_translate_element { display: none; }
  .skiptranslate { display: none !important; }
  body { top: 0 !important; }
  #lang-overlay {
    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
    background: rgba(15, 23, 42, 0.95); z-index: 999999;
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    color: white; font-family: sans-serif; backdrop-filter: blur(5px);
  }
  .lang-btn {
    cursor: pointer; text-align: center; background: rgba(255,255,255,0.1);
    padding: 30px 50px; border-radius: 16px; transition: 0.2s; border: 2px solid transparent;
  }
  .lang-btn:hover { background: rgba(255,255,255,0.2); transform: scale(1.05); border-color: #60a5fa; }
  .lang-icon { font-size: 80px; margin-bottom: 10px; }
  .lang-text { font-size: 24px; font-weight: bold; }
  
  #lang-switch-float {
    position: fixed; bottom: 20px; right: 20px; z-index: 9999;
    background: #1e293b; color: white; padding: 10px 15px; border-radius: 30px;
    cursor: pointer; border: 2px solid #334155; display: flex; align-items: center; gap: 8px;
    font-family: sans-serif; box-shadow: 0 4px 12px rgba(0,0,0,0.5); transition: 0.2s;
  }
  #lang-switch-float:hover { background: #334155; }
`;
document.head.appendChild(style);

function setLanguageCookie(lang) {
  const d = new Date();
  d.setTime(d.getTime() + (365*24*60*60*1000));
  const expires = "expires="+ d.toUTCString();
  const val = lang === 'ru' ? '/en/ru' : '/en/en';
  document.cookie = `googtrans=${val}; ${expires}; path=/`;
  document.cookie = `googtrans=${val}; ${expires}; domain=${location.hostname}; path=/`;
  localStorage.setItem('pytds_lang', lang);
  location.reload();
}

window.addEventListener('DOMContentLoaded', () => {
  // Add hidden google translate element
  const gtDiv = document.createElement('div');
  gtDiv.id = 'google_translate_element';
  document.body.appendChild(gtDiv);

  const currentLang = localStorage.getItem('pytds_lang');
  
  // If no language chosen, show overlay
  if (!currentLang) {
    const overlay = document.createElement('div');
    overlay.id = 'lang-overlay';
    overlay.innerHTML = `
      <h2 style="font-size: 32px; margin-bottom: 40px; text-align: center;">Choose Language<br><span style="color:#94a3b8; font-size:24px; font-weight:normal;">Выберите язык</span></h2>
      <div style="display: flex; gap: 30px;">
        <div class="lang-btn" onclick="setLanguageCookie('en')">
          <div class="lang-icon">🇺🇸</div>
          <div class="lang-text">English</div>
        </div>
        <div class="lang-btn" onclick="setLanguageCookie('ru')">
          <div class="lang-icon">🇷🇺</div>
          <div class="lang-text">Русский</div>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
  }

  // Floating button to change language anytime
  const floatBtn = document.createElement('div');
  floatBtn.id = 'lang-switch-float';
  floatBtn.innerHTML = `🌐 ${currentLang === 'ru' ? 'Русский' : 'English'}`;
  floatBtn.onclick = () => {
    const overlay = document.createElement('div');
    overlay.id = 'lang-overlay';
    overlay.innerHTML = `
      <h2 style="font-size: 32px; margin-bottom: 40px; text-align: center;">Change Language<br><span style="color:#94a3b8; font-size:24px; font-weight:normal;">Сменить язык</span></h2>
      <div style="display: flex; gap: 30px;">
        <div class="lang-btn" onclick="setLanguageCookie('en')">
          <div class="lang-icon">🇺🇸</div>
          <div class="lang-text">English</div>
        </div>
        <div class="lang-btn" onclick="setLanguageCookie('ru')">
          <div class="lang-icon">🇷🇺</div>
          <div class="lang-text">Русский</div>
        </div>
      </div>
      <div style="margin-top: 40px; cursor: pointer; color: #94a3b8; text-decoration: underline;" onclick="document.getElementById('lang-overlay').remove()">Cancel / Отмена</div>
    `;
    document.body.appendChild(overlay);
  };
  document.body.appendChild(floatBtn);
});
